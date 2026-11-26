const { v4: uuidv4 } = require('uuid');
const Participation = require('../../../database/models/participation/participationModel');

class ParticipationRepository {
  async findByUserAndEvent(userId, eventId) {
    return Participation.findOne({ userId, eventId, leftAt: null });
  }

  /**
   * Registra a entrada. Reaproveita o registro se a pessoa já saiu antes,
   * porque existe índice único em { userId, eventId }.
   */
  async upsertJoin(userId, eventId, joinedAt = new Date()) {
    return Participation.findOneAndUpdate(
      { userId, eventId },
      {
        $set: { joinedAt, leftAt: null, penalty: false },
        $setOnInsert: { participation_id: uuidv4() },
      },
      { upsert: true, new: true },
    );
  }

  async markLeft(userId, eventId, penalty = false) {
    return Participation.findOneAndUpdate(
      { userId, eventId, leftAt: null },
      { leftAt: new Date(), penalty },
      { new: true },
    );
  }

  /** True se o usuário está (ainda) participando do evento. */
  async isActiveParticipant(userId, eventId) {
    const p = await Participation.exists({ userId, eventId, leftAt: null });
    return !!p;
  }
}

module.exports = ParticipationRepository;
