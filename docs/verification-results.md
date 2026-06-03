# Resultats des verifications fonctionnelles

Cluster : **kind** (mono-noeud `ecommerce-control-plane`, Kubernetes v1.32.2)
Namespace : `ecommerce`
Date d'execution : 2026-06-04

---

## Etat du cluster (`kubectl get all,pv,pvc -n ecommerce`)

```
NAME                             READY   STATUS    RESTARTS   AGE
pod/backend-db-bcff44b5c-nnd7b   2/2     Running   0          70s
pod/frontend-7d7b7cf69-bkhcp     1/1     Running   1          8h
pod/frontend-7d7b7cf69-vlcpv     1/1     Running   1          8h

NAME                       TYPE        CLUSTER-IP     PORT(S)        AGE
service/backend-service    ClusterIP   10.96.60.216   3000/TCP       8h
service/frontend-service   NodePort    10.96.64.223   80:30080/TCP   8h

NAME                         READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/backend-db   1/1     1            1           8h
deployment.apps/frontend     2/2     2            2           8h

persistentvolume/mongo-pv    2Gi   RWO   Retain   Bound   ecommerce/mongo-pvc   manual   8h
persistentvolumeclaim/mongo-pvc   Bound   mongo-pv   2Gi   RWO   manual   8h
```

Secrets : `mongo-credentials`, `grafana-admin`
ConfigMaps : `backend-config`, `prometheus-config`, `grafana-provisioning`, `grafana-dashboards`

---

## A. Frontend accessible

```
$ curl http://localhost:30080/
HTTP 200

$ curl http://localhost:30080/healthz
ok
```

## B. Communication Frontend -> Backend (proxy Nginx /api -> backend-service ClusterIP)

```
$ curl http://localhost:30080/api/products
[{"_id":"...","sku":"P-001","name":"Casque audio sans-fil","price":79.99,"stock":25,...},
 {"sku":"P-002","name":"Clavier mecanique RGB","price":119.5,...}, ... ]
```

## C. Communication Backend -> MongoDB

```
$ curl http://localhost:30080/api/health
{"status":"ok","db":"connected","timestamp":"2026-06-03T23:45:43.356Z"}
```

Logs backend (connexion + donnees deja presentes = persistees) :
```
[backend] Connecte a MongoDB (127.0.0.1:27017)
[backend] 6 produits deja presents, pas de seed
[backend] API ecoute sur le port 3000
```

## D. Persistance des donnees apres redemarrage du Pod

```
# 1. Creation d'une commande
$ curl -X POST http://localhost:30080/api/orders -H "Content-Type: application/json" \
    -d '{"items":[{"sku":"P-001","name":"Casque audio sans-fil","price":79.99,"qty":2}],"customer":"demo-persistance"}'
{"id":"6a20bcb637fb9e98d1c1e09a", ... "total":159.98, ...}

# 2. Suppression du Pod (le Deployment le recree, strategie Recreate)
$ kubectl delete pod -n ecommerce -l app=backend-db
pod "backend-db-bcff44b5c-cz7qm" deleted

# 3. Pod recree en ~5s (2/2 Running), nouveau nom backend-db-bcff44b5c-nnd7b

# 4. La commande a SURVECU au redemarrage :
$ curl http://localhost:30080/api/orders
[{"_id":"6a20bcb637fb9e98d1c1e09a", ... "customer":"demo-persistance","total":159.98, ...}]
```

**=> Persistance validee** : la commande creee avant la suppression du Pod est toujours
presente apres recreation, grace au PersistentVolume/PVC monte sur `/data/db`.

---

## Bilan

| Verification                          | Resultat |
|---------------------------------------|----------|
| A. Frontend accessible                | OK       |
| B. Frontend <-> Backend               | OK       |
| C. Backend <-> MongoDB                | OK       |
| D. Persistance apres redemarrage Pod  | OK       |

Les 4 verifications imposees par le cahier des charges sont validees.
