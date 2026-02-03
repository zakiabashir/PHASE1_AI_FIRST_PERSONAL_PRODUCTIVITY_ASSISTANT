# Phase V: CI/CD Implementation Guide

## Overview

This guide explains how to set up and use the CI/CD pipeline for the AI Productivity Assistant project. The pipeline uses GitHub Actions for automated testing, building, and deployment.

**Deployment Strategy:**
- **Frontend**: Vercel (React + Vite)
- **Backend**: HuggingFace Spaces (FastAPI)
- **Container Registry**: Docker Hub

---

## Architecture

```
Push to Any Branch / Pull Request
        |
        ▼
┌─────────────────────────────────────────┐
│  CI Workflow (.github/workflows/ci.yml)  │
│                                         │
│  Backend CI          Frontend CI         │
│  - ruff lint        - eslint            │
│  - mypy             - tsc                │
│  - pytest           - build test         │
│  - build img        - build bundle       │
│                                         │
│  Security Scan (Trivy)                  │
└─────────────────────────────────────────┘
        |
        ├──► [PR Check] - Status Only
        ├──► [Feature Branch] - No Deploy
        └──► [Merge to Master] - Trigger CD
                │
                ▼
┌─────────────────────────────────────────┐
│  CD Workflows (master branch only)       │
│                                         │
│  deploy-backend.yml     deploy-frontend │
│  - Push to Docker Hub  - Vercel deploy  │
│  - Update HuggingFace  - Verify health  │
│  - Health check                            │
└─────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

1. GitHub repository with this project
2. Docker Hub account
3. Vercel account
4. HuggingFace account with Space created

### Step 1: Configure GitHub Secrets

Navigate to: **Repository Settings → Secrets and variables → Actions**

Add the following secrets:

| Secret Name | Description | How to Generate |
|-------------|-------------|-----------------|
| `DOCKER_USERNAME` | Docker Hub username | Your Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub access token | See below |
| `VERCEL_TOKEN` | Vercel CLI token | See below |
| `VERCEL_ORG_ID` | Vercel organization ID | See below |
| `VERCEL_PROJECT_ID` | Vercel project ID | See below |
| `HF_TOKEN` | HuggingFace access token | See below |
| `HF_USERNAME` | HuggingFace username | Your HuggingFace username |

See [Environment Configuration Guide](./phase5-environment.md) for detailed instructions.

### Step 2: Create HuggingFace Space

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces)
2. Click "Create new Space"
3. Configure:
   - **Name**: `ai-productivity-backend`
   - **License**: MIT
   - **SDK**: Docker
   - **Hardware**: CPU basic (free)
4. Click "Create Space"

### Step 3: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import this repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"

### Step 4: Trigger CI/CD

Push any commit to verify CI works:

```bash
git checkout -b test-ci
git push origin test-ci
```

Merge to `master` to trigger deployment:

```bash
git checkout master
git merge test-ci
git push origin master
```

---

## Workflows

### CI Workflow (`.github/workflows/ci.yml`)

**Triggers**: Push to any branch, Pull Requests

**Jobs**:

| Job | Purpose | Tools |
|-----|---------|-------|
| `backend-ci` | Lint, type check, test, build backend | ruff, mypy, pytest, Docker |
| `frontend-ci` | Lint, build frontend | ESLint, Vite |
| `security-scan` | Scan for vulnerabilities | Trivy, TruffleHog |
| `ci-summary` | Summary of all jobs | GitHub Actions |

### Backend Deployment Workflow (`.github/workflows/deploy-backend.yml`)

**Triggers**: Push to `master` branch, Manual dispatch

**Jobs**:

| Job | Purpose |
|-----|---------|
| `build-and-push` | Build and push Docker image to Docker Hub |
| `deploy-to-huggingface` | Deploy backend to HuggingFace Spaces |
| `rollback` | Manual rollback to previous deployment |

### Frontend Deployment Workflow (`.github/workflows/deploy-frontend.yml`)

**Triggers**: Push to `master` branch, Manual dispatch

**Jobs**:

| Job | Purpose |
|-----|---------|
| `deploy` | Deploy frontend to Vercel production |
| `rollback` | Manual rollback to previous deployment |

---

## Usage

### Running CI Locally

To test CI steps locally before pushing:

**Backend:**
```bash
# Lint
ruff check src/

# Type check
mypy src/ --ignore-missing-imports

# Run tests
pytest tests/ -v --cov=src

# Build Docker image
docker build -t ai-productivity-backend:test .
```

**Frontend:**
```bash
cd frontend

# Lint
npm run lint

# Build
npm run build
```

### Triggering Manual Deployment

1. Go to **Actions** tab in GitHub
2. Select **Deploy Backend** or **Deploy Frontend**
3. Click **Run workflow**
4. Select branch and click **Run workflow**

### Rolling Back a Deployment

**Backend:**
1. Go to **Actions** tab
2. Select **Deploy Backend**
3. Click **Run workflow**
4. The workflow will revert to the previous commit

**Frontend:**
1. Go to **Actions** tab
2. Select **Deploy Frontend**
3. Click **Run workflow**
4. The workflow will revert to the previous Vercel deployment

---

## Verification Steps

### 1. Verify CI Pipeline

```bash
# Create a test branch
git checkout -b test-ci-branch
git push origin test-ci-branch

# Check: Workflow triggers, all checks pass, artifacts uploaded
# Navigate to: https://github.com/YOUR_USERNAME/ai-productivity-assistant/actions
```

### 2. Verify Docker Hub Image

```bash
# Pull the image
docker pull YOUR_USERNAME/ai-productivity-backend:latest

# Run locally
docker run -p 8000:8000 YOUR_USERNAME/ai-productivity-backend:latest

# Test health endpoint
curl http://localhost:8000/health
```

### 3. Verify Backend Deployment

```bash
# Check HuggingFace Space health
curl https://YOUR_USERNAME-ai-productivity-backend.hf.space/health

# Expected output: {"status":"healthy"}
```

### 4. Verify Frontend Deployment

```bash
# Check Vercel deployment
curl https://ai-productivity-frontend.vercel.app

# Should return HTML content
```

---

## GitHub Actions Interface

### Viewing Workflow Runs

1. Go to **Actions** tab in your repository
2. Click on a workflow to see history
3. Click on a run to see details

### Downloading Artifacts

1. Go to a workflow run
2. Scroll to **Artifacts** section
3. Download build artifacts (frontend-dist, coverage-report, etc.)

### Viewing Security Scans

1. Go to **Security** tab in your repository
2. Click **Code scanning alerts**
3. View Trivy scan results

---

## Troubleshooting

For common issues and solutions, see [Troubleshooting Guide](./phase5-troubleshooting.md).

---

## Best Practices

### Branch Protection

Enable branch protection for `master`:

1. Go to **Settings → Branches**
2. Click **Add rule**
3. Branch name pattern: `master`
4. Enable:
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - Select: `CI / backend-ci`, `CI / frontend-ci`
   - ✅ Require pull request reviews
   - ✅ Do not allow bypassing

### Commit Messages

Use clear, descriptive commit messages:

```bash
# Good
git commit -m "Add user authentication endpoint"

# Bad
git commit -m "fix stuff"
```

### Pull Requests

Always use PRs for changes:

1. Create feature branch
2. Make changes
3. Open PR
4. Wait for CI to pass
5. Request review
6. Merge after approval

---

## Monitoring

### CI Pipeline Status

- **Target Duration**: <10 minutes
- **Success Rate**: >95%
- **False Positive Rate**: <5%

### Deployment Status

- **Target Duration**: <5 minutes
- **Success Rate**: >98%

---

## Cost Summary

| Component | Cost (Monthly) |
|-----------|----------------|
| GitHub Actions | $0 (2000 free minutes) |
| Docker Hub | $0 (free public repos) |
| Vercel | $0 (free hobby tier) |
| HuggingFace Spaces | $0 (free CPU tier) |
| **Total** | **$0** |

---

## Support

For issues or questions:

1. Check [Troubleshooting Guide](./phase5-troubleshooting.md)
2. Check [Environment Configuration](./phase5-environment.md)
3. Review GitHub Actions logs
4. Open an issue on GitHub

---

**Next Steps:**

- [Environment Configuration Guide](./phase5-environment.md)
- [Troubleshooting Guide](./phase5-troubleshooting.md)
