FROM node:lts as builder

RUN mkdir -p /transpile
WORKDIR /transpile

COPY ./.babelrc ./.eslintrc ./.prettierrc ./package*.json ./
COPY ./.env.example ./.env
COPY ./config ./config
RUN npm install
COPY ./src ./src
RUN npm run lint
RUN npm run build

FROM node:lts

RUN mkdir -p /api
COPY --from=builder /transpile/build /api/build
WORKDIR /api

COPY ./package*.json ./
COPY ./config ./config
RUN npm install --only=production
EXPOSE ${API_SERVICE_PORT}
CMD npm start
