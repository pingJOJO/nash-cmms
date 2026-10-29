module.exports = {
  apps: [
    {
      name: 'nash-cmms',
      script: './server/dist/index.js',
      
      // Cluster mode: scales automatically across available CPU cores
      instances: 'max',
      exec_mode: 'cluster',
      
      // Stability & Resilience
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      
      // Environment Configurations
      env_production: {
        NODE_ENV: 'production',
        PORT: 3010
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3010
      },
      
      // Logging
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      merge_logs: true,
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
