# AI-First Personal Productivity Assistant

An AI-first personal productivity assistant that has evolved through multiple development phases:
- **Phase I**: Console CLI MVP with in-memory storage
- **Phase II**: Full-stack web application with database persistence
- **Phase III**: Enhanced AI chat integration
- **Phase IV**: Kubernetes deployment with Minikube

---

## Quick Start - Vercel Deployment (Easiest)

**Deploy the frontend to Vercel in 3 steps:**

1. Go to https://vercel.com/new
2. Import `zakiabashir/PHASE1_AI_FIRST_PERSONAL_PRODUCTIVITY_ASSISTANT`
3. Set **Root Directory**: `frontend`
   Set **Environment Variable**: `VITE_API_BASE_URL` = `https://nshfeys0-ai-productivity-assistant.hf.space`

✨ Your app will be live at: `https://ai-productivity-frontend.vercel.app`

**Backend is already deployed:** https://nshfeys0-ai-productivity-assistant.hf.space

---

## Quick Start - Kubernetes Deployment (Recommended)

The fastest way to run the complete application with AI chat:

```bash
# 1. Install prerequisites: Docker, Minikube, kubectl, Helm
# 2. Deploy to Kubernetes
./scripts/deploy.sh

# 3. Access the application
minikube service ai-assistant-frontend
```

**Features:**
- 🎯 Modern React web interface
- 🤖 AI-powered natural language task management
- 💾 Persistent data storage (Neon PostgreSQL)
- 🔐 User authentication with JWT
- 📊 Real-time chat interface
- 🚀 Production-ready Kubernetes deployment

---

## Table of Contents

- [Phase IV - Kubernetes Deployment](#phase-iv---kubernetes-deployment)
- [Phase II/III - Web Application](#phase-iiiii---web-application)
- [Phase I - CLI Application](#phase-i---cli-application)
- [Architecture](#architecture)
- [Development](#development)
- [Documentation](#documentation)

---

## Phase IV - Kubernetes Deployment

### Prerequisites

| Tool | Version | Installation |
|------|---------|--------------|
| Docker | 20.10+ | [docker.com](https://docs.docker.com/get-docker/) |
| Minikube | 1.28+ | [minikube.sigs.k8s.io](https://minikube.sigs.k8s.io/docs/start/) |
| kubectl | 1.28+ | [kubernetes.io](https://kubernetes.io/docs/tasks/tools/) |
| Helm | 3.x | [helm.sh](https://helm.sh/docs/intro/install/) |

### Quick Deploy

```bash
# Automated deployment (interactive)
./scripts/deploy.sh

# Or manual deployment
minikube start --cpus=4 --memory=8192
eval $(minikube docker-env)
docker build -t ai-productivity-frontend:latest ./frontend
docker build -t ai-productivity-backend:latest .
kubectl create secret generic ai-assistant-secrets \
  --from-literal=openai-api-key="$OPENAI_API_KEY" \
  --from-literal=database-url="$DATABASE_URL" \
  --from-literal=jwt-secret="$JWT_SECRET"
helm install ai-assistant ./helm/ai-productivity-assistant \
  --values ./helm/ai-productivity-assistant/values-dev.yaml
```

### Access the Application

```bash
# Open in browser (automatic)
minikube service ai-assistant-frontend

# Or port forward
kubectl port-forward svc/ai-assistant-frontend 8080:80
# Open: http://localhost:8080
```

### Available Scripts

| Script | Purpose |
|--------|---------|
| `./scripts/deploy.sh` | Full deployment automation |
| `./scripts/build-images.sh` | Build Docker images |
| `./scripts/create-secrets.sh` | Create Kubernetes secrets |
| `./scripts/verify.sh` | Verify deployment |
| `./scripts/cleanup.sh` | Remove deployment |
| `./scripts/test-scalability.sh` | Test horizontal scaling |

### Deployment Verification

```bash
# Check all pods are running
kubectl get pods -l app.kubernetes.io/name=ai-productivity-assistant

# Run full verification
./scripts/verify.sh
```

### Documentation

- **[Kubernetes Deployment Guide](docs/KUBERNETES_DEPLOYMENT.md)** - Complete deployment documentation
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Scripts README](scripts/README.md)** - Script usage documentation

### Required Environment Variables

```bash
# OpenAI API Key (required for AI chat)
export OPENAI_API_KEY="sk-..."

# Neon PostgreSQL Database URL
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# JWT Secret (auto-generated if not set)
export JWT_SECRET="your-random-secret"
```

### Cleanup

```bash
# Remove deployment only
./scripts/cleanup.sh

# Remove everything including Minikube
./scripts/cleanup.sh --purge -y
```

---

## Phase II/III - Web Application

### Prerequisites

- Python 3.13+
- Node.js 20+ and npm
- PostgreSQL database (or Neon)
- OpenAI API key

### Setup

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Install frontend dependencies
cd frontend
npm install
cd ..

# 3. Set environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Run database migrations
alembic upgrade head

# 5. Start backend (FastAPI)
uvicorn src.backend.main:app --reload --port 8000

# 6. Start frontend (Vite dev server) - in separate terminal
cd frontend
npm run dev
```

### Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Web Application Features

| Feature | Description |
|---------|-------------|
| User Authentication | JWT-based login/register |
| Task Management | Full CRUD operations via web UI |
| AI Chat | Natural language task creation |
| Chat History | Persisted conversation history |
| Multi-User Support | Isolated user data |
| Task Filtering | Filter by status and priority |

---

## Phase I - CLI Application

### Prerequisites

- Python 3.13+
- OpenAI API key (for AI mode)

### Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Set API key
export AI_API_KEY=your_openai_api_key_here

# Run CLI
python main.py
```

### CLI Commands

```bash
# Create a task
python main.py create-task "Study AI" --priority high

# List all tasks
python main.py list-tasks

# Update a task
python main.py update-task task-1 --title "Study AI tonight"

# Mark as complete
python main.py complete-task task-1

# Delete a task
python main.py delete-task task-1

# Show summary
python main.py summarize
```

### Interactive Mode

```bash
python main.py

# Manual mode
(manual-mode) $ create-task "Test task"
(manual-mode) $ list-tasks

# AI mode
(ai-mode) $ add a task to study python
(ai-mode) $ show me my tasks
```

### CLI Features

| Mode | Description |
|------|-------------|
| Manual | Deterministic CLI commands |
| AI | Natural language interaction |
| Verbose | Show AI processing details |

**Note**: Phase I uses in-memory storage only. Data is lost on restart.

---

## Architecture

### Full Stack Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Kubernetes Cluster                        │
│                                                                   │
│  ┌──────────────────────┐         ┌──────────────────────┐      │
│  │  Frontend Pods       │         │  Backend Pods        │      │
│  │  (Nginx + React)     │◄────────┤ (FastAPI + Python)   │      │
│  │  Port: 80            │         │  Port: 8000           │      │
│  └──────────────────────┘         └──────────────────────┘      │
│                                          │                       │
│                                          ▼                       │
│                            ┌─────────────────────────────┐        │
│                            │  Neon PostgreSQL            │        │
│                            │  (Cloud-hosted database)     │        │
│                            └─────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### Component Overview

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React + Vite + Tailwind | Web UI |
| Backend | FastAPI + Python 3.13 | REST API |
| Database | PostgreSQL (Neon) | Persistent storage |
| AI | OpenAI API | Natural language processing |
| Container | Docker + Nginx | Containerization |
| Orchestration | Kubernetes + Helm | Deployment |

---

## Development

### Project Structure

```
├── frontend/                   # React web application
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── src/
│   ├── backend/               # FastAPI application
│   │   ├── api/              # API routes
│   │   ├── core/             # Database & security
│   │   ├── models/           # Data models
│   │   └── main.py           # Application entry
│   ├── ai/                   # AI intent parsing
│   ├── cli/                  # CLI interface (Phase I)
│   ├── config/               # Configuration
│   ├── core/                 # CRUD functions
│   ├── resolver/             # Action resolver
│   └── storage/              # Storage layer
├── helm/                     # Kubernetes Helm chart
│   └── ai-productivity-assistant/
├── scripts/                  # Deployment automation
├── docs/                     # Documentation
├── alembic/                  # Database migrations
├── requirements.txt          # Python dependencies
└── main.py                   # CLI entry point
```

### Adding New Features

1. **Backend API**: Add route in `src/backend/api/`
2. **Frontend**: Add component in `frontend/src/`
3. **Database**: Create migration in `alembic/versions/`
4. **AI Intent**: Update parser in `src/ai/intent_parser.py`

### Testing

```bash
# Backend tests
pytest tests/

# Frontend tests
cd frontend && npm test

# Integration tests
./scripts/verify.sh
```

---

## Documentation

| Document | Path | Description |
|----------|------|-------------|
| Kubernetes Deployment | `docs/KUBERNETES_DEPLOYMENT.md` | Minikube deployment guide |
| Troubleshooting | `docs/TROUBLESHOOTING.md` | Common issues and solutions |
| Scripts | `scripts/README.md` | Automation scripts |
| Phase 1 Constitution | `specs/001-ai-productivity-assistant/constitution.md` | Phase I rules |
| Phase 4 Constitution | `specs/001-ai-productivity-assistant/phase4-constitution.md` | Phase IV rules |
| Phase 4 Spec | `specs/001-ai-productivity-assistant/phase4-spec.md` | Phase IV requirements |
| Phase 4 Plan | `specs/001-ai-productivity-assistant/phase4-plan.md` | Phase IV architecture |
| Phase 4 Tasks | `specs/001-ai-productivity-assistant/phase4-tasks.md` | Phase IV implementation |
| ADR-001 | `history/adr/001-containerization-strategy.md` | Docker strategy |
| ADR-002 | `history/adr/002-service-networking.md` | Kubernetes networking |

---

## Quick Reference

### Kubernetes Deployment

```bash
# Deploy
./scripts/deploy.sh

# Verify
./scripts/verify.sh

# Access
minikube service ai-assistant-frontend

# Cleanup
./scripts/cleanup.sh
```

### Web Application (Local)

```bash
# Backend
uvicorn src.backend.main:app --reload

# Frontend
cd frontend && npm run dev
```

### CLI Application

```bash
# Run
python main.py

# Create task
python main.py create-task "My task"
```

---

## Support

- **Kubernetes Issues**: See [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- **Deployment Issues**: Check `./scripts/verify.sh` output
- **Application Issues**: Check pod logs with `kubectl logs <pod-name>`

---

## License

This is a hackathon project for demonstration purposes.

---

## Acknowledgments

Built with Spec-Driven Development (SDD) methodology using SpecKit Plus templates.

**Phases Completed**:
- ✅ Phase I: CLI MVP with in-memory storage
- ✅ Phase II: Full-stack web application
- ✅ Phase III: Enhanced AI chat integration
- ✅ Phase IV: Kubernetes deployment with Minikube
