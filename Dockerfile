FROM node:14-alpine

WORKDIR /usr/src/app

COPY  ./dist/ .

ENTRYPOINT [ "node", "main.js" ]
