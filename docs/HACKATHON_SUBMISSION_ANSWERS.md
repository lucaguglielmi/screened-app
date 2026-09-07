# Hackathon Submission Q&A — Screened

### What Google Cloud products did you use in this project?

* **Vertex AI (Gemini 2.5 Pro & Gemini 2.5 Flash)**: Primary cognitive and reasoning engine invoked via the `google-genai` and `google-cloud-aiplatform` SDKs. Gemini 2.5 Pro handles conversational function calling, multi-agent reasoning, claim extraction, contradiction detection, and narrative synthesis; Gemini 2.5 Flash handles rapid entity disambiguation and pre-flight entity parsing.
* **Google Agent Development Kit (ADK) (`google-adk`)**: Core multi-agent orchestration framework coordinating the pipeline using `LlmAgent`, `SequentialAgent`, `ParallelAgent`, `Runner`, and ADK Sessions.
* **Google Cloud Run**: Fully managed serverless container platform hosting the unified FastAPI backend and React SPA in `europe-west2` (London) with automated HTTPS, auto-scaling, and health probes.
* **Google Cloud Firestore (Native Mode)**: Managed NoSQL document database storing investigation states, candidate entities, atomic claims, source records, event logs, and user feedback.
* **Google Cloud Tasks**: Durable asynchronous task queue (`google-cloud-tasks`) orchestrating background agent jobs (disambiguation and multi-agent deep vetting) with automated retries and worker endpoints.
* **Google Cloud Secret Manager**: Secure storage and runtime injection of sensitive API keys (`parallel-api-key`, `session-signing-key`, `parallel-webhook-secret`, and diagnostics tokens) directly into Cloud Run.
* **Google Cloud Artifact Registry**: Private OCI container registry storing versioned Docker images (`europe-west2-docker.pkg.dev/...`).
* **Google Cloud Build & Cloud SDK (`gcloud`)**: Container build automation and deployment CLI tooling configured via `cloudbuild.yaml` and deployment scripts.
* **Google Cloud Logging (`google-cloud-logging`)**: Centralized application log aggregation and structured cloud log streaming.
* **Google Cloud Trace (`opentelemetry-exporter-gcp-trace`)**: Distributed cloud tracing exporting OpenTelemetry spans directly to Cloud Trace for agent latency and request lifecycle observability.
* **Google Cloud IAM & Workload Identity Federation**: Keyless, secure GitHub Actions CI/CD authentication via `google-github-actions/auth`.
* **Google Analytics 4 (GA4) & Google Tag Manager (`gtag.js`)**: Privacy-first telemetry with anonymized IP tracking on the frontend.

---

### Please list all other tools or products you used in your project.

#### Partner Track & Evidence Engine
* **Parallel Web / Search API (`parallel-web` Python SDK)**: The sole ground-truth evidence layer utilizing:
  * **Search**: Targeted web and registry queries.
  * **Extract**: Verbatim page content extraction with citation grounding and character offsets.
  * **Task API**: Asynchronous, multi-step search research jobs.
  * **FindAll**: Batch entity discovery for matching open festival calls and grant opportunities.
  * **Monitor**: Continuous change and credibility drift detection on target URLs/entities.

#### Backend & Runtime
* **FastAPI**: Modern asynchronous REST API framework serving backend endpoints, Server-Sent Events (SSE) live progress streams, and static SPA files.
* **Uvicorn**: High-performance ASGI web server.
* **Pydantic v2 & Pydantic-Settings**: Strict data validation, schema enforcement, and type-safe environment configuration.
* **HTTPX**: Asynchronous HTTP client for external requests and webhook signatures.
* **SlowAPI**: Rate limiting middleware for API abuse prevention.
* **OpenTelemetry SDK & Instrumentation**: Distributed tracing engine capturing trace spans across FastAPI routes and agent executions.
* **Python-dotenv**: Local environment configuration management.

#### Frontend & UI Engineering
* **React 19**: Modern UI library with concurrent rendering, hooks, and React Portals.
* **TypeScript**: Static typing for end-to-end API contracts and frontend reliability.
* **Vite 6**: Frontend bundler and build tool with hot module replacement (HMR).
* **Tailwind CSS v4 (`@tailwindcss/vite`)**: Modern utility-first CSS styling engine with custom `@theme` tokens.
* **React Flow (`@xyflow/react` v12)**: Interactive node-edge graph visualization library powering the Entity Provenance Graph, Versus Decision Trees, and Venn diagrams.
* **Motion (`motion`)**: Fluid UI transitions, spring physics, and animated modal states.
* **Lucide React**: Clean icon set across the entire user interface.
* **Fontsource**: Self-hosted typography packages (`Fraunces`, `Instrument Sans`, `Spline Sans Mono`).
* **Web Audio API**: Browser-native oscillator synthesis for tactile feedback and audio clicks without external audio assets.

#### DevOps, CI/CD & Testing
* **Docker**: Multi-stage containerization packaging both the Vite frontend build and Python FastAPI backend into a lean production image.
* **GitHub & GitHub Actions**: Source control, automated testing workflows (`test.yml`), and push-to-deploy pipelines (`deploy.yml`).
* **pytest & pytest-asyncio**: Backend unit and integration test runner (81/81 tests passing).
* **VCR.py / pytest-recording**: Network mocking, recording, and cassette replaying for deterministic LLM and API test fixtures.
* **Vitest & React Testing Library (`@testing-library/react`, `jsdom`)**: Component-level frontend unit testing (34/34 tests passing).
* **ESLint & Prettier**: Code linting, type-checking (`typescript-eslint`), and formatting.
* **cURL / Bash**: Automated production smoke testing (`scripts/smoke.sh`).
