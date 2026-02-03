# Phase V: CI/CD Troubleshooting Guide

## Common Issues and Solutions

---

## CI Pipeline Issues

### Issue: CI workflow doesn't trigger

**Symptoms:**
- Pushing to branch doesn't trigger CI
- Pull request doesn't show status checks

**Solutions:**

1. **Check workflow file syntax:**
   ```bash
   # Validate YAML syntax
   yamllint .github/workflows/ci.yml
   ```

2. **Check workflow triggers:**
   - Ensure workflow file is on the default branch (`master`)
   - Check `on:` section matches your branch names

3. **Check GitHub Actions permissions:**
   - Go to **Settings → Actions → General**
   - Ensure "Allow all actions and reusable workflows" is selected

4. **Force workflow refresh:**
   - Make a trivial commit (e.g., update README)
   - Push to trigger workflow

---

### Issue: Backend tests fail in CI but pass locally

**Symptoms:**
- `pytest` fails in GitHub Actions
- Tests pass when running locally

**Solutions:**

1. **Check Python version:**
   ```bash
   # CI uses Python 3.12
   python --version  # Should match
   ```

2. **Check environment variables:**
   ```yaml
   # CI workflow sets these automatically
   env:
     DATABASE_URL: sqlite+aiosqlite:///:memory:
     GROQ_API_KEY: test_key_for_ci
   ```

3. **Check import paths:**
   ```bash
   # Run tests from project root
   pytest tests/ -v
   # NOT: cd tests && pytest
   ```

4. **Check missing dependencies:**
   ```bash
   # Compare local vs CI requirements
   pip freeze | grep -i pytest
   pip install pytest pytest-cov
   ```

---

### Issue: Docker build fails in CI

**Symptoms:**
- `docker build` step fails
- Error: "failed to solve"

**Solutions:**

1. **Check Dockerfile syntax:**
   ```bash
   # Test build locally first
   docker build -t test .
   ```

2. **Check for large files:**
   ```bash
   # Docker build can fail with large cache
   # Add to .dockerignore:
   node_modules/
   __pycache__/
   *.pyc
   .git/
   .env
   ```

3. **Check build timeouts:**
   ```yaml
   # Add timeout to build step
   - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          timeout: 3600  # 1 hour
   ```

4. **Check platform compatibility:**
   ```yaml
   # CI builds for linux/amd64
   platforms: linux/amd64
   ```

---

### Issue: Frontend build fails in CI

**Symptoms:**
- `npm run build` fails
- TypeScript errors

**Solutions:**

1. **Check Node version:**
   ```bash
   # CI uses Node 20
   node --version  # Should be 20.x
   ```

2. **Clear npm cache:**
   ```bash
   rm -rf frontend/node_modules
   rm frontend/package-lock.json
   cd frontend && npm install
   ```

3. **Check environment variables:**
   ```yaml
   # CI sets VITE_API_BASE_URL
   env:
     VITE_API_BASE_URL: https://huggingface.co/spaces/YOUR_USERNAME/ai-productivity-backend
   ```

4. **Check TypeScript errors:**
   ```bash
   cd frontend
   npx tsc --noEmit
   ```

---

## Deployment Issues

### Issue: Backend deployment fails to push to Docker Hub

**Symptoms:**
- `docker push` fails with authentication error
- Error: "denied: access forbidden"

**Solutions:**

1. **Verify Docker Hub credentials:**
   ```bash
   # Test locally
   docker login -u YOUR_USERNAME
   # Enter DOCKER_PASSWORD when prompted
   docker push YOUR_USERNAME/ai-productivity-backend:test
   ```

2. **Regenerate Docker Hub token:**
   - Go to [Docker Hub Settings](https://hub.docker.com/settings/security)
   - Delete old token
   - Create new access token
   - Update GitHub Secret: `DOCKER_PASSWORD`

3. **Check Docker Hub username:**
   - Ensure `DOCKER_USERNAME` matches your Docker Hub username (not email)

4. **Check repository exists:**
   - Create repository on Docker Hub first: `ai-productivity-backend`

---

### Issue: HuggingFace deployment fails

**Symptoms:**
- Git push to HuggingFace fails
- Error: "Authentication failed"

**Solutions:**

1. **Verify HF token:**
   ```bash
   # Test locally
   git clone https://YOUR_USERNAME:HF_TOKEN@huggingface.co/spaces/YOUR_USERNAME/ai-productivity-backend
   ```

2. **Regenerate HF token:**
   - Go to [HuggingFace Settings → Access Tokens](https://huggingface.co/settings/tokens)
   - Create new token with **Write** permissions
   - Update GitHub Secret: `HF_TOKEN`

3. **Check HuggingFace Space exists:**
   - Ensure Space is created: `huggingface.co/spaces/YOUR_USERNAME/ai-productivity-backend`
   - Ensure Space SDK is set to **Docker**

4. **Check Space build logs:**
   - Go to your Space on HuggingFace
   - Click **Settings**
   - Click **Logs** to see build errors

5. **Manual deployment:**
   ```bash
   # Clone Space locally
   git clone https://huggingface.co/spaces/YOUR_USERNAME/ai-productivity-backend
   cd ai-productivity-backend

   # Copy files from project
   cp -r /path/to/project/src/* .
   cp /path/to/project/Dockerfile .
   cp /path/to/project/requirements.txt .

   # Commit and push
   git add .
   git commit -m "Manual deployment"
   git push
   ```

---

### Issue: Vercel deployment fails

**Symptoms:**
- Vercel CLI returns error
- Build fails on Vercel

**Solutions:**

1. **Verify Vercel credentials:**
   ```bash
   # Login locally
   vercel login

   # List deployments
   vercel list

   # Deploy manually
   cd frontend
   vercel --prod
   ```

2. **Get Vercel project IDs:**
   ```bash
   cd frontend
   vercel link

   # This creates .vercel/project.json with:
   # - VERCEL_ORG_ID
   # - VERCEL_PROJECT_ID

   cat .vercel/project.json
   ```

3. **Regenerate Vercel token:**
   - Go to [Vercel Tokens](https://vercel.com/account/tokens)
   - Create new token
   - Update GitHub Secret: `VERCEL_TOKEN`

4. **Check build logs on Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click on your project
   - Click on failed deployment
   - Review build logs

---

### Issue: Health check fails after deployment

**Symptoms:**
- `/health` endpoint returns error
- Timeout during health check

**Solutions:**

1. **Check backend is running:**
   ```bash
   # HuggingFace
   curl https://YOUR_USERNAME-ai-productivity-backend.hf.space/health

   # Docker Hub image locally
   docker run -p 8000:8000 YOUR_USERNAME/ai-productivity-backend:latest
   curl http://localhost:8000/health
   ```

2. **Check HuggingFace Space status:**
   - Go to your Space
   - Check if it's in "Running" state
   - If "Sleeping", click "Wake up"

3. **Check build logs:**
   - Space → Settings → Logs
   - Look for Python errors

4. **Increase health check timeout:**
   ```yaml
   # In deploy-backend.yml
   - name: Health check
        run: |
          sleep 60  # Wait longer for build
   ```

---

## Security Scan Issues

### Issue: Trivy finds vulnerabilities

**Symptoms:**
- Security scan fails
- CRITICAL or HIGH vulnerabilities found

**Solutions:**

1. **Review vulnerabilities:**
   - Go to **Security → Code scanning**
   - Click on Trivy alert
   - Review affected packages

2. **Update dependencies:**
   ```bash
   # Backend
   pip install --upgrade PACKAGE_NAME

   # Frontend
   npm update PACKAGE_NAME
   ```

3. **Use specific versions:**
   ```txt
   # In requirements.txt, pin versions
   fastapi==0.115.0
   uvicorn==0.32.0
   ```

4. **Accept risk (if false positive):**
   ```yaml
   # Continue on error
   - name: Run Trivy vulnerability scanner
        continue-on-error: true
   ```

---

## Rollback Procedures

### Backend Rollback

**Option 1: GitHub Actions (Automatic)**

1. Go to **Actions → Deploy Backend**
2. Click **Run workflow**
3. Select branch with previous commit
4. Click **Run workflow**

**Option 2: Manual Git Rollback**

```bash
# Clone HuggingFace Space
git clone https://huggingface.co/spaces/YOUR_USERNAME/ai-productivity-backend
cd ai-productivity-backend

# Revert last commit
git reset --hard HEAD~1

# Force push
git push --force
```

**Option 3: Docker Hub Rollback**

```bash
# Pull previous image (tagged with commit SHA)
docker pull YOUR_USERNAME/ai-productivity-backend:PREVIOUS_COMMIT_SHA

# Re-tag as latest
docker tag YOUR_USERNAME/ai-productivity-backend:PREVIOUS_COMMIT_SHA YOUR_USERNAME/ai-productivity-backend:latest

# Push
docker push YOUR_USERNAME/ai-productivity-backend:latest
```

### Frontend Rollback

**Option 1: Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Click **Deployments**
4. Find previous deployment
5. Click **Promote to Production**

**Option 2: GitHub Actions**

1. Go to **Actions → Deploy Frontend**
2. Click **Run workflow**
3. Click **Run workflow** (triggers rollback)

**Option 3: Vercel CLI**

```bash
# List recent deployments
vercel list

# Rollback to specific URL
vercel alias set PREVIOUS_DEPLOYMENT_URL ai-productivity-frontend
```

---

## Debugging Tips

### Enable Debug Logging

```yaml
# Add to workflow step
- name: Debug step
        run: |
          echo "Runner OS: ${{ runner.os }}"
          echo "Event: ${{ github.event_name }}"
          echo "Ref: ${{ github.ref }}"
        env:
          DEBUG: true
          ACTIONS_STEP_DEBUG: true
```

### View Runner Logs

1. Go to workflow run
2. Click on failed job
3. Click on failed step
4. Expand logs to see full output

### Test Locally with Act

```bash
# Install act (run GitHub Actions locally)
brew install act  # macOS
# or: choco install act  # Windows

# Run CI workflow locally
act push

# Run specific job
act -j backend-ci
```

---

## Getting Help

If issues persist:

1. **Check workflow logs:** GitHub Actions tab
2. **Check deployment logs:** Vercel/HuggingFace dashboards
3. **Search error messages:** Google with error code
4. **Open GitHub issue:** With logs and steps to reproduce

---

**Useful Links:**

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [Vercel Documentation](https://vercel.com/docs)
- [HuggingFace Spaces Documentation](https://huggingface.co/docs/hub/spaces)
