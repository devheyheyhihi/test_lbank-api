const express = require('express');
const dotenv = require('dotenv');
const lbankRoutes = require('./routes/lbank');

// 환경 변수 설정
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use('/api/lbank', lbankRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Express 서버가 정상적으로 실행 중입니다.' });
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
}); 