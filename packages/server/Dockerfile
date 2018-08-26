FROM node:alpine

RUN apk add curl openssl --no-cache && \
    mkdir -p /braum && \
    mkdir -p /braum/config

WORKDIR /braum

COPY ./ ./

RUN yarn --prod=false && \
    npm run build && \
    rm -rf src/ node_modules/ tsconfig.json && \
    yarn --prod && \
    yarn cache clean

EXPOSE 3000

CMD node index.js
