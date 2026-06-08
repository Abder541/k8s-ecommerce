# 🎯 ANTISÈCHE — à garder ouverte pendant la démo

**TAPE** = tape la commande · **DIS** = ce que tu dis · **FAIS** = action navigateur

---

## ✅ AVANT (préparation, 10 min avant)
1. Ouvrir **Docker Desktop** → attendre **« Engine running »** (point vert)
2. **TAPE :** `docker start ecommerce-control-plane`
3. **TAPE :** `kubectl get pods -n ecommerce` → attendre que tout soit **Running**
4. **FAIS :** ouvrir http://localhost:30080 (le catalogue doit s'afficher)

---

## 🎬 LA DÉMO (lis dans l'ordre)

### 1) Montrer le cluster
**TAPE :** `kubectl get nodes`
**DIS :** « Voici mon cluster Kubernetes : un nœud, prêt. »

**TAPE :** `kubectl get all,pv,pvc -n ecommerce`
**DIS :** « Mes pods tournent, mes services sont là, et mon volume de stockage est relié — Bound. »

### 2) Montrer l'application
**FAIS :** http://localhost:30080 → **Ajouter au panier** → **Valider la commande**
**DIS :** « Les produits viennent de la base de données, en passant par le moteur. La commande est enregistrée. »

### 3) ⭐ Prouver la persistance (LE moment fort)
**TAPE :** `kubectl delete pod -n ecommerce -l app=backend-db`
**DIS :** « Je supprime la partie base de données. Kubernetes va la recréer tout seul. »

**TAPE :** `kubectl get pods -n ecommerce`
**DIS :** « Voilà, le pod est recréé automatiquement. »

**FAIS :** recharger le navigateur (**F5**)
**DIS :** « Et la commande est toujours là : les données ont survécu grâce au volume persistant. »

### 4) Le bonus monitoring
**FAIS :** http://localhost:30090/targets
**DIS :** « Prometheus surveille mon backend : état UP. Il récupère les statistiques toutes les 10 secondes. »

**FAIS :** http://localhost:30030 → connexion **admin / admin123** → **Dashboards** → « E-Commerce - Observabilite »
**DIS :** « Et voici un tableau de bord en temps réel : commandes, trafic, mémoire. »

### 5) Si on doute que c'est du vrai Kubernetes
**TAPE :** `kubectl get pods -n kube-system`
**DIS :** « Les composants internes de Kubernetes tournent — serveur d'API, etcd, planificateur, DNS. C'est un vrai cluster. »

---

## 🌐 LES ADRESSES (navigateur)
| App | http://localhost:30080 |
|-----|------------------------|
| Prometheus | http://localhost:30090/targets |
| Grafana | http://localhost:30030 (admin / admin123) |

> Dans le navigateur : **seulement** localhost:30080 / 30090 / 30030.
> `backend-service` ne s'ouvre PAS dans le navigateur = nom interne au cluster = **normal**.

---

## 🆘 SI ÇA CASSE
| Problème | Solution |
|----------|----------|
| Page 502 / erreur API | Recharger (**F5**), attendre 5 s |
| Pods pas Running | Attendre 30 s, re-taper `kubectl get pods -n ecommerce` |
| Cluster KO | `./deploy.ps1` (relance tout) |
| Docker plante | Fermer Docker → `wsl --shutdown` → rouvrir Docker |
| Rien ne marche | Montrer `docs/screenshots/` + slide 10 |

---

## 💬 RÉPONSES EXPRESS (1 ligne)
- **Pod** = groupe de conteneurs qui vivent ensemble (même réseau)
- **Deployment** = recrée les pods s'ils tombent
- **Service** = adresse réseau stable (ClusterIP = interne, NodePort = extérieur)
- **PV / PVC** = stockage qui survit aux pods → la persistance
- **ConfigMap / Secret** = configuration / mots de passe protégés
- **`-n ecommerce`** = le namespace (espace de travail isolé)
- **`apply -f`** = appliquer un fichier YAML pour créer les ressources
- **build → load → apply** = fabriquer l'image → la mettre dans le cluster → déployer
- **Pourquoi 2 conteneurs dans le Pod 2 ?** = c'était imposé ; ils se parlent en localhost
- **C'est du vrai Kubernetes ?** = oui, kind = Kubernetes dans Docker, version 1.32, projet officiel

---

## 🧠 SI TU NE RETIENS QUE 3 CHOSES
1. **`kubectl get all,pv,pvc -n ecommerce`** (montrer)
2. **`kubectl delete pod -n ecommerce -l app=backend-db`** puis F5 (persistance)
3. Le réflexe **`-n ecommerce`** + les 3 verbes : **get** (voir) · **logs** (comprendre) · **apply** (agir)
