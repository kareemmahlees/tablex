FROM oven/bun:slim as setup-bun

FROM rust:1.79.0-slim

# Install necessary deps
RUN apt-get update -qq && apt-get install -qq -y \
    curl \
    libwebkit2gtk-4.1-dev \
    libappindicator3-dev \
    librsvg2-dev \
    libssl-dev \
    patchelf \
    unzip

WORKDIR /usr/src/tablex

COPY --from=setup-bun /usr/local/bin/bun /usr/local/bin/bun
COPY --from=setup-bun /usr/local/bin/bunx /usr/local/bin/bunx

COPY package.json ./
COPY bun.lockb ./
COPY apps/core/package.json apps/core/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/lib/package.json packages/lib/package.json
COPY packages/config/tailwind/package.json packages/config/tailwind/package.json

RUN bun install --frozen-lock

COPY . .

ENV DEBIAN_FRONTEND=noninteractive
ENV DISPLAY=:0

CMD ["bun", "tauri:dev"]


# /usr/local/bin/bun