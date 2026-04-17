FROM node:22-alpine AS builder

WORKDIR /app
ENV CI=true
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY website/package.json ./website/
RUN pnpm install --frozen-lockfile --filter @valaris/website

COPY website/ ./website/
RUN pnpm --filter @valaris/website build

FROM nginx:alpine
COPY --from=builder /app/website/dist /usr/share/nginx/html
COPY website/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
