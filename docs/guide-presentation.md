# Guide de présentation — Projet K8s E-Commerce

> À lire 2-3 fois avant l'oral. Objectif : comprendre, pas réciter.

---

## PARTIE 1 — Les 10 mots à comprendre (avec une image simple)

| Mot | Explication simple |
|-----|--------------------|
| **Image Docker** | Une "photo figée" de l'application avec tout ce qu'il faut pour tourner (code + dépendances). Comme un plat préparé sous vide. |
| **Conteneur** | Une image qu'on lance et qui tourne. Le plat qu'on réchauffe et qu'on mange. |
| **Docker** | L'outil qui fabrique les images et lance les conteneurs. |
| **Kubernetes (K8s)** | Le **chef d'orchestre** : il lance les conteneurs, les surveille, les **redémarre tout seul** s'ils tombent, et les connecte entre eux. |
| **Cluster** | L'ensemble géré par Kubernetes. Le nôtre a **1 nœud**. |
| **Nœud (Node)** | Une "machine" où tournent les conteneurs. Chez nous, c'est un conteneur kind (`ecommerce-control-plane`). |
| **Pod** | La plus petite unité de Kubernetes : 1 ou plusieurs conteneurs qui vivent **ensemble** (même réseau, se parlent par `localhost`). |
| **Deployment** | La "recette" qui dit à K8s : *combien* de Pods lancer, *quelle* image, et qui les **recrée** s'ils meurent. |
| **Service** | Une **adresse réseau stable** pour joindre des Pods (car les Pods changent d'IP quand ils redémarrent). |
| **PV / PVC** | **PersistentVolume** = un disque qui **survit** aux Pods. **PVC** = la demande d'un Pod pour utiliser ce disque. C'est ce qui permet la **persistance** des données. |

**ConfigMap** = stocke la configuration (valeurs non sensibles). **Secret** = pareil mais pour les infos sensibles (mots de passe), encodées.

**Deux types de Service utilisés :**
- **ClusterIP** = adresse **interne** (un Pod parle à un autre Pod). → `backend-service`
- **NodePort** = ouvre un **port sur la machine** pour accéder depuis le navigateur. → `frontend-service` sur le port **30080**

---

## PARTIE 2 — L'architecture en 1 phrase

> *« Le navigateur arrive sur le frontend (Pod 1) via le port 30080 ; le frontend transmet les appels API au backend (Pod 2) via un Service interne ; le backend lit/écrit dans MongoDB qui est dans le même Pod ; et les données de MongoDB sont stockées sur un volume persistant. »*

**Le chemin d'une requête :**
```
Navigateur  →  NodePort 30080  →  Nginx (Pod 1)  →  backend-service (ClusterIP)
            →  Backend Node.js (Pod 2)  →  localhost:27017  →  MongoDB  →  Volume PV/PVC
```

**Les 2 Pods imposés :**
- **Pod 1** = Frontend uniquement (Nginx qui sert le site React, en 2 exemplaires)
- **Pod 2** = Backend + Base de données (2 conteneurs : Node.js + MongoDB)

---

## PARTIE 3 — Script slide par slide (ce que tu dis)

**Slide 1 — Titre**
> « Bonjour, je vais vous présenter le déploiement d'une application e-commerce complète sur Kubernetes : un frontend, un backend et une base de données, conteneurisés et orchestrés. »

**Slide 2 — Objectif**
> « L'objectif était de conteneuriser une app 3-tiers et de la déployer sur un cluster Kubernetes, en respectant une architecture imposée : le frontend seul dans un Pod, le backend et la base ensemble dans un second Pod. »

**Slide 3 — Architecture** *(montre le schéma)*
> « Voici le flux : l'utilisateur accède au frontend par un Service NodePort. Le frontend (Nginx) fait un reverse-proxy vers le backend via un Service interne ClusterIP. Le backend communique avec MongoDB en localhost car ils sont dans le même Pod. Et MongoDB stocke ses données sur un volume persistant. »

**Slide 4 — Choix techniques**
> « J'ai choisi React pour le frontend, Node.js/Express pour le backend, MongoDB pour la base — une stack JavaScript homogène. Le cluster tourne avec kind, qui est un Kubernetes léger et 100% reproductible. »

**Slide 5 — Conteneurs Docker**
> « Chaque composant a son Dockerfile. Le frontend utilise un build multi-stage : on compile React avec Node, puis on copie juste le résultat dans une image Nginx légère — d'où une image de seulement 21 Mo. »

**Slide 6 — Cluster Kubernetes**
> « Je crée le cluster avec une commande kind. Comme les images sont locales, je les charge dans le cluster avec `kind load`, ce qui évite d'avoir à les publier sur un registre. »

**Slide 7 — Pods & Deployments**
> « J'ai 3 Deployments. Chaque conteneur a des sondes liveness et readiness pour que Kubernetes le redémarre automatiquement s'il plante, et des limites de ressources. Le Pod 2 utilise la stratégie Recreate car le volume ne peut être monté que par un Pod à la fois. »

**Slide 8 — Services & communication**
> « Le frontend est exposé en NodePort sur le 30080. Le backend est en ClusterIP, accessible uniquement à l'intérieur du cluster. Le reverse-proxy Nginx évite les problèmes de CORS : le navigateur ne voit qu'une seule origine. »

**Slide 9 — Persistance & Secrets**
> « MongoDB écrit dans un PersistentVolume via un PVC. Pour le prouver : je crée une commande, je supprime le Pod, Kubernetes le recrée, et la commande est toujours là. Les mots de passe sont dans des Secrets, jamais en clair. »

**Slide 10 — Démonstration**
> « Voici l'application en fonctionnement et l'état du cluster : tous les Pods Running, le volume Bound, l'API qui répond. Les 4 vérifications demandées passent. »

**Slide 11 — Bonus**
> « En bonus : les Secrets pour les données sensibles, une configuration multi-nœuds, et un Pod 3 de monitoring avec Prometheus et Grafana (manifestes fournis, backend instrumenté). »

**Slide 12 — Difficultés**
> « Principales difficultés : le backend démarrait avant MongoDB (résolu par une boucle de retry), et la stratégie Recreate pour gérer le volume en lecture-écriture exclusive. »

**Slide 13 — Conclusion**
> « En conclusion, l'application est fonctionnelle, persistante et respecte l'architecture imposée. Pistes d'amélioration : Ingress + HTTPS, autoscaling (HPA), et pipeline CI/CD. »

---

## PARTIE 4 — Questions probables + réponses simples

**« C'est quoi un Pod ? »**
> La plus petite unité de Kubernetes. Un groupe de 1 ou plusieurs conteneurs qui partagent le même réseau et se parlent par localhost.

**« Pourquoi 2 conteneurs dans le Pod 2 ? »**
> Le sujet imposait backend + base de données dans le même Pod. Comme ils sont ensemble, le backend joint MongoDB simplement en `localhost:27017`.

**« C'est quoi la différence entre ClusterIP et NodePort ? »**
> ClusterIP = adresse interne, seulement entre Pods. NodePort = ouvre un port sur la machine pour accéder de l'extérieur (le navigateur).

**« Comment marche la persistance ? »**
> MongoDB écrit dans un dossier monté sur un PersistentVolume. Même si le Pod est supprimé et recréé, il remonte le même volume, donc les données restent. Je l'ai démontré en supprimant le Pod : la commande créée avant est toujours là après.

**« Pourquoi la stratégie Recreate ? »**
> Le volume est en ReadWriteOnce : un seul Pod peut le monter à la fois. Recreate arrête l'ancien Pod avant de créer le nouveau, ce qui évite un conflit de montage.

**« C'est quoi un Deployment vs un Pod ? »**
> Le Pod, c'est l'app qui tourne. Le Deployment, c'est le gestionnaire : il garde le bon nombre de Pods et les recrée s'ils tombent.

**« ConfigMap vs Secret ? »**
> Les deux stockent de la configuration. Le Secret est pour les données sensibles (mots de passe), encodées en base64.

**« C'est bien du vrai Kubernetes ? Tu utilises Docker… »**
> Oui. kind = "Kubernetes in Docker". Le nœud tourne dans un conteneur, mais à l'intérieur c'est un vrai Kubernetes complet (kube-apiserver, etcd, kubelet…), version 1.32. kind est un projet officiel de la communauté Kubernetes. Tout est piloté avec kubectl et des manifestes YAML.

**« Comment les composants communiquent ? »**
> Frontend → backend : via le Service ClusterIP `backend-service` (DNS interne du cluster). Backend → MongoDB : via localhost car même Pod.

**« Pourquoi un reverse-proxy Nginx ? »**
> Pour éviter le CORS. Le navigateur n'appelle que le frontend ; Nginx transmet les `/api` au backend en interne. Une seule origine, pas de blocage navigateur.

**« Comment tu relances tout ? »**
> Une commande : `./deploy.ps1`. Elle crée le cluster, build les images, les charge et applique les manifestes.

---

## PARTIE 5 — Démo live (commandes, si demandé)

```bash
# 1. Montrer le cluster et les ressources
kubectl get nodes
kubectl get all,pv,pvc -n ecommerce

# 2. Ouvrir l'application
#    -> http://localhost:30080  (catalogue + panier)

# 3. Prouver la persistance
kubectl get pods -n ecommerce
kubectl delete pod -n ecommerce -l app=backend-db   # on supprime
kubectl get pods -n ecommerce                        # il se recree
#    -> rouvrir l'app : les données sont toujours là

# 4. (Preuve "vrai Kubernetes")
kubectl get pods -n kube-system   # etcd, apiserver, scheduler, coredns...
```

**Si l'app n'est pas lancée :** `./deploy.ps1` (attendre ~1 min que les Pods soient Running).

---

## En 3 phrases si tu n'as que 30 secondes
> « J'ai conteneurisé une app e-commerce (React, Node.js, MongoDB) et je l'ai déployée sur un cluster Kubernetes. Le frontend est isolé dans un Pod, le backend et la base dans un second Pod, avec une persistance des données via un volume. La communication passe par des Services Kubernetes, les mots de passe par des Secrets, et j'ai vérifié que les données survivent au redémarrage des Pods. »
