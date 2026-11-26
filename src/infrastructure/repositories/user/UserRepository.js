const User = require('../../../database/models/user/userModel');
const { formatUser } = require('../../../app/utils/formatters');
const { escapeRegex } = require('../../../app/utils/escape');

class UserRepository {
  async findById(user_id) {
    return User.findOne({ user_id });
  }

  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
  }

  async create(data) {
    const user = new User(data);
    return user.save();
  }

  async update(user_id, data) {
    return User.findOneAndUpdate({ user_id }, data, { new: true, runValidators: true });
  }

  async findAll({ page = 1, limit = 20, search } = {}) {
    const skip = (page - 1) * limit;
    const query = search
      ? { name: { $regex: escapeRegex(search), $options: 'i' } }
      : {};

    const [data, total] = await Promise.all([
      User.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    // Listagem pública: nunca expõe email
    return { data: data.map(u => formatUser(u)), total };
  }
}

module.exports = UserRepository;
