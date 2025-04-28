const axios = require('axios');
const { log } = require('console');
const crypto = require('crypto');
const WebSocket = require('ws');

class LBankAPI {
  constructor(apiKey, secretKey) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseUrl = 'https://www.lbkex.net/v2';
    this.wsUrl = 'wss://www.lbkex.net/ws/V2';
  }

  // HMAC SHA256 서명 생성
  generateSignature(params) {
    // sign 파라미터는 제외
    const { sign, ...paramsForSign } = params;
    
    // 파라미터를 알파벳 순으로 정렬
    const sortedKeys = Object.keys(paramsForSign).sort();
    
    // 파라미터 문자열 생성
    const pairs = [];
    for (const key of sortedKeys) {
      const value = paramsForSign[key];
      if (value !== undefined && value !== null && value !== '') {
        pairs.push(`${key}=${value}`);
      }
    }
    
    const parameters = pairs.join('&');
    console.log('파라미터 문자열:', parameters);
    
    // MD5 해시 생성 및 대문자 변환
    const md5Hash = crypto
      .createHash('md5')
      .update(parameters)
      .digest('hex')
      .toUpperCase();
    
    console.log('MD5 해시:', md5Hash);
    
    // HmacSHA256 서명 생성
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(md5Hash)
      .digest('hex');
    
    console.log('최종 서명:', signature);
    return signature;
  }

  // REST API 요청
  async request(config) {
    const { url, method, params } = config;
    
    const requestConfig = {
      url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
      method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    if (params) {
      if (method === 'GET') {
        requestConfig.params = params;
      } else {
        const formData = new URLSearchParams();
        // 파라미터를 알파벳 순으로 정렬
        const sortedKeys = Object.keys(params).sort();
        
        for (const key of sortedKeys) {
          const value = params[key];
          if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
          }
        }
        requestConfig.data = formData;
        console.log('POST 요청 데이터:', formData.toString());
      }
    }

    try {
      const response = await axios(requestConfig);
      return response.data;
    } catch (error) {
      console.error('API 요청 실패:', error.message);
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  // WebSocket 연결
  connectWebSocket() {
    return new WebSocket(this.wsUrl);
  }

  // 시장 데이터 조회 (공개 API)
  async getTicker(symbol) {
    const response = await this.request({
      url: '/ticker.do',
      method: 'GET',
      params: { symbol }
    });

    if (response.error_code === 0) {
      return response.data[0];
    }
    throw new Error(response.msg || '티커 정보 조회 실패');
  }

  // 주문서 조회 (공개 API)
  async getDepth(symbol, size = 60) {
    return this.request({
      url: '/depth.do',
      method: 'GET',
      params: { symbol, size }
    });
  }

  // 거래 내역 조회 (공개 API)
  async getTrades(symbol, size = 60) {
    return this.request({
      url: '/trades.do',
      method: 'GET',
      params: { symbol, size }
    });
  }

  // 계정 정보 조회 (인증 필요)
  async getUserInfo() {
    return this.request({
      url: '/user_info.do',
      method: 'POST',
      params: {}
    });
  }

  // 주문 생성 (인증 필요)
  async createOrder(symbol, type, price, amount) {
    const timestamp = Date.now().toString();
    const params = {
      api_key: this.apiKey,
      timestamp,
      symbol,
      type,
      price,
      amount,
    };
    params.sign = this.generateSignature(params);
    
    return this.request({
      url: '/create_order.do',
      method: 'POST',
      params
    });
  }

  // 주문 취소 (인증 필요)
  async cancelOrder(symbol, orderId) {
    return this.request({
      url: '/cancel_order.do',
      method: 'POST',
      params: {
        symbol,
        order_id: orderId,
      }
    });
  }

  // 시장가 주문 생성 (인증 필요)
  async createMarketOrder(symbol, type, amount) {
    const timestamp = Date.now().toString();
    const echostr = 'ABCDEFGHIJ' + timestamp + 'KLMNOPQRST';
    
    const params = {
      api_key: this.apiKey,
      symbol,
      type,
      price: '1',  // 시장가 주문을 위한 고정 가격
      amount: amount.toString(),
      signature_method: 'HmacSHA256',
      timestamp,
      echostr
    };
    
    console.log('요청 파라미터:', params);
    const signature = this.generateSignature(params);
    params.sign = signature;
    
    return this.request({
      url: '/supplement/create_order.do',
      method: 'POST',
      params
    });
  }
}

module.exports = LBankAPI; 