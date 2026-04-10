const Event = require('../../../database/models/event/eventModel');

class EventRepository {
  _format(event) {
    if (!event) return null;
    return {
      id: event.event_id,
      sport: event.sport,
      totalPlayers: event.totalPlayers,
      duration: event.duration,
      clubName: event.clubName,
      location: event.location,
      city: event.city,
      dateTime: event.dateTime,
      pricePerPerson: event.pricePerPerson,
      preFilledPlayers: event.preFilledPlayers || 0,
      skillLevel: event.skillLevel || '',
      creatorId: event.creatorId,
      creatorName: event.creatorName,
      status: event.status,
      participants: event.participants,
      kickedUsers: event.kickedUsers || [],
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  async findById(event_id) {
    return Event.findOne({ event_id });
  }

  async create(data) {
    const event = new Event(data);
    return event.save();
  }

  async update(event_id, data) {
    return Event.findOneAndUpdate({ event_id }, data, { new: true });
  }

  async findAll({ page = 1, limit = 20, sport, city, date, status, excludeCreatorIds = [] } = {}) {
    const skip = (page - 1) * limit;
    const query = {};

    if (sport) query.sport = sport;
    if (status) query.status = status;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (excludeCreatorIds.length > 0) query.creatorId = { $nin: excludeCreatorIds };
    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);
      query.dateTime = { $gte: start, $lte: end };
    }

    const [data, total] = await Promise.all([
      Event.find(query).sort({ dateTime: 1 }).skip(skip).limit(limit).lean(),
      Event.countDocuments(query),
    ]);

    return { data: data.map(e => this._format(e)), total };
  }
}

module.exports = EventRepository;
