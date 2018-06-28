FROM openbankinguk/node:latest

WORKDIR /root/app/
COPY . /root/app/
RUN npm install

RUN cp .env.sample .env
EXPOSE 8001
CMD ["npm", "run", "foreman"]
