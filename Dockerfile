FROM node:20-alpine

# Install git, cron, and pm2
RUN apk update && \
    apk add --no-cache git dcron tzdata && \
    npm install -g pm2

# Setup working directory
WORKDIR /app

# Copy the application source code (excluding Contents via .dockerignore)
COPY . .

# Set permissions for update script
RUN chmod +x update.sh

# Setup cron job to run daily at midnight (adjust the timing if needed)
# 0 0 * * * refers to midnight. We pipe output to cron.log
RUN echo "0 0 * * * /app/update.sh >> /var/log/cron.log 2>&1" > /etc/crontabs/root

# Set environment to production
ENV NODE_ENV=production

# Install dependencies and build initially
RUN npm install --include=dev && npm run build

# Expose port
EXPOSE 3000

# Start cron daemon and then start the PM2 server
# crond -b runs in background. 
CMD crond -b && pm2-runtime start npm --name "nextjs" -- run start
