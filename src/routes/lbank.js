const express = require('express');
const router = express.Router();
const LBankClient = require('../services/lbank');

// 환경 변수에서 API 키 가져오기
const apiKey = process.env.LBANK_API_KEY;
const secretKey = process.env.LBANK_SECRET_KEY;

const lbank = new LBankClient(apiKey, secretKey);

// 시장 데이터 조회
router.get('/ticker/:symbol', async (req, res) => {
  try {
    const data = await lbank.getTicker(req.params.symbol);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 주문서 조회
router.get('/depth/:symbol', async (req, res) => {
  try {
    const data = await lbank.getDepth(req.params.symbol);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 거래 내역 조회
router.get('/trades/:symbol', async (req, res) => {
  try {
    const data = await lbank.getTrades(req.params.symbol);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 계정 정보 조회
router.get('/user-info', async (req, res) => {
  try {
    const data = await lbank.getUserInfo();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 주문 생성
router.post('/order', async (req, res) => {
  try {
    const { symbol, type, price, amount } = req.body;
    const data = await lbank.createOrder(symbol, type, price, amount);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 주문 취소
router.post('/order/cancel', async (req, res) => {
  try {
    const { symbol, orderId } = req.body;
    const data = await lbank.cancelOrder(symbol, orderId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 