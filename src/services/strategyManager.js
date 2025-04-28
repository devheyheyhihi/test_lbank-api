const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

class StrategyManager {
  constructor() {
    this.buyStrategies = [];
    this.executedStrategies = new Set(); // 실행된 전략을 기록
    this.loadStrategies();
  }

  loadStrategies() {
    try {
      const strategyPath = path.join(__dirname, '../../config/buy_strategy.csv');
      const data = fs.readFileSync(strategyPath, 'utf8');
      this.buyStrategies = csv.parse(data, {
        columns: true,
        skip_empty_lines: true
      }).map(row => ({
        price: parseFloat(row.가격),
        quantity: parseFloat(row.수량)
      }));
      
      console.log('\n=== 매수 전략 목록 ===');
      this.buyStrategies.forEach((strategy, index) => {
        console.log(`전략 ${index + 1}: ${strategy.price} USDT 이하일 때 ${strategy.quantity} QCC 매수`);
      });
      console.log('==================\n');
    } catch (error) {
      console.error('전략 로드 중 오류 발생:', error);
    }
  }

  getBuyQuantity(currentPrice) {
    // CSV 파일의 순서대로 전략 확인
    for (let i = 0; i < this.buyStrategies.length; i++) {
      const strategy = this.buyStrategies[i];
      
      // 이미 실행된 전략이면 다음 전략으로
      if (this.executedStrategies.has(i)) {
        continue;
      }

      // 현재 가격이 전략 가격보다 높으면 다음 전략으로
      if (currentPrice <= strategy.price) {
        // 전략 실행 표시
        this.executedStrategies.add(i);
        console.log(`\n[전략 실행] ${strategy.price} USDT 이하 도달 -> ${strategy.quantity} QCC 매수`);
        return strategy.quantity;
      }
    }

    return 0;
  }

  // 모든 전략이 실행되었는지 확인
  isAllStrategiesExecuted() {
    return this.buyStrategies.every((_, index) => this.executedStrategies.has(index));
  }

  // 실행된 전략 초기화
  resetExecutedStrategies() {
    this.executedStrategies.clear();
  }

  // 전략 다시 로드
  reloadStrategies() {
    this.buyStrategies = [];
    this.executedStrategies.clear();
    this.loadStrategies();
  }
}

module.exports = StrategyManager; 