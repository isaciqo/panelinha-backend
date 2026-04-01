const jwt = require('jsonwebtoken');

class TokenService {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    if (!this.secret) throw new Error('JWT_SECRET env var is required');
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  generate(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token) {
    return jwt.verify(token, this.secret);
  }
}

module.exports = TokenService;
