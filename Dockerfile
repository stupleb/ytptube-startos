ARG IMAGE
FROM ${IMAGE}
USER root
# The base image's CA stores are only as current as its last release.
RUN apt-get update \
 && apt-get install -y --no-install-recommends --only-upgrade ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && /opt/python/bin/python -m pip install --no-cache-dir --upgrade 'certifi>=2026.10.19' \
 && for f in /etc/ssl/certs/ca-certificates.crt "$(/opt/python/bin/python -c 'import certifi; print(certifi.where())')"; do \
      test -s "$f" && ! grep -q MIICTjCCAdOgAwIBAgIKPPYHqWhwDtqLhDAKBggqhkjOPQQDAzBr "$f" || exit 1; \
    done
USER app
ENV DENO_TLS_CA_STORE=system
