"""Compatibility imports for the shared evidence-backed relation engine."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[3] / 'packages/cosmos-engine'))
from cosmos_engine.schema import RULES, derive_relations
