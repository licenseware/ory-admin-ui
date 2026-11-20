FROM oven/bun:1@sha256:3aa040e5445efa09d75bb428a64ba50db13e2b3ac9b6b0c7f145615f62b2ee18 AS builder

ARG VERSION
ARG COMMIT

WORKDIR /app
COPY . .

ENV APP_VERSION=${VERSION} \
    APP_COMMIT=${COMMIT}

RUN bun install --frozen-lockfile && \
    bun run build

FROM ghcr.io/static-web-server/static-web-server:2@sha256:ccf2d666ffe5f8ef2ec96bc40f07757605998c04b78f7d8fdb98a584dd4f5717 AS runner

ENV SERVER_COMPRESSION_LEVEL=fastest \
    SERVER_FALLBACK_PAGE=index.html \
    SERVER_ERROR_PAGE_404=index.html \
    SERVER_HEALTH=true \
    SERVER_LOG_FORWARDED_FOR=true \
    SERVER_LOG_REMOTE_ADDRESS=true \
    SERVER_PORT=8080

COPY --from=builder /app/dist /public
