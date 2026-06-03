# Script de deploiement complet sur Windows / PowerShell avec kind
# Pre-requis : Docker Desktop demarre + kind + kubectl dans le PATH
#
# Usage :
#   ./deploy.ps1            # deploie l'app (core) + tente le monitoring (bonus)
#   ./deploy.ps1 -CoreOnly  # deploie uniquement l'app (sans monitoring) - recommande si RAM limitee

param([switch]$CoreOnly)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$cluster = "ecommerce"

Write-Host "==> 1. Verification de Docker" -ForegroundColor Cyan
docker info | Out-Null

Write-Host "`n==> 2. Creation du cluster kind (si absent)" -ForegroundColor Cyan
$existing = kind get clusters 2>$null
if ($existing -contains $cluster) {
  Write-Host "Cluster '$cluster' deja present."
} else {
  kind create cluster --config "$root\kind-config.yaml" --wait 150s
}
kubectl config use-context "kind-$cluster" | Out-Null

Write-Host "`n==> 3. Build des images Docker" -ForegroundColor Cyan
docker build -t ecommerce-backend:1.0  "$root\backend"
docker build -t ecommerce-frontend:1.0 "$root\frontend"

Write-Host "`n==> 4. Chargement des images dans le cluster kind" -ForegroundColor Cyan
kind load docker-image ecommerce-backend:1.0  --name $cluster
kind load docker-image ecommerce-frontend:1.0 --name $cluster

Write-Host "`n==> 5. Application des manifestes (app principale)" -ForegroundColor Cyan
kubectl apply -f "$root\k8s\00-namespace.yaml"
kubectl apply -f "$root\k8s\01-secret-mongo.yaml"
kubectl apply -f "$root\k8s\02-configmap-backend.yaml"
kubectl apply -f "$root\k8s\03-pv-pvc-mongo.yaml"
kubectl apply -f "$root\k8s\04-deployment-backend-db.yaml"
kubectl apply -f "$root\k8s\05-service-backend.yaml"
kubectl apply -f "$root\k8s\06-deployment-frontend.yaml"
kubectl apply -f "$root\k8s\07-service-frontend.yaml"

Write-Host "`n==> 6. Attente du demarrage des Pods (app)" -ForegroundColor Cyan
kubectl wait --for=condition=ready pod -l app=backend-db -n ecommerce --timeout=240s
kubectl wait --for=condition=ready pod -l app=frontend   -n ecommerce --timeout=120s

if (-not $CoreOnly) {
  Write-Host "`n==> 7. Monitoring (bonus, non-bloquant)" -ForegroundColor Cyan
  try {
    kubectl apply -f "$root\k8s\08-configmap-prometheus.yaml"
    kubectl apply -f "$root\k8s\09-configmap-grafana.yaml"
    kubectl apply -f "$root\k8s\10-deployment-monitoring.yaml"
    kubectl apply -f "$root\k8s\11-service-monitoring.yaml"
    kubectl wait --for=condition=ready pod -l app=monitoring -n ecommerce --timeout=120s
    Write-Host "Monitoring pret." -ForegroundColor Green
  } catch {
    Write-Host "Monitoring non demarre (RAM ?). L'app principale fonctionne. Relancez avec plus de RAM ou ignorez." -ForegroundColor Yellow
  }
}

Write-Host "`n==> 8. Etat du cluster" -ForegroundColor Cyan
kubectl get nodes
kubectl get all,pv,pvc -n ecommerce

Write-Host "`nDeploiement termine !" -ForegroundColor Green
Write-Host "  Frontend   : http://localhost:30080" -ForegroundColor Green
if (-not $CoreOnly) {
  Write-Host "  Prometheus : http://localhost:30090" -ForegroundColor Green
  Write-Host "  Grafana    : http://localhost:30030  (admin / admin123)" -ForegroundColor Green
}
