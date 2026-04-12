#!/bin/sh
cd /app
git fetch origin main

# Check if there are updates on the remote branch
if [ "$(git rev-parse HEAD)" != "$(git rev-parse @{u})" ]; then
    echo "$(date): Updates found. Pulling latest code..."
    
    # Store current package.json hash to see if we need to npm install
    OLD_PKG_HASH=$(shasum package.json | awk '{ print $1 }')
    
    git pull origin main
    
    NEW_PKG_HASH=$(shasum package.json | awk '{ print $1 }')
    
    # Run npm install if package.json has changed
    if [ "$OLD_PKG_HASH" != "$NEW_PKG_HASH" ]; then
        echo "package.json changed, running npm install..."
        npm install
    fi
    
    echo "Running npm run build..."
    npm run build
    
    echo "Restarting application..."
    pm2 reload nextjs
else
    echo "$(date): No updates found."
fi
