module.exports = {
  apps: [{
    name: 'qcc-trading-bot',
    script: 'src/bot/tradingBot.js',
    watch: false,
    autorestart: false,
    max_memory_restart: '1G',
    node_args: '--no-deprecation',
    env: {
      NODE_ENV: 'production'
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    error_file: 'logs/error.log',
    out_file: 'logs/out.log'
  }]
}; 