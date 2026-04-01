const Participation = require('../../../database/models/participation/participationModel');

class ParticipationRepository {
  async findByUserAndEvent(userId, eventId) {
    return Participation.findOne({ userId, eventId, leftAt: null });
  }

  async create(data) {
    const participation = new Participation(data);
    return participation.save();
  }

  async markLeft(userId, eventId, penalty = false) {
    return Participation.findOneAndUpdate(
      { userId, eventId, leftAt: null },
      { leftAt: new Date(), penalty },
      { new: true }
    );
  }

  async hasParticipated(userId, eventId) {
    const p = await Participation.findOne({ userId, eventId });
    return !!p;
  }
}

module.exports = ParticipationRepository;
