# LLM Pipeline Testing Strategy: Record & Replay (VCR)

## Overview
To comprehensively test that the final report can be generated across all agents and tools—without spending money on API calls for every test run—we will implement a context-aware mocking strategy using the **"Record & Replay"** pattern.

Because LLM pipelines are non-deterministic and involve complex JSON schemas (e.g., Scout outputs, Deep Vetting matrices), a simple static mock will quickly become impossible to maintain. We will use a VCR library (like `vcrpy` or `pytest-recording`) to record HTTP traffic to the Gemini API.

## How it works

1. **Record Mode:** You run `pytest --record-mode=once` locally with a real `GEMINI_API_KEY`. The test executes the full pipeline using the real LLM. The exact requests (prompts) and responses (JSON outputs) are saved to a physical "cassette" file (e.g., `tests/cassettes/e2e_report.yaml`).
2. **Replay Mode:** In CI/CD (or subsequent local runs), the test runs without an API key. The framework intercepts the API call, matches the prompt to the cassette, and returns the pre-recorded real response.

## Pros
* **Strongest possible test:** It uses actual, real-world LLM outputs, meaning it implicitly tests your prompt engineering and token limits.
* **Zero cost in CI/CD:** The real API is only hit once when a developer decides to update the cassette.
* **Low maintenance:** You don't have to manually write massive mock JSON files for complex dossier structures. 

## Scope & Decision
* **Full Test Suite Rollout:** This Record & Replay strategy will NOT be limited to just the end-to-end integration test (`test_end_to_end.py`). It will be rolled out across **all unit tests and test modules** across the entire repository (replacing the blanket static mock in `conftest.py`).
* **Tool Parity & Comprehensive Coverage:** Every single agent tool and agent pipeline must be exercised under this pattern with its own corresponding recorded cassette to ensure complete offline, deterministic, zero-cost test execution.

## Crucial Maintenance Rules
* **Keep Cassettes Updated:** If the underlying implementation of a tool, agent, prompt, or response schema changes in the future, the tests MUST change too. You must delete the outdated cassette and re-record it (`pytest --record-mode=rewrite`) to ensure the recorded traffic matches the new architecture. 
* **Complete Tool Coverage:** The test suite must exercise **every single tool we have**. We must ensure that cassettes capture the usage of all tools to prove they work seamlessly across both isolated unit tests and full pipelines.

## Implementation Steps (Pending)
When we are ready to implement this, the following steps are required:
1. Remove the aggressive blanket mock of `google.genai.Client` in `tests/conftest.py`.
2. Configure VCR globally in `tests/conftest.py` to filter out sensitive headers (`x-goog-api-key`, `authorization`), query params (`key`), and ignore local ASGI requests (`http://test`, `localhost`, `127.0.0.1`).
3. Apply `@pytest.mark.vcr` across **all unit test files** (`test_backend.py`, `test_chat.py`, `test_deep_vetting.py`, `test_scout.py`, `test_outreach.py`, `test_document_analysis.py`, etc.) and integration tests (`test_end_to_end.py`).
4. Run tests in record mode with a valid `GEMINI_API_KEY` to generate initial cassettes for every tool and agent.
5. Verify in offline mode (dummy/unset API key) that all unit and integration tests pass cleanly via cassette replay with $0 API cost.
