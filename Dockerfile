FROM openbankinguk/node:latest

WORKDIR /home/node/app
RUN mkdir /home/node/app/reference-mock-server
COPY . /home/node/app/reference-mock-server
WORKDIR /home/node/app/reference-mock-server

RUN npm install

RUN cp .env.sample .env
EXPOSE 8001
CMD ["npm", "run", "foreman"]
