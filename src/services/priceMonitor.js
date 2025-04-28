const WebSocket = require('ws');

class PriceMonitor {
  constructor(symbol) {
    this.symbol = symbol.toLowerCase();
    this.ws = null;
    this.price = null;
    this.callbacks = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.lastPrice = null;
  }

  // WebSocket 연결 시작
  start() {
    console.log(`[${this.symbol}] 가격 모니터링 시작`);
    this.connect();
  }

  // WebSocket 연결
  connect() {
    const wsUrl = 'wss://www.lbkex.net/ws/V2/';
    console.log(`[${this.symbol}] WebSocket 연결 시도: ${wsUrl}`);
    
    this.ws = new WebSocket(wsUrl);

    this.ws.on('open', () => {
      console.log(`[${this.symbol}] WebSocket 연결 성공`);
      this.subscribeToTicker();
      this.reconnectAttempts = 0;
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(message);
      } catch (error) {
        console.error(`[${this.symbol}] 메시지 처리 오류:`, error);
      }
    });

    this.ws.on('close', () => {
      console.log(`[${this.symbol}] WebSocket 연결 종료`);
      this.handleReconnect();
    });

    this.ws.on('error', (error) => {
      console.error(`[${this.symbol}] WebSocket 오류:`, error);
    });
  }

  // 티커 구독
  subscribeToTicker() {
    const subscribeMessage = {
      action: 'subscribe',
      subscribe: 'tick',
      pair: this.symbol
    };
    console.log(`[${this.symbol}] 티커 구독 요청:`, subscribeMessage);
    this.ws.send(JSON.stringify(subscribeMessage));
  }

  // 메시지 처리
  handleMessage(message) {
    console.log('받은 메시지:', JSON.stringify(message, null, 2));  // 디버깅용 로그 추가
    
    // ping 메시지 처리
    if (message.action === 'ping') {
      const pongMessage = {
        action: 'pong',
        pong: message.ping
      };
      this.ws.send(JSON.stringify(pongMessage));
      return;
    }
    
    if (message.type === 'tick' && message.pair === this.symbol) {
      const newPrice = parseFloat(message.tick.latest);
      const timestamp = new Date().toISOString();
      
      // 가격 변동 계산
      let priceChange = '';
      if (this.lastPrice !== null) {
        const change = ((newPrice - this.lastPrice) / this.lastPrice * 100).toFixed(2);
        priceChange = change >= 0 ? `+${change}%` : `${change}%`;
      }
      
      this.price = newPrice;
      this.lastPrice = newPrice;
      
      // 상세 로그 출력
      console.log(`[${timestamp}] [${this.symbol}] 현재가: ${newPrice} USDT ${priceChange}`);
      console.log(`[${timestamp}] [${this.symbol}] 24시간 변동: ${message.tick.change}%`);
      console.log(`[${timestamp}] [${this.symbol}] 거래량: ${message.tick.vol} ${this.symbol.split('_')[0]}`);
      
      this.notifyPriceChange();
    }
  }

  // 가격 변경 알림
  notifyPriceChange() {
    this.callbacks.forEach((callback) => {
      callback(this.price);
    });
  }

  // 가격 변경 콜백 등록
  onPriceChange(callback) {
    const callbackId = Date.now();
    this.callbacks.set(callbackId, callback);
    return callbackId;
  }

  // 콜백 제거
  removeCallback(callbackId) {
    this.callbacks.delete(callbackId);
  }

  // 재연결 처리
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = 5000 * this.reconnectAttempts;
      console.log(`[${this.symbol}] ${delay/1000}초 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), delay);
    } else {
      console.error(`[${this.symbol}] 최대 재연결 시도 횟수 초과`);
    }
  }

  // 연결 종료
  stop() {
    if (this.ws) {
      console.log(`[${this.symbol}] WebSocket 연결 종료 중...`);
      this.ws.close();
      this.ws = null;
    }
    this.callbacks.clear();
    console.log(`[${this.symbol}] 가격 모니터링 중지`);
  }
}

// 직접 실행 코드 추가
if (require.main === module) {
  const monitor = new PriceMonitor('qcc_usdt');
  monitor.start();

  monitor.onPriceChange((price) => {
    console.log(`[콜백] QCC 가격 변경: ${price} USDT`);
  });

  // 30초 후 모니터링 중지
  setTimeout(() => {
    monitor.stop();
    console.log('테스트 종료');
  }, 30000);
}

module.exports = PriceMonitor; 