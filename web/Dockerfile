FROM node:20-alpine AS dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci

FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:20-alpine
COPY ./package.json package-lock.json /app/
COPY --from=dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/dist /app/dist
WORKDIR /app
EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
