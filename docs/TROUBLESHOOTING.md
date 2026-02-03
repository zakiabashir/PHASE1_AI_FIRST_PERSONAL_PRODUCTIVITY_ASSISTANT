# Troubleshooting Guide

This guide covers common issues when deploying and running the AI Productivity Assistant on Minikube.

## Table of Contents

- [Prerequisites Issues](#prerequisites-issues)
- [Minikube Issues](#minikube-issues)
- [Docker Image Issues](#docker-image-issues)
- [Pod Issues](#pod-issues)
- [Networking Issues](#networking-issues)
- [Database Issues](#database-issues)
- [Secrets Issues](#secrets-issues)
- [Helm Chart Issues](#helm-chart-issues)
- [Resource Issues](#resource-issues)
- [Application Issues](#application-issues)

---

## Prerequisites Issues

### Docker Not Found

**Symptom:**
```bash
docker: command not found
```

**Solutions:**

1. Install Docker Desktop: [docker.com](https://docs.docker.com/get-docker/)
2. Enable WSL2 integration (Windows):
   - Open Docker Desktop → Settings → Resources → WSL Integration
   - Enable your WSL distribution
3. Restart WSL terminal

### Minikube Not Found

**Symptom:**
```bash
minikube: command not found
```

**Solutions:**

1. Install Minikube: [minikube.sigs.k8s.io](https://minikube.sigs.k8s.io/docs/start/)
2. Verify installation:
   ```bash
   minikube version
   ```

### kubectl Not Found

**Symptom:**
```bash
kubectl: command not found
```

**Solutions:**

1. Install kubectl: [kubernetes.io](https://kubernetes.io/docs/tasks/tools/)
2. Verify version:
   ```bash
   kubectl version --client
   ```

### Helm Not Found

**Symptom:**
```bash
helm: command not found
```

**Solutions:**

1. Install Helm 3.x: [helm.sh](https://helm.sh/docs/intro/install/)
2. Verify version:
   ```bash
   helm version
   ```

---

## Minikube Issues

### Minikube Won't Start

**Symptom:**
```bash
minikube start
# Errors or hangs
```

**Diagnosis:**
```bash
minikube status
minikube logs
```

**Solutions:**

1. Check virtualization is enabled:
   ```bash
   # Linux
   lscpu | grep Virtualization

   # Windows
   systeminfo | findstr Virtualization
   ```

2. Delete and restart Minikube:
   ```bash
   minikube delete
   minikube start --cpus=4 --memory=8192 --driver=docker
   ```

3. Try different driver:
   ```bash
   minikube start --driver=podman
   # or
   minikube start --driver=virtualbox
   ```

### Minikube Out of Memory

**Symptom:**
```
Exiting due to resource exhaustion
```

**Solutions:**

1. Increase Minikube resources:
   ```bash
   minikube config set memory 8192
   minikube config set cpus 4
   minikube start
   ```

2. Stop unused pods:
   ```bash
   kubectl delete pods --all -n kube-system
   ```

3. Check resource usage:
   ```bash
   minikube ssh
   top
   ```

### Minikube Slow Performance

**Solutions:**

1. Allocate more resources:
   ```bash
   minikube start --cpus=6 --memory=12288
   ```

2. Use Docker driver (faster than VM):
   ```bash
   minikube start --driver=docker
   ```

3. Clear Minikube cache:
   ```bash
   minikube ssh -- docker system prune -a
   ```

---

## Docker Image Issues

### ImagePullBackOff or ErrImagePull

**Symptom:**
```
Status:       ImagePullBackOff
Reason:       ErrImagePull
```

**Diagnosis:**
```bash
kubectl describe pod <pod-name>
# Look for "Failed to pull image"
```

**Solutions:**

1. **Image doesn't exist in Minikube:**

   Build images in Minikube context:
   ```bash
   eval $(minikube docker-env)
   docker build -t ai-productivity-frontend:latest ./frontend
   docker build -t ai-productivity-backend:latest .
   ```

2. **Wrong image tag:**

   Check image tags:
   ```bash
   minikube image ls | grep ai-productivity
   ```

   Update deployment:
   ```bash
   kubectl set image deployment/ai-assistant-frontend \
     frontend=ai-productivity-frontend:latest
   ```

3. **Image name mismatch:**

   Check deployment image:
   ```bash
   kubectl get deployment ai-assistant-frontend -o jsonpath='{.spec.template.spec.containers[0].image}'
   ```

### Image Too Large

**Symptom:**
- Image size >500MB (frontend)
- Image size >400MB (backend)
- Slow pull times

**Solutions:**

1. Check image size:
   ```bash
   docker images | grep ai-productivity
   ```

2. Optimize Dockerfile:
   - Use multi-stage builds (already implemented)
   - Use Alpine base images
   - Add `.dockerignore`

3. Clean up build cache:
   ```bash
   docker builder prune
   ```

---

## Pod Issues

### Pods Stuck in Pending State

**Symptom:**
```
NAME    READY   STATUS    RESTARTS   AGE
pod-x   0/1     Pending   0          5m
```

**Diagnosis:**
```bash
kubectl describe pod <pod-name>
# Check "Events" section
```

**Common Causes & Solutions:**

1. **Insufficient resources:**
   ```bash
   # Check node resources
   kubectl describe node

   # Scale down other deployments
   kubectl scale deployment <name> --replicas=1
   ```

2. **Node not ready:**
   ```bash
   kubectl get nodes
   # If NotReady, check Minikube
   minikube status
   ```

3. **Image pull errors:**
   - See "Docker Image Issues" above

### Pods CrashLoopBackOff

**Symptom:**
```
NAME    READY   STATUS             RESTARTS   AGE
pod-x   0/1     CrashLoopBackOff   5          10m
```

**Diagnosis:**
```bash
# Check pod logs
kubectl logs <pod-name>

# Check previous container logs
kubectl logs <pod-name> --previous

# Describe pod for events
kubectl describe pod <pod-name>
```

**Common Causes & Solutions:**

1. **Missing environment variables:**
   ```bash
   # Check pod env vars
   kubectl exec <pod-name> -- env | grep -i api

   # Verify secrets exist
   kubectl get secrets
   kubectl describe secret ai-assistant-secrets
   ```

2. **Application startup error:**
   - Check logs for Python/Node errors
   - Verify DATABASE_URL format
   - Verify OpenAI API key is valid

3. **Port conflict:**
   ```bash
   # Check ports in use
   kubectl get svc
   ```

### Pods Not Ready

**Symptom:**
```
NAME    READY   STATUS    RESTARTS   AGE
pod-x   0/1     Running   0          5m
```

**Diagnosis:**
```bash
kubectl describe pod <pod-name>
# Check "Events" for readiness probe failures
```

**Solutions:**

1. **Application slow to start:**
   - Increase `initialDelaySeconds` in deployment
   - Check resource limits

2. **Health check failing:**
   ```bash
   # Port forward and test manually
   kubectl port-forward <pod-name> 8000:8000
   curl http://localhost:8000/health
   ```

3. **Resource constraints:**
   ```bash
   kubectl top pods
   # If at limits, increase in values.yaml
   ```

---

## Networking Issues

### Frontend Can't Reach Backend

**Symptom:**
- Browser console shows network errors
- API calls fail with connection refused

**Diagnosis:**
```bash
# Check backend service exists
kubectl get svc ai-assistant-backend

# Check service endpoints
kubectl get endpoints ai-assistant-backend

# Test from frontend pod
kubectl exec -it <frontend-pod> -- sh
# Inside pod:
wget -O- http://ai-productivity-backend:8000/health
```

**Solutions:**

1. **Backend service not found:**
   ```bash
   # Check service DNS
   kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup ai-productivity-backend
   ```

2. **Wrong API URL in frontend:**
   ```bash
   # Check frontend env var
   kubectl exec <frontend-pod> -- env | grep API_URL

   # Should be: http://ai-productivity-backend:8000
   ```

3. **CORS misconfiguration:**
   ```bash
   # Check ConfigMap
   kubectl get configmap ai-assistant-config -o yaml

   # Should include frontend URL
   ```

### Service Not Accessible

**Symptom:**
```
minikube service ai-assistant-frontend
# No URL shown or connection refused
```

**Solutions:**

1. **Check service type:**
   ```bash
   kubectl get svc ai-assistant-frontend -o yaml | grep type
   # Should be: LoadBalancer
   ```

2. **Use port forwarding instead:**
   ```bash
   kubectl port-forward svc/ai-assistant-frontend 8080:80
   ```

3. **Check tunnel status:**
   ```bash
   minikube tunnel
   # Run in separate terminal
   ```

---

## Database Issues

### Database Connection Refused

**Symptom:**
Backend logs show:
```
connection refused
could not connect to server
```

**Diagnosis:**
```bash
# Check DATABASE_URL in secret
kubectl get secret ai-assistant-secrets -o jsonpath='{.data.database-url}' | base64 -d

# Test connectivity from pod
kubectl exec -it <backend-pod> -- sh
# Inside pod:
wget -O- $DATABASE_URL  # Should fail with PostgreSQL error, not connection refused
```

**Solutions:**

1. **Invalid DATABASE_URL format:**
   - Correct format: `postgresql://user:password@host:port/database`
   - Check for typos, extra spaces, missing components

2. **Database not running:**
   - Log into Neon dashboard
   - Verify database is active
   - Check for suspension

3. **Network/firewall issues:**
   - Neon allows all IPs by default
   - Check if IP restrictions were added

### Database Password Wrong

**Symptom:**
```
password authentication failed
```

**Solutions:**

1. **Verify credentials in Neon dashboard**
2. **Update secret:**
   ```bash
   kubectl delete secret ai-assistant-secrets
   ./scripts/create-secrets.sh
   ```
3. **Restart backend:**
   ```bash
   kubectl rollout restart deployment ai-assistant-backend
   ```

---

## Secrets Issues

### Secrets Not Found

**Symptom:**
```
Error from server (NotFound): secrets "ai-assistant-secrets" not found
```

**Solutions:**

1. **Create secrets:**
   ```bash
   ./scripts/create-secrets.sh
   ```

2. **List secrets to verify:**
   ```bash
   kubectl get secrets
   ```

### Empty or Invalid Secrets

**Symptom:**
Pods start but fail with "missing environment variable"

**Diagnosis:**
```bash
# Check secret exists
kubectl get secret ai-assistant-secrets

# Check secret contents (base64 encoded)
kubectl get secret ai-assistant-secrets -o yaml

# Decode a value
kubectl get secret ai-assistant-secrets -o jsonpath='{.data.openai-api-key}' | base64 -d
```

**Solutions:**

1. **Recreate secret:**
   ```bash
   kubectl delete secret ai-assistant-secrets
   kubectl create secret generic ai-assistant-secrets \
     --from-literal=openai-api-key="your-key" \
     --from-literal=database-url="your-url" \
     --from-literal=jwt-secret="your-secret"
   ```

2. **Restart pods:**
   ```bash
   kubectl rollout restart deployment ai-assistant-backend
   ```

---

## Helm Chart Issues

### Helm Install Fails

**Symptom:**
```
Error: execution error at template
```

**Diagnosis:**
```bash
# Lint the chart
helm lint ./helm/ai-productivity-assistant

# Dry-run with debug
helm install ai-assistant ./helm/ai-productivity-assistant \
  --values ./helm/ai-productivity-assistant/values-dev.yaml \
  --dry-run --debug
```

**Common Errors & Solutions:**

1. **Invalid YAML:**
   - Check template syntax
   - Verify indentation (spaces, not tabs)

2. **Missing values:**
   ```bash
   # Check required values
   grep -r "required" helm/ai-productivity-assistant/templates/
   ```

3. **API version incompatibility:**
   ```bash
   # Check Kubernetes version
   kubectl version

   # Verify API versions in templates
   grep "apiVersion" helm/ai-productivity-assistant/templates/
   ```

### Helm Upgrade Fails

**Symptom:**
```
Error: UPGRADE FAILED: another operation (install/upgrade/rollback) is in progress
```

**Solutions:**

1. **Wait and retry:**
   ```bash
   # Check if helm is still working
   helm list

   # Retry after a moment
   helm upgrade ai-assistant ./helm/ai-productivity-assistant
   ```

2. **Force rollback:**
   ```bash
   helm rollback ai-assistant
   ```

---

## Resource Issues

### OOMKilled (Out of Memory)

**Symptom:**
```
Last State:     Terminated
Reason:         OOMKilled
Exit Code:      137
```

**Diagnosis:**
```bash
kubectl describe pod <pod-name>

# Check memory usage
kubectl top pods
```

**Solutions:**

1. **Increase memory limits:**
   ```yaml
   # In values.yaml
   resources:
     limits:
       memory: 512Mi  # Increase from 256Mi
   ```

2. **Increase Minikube memory:**
   ```bash
   minikube config set memory 12288
   minikube start
   ```

3. **Check for memory leaks:**
   ```bash
   kubectl logs <pod-name> --previous
   ```

### CPU Throttling

**Symptom:**
- Slow response times
- High CPU usage in `kubectl top pods`

**Solutions:**

1. **Increase CPU limits:**
   ```yaml
   # In values.yaml
   resources:
     limits:
       cpu: 1000m  # Increase from 500m
   ```

2. **Add more replicas:**
   ```bash
   kubectl scale deployment ai-assistant-backend --replicas=3
   ```

---

## Application Issues

### AI Chat Not Working

**Symptom:**
- Chat returns errors
- No response from AI

**Diagnosis:**
```bash
# Check backend logs
kubectl logs -l app.kubernetes.io/component=backend -f

# Look for OpenAI errors
```

**Solutions:**

1. **Invalid OpenAI API key:**
   ```bash
   # Check secret
   kubectl get secret ai-assistant-secrets -o jsonpath='{.data.openai-api-key}' | base64 -d

   # Should start with "sk-"
   ```

2. **OpenAI quota exceeded:**
   - Check usage at [platform.openai.com](https://platform.openai.com/usage)
   - Add credits to account

3. **Timeout error:**
   - Check network connectivity
   - Increase timeout in backend code

### Tasks Not Persisting

**Symptom:**
- Tasks disappear after refresh
- Data not saving

**Solutions:**

1. **Check database connection:**
   ```bash
   kubectl logs -l app.kubernetes.io/component=backend | grep -i database
   ```

2. **Verify DATABASE_URL:**
   ```bash
   kubectl get secret ai-assistant-secrets -o jsonpath='{.data.database-url}' | base64 -d
   ```

3. **Check database schema:**
   - Ensure migrations ran successfully
   - Verify tables exist

### Frontend Shows 404

**Symptom:**
- Nginx 404 errors
- Blank page

**Solutions:**

1. **Check build completed:**
   ```bash
   # Rebuild frontend image
   docker build -t ai-productivity-frontend:latest ./frontend
   ```

2. **Verify nginx config:**
   ```bash
   kubectl exec -it <frontend-pod> -- cat /etc/nginx/nginx.conf
   ```

3. **Check files exist:**
   ```bash
   kubectl exec -it <frontend-pod> -- ls -la /usr/share/nginx/html
   ```

---

## Getting Help

If issues persist:

1. **Collect diagnostic information:**
   ```bash
   ./scripts/verify.sh > diagnostics.txt 2>&1
   ```

2. **Check logs:**
   ```bash
   # All pod logs
   kubectl logs -l app.kubernetes.io/name=ai-productivity-assistant --all-containers=true > logs.txt
   ```

3. **Describe resources:**
   ```bash
   kubectl describe all > resources.txt
   ```

4. **Open an issue on GitHub** with:
   - Diagnostic output
   - Logs
   - Steps to reproduce
   - Environment details (OS, Minikube version, etc.)

---

**Last Updated:** 2025-01-30
