FROM alpine:latest

ENV NGINX_USER=svc_nginx_hmda

ADD . /usr/src/app

WORKDIR /usr/src/app

RUN apk update && \
    apk upgrade && \
    apk add --update openssl nginx && \
    adduser -D -g $NGINX_USER $NGINX_USER && \
    rm -f nginx/*.rpm && \
    rm -rf /usr/share/nginx/ && \
    ls -d -1 /etc/nginx/* | grep -v '\/mime.types$' | xargs rm -rf && \
    mv nginx/* /etc/nginx && \
    ls -d -1 * | grep -v '^\(dist\|docker-entrypoint.sh\|env.sh\)$' | xargs rm -rf && \
    touch /run/nginx.pid && \
    chown -R $NGINX_USER:$NGINX_USER dist/js/*.js /etc/nginx /run/nginx.pid


USER $NGINX_USER

EXPOSE 8080

CMD ["./docker-entrypoint.sh"]
