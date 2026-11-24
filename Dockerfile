ARG IMAGE
FROM ${IMAGE}
# Deno trusts only its built-in roots unless told otherwise.
RUN test -s /etc/ssl/certs/ca-certificates.crt \
 && ! grep -q MIICTjCCAdOgAwIBAgIKPPYHqWhwDtqLhDAKBggqhkjOPQQDAzBr /etc/ssl/certs/ca-certificates.crt
ENV DENO_TLS_CA_STORE=system
