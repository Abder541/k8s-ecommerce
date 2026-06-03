#!/usr/bin/env bash
# Script de deploiement complet avec kind (Linux / Mac / Git Bash)
# Pre-requis : Docker demarre + kind + kubectl dans le PATH

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLUSTER="ecommerce"

echo "==> 1. Verification de Docker"
docker info >/dev/null

echo
echo "==> 2. Creation du cluster kind (si absent)"
if kind get clusters 2>/dev/null | grep -qx "$CLUSTER"; then
  echo "Cluster '$CLUSTER' deja present."
else
  kind create cluster --config "$ROOT/kind-config.yaml" --wait 120s
fi
kubectl config use-context "kind-$CLUSTER" >/dev/null

echo
echo "==> 3. Build des images Docker"
docker build -t ecommerce-backend:1.0  "$ROOT/backend"
docker build -t ecommerce-frontend:1.0 "$ROOT/frontend"

echo
echo "==> 4. Chargement des images dans le cluster kind"
kind load docker-image ecommerce-backend:1.0  --name "$CLUSTER"
kind load docker-image ecommerce-frontend:1.0 --name "$CLUSTER"

echo
echo "==> 5. Application des manifestes Kubernetes"
kubectl apply -f "$ROOT/k8s/"

echo
echo "==> 6. Attente du demarrage des Pods"
kubectl wait --for=condition=ready pod -l app=backend-db -n ecommerce --timeout=180s
kubectl wait --for=condition=ready pod -l app=frontend   -n ecommerce --timeout=120s
kubectl wait --for=condition=ready pod -l app=monitoring  -n ecommerce --timeout=120s

echo
echo "==> 7. Etat du cluster"
kubectl get nodes
kubectl get all,pv,pvc -n ecommerce

echo
echo "Deploiement termine !"
echo "  Frontend   : http://localhost:30080"
echo "  Prometheus : http://localhost:30090"
echo "  Grafana    : http://localhost:30030  (admin / admin123)"
