const mongoose = require('mongoose');
const encryptionService = require('../services/encryption');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  lbankApiKey: {
    iv: String,
    encryptedData: String
  },
  lbankSecretKey: {
    iv: String,
    encryptedData: String
  },
  oldApiKeys: [{
    apiKey: {
      iv: String,
      encryptedData: String
    },
    secretKey: {
      iv: String,
      encryptedData: String
    },
    rotatedAt: Date
  }],
  tradingBots: [{
    symbol: String,
    buyPrice: Number,
    sellPrice: Number,
    orderAmount: Number,
    maxPosition: Number,
    stopLoss: Number,
    takeProfit: Number,
    isActive: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastKeyRotation: {
    type: Date,
    default: Date.now
  }
});

// API 키와 시크릿 키를 암호화하여 저장
userSchema.methods.setApiKeys = function(apiKey, secretKey) {
  this.lbankApiKey = encryptionService.encrypt(apiKey);
  this.lbankSecretKey = encryptionService.encrypt(secretKey);
  this.lastKeyRotation = new Date();
};

// API 키와 시크릿 키를 복호화하여 반환
userSchema.methods.getApiKeys = function() {
  return {
    apiKey: encryptionService.decrypt(this.lbankApiKey),
    secretKey: encryptionService.decrypt(this.lbankSecretKey)
  };
};

// 이전 API 키 저장
userSchema.methods.saveOldKeys = function() {
  if (this.lbankApiKey && this.lbankSecretKey) {
    this.oldApiKeys.push({
      apiKey: this.lbankApiKey,
      secretKey: this.lbankSecretKey,
      rotatedAt: new Date()
    });
  }
};

module.exports = mongoose.model('User', userSchema); 