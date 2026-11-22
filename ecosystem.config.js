// ecosystem.config.js — PM2 production process definition for esp-app
// Usage: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "esp-app",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 4000",
      interpreter: "C:/Program Files/nodejs/node.exe",
      cwd: "C:/Users/s.jalili/Repositories/esp-app",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
