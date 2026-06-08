# Guide de démonstration live — Projet K8s E-Commerce

> Objectif : montrer que l'application tourne vraiment sur Kubernetes, en 5 minutes.

---

## ÉTAPE 0 — Préparation (10 min AVANT la démo)

> ⚠️ Fais toujours un essai complet avant de présenter. Ne découvre pas un bug devant le jury.

### 1. Lancer Docker
- Ouvre **Docker Desktop**, attends que ça affiche **« Engine running »** (en bas à gauche, point vert).

### 2. Démarrer le cluster
Ouvre **PowerShell** et tape **UNE** de ces deux options :

**Option A — le cluster existe déjà (le plus rapide) :**
```powershell
docker start ecommerce-control-plane
```
Attends ~1 minute, puis vérifie (voir étape 3).

**Option B — repartir de zéro (si A ne marche pas) :**
```powershell
cd "C:\Users\Maintenant pret\Cours (Red Hat, Docker) Loic"
./deploy.ps1
```
*(reconstruit tout : cluster + images + déploiement, ~3-5 min)*

### 3. Vérifier que tout est prêt
```powershell
kubectl get pods -n ecommerce
```
Tu dois voir **tous les pods en `Running`** :
```
backend-db-xxxxx   2/2   Running
frontend-xxxxx     1/1   Running
frontend-xxxxx     1/1   Running
```

### 4. Ouvrir l'application dans le navigateur
> **http://localhost:30080**

Le catalogue doit s'afficher. **Laisse cet onglet ouvert.**

### 5. Garde ouverts pendant la démo
- 1 fenêtre **PowerShell**
- 1 onglet **navigateur** sur localhost:30080
- (optionnel) le **PowerPoint**

---

## ÉTAPE — LE DÉROULÉ DE LA DÉMO (ce que tu fais devant le jury)

### 1️⃣ Montrer le cluster Kubernetes
```powershell
kubectl get nodes
```
> « Voici mon cluster Kubernetes : un nœud, prêt. »

```powershell
kubectl get all,pv,pvc -n ecommerce
```
> « Et voici toutes mes ressources : les Pods qui tournent, les Services, et mon volume de stockage qui est bien relié (Bound). »

### 2️⃣ Montrer l'application qui fonctionne
- Va sur le navigateur → **http://localhost:30080**
> « Voici la boutique. Les produits viennent de la base de données, en passant par le moteur. »
- **Clique sur « Ajouter au panier »** sur un produit
- **Clique sur « Valider la commande »**
> « La commande est enregistrée dans la base de données. »

### 3️⃣ LE moment fort : prouver la persistance
> « Je vais maintenant supprimer la partie base de données, et vous allez voir que les données ne sont pas perdues. »

```powershell
kubectl delete pod -n ecommerce -l app=backend-db
```
> « Kubernetes recrée automatiquement le Pod. »

Attends ~15-20 secondes, puis :
```powershell
kubectl get pods -n ecommerce
```
> « Le Pod est recréé, tout seul. »

- **Recharge le navigateur** (F5) et regarde la commande / les produits :
> « Et la commande est toujours là : les données ont survécu grâce au volume persistant. »

### 4️⃣ (Si on doute que c'est du vrai Kubernetes)
```powershell
kubectl get pods -n kube-system
```
> « Voici les composants internes de Kubernetes qui tournent : le serveur d'API, la base etcd, le planificateur, le DNS… C'est un vrai Kubernetes complet. »

---

## COMMANDES — toutes regroupées (antisèche)

```powershell
# Préparation
docker start ecommerce-control-plane
kubectl get pods -n ecommerce

# Démo
kubectl get nodes
kubectl get all,pv,pvc -n ecommerce
#   -> navigateur : http://localhost:30080  (ajouter au panier, valider)
kubectl delete pod -n ecommerce -l app=backend-db
kubectl get pods -n ecommerce
#   -> recharger le navigateur : les données sont toujours là
kubectl get pods -n kube-system   # preuve "vrai Kubernetes"
```

### Les adresses
| Quoi | Adresse |
|------|---------|
| L'application (frontend) | http://localhost:30080 |
| (bonus, si monitoring lancé) Prometheus | http://localhost:30090 |
| (bonus, si monitoring lancé) Grafana | http://localhost:30030 |

---

## PLAN B — si quelque chose plante pendant la démo

1. **Pods pas Running ?** → attends 30s de plus, retape `kubectl get pods -n ecommerce`.
2. **Page 502 / erreur API dans le navigateur ?** → recharge (F5) une ou deux fois ; le backend met quelques secondes à répondre après un redémarrage.
3. **Le cluster ne répond plus ?** → relance tout : `./deploy.ps1`.
4. **Docker plante (erreur au démarrage) ?** → ferme Docker, dans PowerShell tape `wsl --shutdown`, rouvre Docker, attends « Engine running », puis `docker start ecommerce-control-plane`.
5. **Rien ne marche / pas le temps ?** → montre les **captures dans `docs/screenshots/`** et la **slide 10** du PowerPoint : tu as la preuve que ça a fonctionné.

> Astuce : garde le dépôt GitHub ouvert dans un onglet — `docs/screenshots/` et `docs/verification-results.md` sont une preuve de secours.

---

## Ordre conseillé si tu as peu de temps
1. `kubectl get all,pv,pvc -n ecommerce` (10 s)
2. Navigateur localhost:30080 + ajouter au panier (30 s)
3. Test de persistance : delete pod → recharger (1 min) ← **le plus impressionnant**

Ces 3 étapes suffisent à montrer l'essentiel.
