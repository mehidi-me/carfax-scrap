FROM ghcr.io/puppeteer/puppeteer:23.4.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app
RUN chown -R admin:admin /usr/src/app
RUN chmod 755 /usr/src/app
USER admin

COPY package*.json ./
RUN npm ci
COPY . .

# Ensure the directory has write permissions
RUN chmod -R 777 /usr/src/app/public/html

CMD [ "node", "index.js" ]
