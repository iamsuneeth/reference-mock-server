FROM node:8.11.1-alpine

# Backup repository if the main one doesn't work
# RUN echo http://mirror.yandex.ru/mirrors/alpine/v3.5/main > /etc/apk/repositories; \
#     echo http://mirror.yandex.ru/mirrors/alpine/v3.5/community >> /etc/apk/repositories

RUN apk update && apk upgrade && \
    apk add --no-cache bash git

WORKDIR /home/node/app
RUN chown -R node:node /home/node/app
USER node:node

RUN mkdir /home/node/app/reference-mock-server
COPY . /home/node/app/reference-mock-server
WORKDIR /home/node/app/reference-mock-server

RUN npm install

RUN cp .env.sample .env
EXPOSE 8001
CMD ["npm", "run", "foreman"]
