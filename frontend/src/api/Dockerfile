FROM node:18-alpine

WORKDIR /app

# Copy package files from frontend root
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend source (including src/api)
COPY . .

# Set working directory to API
WORKDIR /app/src/api

# Expose API port
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]
