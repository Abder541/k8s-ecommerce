# 📘 Commandes complètes — Docker & Kubernetes (référence pour l'oral)

> Pour chaque commande : à quoi elle sert + des exemples avec les **options** (quoi mettre derrière).
> Mes ressources sont dans le **namespace `ecommerce`** → presque toujours `-n ecommerce`.

---

## 🟦 DOCKER

```bash
docker --version                  # version de Docker
docker info                       # infos sur le moteur Docker
docker images                     # lister toutes les images
docker image ls                   # idem (autre écriture)
docker image inspect <image>      # détails d'une image (couches, taille, arch)

# Construire une image
docker build -t ecommerce-backend:1.0 ./backend     # -t = nom:tag, ./backend = dossier du Dockerfile
docker build -t mon-image:1.0 -f Dockerfile.dev .   # -f = choisir un Dockerfile précis
docker build --no-cache -t mon-image:1.0 .          # --no-cache = reconstruire sans cache

# Lister / inspecter les conteneurs
docker ps                         # conteneurs en cours d'exécution
docker ps -a                      # TOUS les conteneurs (même arrêtés)
docker ps -q                      # seulement les ID (utile pour scripts)
docker inspect <conteneur>        # détails complets (réseau, montages...)
docker stats                      # CPU/RAM en temps réel des conteneurs

# Logs d'un conteneur
docker logs <conteneur>           # afficher les logs
docker logs -f <conteneur>        # -f = suivre en direct
docker logs --tail 50 <conteneur> # les 50 dernières lignes

# Entrer / exécuter dans un conteneur
docker exec -it <conteneur> sh    # -it = interactif, ouvre un terminal
docker exec <conteneur> ls /app   # exécuter une commande sans entrer

# Cycle de vie
docker start <conteneur>          # démarrer
docker stop <conteneur>           # arrêter
docker restart <conteneur>        # redémarrer
docker rm <conteneur>             # supprimer un conteneur
docker rmi <image>                # supprimer une image

# Images depuis/vers un registre
docker pull nginx:1.27-alpine     # télécharger une image
docker pull --platform linux/amd64 grafana/grafana:11.2.0   # forcer l'architecture
```

---

## 🟩 KIND (créer / gérer le cluster)

```bash
kind create cluster --config kind-config.yaml      # créer le cluster depuis ma config
kind create cluster --name test                    # créer un cluster nommé "test"
kind get clusters                                  # lister les clusters
kind get nodes --name ecommerce                    # lister les nœuds du cluster
kind load docker-image ecommerce-backend:1.0 --name ecommerce   # injecter une image locale
kind delete cluster --name ecommerce               # supprimer le cluster
kind export kubeconfig --name ecommerce            # reconfigurer kubectl sur ce cluster
```

---

## 🟦 KUBECTL — Cluster & configuration

```bash
kubectl version                                 # version client + serveur
kubectl cluster-info                            # adresses du cluster
kubectl config get-contexts                     # lister les "contextes" (clusters connus)
kubectl config current-context                  # le contexte actif
kubectl config use-context kind-ecommerce       # changer de cluster
kubectl config set-context --current --namespace=ecommerce   # namespace par défaut (plus besoin de -n)
kubectl api-resources                           # liste TOUS les types de ressources
kubectl explain pod                             # documentation d'un type de ressource
kubectl explain pod.spec.containers             # doc d'un champ précis
```

---

## 🟦 KUBECTL — `get` (VOIR l'état) + ses options

```bash
kubectl get nodes                               # les machines du cluster
kubectl get nodes -o wide                       # + IP, OS, version

kubectl get pods -n ecommerce                   # les pods de mon appli
kubectl get pods -n ecommerce -o wide           # + IP du pod et nœud
kubectl get pods -A                             # pods de TOUS les namespaces (-A = all)
kubectl get pods -n ecommerce --watch           # surveiller en direct (Ctrl+C pour arrêter)
kubectl get pods -n ecommerce --show-labels     # afficher les étiquettes
kubectl get pods -n ecommerce -l app=frontend   # filtrer par étiquette (-l = label)
kubectl get pod <nom> -n ecommerce -o yaml      # le YAML complet du pod
kubectl get pod <nom> -n ecommerce -o json      # en JSON

kubectl get all -n ecommerce                    # TOUT (pods, services, deployments, replicasets)
kubectl get svc -n ecommerce                    # les Services
kubectl get endpoints -n ecommerce              # vers quels pods pointent les services
kubectl get deployments -n ecommerce            # les Deployments
kubectl get rs -n ecommerce                     # les ReplicaSets
kubectl get pv                                  # les volumes (PV = ressource du cluster, sans namespace)
kubectl get pvc -n ecommerce                    # les réservations de volume
kubectl get configmap -n ecommerce              # les configurations
kubectl get secret -n ecommerce                 # les secrets
kubectl get namespaces                          # les espaces de travail
kubectl get events -n ecommerce --sort-by=.lastTimestamp   # les événements récents
```

---

## 🟦 KUBECTL — `describe` (DÉTAILS / pourquoi ça plante)

```bash
kubectl describe pod <nom> -n ecommerce         # détails + événements d'un pod (LA commande de debug)
kubectl describe node <nom>                     # détails d'un nœud
kubectl describe svc backend-service -n ecommerce       # détails d'un service
kubectl describe deployment frontend -n ecommerce       # détails d'un deployment
kubectl describe pvc mongo-pvc -n ecommerce             # détails d'une réservation de volume
```

---

## 🟦 KUBECTL — `logs` (voir ce que dit l'appli)

```bash
kubectl logs <pod> -n ecommerce                 # logs d'un pod
kubectl logs <pod> -n ecommerce -c backend      # -c = un conteneur précis (le pod a backend + mongo)
kubectl logs -f <pod> -n ecommerce              # -f = en direct
kubectl logs --tail=50 <pod> -n ecommerce       # les 50 dernières lignes
kubectl logs --since=10m <pod> -n ecommerce     # les 10 dernières minutes
kubectl logs --previous <pod> -n ecommerce      # logs du conteneur AVANT son crash (très utile)
kubectl logs -l app=backend-db -n ecommerce -c backend   # par étiquette, sans connaître le nom exact
kubectl logs deploy/backend-db -n ecommerce -c backend   # via le deployment
```

---

## 🟦 KUBECTL — `exec` (entrer dans un conteneur)

```bash
kubectl exec -it <pod> -n ecommerce -- sh                 # ouvrir un terminal dans le pod
kubectl exec -it <pod> -n ecommerce -c mongo -- sh        # choisir le conteneur
kubectl exec <pod> -n ecommerce -- ls /app                # lancer UNE commande
# Entrer dans MongoDB :
kubectl exec -it deploy/backend-db -n ecommerce -c mongo -- mongosh -u admin -p Sup3rS3cret
```

---

## 🟦 KUBECTL — `port-forward` (accéder à un service depuis localhost)

> Sert à joindre depuis ton PC un pod/service **interne** au cluster (qui n'a pas de NodePort).

```bash
kubectl port-forward -n ecommerce svc/backend-service 3000:3000
#   -> ouvre localhost:3000 vers le backend (normalement interne)
#   format : port_local:port_distant

kubectl port-forward -n ecommerce pod/<nom-du-pod> 8080:80    # vers un pod précis
kubectl port-forward -n ecommerce deploy/frontend 8080:80     # vers un deployment
kubectl port-forward -n ecommerce svc/grafana-service 3001:3000   # Grafana sur localhost:3001
```
> Exemple à citer : *« Le backend est interne. Avec `port-forward`, je peux le tester depuis mon PC sans l'exposer publiquement. »*

---

## 🟦 KUBECTL — `apply` / `create` / `delete` (créer & supprimer)

```bash
kubectl apply -f k8s/                           # appliquer TOUS les fichiers d'un dossier
kubectl apply -f k8s/04-deployment-backend-db.yaml   # un seul fichier
kubectl delete -f k8s/                          # supprimer ce qui a été créé par ces fichiers
kubectl delete pod <nom> -n ecommerce           # supprimer un pod (le Deployment le recrée)
kubectl delete pod -l app=backend-db -n ecommerce    # supprimer par étiquette
kubectl delete deployment monitoring -n ecommerce    # supprimer un deployment
kubectl delete namespace ecommerce              # TOUT supprimer d'un coup
kubectl create namespace test                   # créer un namespace
```

---

## 🟦 KUBECTL — `scale` / `rollout` / `edit` (modifier en marche)

```bash
kubectl scale deployment frontend --replicas=3 -n ecommerce   # passer à 3 copies du frontend
kubectl scale deployment frontend --replicas=1 -n ecommerce   # revenir à 1

kubectl rollout status deployment frontend -n ecommerce       # état d'un déploiement
kubectl rollout restart deployment backend-db -n ecommerce    # redémarrer proprement (sans delete)
kubectl rollout history deployment frontend -n ecommerce      # historique des versions
kubectl rollout undo deployment frontend -n ecommerce         # revenir à la version précédente

kubectl edit deployment frontend -n ecommerce                 # éditer la config en direct
kubectl set image deployment/frontend frontend=ecommerce-frontend:2.0 -n ecommerce   # changer l'image
```

---

## 🟦 KUBECTL — Surveillance / avancé

```bash
kubectl top nodes                               # CPU/RAM des nœuds (si metrics-server installé)
kubectl top pods -n ecommerce                   # CPU/RAM des pods
kubectl get pod <nom> -n ecommerce -o jsonpath='{.status.podIP}'   # extraire un champ précis
kubectl label pod <nom> env=demo -n ecommerce   # ajouter une étiquette
kubectl cp ecommerce/<pod>:/chemin/fichier ./local   # copier un fichier depuis un pod
```

---

## 🎯 « Le prof me demande… » → la commande

| Question | Commande |
|----------|----------|
| Combien de pods tournent ? | `kubectl get pods -n ecommerce` |
| Montre les nœuds du cluster | `kubectl get nodes` |
| Affiche les logs du backend | `kubectl logs deploy/backend-db -n ecommerce -c backend` |
| Pourquoi ce pod ne démarre pas ? | `kubectl describe pod <nom> -n ecommerce` puis `kubectl logs --previous <nom> -n ecommerce` |
| Entre dans un conteneur | `kubectl exec -it <pod> -n ecommerce -- sh` |
| Accède au backend depuis ton PC | `kubectl port-forward -n ecommerce svc/backend-service 3000:3000` |
| Montre le YAML d'un pod | `kubectl get pod <nom> -n ecommerce -o yaml` |
| Redémarre sans supprimer | `kubectl rollout restart deployment backend-db -n ecommerce` |
| Mets 3 frontends | `kubectl scale deployment frontend --replicas=3 -n ecommerce` |
| Voir l'utilisation CPU/RAM | `kubectl top pods -n ecommerce` |
| Voir les événements | `kubectl get events -n ecommerce --sort-by=.lastTimestamp` |
| Déploie l'application | `kubectl apply -f k8s/` |
| Supprime tout | `kubectl delete namespace ecommerce` |
| Vérifie le volume | `kubectl get pv,pvc -n ecommerce` |
| Liste les services et leurs ports | `kubectl get svc -n ecommerce` |

---

## 🧩 Comprendre la STRUCTURE d'une commande kubectl

```
kubectl  <VERBE>   <TYPE>      <NOM>     -n <NAMESPACE>   <OPTIONS>
kubectl  get       pods        backend   -n ecommerce     -o wide
   |       |          |           |            |              |
 outil   action   ressource    objet       espace        affichage
```
- **VERBE** : get, describe, logs, apply, delete, scale, exec, port-forward…
- **TYPE** : pod, svc, deployment, pv, pvc, configmap, secret, node…
- **OPTIONS courantes** : `-n` namespace · `-f` fichier · `-l` étiquette · `-c` conteneur · `-o` format · `-it` interactif · `-A` tous les namespaces
