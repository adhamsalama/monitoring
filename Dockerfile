FROM node:16-alpine AS build

# Create app directory

WORKDIR /app

# Install app dependencies production only
COPY package.json ./

RUN npm install

# Bundle app source
COPY . .

# Build app
RUN npm run build

# Multi-stage build
FROM node:16-alpine

# Create app directory
WORKDIR /app

# Install app dependencies production only
COPY package.json ./

RUN npm install --only=production

# Copy only the necessary files from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Run the app
CMD ["npm", "start"]