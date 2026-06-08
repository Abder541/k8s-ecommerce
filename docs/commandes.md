# Aide-mémoire des commandes — Projet K8s E-Commerce

> Pour chaque commande : ce qu'elle fait, en mots simples. Le prof demande souvent « cette commande fait quoi ? ».

---

## ⚠️ À savoir AVANT tout (le piège le plus courant)

Toutes mes ressources sont dans un **namespace** (un espace de travail isolé) appelé `ecommerce`.
→ Si tu oublies `-n ecommerce`, tu ne vois **rien** (kubectl regarde l'espace par défaut).

**Astuce pour ne plus avoir à taper `-n ecommerce` à chaque fois :**
```bash
kubectl config set-context --current --namespace=ecommerce
```
> Définit `ecommerce` comme espace par défaut. Ensuite, plus besoin de `-n ecommerce`.

**Les options qui reviennent partout :**
| Option | Signification |
|--------|---------------|
| `-n ecommerce` | dans le **namespace** (espace) ecommerce |
| `-f fichier` | depuis un **fichier** (file) |
| `-l app=frontend` | filtre par **label** (étiquette) |
| `-c backend` | un **conteneur** précis (si le pod en a plusieurs) |
| `-o wide` | affichage **détaillé** (output) |
| `-it` | mode **interactif** (pour entrer dans un conteneur) |

---

## 1. DOCKER (fabriquer et lancer les images)

| Commande | Ce qu'elle fait |
|----------|-----------------|
| `docker --version` | Affiche la version de Docker |
| `docker build -t ecommerce-backend:1.0 ./backend` | **Construit** une image à partir du Dockerfile du dossier backend |
| `docker images` | **Liste** toutes les images présentes |
| `docker ps` | Liste les conteneurs **en cours d'exécution** |
| `docker ps -a` | Liste **tous** les conteneurs (même arrêtés) |
| `docker logs <conteneur>` | Affiche les **logs** d'un conteneur |
| `docker start ecommerce-control-plane` | **Démarre** le conteneur du cluster (utile avant la démo) |
| `docker stop <conteneur>` | **Arrête** un conteneur |

---

## 2. KIND (créer/gérer le cluster Kubernetes)

| Commande | Ce qu'elle fait |
|----------|-----------------|
| `kind create cluster --config kind-config.yaml` | **Crée** le cluster Kubernetes selon ma configuration |
| `kind get clusters` | **Liste** les clusters existants |
| `kind load docker-image ecommerce-backend:1.0 --name ecommerce` | **Injecte** mon image locale dans le cluster |
| `kind delete cluster --name ecommerce` | **Supprime** le cluster |

---

## 3. KUBECTL — VOIR l'état (les plus importantes !)

| Commande | Ce qu'elle fait |
|----------|-----------------|
| `kubectl get nodes` | Liste les **nœuds** (machines) du cluster |
| `kubectl get pods -n ecommerce` | Liste les **pods** (mes applications qui tournent) |
| `kubectl get pods -n ecommerce -o wide` | Pareil, avec l'**IP** et le nœud de chaque pod |
| `kubectl get all -n ecommerce` | Liste **toutes** les ressources (pods, services, deployments…) |
| `kubectl get svc -n ecommerce` | Liste les **Services** (les adresses réseau) |
| `kubectl get deployments -n ecommerce` | Liste les **Deployments** (les gestionnaires de pods) |
| `kubectl get pv,pvc -n ecommerce` | Liste le **volume** persistant et sa réservation |
| `kubectl get configmap,secret -n ecommerce` | Liste les **configurations** et les **secrets** |
| `kubectl get namespaces` | Liste les **espaces de travail** |
| `kubectl cluster-info` | Infos générales sur le **cluster** |

---

## 4. KUBECTL — COMPRENDRE / DÉBOGUER (le prof adore ça)

| Commande | Ce qu'elle fait |
|----------|-----------------|
| `kubectl describe pod <nom> -n ecommerce` | **Tous les détails** d'un pod + les événements (pourquoi il plante) |
| `kubectl logs <pod> -n ecommerce` | Affiche les **logs** d'un pod |
| `kubectl logs <pod> -n ecommerce -c backend` | Logs d'un **conteneur précis** (le pod backend-db en a 2) |
| `kubectl logs -f <pod> -n ecommerce` | Logs **en direct** (suit en continu) |
| `kubectl exec -it <pod> -n ecommerce -- sh` | **Entrer dans** un conteneur (ouvre un terminal dedans) |
| `kubectl get events -n ecommerce` | Liste les **événements** récents du cluster |

> Question piège fréquente : *« Comment tu sais pourquoi un pod ne démarre pas ? »*
> Réponse : `kubectl describe pod <nom>` (voir les événements) **et** `kubectl logs <pod>` (voir l'erreur).

---

## 5. KUBECTL — AGIR (déployer, supprimer, redémarrer)

| Commande | Ce qu'elle fait |
|----------|-----------------|
| `kubectl apply -f k8s/` | **Déploie** toutes mes ressources (applique les fichiers YAML du dossier k8s) |
| `kubectl apply -f k8s/04-deployment-backend-db.yaml` | Applique **un seul** fichier |
| `kubectl delete pod <nom> -n ecommerce` | **Supprime** un pod (le Deployment le recrée tout seul) |
| `kubectl delete pod -n ecommerce -l app=backend-db` | Supprime le(s) pod(s) qui ont l'étiquette `app=backend-db` |
| `kubectl scale deployment frontend --replicas=3 -n ecommerce` | Change le **nombre de copies** (ici 3 frontends) |
| `kubectl rollout restart deployment backend-db -n ecommerce` | **Redémarre** proprement un deployment |
| `kubectl delete -f k8s/` | **Supprime** toutes les ressources déployées |
| `kubectl delete namespace ecommerce` | Supprime **tout** l'espace ecommerce d'un coup |

---

## 6. Les commandes de MA démo (à connaître par cœur)

```bash
# 1. Voir le cluster et tout ce qui tourne
kubectl get nodes
kubectl get all,pv,pvc -n ecommerce

# 2. Voir que le backend parle à la base
kubectl logs -n ecommerce -l app=backend-db -c backend

# 3. LE test de persistance (le moment fort)
kubectl delete pod -n ecommerce -l app=backend-db   # je supprime
kubectl get pods -n ecommerce                        # il se recrée tout seul
#   -> recharger http://localhost:30080 : les données sont toujours là

# 4. Entrer dans la base de données MongoDB (si demandé)
kubectl exec -it -n ecommerce deploy/backend-db -c mongo -- mongosh -u admin -p Sup3rS3cret

# 5. Preuve que c'est un VRAI Kubernetes
kubectl get pods -n kube-system   # etcd, apiserver, scheduler, coredns...
```

---

## 7. Déploiement complet (si on me demande de tout relancer)

```bash
cd "C:\Users\Maintenant pret\Cours (Red Hat, Docker) Loic"
./deploy.ps1
```
> Une seule commande qui : crée le cluster, construit les images, les charge, et déploie tout.

**Étape par étape (si on me demande le détail) :**
```bash
kind create cluster --config kind-config.yaml          # 1. créer le cluster
docker build -t ecommerce-backend:1.0 ./backend        # 2. construire les images
docker build -t ecommerce-frontend:1.0 ./frontend
kind load docker-image ecommerce-backend:1.0 --name ecommerce   # 3. charger les images
kind load docker-image ecommerce-frontend:1.0 --name ecommerce
kubectl apply -f k8s/                                  # 4. déployer
kubectl get pods -n ecommerce                          # 5. vérifier
```

---

## 8. Les adresses (dans le navigateur)

| Adresse | Quoi |
|---------|------|
| http://localhost:30080 | L'application e-commerce |
| http://localhost:30090/targets | Prometheus (cibles surveillées) |
| http://localhost:30030 | Grafana (admin / admin123) |

> Rappel : dans le navigateur, **uniquement `localhost:30080/30090/30030`**. Les noms comme `backend-service` sont **internes** au cluster et ne marchent pas dans le navigateur (c'est normal et voulu).

---

## 9. Questions-pièges & réponses courtes

**« Comment vérifier que tout tourne ? »**
> `kubectl get pods -n ecommerce` → tout doit être `Running`.

**« Comment voir les logs d'une appli ? »**
> `kubectl logs <pod> -n ecommerce` (et `-c backend` ou `-c mongo` pour choisir le conteneur).

**« Comment entrer dans un conteneur ? »**
> `kubectl exec -it <pod> -n ecommerce -- sh`.

**« C'est quoi `-n` ? »**
> Le namespace, un espace de travail isolé. Mes ressources sont dans `ecommerce`.

**« C'est quoi `apply -f` ? »**
> Appliquer un fichier de configuration YAML pour créer/mettre à jour les ressources.

**« Comment Kubernetes redémarre un pod tout seul ? »**
> Le Deployment surveille le nombre de pods voulus ; si un pod disparaît, il en recrée un. Les sondes (probes) détectent aussi un pod en panne et le relancent.

**« Différence build / load / apply ? »**
> `docker build` fabrique l'image ; `kind load` la met dans le cluster ; `kubectl apply` déploie l'application qui utilise cette image.
