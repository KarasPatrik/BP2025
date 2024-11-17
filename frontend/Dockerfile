# Use Ubuntu 22.04 as the base image
FROM ubuntu:22.04

# Set environment variables to prevent prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Update package list and install necessary packages
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    ca-certificates \
    build-essential

# Install Node.js (LTS version 18)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Verify Node.js and npm installation
RUN node -v && npm -v

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the default React development port
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]

