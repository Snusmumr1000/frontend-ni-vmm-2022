FROM node:18-alpine
WORKDIR /app
COPY . .

ENV PORT 8080

RUN yarn
RUN npm install -g @quasar/cli
CMD quasar dev -p $PORT
EXPOSE $PORT
