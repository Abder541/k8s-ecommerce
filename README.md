# Projet K8s E-Commerce

Application e-commerce conteneurisee et deployee sur **Kubernetes**, conforme au cahier des charges :
Frontend isole dans un Pod, Backend + Base de donnees dans un second Pod, persistance via PV/PVC,
secrets pour les credentials, et un **Pod 3 d'observabilite (Prometheus + Grafana)** en bonus.

---

## Architecture

```
                                +-----------------------------------------------+
                                |             Cluster Kubernetes (kind)         |
                                |             Namespace: ecommerce              |
                                |                                               |
  navigateur                    |   +-----------------------------+             |
   utilisateur                  |   | Pod 1 : frontend (x2)       |             |
       |  :30080                |   |  - Nginx (React build)      |             |
       +---- NodePort --------> |   |  - proxy /api -> backend    |             |
                                |   +--------------+--------------+             |
                                |                  | ClusterIP                  |
                                |                  v  backend-service:3000       |
                                |   +-----------------------------+             |
                                |   | Pod 2 : backend + mongo     |             |
                                |   |  - backend Node.js  (3000)  |             |
                                |   |  - mongodb          (27017) | <--+        |
                                |   |    communication via         |   | PVC    |
                                |   |    localhost                  |   |        |
                                |   +--------------+----------------+   |        |
                                |                  |                    |        |
                                |                  v                    v        |
                                |   +-----------------------------+  +--------+  |
                                |   | PersistentVolume (hostPath) |  |  PV/   |  |
                                |   |  -> /mnt/data/mongo         |  |  PVC   |  |
                                |   +-----------------------------+  +--------+  |
                                |                                               |
  navigateur  :30090 / :30030   |   +-----------------------------+             |
       +----- NodePort -------> |   | Pod 3 : monitoring (bonus)  |             |
                                |   |  - Prometheus (9090)        |             |
                                |   |  - Grafana    (3000)        |             |
                                |   |    scrape backend /metrics  |             |
                                |   +-----------------------------+             |
                                +-----------------------------------------------+
```

| Pod   | Contenu                                       |
|-------|-----------------------------------------------|
| Pod 1 | Frontend Nginx (React build statique), 2 replicas |
| Pod 2 | Backend Node.js + MongoDB (2 conteneurs)      |
| Pod 3 | Prometheus + Grafana (2 conteneurs) - *bonus* |

### Ressources Kubernetes

| Type       | Nom                       | Role                                             |
|------------|---------------------------|--------------------------------------------------|
| Namespace  | `ecommerce`               | Isolation logique                                |
| Secret     | `mongo-credentials`       | User / password / db MongoDB                     |
| Secret     | `grafana-admin`           | Identifiants admin Grafana                        |
| ConfigMap  | `backend-config`          | Parametres non-sensibles du backend              |
| ConfigMap  | `prometheus-config`       | Configuration de scrape Prometheus               |
| ConfigMap  | `grafana-provisioning`    | Datasource + provider de dashboards Grafana      |
| ConfigMap  | `grafana-dashboards`      | Dashboard JSON e-commerce                        |
| PV         | `mongo-pv`                | Volume persistant (hostPath, 2 Gi)              |
| PVC        | `mongo-pvc`               | Reclamation du volume                            |
| Deployment | `backend-db`              | Pod 2 (backend + mongo, strategie Recreate)      |
| Deployment | `frontend`                | Pod 1 (Nginx, 2 replicas)                        |
| Deployment | `monitoring`              | Pod 3 (Prometheus + Grafana)                     |
| Service    | `backend-service`         | ClusterIP, expose le backend en interne          |
| Service    | `frontend-service`        | NodePort 30080, frontend                         |
| Service    | `prometheus-service`      | NodePort 30090, Prometheus                       |
| Service    | `grafana-service`         | NodePort 30030, Grafana                          |

---

## Stack technique

- **Frontend** : React 18 + Vite, servi par Nginx 1.27 (Alpine)
- **Backend** : Node.js 20 + Express + driver MongoDB officiel + `prom-client` (metriques)
- **Base de donnees** : MongoDB 7.0
- **Observabilite** : Prometheus 2.54 + Grafana 11.2 (bonus)
- **Orchestration** : Kubernetes via **kind** (Kubernetes-in-Docker)
- **Build** : Docker (multi-stage pour le frontend)

---

## Arborescence

```
.
+-- backend/                 # API Node.js + Express
|   +-- Dockerfile
|   +-- server.js            # routes + endpoint /metrics Prometheus
|   +-- package.json
+-- frontend/                # SPA React + Nginx
|   +-- Dockerfile           # multi-stage (build Vite -> Nginx)
|   +-- nginx.conf           # reverse-proxy /api + DNS paresseux
|   +-- 40-set-resolver.sh   # injecte le resolver DNS au demarrage
|   +-- index.html / vite.config.js / package.json
|   +-- src/ (main.jsx, App.jsx, styles.css)
+-- k8s/                     # manifestes Kubernetes (ordre = prefixe)
|   +-- 00-namespace.yaml
|   +-- 01-secret-mongo.yaml
|   +-- 02-configmap-backend.yaml
|   +-- 03-pv-pvc-mongo.yaml
|   +-- 04-deployment-backend-db.yaml
|   +-- 05-service-backend.yaml
|   +-- 06-deployment-frontend.yaml
|   +-- 07-service-frontend.yaml
|   +-- 08-configmap-prometheus.yaml
|   +-- 09-configmap-grafana.yaml
|   +-- 10-deployment-monitoring.yaml
|   +-- 11-service-monitoring.yaml
+-- kind-config.yaml             # cluster mono-noeud (defaut)
+-- kind-config-multinode.yaml   # cluster 3 noeuds (option / bonus)
+-- deploy.ps1 / deploy.sh       # scripts de deploiement automatique
+-- README.md
```

---

## Pre-requis

- **Docker Desktop** demarre
- **kind** ([installation](https://kind.sigs.k8s.io/docs/user/quick-start/#installation))
  ```powershell
  curl -fsSL -o kind.exe https://kind.sigs.k8s.io/dl/v0.27.0/kind-windows-amd64
  # placer kind.exe dans un dossier du PATH
  ```
- **kubectl** (fourni avec Docker Desktop)

> **Alternative Docker Desktop** : on peut aussi activer le Kubernetes integre
> (`Settings -> Kubernetes -> Enable Kubernetes`). Les manifestes sont identiques ;
> seules les etapes de creation du cluster et de chargement des images different
> (avec Docker Desktop les images locales sont directement visibles, pas de `kind load`).

---

## Deploiement

### Methode rapide (script)

```powershell
# Windows
./deploy.ps1
```
```bash
# Linux / Mac / Git Bash
./deploy.sh
```

### Methode manuelle (etape par etape)

**1. Creer le cluster kind**
```bash
kind create cluster --config kind-config.yaml --wait 120s
kubectl config use-context kind-ecommerce
```

**2. Construire les images Docker**
```bash
docker build -t ecommerce-backend:1.0  ./backend
docker build -t ecommerce-frontend:1.0 ./frontend
```

**3. Charger les images dans le cluster kind**
```bash
kind load docker-image ecommerce-backend:1.0  --name ecommerce
kind load docker-image ecommerce-frontend:1.0 --name ecommerce
```

**4. Appliquer les manifestes**
```bash
kubectl apply -f k8s/
```

**5. Attendre le demarrage**
```bash
kubectl wait --for=condition=ready pod -l app=backend-db -n ecommerce --timeout=180s
kubectl wait --for=condition=ready pod -l app=frontend   -n ecommerce --timeout=120s
kubectl wait --for=condition=ready pod -l app=monitoring  -n ecommerce --timeout=120s
```

**6. Acceder aux services**

| Service    | URL                       | Identifiants       |
|------------|---------------------------|--------------------|
| Frontend   | http://localhost:30080    | -                  |
| Prometheus | http://localhost:30090    | -                  |
| Grafana    | http://localhost:30030    | admin / admin123   |

---

## Verifications fonctionnelles

### A. Frontend accessible
```bash
curl http://localhost:30080/healthz          # -> ok
```

### B. Communication Frontend -> Backend (via Service)
```bash
curl http://localhost:30080/api/products     # -> JSON des produits
```

### C. Communication Backend -> MongoDB
```bash
kubectl exec -n ecommerce deploy/backend-db -c backend -- \
  wget -qO- http://localhost:3000/api/health
# -> {"status":"ok","db":"connected", ...}
```

### D. Persistance apres redemarrage du Pod
```bash
# 1) Passer une commande via http://localhost:30080 (bouton "Valider la commande")
# 2) Lister les commandes
kubectl exec -n ecommerce deploy/backend-db -c backend -- wget -qO- http://localhost:3000/api/orders
# 3) Supprimer le Pod (le Deployment le recree, le PVC est remonte)
kubectl delete pod -n ecommerce -l app=backend-db
kubectl wait --for=condition=ready pod -l app=backend-db -n ecommerce --timeout=120s
# 4) Verifier que la commande est TOUJOURS la
kubectl exec -n ecommerce deploy/backend-db -c backend -- wget -qO- http://localhost:3000/api/orders
```

### E. Observabilite (bonus)
- **Prometheus** http://localhost:30090 -> menu *Status > Targets* : la cible
  `ecommerce-backend` doit etre **UP**.
- **Grafana** http://localhost:30030 -> dashboard *E-Commerce - Observabilite*
  (commandes, taux de requetes, latence p95, memoire backend).

---

## Commandes utiles

```bash
kubectl get nodes                                   # noeuds du cluster
kubectl get all,pv,pvc -n ecommerce                 # vue d'ensemble
kubectl logs -n ecommerce -l app=backend-db -c backend -f
kubectl logs -n ecommerce -l app=backend-db -c mongo   -f
kubectl describe pod -n ecommerce -l app=backend-db    # events / probes
kubectl exec -it -n ecommerce deploy/backend-db -c mongo -- mongosh -u admin -p Sup3rS3cret

# Nettoyage complet
kubectl delete namespace ecommerce
kind delete cluster --name ecommerce
```

---

## Choix techniques et bonnes pratiques

| Choix                                   | Justification                                                       |
|-----------------------------------------|---------------------------------------------------------------------|
| Cluster **kind**                        | 100% scriptable, leger, reproductible ; pas de toggle GUI           |
| 2 conteneurs dans le Pod 2              | Spec du projet ; communication via `localhost` (zero latence)      |
| `strategy: Recreate` sur Pod 2          | `PVC ReadWriteOnce` -> un seul Pod monte le volume a la fois        |
| 2 replicas pour le frontend             | Disponibilite et repartition de charge                              |
| Nginx en reverse-proxy `/api`           | Evite CORS, une seule origine cote navigateur                       |
| DNS paresseux dans Nginx                | Le frontend demarre meme si le backend n'est pas encore pret        |
| Secrets (Mongo, Grafana)                | Pas de mot de passe en clair dans les Deployments                   |
| ConfigMaps                              | Separation config / secrets / image                                 |
| `nodeSelector: tier=storage`            | Epingle le Pod 2 -> le hostPath du PV est toujours retrouve         |
| Probes liveness + readiness             | Detection automatique des conteneurs en panne                       |
| `requests` / `limits`                   | Stabilite du scheduler, evite l'epuisement memoire                  |
| `reclaimPolicy: Retain`                 | Les donnees survivent meme si le PVC est supprime                   |
| Backend instrumente (`/metrics`)        | Prometheus scrape de vraies metriques applicatives                  |

---

## Bonus realises

- **Secrets** pour toutes les informations sensibles (MongoDB, Grafana)
- **Pod 3 - Observabilite** : Prometheus + Grafana, backend instrumente avec `prom-client`,
  dashboard pre-provisionne
- **Cluster multi-noeuds** : fichier `kind-config-multinode.yaml` (1 control-plane + 2 workers),
  le Pod 2 reste epingle au worker `tier=storage`

---

## Difficultes rencontrees & solutions

| Probleme                                              | Solution                                                          |
|-------------------------------------------------------|-------------------------------------------------------------------|
| Backend qui se connecte avant que Mongo soit pret     | Boucle de retry (30 x 2s) dans `server.js`                        |
| Nginx refuse de demarrer (`host not found upstream`)  | Resolution DNS **paresseuse** + `resolver` injecte au runtime     |
| PV ReadWriteOnce empeche le rolling update            | `strategy: Recreate` sur le Deployment Pod 2                      |
| CORS entre frontend et backend                        | Reverse-proxy `/api` cote Nginx (meme origine)                    |
| Images locales absentes du cluster                    | `kind load docker-image` (et `imagePullPolicy: IfNotPresent`)     |
| Docker Desktop crash au demarrage (Inference manager) | Desactivation de **Docker AI** (`EnableDockerAI:false`) + nettoyage du socket orphelin `dockerInference` |
| Cluster 3 noeuds instable (RAM hote limitee)          | Repli sur un cluster mono-noeud, multi-noeuds documente en option |
| Persistance multi-noeuds                              | `nodeSelector` + hostPath `DirectoryOrCreate` sur un noeud labelise |

---

## Pistes d'amelioration

- **Ingress + TLS** (Nginx Ingress Controller + cert-manager / Let's Encrypt)
- **HPA** (Horizontal Pod Autoscaler) sur le frontend, avec metrics-server
- **StatefulSet** pour MongoDB en production (replica set)
- **Helm chart** pour parametrer les deploiements
- **CI/CD** (GitHub Actions : build, scan Trivy, push registry, deploiement)
- **NetworkPolicy** pour restreindre les flux inter-Pods
- **Externalisation des secrets** (Vault, Sealed Secrets, KMS)

---

## Equipe

A completer avec les noms des membres de l'equipe.
