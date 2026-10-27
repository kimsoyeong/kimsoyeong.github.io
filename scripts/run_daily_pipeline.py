#!/usr/bin/env python3
"""Generate locally, publish one dated Markdown file from an isolated checkout.

The scheduled host needs a logged-in Codex CLI and Git push access. A push to
main runs the repository's Pages workflow; this script never stages local edits.
"""
from __future__ import annotations

from datetime import datetime
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
from typing import Callable
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
COMMIT_MESSAGE = '🤖 [Bot] 데일리 리포트 추가'


def git(directory: Path, *args: str, check: bool = True) -> subprocess.CompletedProcess:
    result = subprocess.run(
        ['git', '-c', 'core.hooksPath=/dev/null', *args], cwd=directory,
        env={**os.environ, 'GIT_TERMINAL_PROMPT': '0'},
        capture_output=True, timeout=120,
    )
    if check and result.returncode:
        # Do not print remote URLs or credential-helper diagnostics.
        raise RuntimeError(f'Git {args[0]} failed (exit {result.returncode}). Check repository access and network.')
    return result


def verify_existing(local: Path, remote: Path) -> None:
    if local.is_symlink() or remote.is_symlink():
        raise RuntimeError('Refusing a report path that is a symbolic link.')
    if local.exists() and local.read_bytes() != remote.read_bytes():
        raise RuntimeError(f'{local.name} is already published with different content; immutable reports cannot be overwritten.')


def publish(root: Path = ROOT, *, day: str | None = None, generate: Callable[[], None] | None = None) -> bool:
    """Return True only when a new report commit was pushed successfully."""
    day = day or datetime.now(ZoneInfo('Asia/Seoul')).date().isoformat()
    # The date is internal by default, but validate injected values used by tools/tests.
    from datetime import date
    if date.fromisoformat(day).isoformat() != day:
        raise ValueError('Report day must use YYYY-MM-DD.')
    relative = Path('public/daily-reports') / f'{day}.md'
    target = root / relative
    remote_url = git(root, 'remote', 'get-url', 'origin').stdout.decode().strip()
    with tempfile.TemporaryDirectory(prefix='daily-report-publish-') as temporary:
        checkout = Path(temporary) / 'repo'
        git(root, 'clone', '--depth', '1', '--branch', 'main', '--single-branch', '--', remote_url, str(checkout))
        if not (checkout / '.github/workflows/daily-post.yml').is_file():
            raise RuntimeError('Daily Report infrastructure is not published on origin/main. Publish the setup before running the scheduler.')
        remote_target = checkout / relative
        if remote_target.exists():
            verify_existing(target, remote_target)
            print(f'Already published: {relative}')
            return False
        if generate is not None:
            generate()
        else:
            subprocess.run([sys.executable, str(root / 'scripts/generate_report.py'), '--history-dir', str(checkout / 'public/daily-reports')], cwd=root, check=True, timeout=900)
        if target.is_symlink() or not target.is_file() or not target.stat().st_size:
            raise RuntimeError(f'Generator did not produce a nonempty regular report: {relative}')
        remote_target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(target, remote_target)
        git(checkout, 'add', '--', relative.as_posix())
        git(checkout, '-c', 'user.name=Daily Report Bot', '-c', 'user.email=daily-report@users.noreply.github.com',
            '-c', 'commit.gpgsign=false', 'commit', '-m', COMMIT_MESSAGE)
        for attempt in range(3):
            if git(checkout, 'push', 'origin', 'HEAD:main', check=False).returncode == 0:
                print(f'Published {relative}; GitHub Actions will build and deploy Pages.')
                return True
            git(checkout, 'fetch', 'origin', 'main')
            concurrent = git(checkout, 'show', f'origin/main:{relative.as_posix()}', check=False)
            if concurrent.returncode == 0:
                if concurrent.stdout == target.read_bytes():
                    print(f'Already published by another run: {relative}')
                    return False
                raise RuntimeError(f'{relative.name} was concurrently published with different content; no overwrite was pushed.')
            if attempt < 2:
                git(checkout, 'rebase', 'origin/main')
        raise RuntimeError('Push failed after 3 attempts. Check GitHub authentication, branch protection, or remote changes.')


def main() -> int:
    try:
        publish()
        return 0
    except (RuntimeError, ValueError, subprocess.SubprocessError, OSError) as error:
        # CalledProcessError may contain CLI arguments. Those contain no secrets here.
        print(f'Daily pipeline failed: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
