# AI Productivity Assistant - Kubernetes Deployment Guide

This guide covers deploying the AI Productivity Assistant on a local Kubernetes cluster using Minikube.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Deployment Steps](#detailed-deployment-steps)
- [Verification](#verification)
- [Accessing the Application](#accessing-the-application)
- [Development Workflow](#development-workflow)
- [Cleanup](#cleanup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

Install the following software before proceeding:

| Tool | Version | Installation |
|------|---------|--------------|
| **Docker** | 20.10+ | [docker.com](https://docs.docker.com/get-docker/) |
| **Minikube** | 1.28+ | [minikube.sigs.k8s.io](https://minikube.sigs.k8s.io/docs/start/) |
| **kubectl** | 1.28+ | [kubernetes.io](https://kubernetes.io/docs/tasks/tools/) |
| **Helm** | 3.x | [helm.sh](https://helm.sh/docs/intro/install/) |

### Verify Installation

```bash
# Check versions
docker --version
minikube version
kubectl version --client
helm version
```

### Required Resources

- **CPU**: 4 cores minimum
- **RAM**: 8GB minimum
- **Disk**: 20GB free space

### Required Accounts/Services

1. **Neon PostgreSQL** - Cloud-hosted database
   - Sign up at [neon.tech](https://neon.tech)
   - Create a PostgreSQL database
   - Save the connection string

2. **OpenAI API** - AI chat functionality
   - Get API key at [platform.openai.com](https://platform.openai.com/api-keys)
   - Ensure account has credits

---

## Quick Start

The fastest way to deploy is using the automated deployment script:

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd PHASE1_AI_FIRST_PERSONAL_PRODUCTIVITY_ASSISTANT

# Deploy everything
./scripts/deploy.sh
```

The script will:
1. Check prerequisites
2. Start Minikube
3. Build Docker images
4. Prompt for credentials (OpenAI key, Database URL)
5. Create Kubernetes secrets
6. Deploy with Helm
7. Show access information

**Output:**
```
✓ Minikube is running
✓ Images built
✓ Secrets created
✓ Helm chart deployed

Access the application:
  minikube service ai-assistant-frontend
```

---

## Detailed Deployment Steps

If you prefer manual deployment or need to customize the process:

### Step 1: Start Minikube

```bash
# Start Minikube with adequate resources
minikube start --cpus=4 --memory=8192 --driver=docker

# Optional: Enable ingress addon
minikube addons enable ingress

# Verify Minikube is running
minikube status
```

**Expected output:**
```
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

### Step 2: Build Docker Images

Images must be built within Minikube's Docker context:

```bash
# Configure shell to use Minikube's Docker daemon
eval $(minikube docker-env)

# Build frontend image
docker build -t ai-productivity-frontend:latest ./frontend

# Build backend image
docker build -t ai-productivity-backend:latest .

# Verify images are in Minikube
minikube image ls | grep ai-productivity
```

**Image size targets:**
- Frontend: <500MB
- Backend: <400MB

### Step 3: Create Kubernetes Secrets

Create a secret for sensitive configuration:

```bash
# Option 1: Use the script (interactive)
./scripts/create-secrets.sh

# Option 2: Manual creation
kubectl create secret generic ai-assistant-secrets \
  --from-literal=openai-api-key="sk-your-openai-key" \
  --from-literal=database-url="postgresql://user:pass@host:5432/dbname" \
  --from-literal=jwt-secret="your-random-jwt-secret"
```

**Secret details:**
| Key | Description | Example |
|-----|-------------|---------|
| `openai-api-key` | OpenAI API key | `sk-...` |
| `database-url` | PostgreSQL connection string | `postgresql://user:pass@ep-...aws.neon.tech:5432/neondb` |
| `jwt-secret` | JWT signing secret | Random 32+ character string |

**Generate JWT secret:**
```bash
# Using OpenSSL
openssl rand -base64 32

# Or use /dev/urandom
head -c 32 /dev/urandom | base64
```

### Step 4: Deploy with Helm

```bash
# Install the Helm chart
helm install ai-assistant ./helm/ai-productivity-assistant \
  --values ./helm/ai-productivity-assistant/values-dev.yaml
```

**Helm will create:**
- 2 Frontend pods (Nginx serving React)
- 2 Backend pods (FastAPI)
- Frontend LoadBalancer service
- Backend ClusterIP service
- ConfigMap (CORS, logging)
- Secrets (already created)

**Verify Helm release:**
```bash
helm list
helm status ai-assistant
```

---

## Verification

### Check Pod Status

```bash
# Get all pods
kubectl get pods -l app.kubernetes.io/name=ai-productivity-assistant

# Expected output:
# NAME                                    READY   STATUS    RESTARTS   AGE
# ai-assistant-frontend-xxxxxxxxxx-xxxxx   1/1     Running   0          1m
# ai-assistant-frontend-xxxxxxxxxx-xxxxx   1/1     Running   0          1m
# ai-assistant-backend-xxxxxxxxxx-xxxxx    1/1     Running   0          1m
# ai-assistant-backend-xxxxxxxxxx-xxxxx    1/1     Running   0          1m
```

### Check Services

```bash
# Get services
kubectl get svc -l app.kubernetes.io/name=ai-productivity-assistant

# Expected output:
# NAME                         TYPE           EXTERNAL-IP      PORT(S)        AGE
# ai-assistant-frontend        LoadBalancer   <pending>        80:xxxxx/TCP   1m
# ai-assistant-backend         ClusterIP      10.xx.xxx.xx     8000/TCP       1m
```

### Run Verification Script

```bash
./scripts/verify.sh
```

This will check:
- Minikube status
- Helm release status
- Pod readiness
- Service endpoints
- Secret configuration
- Resource usage

---

## Accessing the Application

### Option 1: Minikube Service Command (Recommended)

```bash
# Open frontend in default browser
minikube service ai-assistant-frontend
```

This automatically opens the application in your browser.

### Option 2: Port Forwarding

```bash
# Forward frontend to localhost:8080
kubectl port-forward svc/ai-assistant-frontend 8080:80

# Forward backend to localhost:8000
kubectl port-forward svc/ai-assistant-backend 8000:8000
```

Then access:
- Frontend: http://localhost:8080
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 3: Minikube Tunnel

```bash
# Start tunnel in background
minikube tunnel &

# Get LoadBalancer IP
kubectl get svc ai-assistant-frontend
```

Use the EXTERNAL-IP shown.

---

## Development Workflow

### Making Changes to Backend

```bash
# 1. Edit source code
vim src/backend/main.py

# 2. Rebuild backend image
eval $(minikube docker-env)
docker build -t ai-productivity-backend:latest .

# 3. Restart backend pods
kubectl rollout restart deployment ai-assistant-backend

# 4. Watch pods restart
kubectl get pods -w
```

### Making Changes to Frontend

```bash
# 1. Edit source code
vim frontend/src/App.tsx

# 2. Rebuild frontend image
eval $(minikube docker-env)
docker build -t ai-productivity-frontend:latest ./frontend

# 3. Restart frontend pods
kubectl rollout restart deployment ai-assistant-frontend

# 4. Watch pods restart
kubectl get pods -w
```

### Viewing Logs

```bash
# Frontend logs (all pods)
kubectl logs -l app.kubernetes.io/component=frontend -f

# Backend logs (all pods)
kubectl logs -l app.kubernetes.io/component=backend -f

# Specific pod logs
kubectl logs <pod-name> -f

# Logs from previous container (if pod restarted)
kubectl logs <pod-name> --previous
```

### Debugging Pods

```bash
# Describe pod (events, status)
kubectl describe pod <pod-name>

# Execute into pod
kubectl exec -it <pod-name> -- /bin/sh

# Port forward to specific pod
kubectl port-forward <pod-name> 8000:8000
```

---

## Cleanup

### Remove Deployment Only

```bash
# Use the cleanup script
./scripts/cleanup.sh

# Or manually
helm uninstall ai-assistant
kubectl delete secret ai-assistant-secrets
```

### Stop Minikube

```bash
# Stop Minikube (keeps cluster state)
minikube stop

# Start again later
minikube start
```

### Delete Minikube Cluster

```bash
# Complete cleanup (removes all data)
minikube delete

# Or use the script
./scripts/cleanup.sh --purge -y
```

---

## Troubleshooting

### Pods Not Starting

**Symptom:** Pods stuck in `Pending` or `ImagePullBackOff` status

**Solutions:**

1. Check pod status:
   ```bash
   kubectl get pods
   kubectl describe pod <pod-name>
   ```

2. Common causes:
   - **Image not found**: Rebuild images in Minikube context
   - **Resource limits**: Increase Minikube resources
   - **Secrets missing**: Create secrets with `./scripts/create-secrets.sh`

### Database Connection Issues

**Symptom:** Backend logs show "connection refused" or "could not connect"

**Solutions:**

1. Verify DATABASE_URL is correct:
   ```bash
   kubectl get secret ai-assistant-secrets -o jsonpath='{.data.database-url}' | base64 -d
   ```

2. Test connectivity from pod:
   ```bash
   kubectl exec -it <backend-pod> -- sh
   # Inside pod, test database connection
   ```

3. Check Neon database is running and accessible

### Frontend Can't Reach Backend

**Symptom:** API calls fail in browser console

**Solutions:**

1. Check backend service:
   ```bash
   kubectl get svc ai-assistant-backend
   ```

2. Check frontend environment variable:
   ```bash
   kubectl exec -it <frontend-pod> -- env | grep API_URL
   ```

3. Verify CORS configuration:
   ```bash
   kubectl get configmap ai-assistant-config -o yaml
   ```

### Minikube Issues

**Symptom:** Minikube won't start or crashes

**Solutions:**

1. Check Minikube status:
   ```bash
   minikube status
   ```

2. Delete and recreate:
   ```bash
   minikube delete
   minikube start --cpus=4 --memory=8192
   ```

3. Check logs:
   ```bash
   minikube logs
   ```

### Resource Issues

**Symptom:** OOMKilled or CPU throttling

**Solutions:**

1. Increase Minikube resources:
   ```bash
   minikube config set cpus 4
   minikube config set memory 8192
   minikube start
   ```

2. Adjust pod resource limits in `values.yaml`:
   ```yaml
   resources:
     requests:
       cpu: 100m
       memory: 128Mi
     limits:
       cpu: 500m
       memory: 512Mi
   ```

### Helm Chart Issues

**Symptom:** `helm install` fails with validation errors

**Solutions:**

1. Lint the chart:
   ```bash
   helm lint ./helm/ai-productivity-assistant
   ```

2. Dry-run to check manifests:
   ```bash
   helm template ai-assistant ./helm/ai-productivity-assistant \
     --values ./helm/ai-productivity-assistant/values-dev.yaml \
     --dry-run --debug
   ```

3. Check Helm version:
   ```bash
   helm version
   # Requires Helm 3.x
   ```

---

## Advanced Topics

### Scaling Applications

```bash
# Scale backend to 3 replicas
kubectl scale deployment ai-assistant-backend --replicas=3

# Scale frontend to 3 replicas
kubectl scale deployment ai-assistant-frontend --replicas=3

# Verify scaling
kubectl get pods
```

### Updating Configuration

```bash
# Update ConfigMap
kubectl edit configmap ai-assistant-config

# Restart pods to pick up changes
kubectl rollout restart deployment ai-assistant-backend

# Or update via Helm
helm upgrade ai-assistant ./helm/ai-productivity-assistant \
  --values ./helm/ai-productivity-assistant/values-dev.yaml \
  --set backend.envConfig.LOG_LEVEL=debug
```

### Checking Resource Usage

```bash
# Pod resource usage
kubectl top pods -l app.kubernetes.io/name=ai-productivity-assistant

# Node resource usage
kubectl top nodes

# Detailed pod resources
kubectl describe pod <pod-name> | grep -A 5 Limits
```

---

## Support

For additional help:

1. Check the [troubleshooting guide](./TROUBLESHOOTING.md)
2. Review script documentation in `scripts/README.md`
3. Check pod logs: `kubectl logs <pod-name>`
4. Open an issue on GitHub

---

**Last Updated:** 2025-01-30
**Version:** 1.0.0
