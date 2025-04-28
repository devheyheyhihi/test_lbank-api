require('dotenv').config();
const PriceMonitor = require('../services/priceMonitor');
const buyQCC = require('../services/buyQcc');
const StrategyManager = require('../services/strategyManager');

console.log('프로그램 시작...');

const strategyManager = new StrategyManager();
let monitor = null;  // PriceMonitor 인스턴스
let isBuying = false;  // 매수 중인지 확인하는 플래그

// priceMonitor 시작 함수
function startPriceMonitor() {
  monitor = new PriceMonitor('qcc_usdt');
  console.log('WebSocket 연결 시작...');
  
  monitor.onPriceChange((price) => {
    const now = new Date().toLocaleString();
    process.stdout.write(`\r[${now}] QCC 현재가: ${price} USDT`);
    
    // 모든 전략이 실행되었는지 확인
    if (strategyManager.isAllStrategiesExecuted()) {
      console.log('\n\n=== 모든 매수 전략이 실행되었습니다 ===');
      console.log('프로그램을 종료합니다...');
      if (monitor) {
        monitor.stop();
      }
      process.exit(0);
      return;
    }
    
    // 매수 중이 아닐 때만 매수 실행
    if (!isBuying) {
      const quantity = strategyManager.getBuyQuantity(price);
      if (quantity > 0) {
        console.log(`\n[${now}] ⚠️ 매수 시작`);
        console.log(`현재가: ${price} USDT`);
        console.log(`매수 수량: ${quantity} QCC`);
        
        isBuying = true;
        
        buyQCC(quantity).then((success) => {
          if (success) {
            console.log('\n✅ 매수 완료');
          }
          isBuying = false;  // 매수 완료 후 플래그 초기화
        }).catch(error => {
          console.error('\n❌ 매수 실패:', error);
          isBuying = false;  // 매수 실패 후 플래그 초기화
        });
      }
    }
  });
  
  monitor.start();
}

// WebSocket 연결 시작
startPriceMonitor();

// Ctrl+C로 프로그램을 종료할 때 정리
process.on('SIGINT', () => {
  console.log('\n프로그램을 종료합니다...');
  if (monitor) {
    monitor.stop();
  }
  process.exit(0);
}); 