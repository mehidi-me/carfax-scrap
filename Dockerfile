FROM ghcr.io/puppeteer/puppeteer:23.4.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .

# Ensure the directory has write permissions
RUN mkdir -p /usr/src/app/public/html && chmod -R 777 /usr/src/app/public/html

CMD [ "node", "index.js" ]
