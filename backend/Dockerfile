### Dockerfile ###
# 1. Pick a Node base image
FROM node:20-alpine

# 2. Create app directory
WORKDIR /usr/src/app

# 3. Copy package manifests and install deps
COPY package*.json ./
RUN npm ci --production

# 4. Copy rest of your source
COPY . .

# 5. Expose your port
EXPOSE 5002

# 6. Run the server
CMD ["node", "server.js"]
