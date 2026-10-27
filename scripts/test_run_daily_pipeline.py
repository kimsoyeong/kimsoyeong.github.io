from pathlib import Path
import subprocess
import tempfile
import unittest

from run_daily_pipeline import COMMIT_MESSAGE, publish


class IsolatedPublisherTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name)
        self.remote = self.base / 'remote.git'
        self.root = self.base / 'working'
        self.command(self.base, 'init', '--bare', '--initial-branch=main', str(self.remote))
        self.command(self.base, 'clone', str(self.remote), str(self.root))
        self.command(self.root, 'config', 'user.name', 'Test Author')
        self.command(self.root, 'config', 'user.email', 'test@example.com')
        workflow = self.root / '.github/workflows/daily-post.yml'
        workflow.parent.mkdir(parents=True)
        workflow.write_text('name: Daily Report\n')
        (self.root / 'user.txt').write_text('original\n')
        self.command(self.root, 'add', '.')
        self.command(self.root, '-c', 'commit.gpgsign=false', 'commit', '-m', 'Initial')
        self.command(self.root, 'push', 'origin', 'main')
        self.day = '2026-10-27'
        self.relative = f'public/daily-reports/{self.day}.md'

    def command(self, cwd, *args):
        return subprocess.run(['git', '-c', 'core.hooksPath=/dev/null', *args], cwd=cwd, check=True, capture_output=True).stdout

    def generate(self):
        report = self.root / self.relative
        report.parent.mkdir(parents=True, exist_ok=True)
        report.write_text('# Verified daily report\n', encoding='utf-8')

    def test_only_report_is_published_and_users_staged_changes_survive(self):
        (self.root / 'user.txt').write_text('user staged change\n')
        self.command(self.root, 'add', 'user.txt')
        (self.root / 'private.txt').write_text('untracked user work\n')
        before = self.command(self.root, 'diff', '--cached')
        head_before = self.command(self.root, 'rev-parse', 'HEAD')
        self.assertTrue(publish(self.root, day=self.day, generate=self.generate))
        self.assertEqual(before, self.command(self.root, 'diff', '--cached'))
        self.assertEqual(head_before, self.command(self.root, 'rev-parse', 'HEAD'))
        self.assertEqual(self.command(self.remote, 'show', 'main:user.txt'), b'original\n')
        self.assertEqual(self.command(self.remote, 'diff-tree', '--no-commit-id', '--name-only', '-r', 'main').decode().strip(), self.relative)
        message = self.command(self.remote, 'log', '-1', '--format=%B').decode().strip()
        self.assertEqual(message, COMMIT_MESSAGE)
        self.assertNotIn('Co-authored-by', message)

    def test_repeat_skips_generation_and_does_not_create_another_commit(self):
        publish(self.root, day=self.day, generate=self.generate)
        revision = self.command(self.remote, 'rev-parse', 'main')
        def fail_generation():
            self.fail('Already-published report must not invoke generation')
        self.assertFalse(publish(self.root, day=self.day, generate=fail_generation))
        self.assertEqual(revision, self.command(self.remote, 'rev-parse', 'main'))

    def test_published_report_cannot_be_replaced_by_changed_local_content(self):
        publish(self.root, day=self.day, generate=self.generate)
        (self.root / self.relative).write_text('changed')
        with self.assertRaisesRegex(RuntimeError, 'immutable'):
            publish(self.root, day=self.day, generate=self.generate)

    def test_missing_remote_infrastructure_fails_before_generation(self):
        self.command(self.root, 'rm', '.github/workflows/daily-post.yml')
        self.command(self.root, '-c', 'commit.gpgsign=false', 'commit', '-m', 'Remove setup')
        self.command(self.root, 'push', 'origin', 'main')
        def fail_generation():
            self.fail('Unpublished infrastructure must be detected before generation')
        with self.assertRaisesRegex(RuntimeError, 'infrastructure is not published'):
            publish(self.root, day=self.day, generate=fail_generation)


if __name__ == '__main__':
    unittest.main()
