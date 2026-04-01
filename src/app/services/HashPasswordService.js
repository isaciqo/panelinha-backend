const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

class HashPasswordService {
  async hash(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async compare(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  }
}

module.exports = HashPasswordService;
