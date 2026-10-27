ARG IMAGE
FROM ${IMAGE}
USER root
# Deno trusts only its built-in roots unless told otherwise, and curl_cffi bundles its own Brotli.
RUN /opt/python/bin/python -m pip install --no-cache-dir --upgrade 'curl_cffi>=0.17.0' \
 && test -s /etc/ssl/certs/ca-certificates.crt \
 && ! grep -q MIICTjCCAdOgAwIBAgIKPPYHqWhwDtqLhDAKBggqhkjOPQQDAzBr /etc/ssl/certs/ca-certificates.crt \
 && /opt/python/bin/python -c "import re, curl_cffi.curl as c; from packaging.version import Version as V; assert V(re.search(r'brotli/([\d.]+)', c.Curl().version().decode())[1]) >= V('1.2.1')"
USER app
ENV DENO_TLS_CA_STORE=system
