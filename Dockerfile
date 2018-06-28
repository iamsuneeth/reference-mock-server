FROM openbankinguk/node:latest

COPY . /root/app/
RUN npm install

RUN cp .env.sample .env
EXPOSE 8001
CMD ["npm", "run", "foreman"]
