#!/bin/bash

# 스크립트 실행 디렉토리로 이동
cd "$(dirname "$0")"

# PM2 프로세스 상태 확인
if pm2 list | grep -q "qcc-trading-bot"; then
    echo "QCC Trading Bot is already running. Restarting..."
    pm2 restart qcc-trading-bot
else
    echo "Starting QCC Trading Bot..."
    pm2 start ecosystem.config.js
fi