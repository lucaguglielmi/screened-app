import os
import pytest
from unittest.mock import MagicMock
from tests.conftest import is_vcr_enabled, vcr_config


def test_vcr_toggle_default(monkeypatch):
    """Verify that by default VCR is disabled and the test harness runs in mock mode."""
    monkeypatch.delenv("SCREENED_VCR_ENABLED", raising=False)
    config = MagicMock()
    config.getoption.side_effect = lambda opt, default=False: False
    assert is_vcr_enabled(config) is False
    assert is_vcr_enabled(None) is False


def test_vcr_toggle_env_var(monkeypatch):
    """Verify that SCREENED_VCR_ENABLED enables VCR."""
    for truthy in ["1", "true", "True", "yes", "on"]:
        monkeypatch.setenv("SCREENED_VCR_ENABLED", truthy)
        assert is_vcr_enabled(None) is True

    for falsy in ["0", "false", "no", "off", ""]:
        monkeypatch.setenv("SCREENED_VCR_ENABLED", falsy)
        assert is_vcr_enabled(None) is False


def test_vcr_toggle_cli_flags(monkeypatch):
    """Verify that CLI flags take precedence over environment variables."""
    monkeypatch.setenv("SCREENED_VCR_ENABLED", "1")
    
    # --disable-vcr overrides env var
    config_disable = MagicMock()
    config_disable.getoption.side_effect = lambda opt, default=False: opt == "--disable-vcr"
    assert is_vcr_enabled(config_disable) is False

    # --use-vcr enables VCR even if env var is unset
    monkeypatch.delenv("SCREENED_VCR_ENABLED", raising=False)
    config_enable = MagicMock()
    config_enable.getoption.side_effect = lambda opt, default=False: opt == "--use-vcr"
    assert is_vcr_enabled(config_enable) is True


def test_vcr_config_scrubbing(vcr_config):
    """Verify that VCR configuration scrubs sensitive credentials and ignores local test traffic."""
    assert "filter_headers" in vcr_config
    assert "x-goog-api-key" in vcr_config["filter_headers"]
    assert "authorization" in vcr_config["filter_headers"]
    
    assert "filter_query_parameters" in vcr_config
    assert "key" in vcr_config["filter_query_parameters"]
    
    assert vcr_config.get("ignore_localhost") is True
    assert "testserver" in vcr_config.get("ignore_hosts", [])
    assert "test" in vcr_config.get("ignore_hosts", [])


@pytest.mark.vcr
def test_marked_vcr_test_executes_in_fallback_mode():
    """Verify that a test marked with @pytest.mark.vcr executes safely with the in-memory mock when VCR is disabled."""
    from backend.db.firestore import db
    assert db.use_memory is True
