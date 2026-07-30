import copy
import pytest

from fastapi.testclient import TestClient

from src import app as app_module


@pytest.fixture()
def client():
    """Provides a TestClient for the FastAPI app."""
    with TestClient(app_module.app) as c:
        yield c


@pytest.fixture(autouse=True)
def reset_activities():
    """Snapshot and restore the module-level `activities` to avoid state leakage between tests."""
    original = copy.deepcopy(app_module.activities)
    yield
    app_module.activities.clear()
    app_module.activities.update(copy.deepcopy(original))
