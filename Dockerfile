# Step 1: Use official Node.js image
FROM node:18-slim

# Step 2: Install dependencies required for Puppeteer to run Chromium
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    curl \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Step 3: Install Google Chrome
RUN curl -sSL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o google-chrome-stable_current_amd64.deb \
    && dpkg -i google-chrome-stable_current_amd64.deb \
    && apt-get install -f -y \
    && rm google-chrome-stable_current_amd64.deb

# Step 4: Set the working directory in the container
WORKDIR /app

# Step 5: Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Step 6: Install the Node.js dependencies
RUN npm install

# Step 7: Copy the rest of the application code
COPY . .

# Step 8: Expose the port your app will be running on
EXPOSE 3000

# Step 9: Define the command to run your app
CMD ["npm", "start"]
