FROM ghcr.io/puppeteer/puppeteer:23.4.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Create a non-root user and give ownership of the working directory
RUN useradd -m appuser

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .

# Create the directory with appropriate permissions
RUN mkdir -p /usr/src/app/public/html && chown -R appuser:appuser /usr/src/app/public/html

# Switch to non-root user
USER appuser

CMD ["node", "index.js"]
