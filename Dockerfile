FROM node:18-alpine
WORKDIR /app
COPY . .

ENV PORT 9000

RUN yarn
RUN npm install -g @quasar/cli
CMD quasar dev -p $PORT
EXPOSE $PORT
