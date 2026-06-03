#!/bin/sh
# Injecte le DNS resolver (lu depuis /etc/resolv.conf) dans la conf Nginx
# au demarrage du conteneur. Permet une resolution DNS paresseuse, robuste
# meme si le Service backend n'est pas encore pret.
set -e
NS=$(awk '/^nameserver/ { print $2; exit }' /etc/resolv.conf)
if [ -z "$NS" ]; then
    echo "[entrypoint] WARN: aucun nameserver trouve dans /etc/resolv.conf, fallback 127.0.0.11"
    NS="127.0.0.11"
fi
echo "[entrypoint] DNS resolver Nginx : $NS"
sed -i "s|__NGINX_RESOLVER__|$NS|g" /etc/nginx/conf.d/default.conf
