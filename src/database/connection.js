const mongoose = require('mongoose');
const PasswordResetToken = require('./models/passwordResetToken/passwordResetTokenModel');

const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/panelinha_db';
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }

  // O TTL do token de reset mudou: syncIndexes recria o índice com a opção nova
  // (o Mongo não altera um índice existente sozinho).
  try {
    await PasswordResetToken.syncIndexes();
  } catch (error) {
    console.warn('Não foi possível sincronizar índices de PasswordResetToken:', error.message);
  }
};

module.exports = connectDatabase;
