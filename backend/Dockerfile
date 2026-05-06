FROM node:20-alpine

WORKDIR /app

# Copy root workspace package and lockfiles if any
COPY package.json package-lock.json* ./

# Copy package.json for workspaces
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# Copy compiled dist folders (assumes build runs before docker build)
COPY backend/dist ./backend/dist
COPY shared/dist ./shared/dist

# Install only production dependencies
RUN npm install --production

# Set working directory to backend to run the server
WORKDIR /app/backend

# Expose port (Railway auto-injects PORT env var)
EXPOSE ${PORT}

# Start server
CMD ["node", "dist/index.js"]
