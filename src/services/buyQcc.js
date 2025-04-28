require('dotenv').config();
const LBankClient = require('./lbank');

// 환경 변수에서 API 키와 시크릿 키 가져오기
const apiKey = process.env.LBANK_API_KEY;
const secretKey = process.env.LBANK_SECRET_KEY;

if (!apiKey || !secretKey) {
  console.error('API 키와 시크릿 키를 설정해주세요.');
  process.exit(1);
}

// LBank 클라이언트 생성
const client = new LBankClient(apiKey, secretKey);

// QCC 시장가 매수 실행
async function buyQCC(quantity) {
  try {
    console.log('QCC 시장가 매수 시작...');
    console.log('매수 수량:', quantity, 'QCC');
    
    // 시장가 매수 주문 실행
    const response = await client.createMarketOrder('qcc_usdt', 'buy_market', quantity);
    console.log('주문 응답:', JSON.stringify(response, null, 2));
    
    if (response.result === true) {
      console.log('QCC 매수 성공!');
      console.log('주문 ID:', response.data.order_id);
      return true;
    } else {
      console.error('QCC 매수 실패:', response.msg);
      return false;
    }
  } catch (error) {
    console.error('에러 발생:', error.response?.data || error.message);
    return false;
  }
}

module.exports = buyQCC; 