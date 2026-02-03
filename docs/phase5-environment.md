# Phase V: Environment Configuration Guide

This guide explains how to configure all required GitHub Secrets and environment variables for the CI/CD pipeline.

---

## Required GitHub Secrets

Navigate to: **Repository → Settings → Secrets and variables → Actions → New repository secret**

### Summary Table

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DOCKER_USERNAME` | Docker Hub username | `johndoe` |
| `DOCKER_PASSWORD` | Docker Hub access token | `dckr_pat_abc123...` |
| `VERCEL_TOKEN` | Vercel API token | `JPjvYx...` |
| `VERCEL_ORG_ID` | Vercel organization ID | `team_abc123...` |
| `VERCEL_PROJECT_ID` | Vercel project ID | `prj_abc123...` |
| `HF_TOKEN` | HuggingFace access token | `hf_xxx...` |
| `HF_USERNAME` | HuggingFace username | `johndoe` |

---

## 1. Docker Hub Configuration

### Step 1: Create Docker Hub Account

1. Go to [hub.docker.com](https://hub.docker.com)
2. Click **Sign Up**
3. Verify your email

### Step 2: Create Access Token

1. Go to [Docker Hub Security Settings](https://hub.docker.com/settings/security)
2. Click **New Access Token**
3. Configure:
   - **Access Token Description**: `GitHub Actions CI/CD`
   - **Access Permissions**: Read, Write, Delete
4. Click **Generate**
5. **Copy the token** - you won't see it again!

### Step 3: Add GitHub Secrets

| Secret Name | Value |
|-------------|-------|
| `DOCKER_USERNAME` | Your Docker Hub username (e.g., `johndoe`) |
| `DOCKER_PASSWORD` | The access token you just created |

### Step 4: Create Repository

1. Go to [Docker Hub](https://hub.docker.com)
2. Click **Create Repository**
3. Configure:
   - **Name**: `ai-productivity-backend`
   - **Visibility**: Public
4. Click **Create**

---

## 2. HuggingFace Configuration

### Step 1: Create HuggingFace Account

1. Go to [huggingface.co](https://huggingface.co)
2. Click **Sign Up**
3. Verify your email

### Step 2: Create Access Token

1. Go to [HuggingFace Access Tokens](https://huggingface.co/settings/tokens)
2. Click **New token**
3. Configure:
   - **Token name**: `GitHub Actions CI/CD`
   - **Token type**: **Write** (important!)
4. Click **Generate token**
5. **Copy the token**

### Step 3: Add GitHub Secrets

| Secret Name | Value |
|-------------|-------|
| `HF_TOKEN` | The access token you just created |
| `HF_USERNAME` | Your HuggingFace username (e.g., `johndoe`) |

### Step 4: Create HuggingFace Space

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces)
2. Click **Create new Space**
3. Configure:
   - **Owner**: Your username
   - **Space name**: `ai-productivity-backend`
   - **License**: MIT
   - **SDK**: Docker
   - **Hardware**: CPU basic (free tier)
   - **Visibility**: Public
4. Click **Create Space**

---

## 3. Vercel Configuration

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Sign up with GitHub (recommended)

### Step 2: Create Access Token

1. Go to [Vercel Tokens](https://vercel.com/account/tokens)
2. Click **Create Token**
3. Configure:
   - **Token Name**: `GitHub Actions CI/CD`
4. Click **Create**
5. **Copy the token**

### Step 3: Add GitHub Secret

| Secret Name | Value |
|-------------|-------|
| `VERCEL_TOKEN` | The token you just created |

### Step 4: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**

### Step 5: Get Project IDs

**Method 1: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
cd frontend
vercel link

# View project configuration
cat .vercel/project.json
```

The output will show:
```json
{
  "orgId": "team_abc123...",
  "projectId": "prj_xyz789..."
}
```

**Method 2: From Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **General**
4. Copy **Project ID**
5. For **Org ID**: Click your profile → Settings → Copy **Team ID**

### Step 6: Add GitHub Secrets

| Secret Name | Value |
|-------------|-------|
| `VERCEL_ORG_ID` | Your organization/team ID (e.g., `team_abc123...`) |
| `VERCEL_PROJECT_ID` | Your project ID (e.g., `prj_xyz789...`) |

---

## Environment Variables

### CI Environment Variables

These are automatically set in `.github/workflows/ci.yml`:

```yaml
env:
  PYTHON_VERSION: '3.12'
  NODE_VERSION: '20'
```

### Backend Environment Variables

These are required for running the backend:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://user:pass@host/db` |
| `GROQ_API_KEY` | Groq AI API key | `gsk_abc123...` |
| `JWT_SECRET_KEY` | Secret for JWT tokens | `your-secret-key` |
| `CORS_ORIGINS` | Allowed CORS origins | `["https://ai-productivity-frontend.vercel.app"]` |

### Frontend Environment Variables

These are set in `frontend/.env.production`:

```bash
VITE_API_BASE_URL=https://YOUR_USERNAME-ai-productivity-backend.hf.space
```

---

## Verification

### Test Docker Hub Credentials

```bash
docker login -u $DOCKER_USERNAME
# Enter DOCKER_PASSWORD when prompted
# Should see: Login Succeeded

docker pull hello-world
docker run hello-world
```

### Test HuggingFace Credentials

```bash
# Clone your Space
git clone https://HF_USERNAME:HF_TOKEN@huggingface.co/spaces/HF_USERNAME/ai-productivity-backend

# Make a test change
cd ai-productivity-backend
echo "test" > test.txt
git add test.txt
git commit -m "test"
git push

# Should see: Successfully pushed
```

### Test Vercel Credentials

```bash
# Install Vercel CLI
npm install -g vercel

# Login with token
echo $VERCEL_TOKEN | vercel login --token

# List deployments
vercel list

# Should see your deployments
```

---

## Security Best Practices

### 1. Token Rotation

Rotate tokens regularly (every 90 days):

- **Docker Hub**: Delete old token, create new one
- **HuggingFace**: Delete old token, create new one
- **Vercel**: Delete old token, create new one

### 2. Least Privilege

- Use **Read** permissions when possible
- Only use **Write** when necessary (e.g., HuggingFace deployment)
- Delete tokens after use (if one-time)

### 3. Secret Masking

GitHub automatically masks secrets in logs. To verify:

```yaml
# This should NOT show the actual token in logs
- name: Test secret
        run: echo "Token is ${{ secrets.DOCKER_PASSWORD }}"
# Output: Token is ***
```

### 4. Never Commit Secrets

Ensure `.gitignore` includes:

```gitignore
# Environment files
.env
.env.local
.env.*.local

# Vercel
.vercel/

# Python
__pycache__/
*.pyc

# Node
node_modules/
```

---

## Environment-Specific Configuration

### Development (Local)

```bash
# backend/.env
DATABASE_URL=sqlite+aiosqlite:///./local.db
GROQ_API_KEY=your-dev-key
JWT_SECRET_KEY=dev-secret-key
CORS_ORIGINS=["http://localhost:5173"]
```

### Production (HuggingFace)

```bash
# Set in HuggingFace Space Settings → Secrets
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
GROQ_API_KEY=your-prod-key
JWT_SECRET_KEY=strong-random-secret-key
CORS_ORIGINS=["https://ai-productivity-frontend.vercel.app"]
```

### CI (GitHub Actions)

Set automatically in `.github/workflows/ci.yml`:

```yaml
env:
  DATABASE_URL: sqlite+aiosqlite:///:memory:
  GROQ_API_KEY: test_key_for_ci
```

---

## Cost Considerations

All services used have free tiers:

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Docker Hub | Yes | Unlimited public repos |
| HuggingFace Spaces | Yes | CPU basic, 1 container |
| Vercel | Yes | Hobby tier, 100GB bandwidth/month |
| GitHub Actions | Yes | 2000 minutes/month |

**Total Monthly Cost: $0**

---

## Next Steps

After configuring all secrets:

1. ✅ Verify all secrets are set in GitHub
2. ✅ Test credentials locally
3. ✅ Push a test branch to trigger CI
4. ✅ Merge to `master` to trigger deployment
5. ✅ Verify deployments are working

See [CI/CD Guide](./phase5-cicd-guide.md) for usage instructions.
