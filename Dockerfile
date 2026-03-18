# Node.js 20 Alpine をベースイメージとして使用
FROM node:20-alpine

# Dev Containerで必要なツールをインストール
RUN apk update && apk add --no-cache \
    bash \
    build-base \
    curl \
    git \
    vim \
    ca-certificates \
    && rm -rf /var/cache/apk/*
    
# 作業ディレクトリを設定
WORKDIR /app

# 権限設定: nodeユーザーが書き込めるように所有権を変更
RUN chown -R node:node /app

# nodeユーザーに切り替え
USER node

# 依存関係ファイルをコピー（所有者をnodeに変更）
COPY --chown=node:node package*.json ./

RUN npm install

# ソースコード全体をコピー（所有者をnodeに変更）
COPY --chown=node:node . .

# ポート3000を公開
EXPOSE 3000