const User = require('../../../database/models/user/userModel');

class UserRepository {
  _format(user) {
    if (!user) return null;
    return {
      id: user.user_id,
      name: user.name,
      email: user.email,
      city: user.city || null,
      avatarUrl: user.avatarUrl || null,
      averageRating: user.averageRating,
      gamesCreated: user.gamesCreated,
      gamesParticipated: user.gamesParticipated,
      lastMinuteCancellations: user.lastMinuteCancellations,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

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
    return User.findOneAndUpdate({ user_id }, data, { new: true });
  }

  async findAll({ page = 1, limit = 20, search } = {}) {
    const skip = (page - 1) * limit;
    const query = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const [data, total] = await Promise.all([
      User.find(query).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    return { data: data.map(u => this._format(u)), total };
  }
}

module.exports = UserRepository;
