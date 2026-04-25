FROM node:20-alpine

# Install git, cron, rm, pm2, and wget/unzip for PocketBase
RUN apk update && \
    apk add --no-cache git dcron tzdata wget unzip && \
    npm install -g pm2

# Setup working directory
WORKDIR /app

# Download and install PocketBase Linux binary
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.12/pocketbase_0.22.12_linux_amd64.zip -O /tmp/pb.zip && \
    unzip /tmp/pb.zip -d /tmp/pb_temp && \
    mv /tmp/pb_temp/pocketbase /usr/local/bin/pocketbase && \
    chmod +x /usr/local/bin/pocketbase && \
    rm -rf /tmp/pb.zip /tmp/pb_temp

# Copy the application source code (excluding Contents via .dockerignore)
COPY . .

# Set permissions for update script
RUN chmod +x update.sh

# Setup cron job to run daily at midnight (adjust the timing if needed)
RUN echo "0 0 * * * /app/update.sh >> /var/log/cron.log 2>&1" > /etc/crontabs/root

# Set environment to production and point to internal PocketBase
ENV NODE_ENV=production
ENV NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090

# Install dependencies and build initially (while running PocketBase temporarily)
RUN npm install --include=dev && \
    pocketbase serve --dir /app/backend/pb_data & \
    sleep 3 && \
    npm run build && \
    pkill pocketbase

# Expose Next.js and PocketBase ports
EXPOSE 3000
EXPOSE 8090

# Start cron daemon, Pocketbase, and the PM2 Next.js server
CMD crond -b && pocketbase serve --dir /app/backend/pb_data --http="0.0.0.0:8090" & pm2-runtime start npm --name "nextjs" -- run start
