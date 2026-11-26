const Event = require('../../../database/models/event/eventModel');
const { formatEvent } = require('../../../app/utils/formatters');
const { escapeRegex } = require('../../../app/utils/escape');

// Brasil não tem horário de verão desde 2019: UTC-3 (180 min) é o padrão sensato.
const DEFAULT_TZ_OFFSET_MIN = 180;

class EventRepository {
  async findById(event_id) {
    return Event.findOne({ event_id });
  }

  async create(data) {
    const event = new Event(data);
    return event.save();
  }

  async update(event_id, data) {
    return Event.findOneAndUpdate({ event_id }, data, { new: true, runValidators: true });
  }

  /**
   * Adiciona o participante apenas se, no momento da escrita, o evento ainda estiver
   * aberto, no futuro, com vaga, e o usuário não estiver nem dentro nem removido.
   * Evita overbooking quando duas pessoas entram ao mesmo tempo na última vaga.
   * Retorna null se alguma condição falhar.
   */
  async addParticipantIfAvailable(event_id, participant) {
    return Event.findOneAndUpdate(
      {
        event_id,
        status: 'open',
        dateTime: { $gt: new Date() },
        'participants.userId': { $ne: participant.userId },
        kickedUsers: { $ne: participant.userId },
        $expr: {
          $lt: [
            { $add: [{ $size: '$participants' }, { $ifNull: ['$preFilledPlayers', 0] }] },
            '$totalPlayers',
          ],
        },
      },
      { $push: { participants: participant } },
      { new: true },
    );
  }

  async findAll({
    page = 1,
    limit = 20,
    sport,
    city,
    date,
    status,
    tzOffset = DEFAULT_TZ_OFFSET_MIN,
    includePast = false,
    excludeCreatorIds = [],
  } = {}) {
    const skip = (page - 1) * limit;
    const query = {};

    if (sport) query.sport = sport;
    if (status) {
      const statuses = status.split(',').map(s => s.trim()).filter(Boolean);
      query.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    } else {
      query.status = { $in: ['open', 'confirmed'] };
    }
    if (city) query.city = { $regex: escapeRegex(city), $options: 'i' };
    if (excludeCreatorIds.length > 0) query.creatorId = { $nin: excludeCreatorIds };

    let rangeStart;
    let rangeEnd;
    if (date) {
      // `date` é o dia no fuso do usuário; tzOffset segue Date#getTimezoneOffset (UTC-3 → 180)
      const [y, m, d] = date.split('-').map(Number);
      rangeStart = new Date(Date.UTC(y, m - 1, d) + tzOffset * 60 * 1000);
      rangeEnd = new Date(rangeStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    }
    if (!includePast) {
      const now = new Date();
      if (!rangeStart || rangeStart < now) rangeStart = now;
    }
    if (rangeStart || rangeEnd) {
      query.dateTime = {};
      if (rangeStart) query.dateTime.$gte = rangeStart;
      if (rangeEnd) query.dateTime.$lte = rangeEnd;
    }

    const [data, total] = await Promise.all([
      Event.find(query).sort({ dateTime: 1 }).skip(skip).limit(limit).lean(),
      Event.countDocuments(query),
    ]);

    return { data: data.map(formatEvent), total };
  }

  /** Eventos que o usuário criou ou dos quais participa (todos os status, inclusive passados). */
  async findByUser(userId, { limit = 100 } = {}) {
    const data = await Event.find({
      $or: [{ creatorId: userId }, { 'participants.userId': userId }],
    })
      .sort({ dateTime: -1 })
      .limit(limit)
      .lean();
    return data.map(formatEvent);
  }

  /** Atualiza o nome copiado (desnormalizado) do usuário nos eventos. */
  async renameUser(userId, name) {
    await Promise.all([
      Event.updateMany({ creatorId: userId }, { $set: { creatorName: name } }),
      Event.updateMany(
        { 'participants.userId': userId },
        { $set: { 'participants.$[p].userName': name } },
        { arrayFilters: [{ 'p.userId': userId }] },
      ),
    ]);
  }
}

module.exports = EventRepository;
