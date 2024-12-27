# Use ARM64-based Node.js image
FROM arm64v8/node:16-buster

# Install dependencies required for Chromium to run
RUN apt-get update && apt-get install -y \
  chromium \
  curl \
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
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy the backend and frontend code into the container
COPY ./backend/ /app/backend/
COPY ./frontend/ /app/frontend/

# Install backend dependencies
RUN npm install --prefix /app/backend

# Set environment variable to specify the location of Chromium on the system
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Expose port for the app
EXPOSE 3000

# Run the backend server
CMD ["node", "/app/backend/server.js"]
