FROM node:20-alpine AS build

WORKDIR /usr/build

COPY . .

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM nginx:stable-alpine AS production

COPY --from=build /usr/build/dist /usr/share/nginx/html
COPY --from=build /usr/build/default.conf /etc/nginx/conf.d

EXPOSE 8080