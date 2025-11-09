# Use the official Node.js 22.2.0 image as the base
FROM node:20.17.0

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build TypeScript code
RUN npm run build

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 8000

# Command to run your application
CMD ["node", "dist/server.js"]