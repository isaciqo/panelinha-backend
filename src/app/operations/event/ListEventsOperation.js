class ListEventsOperation {
  constructor({ eventRepository, userBlockRepository }) {
    this.eventRepository = eventRepository;
    this.userBlockRepository = userBlockRepository;
  }

  async execute({ page = 1, limit = 20, sport, city, date, status } = {}, requesterId) {
    const safePage = Math.max(Number(page), 1);
    const safeLimit = Math.min(Number(limit), 100);

    const blockedIds = requesterId
      ? await this.userBlockRepository.getBlockedIdsBidirectional(requesterId)
      : [];

    const { data, total } = await this.eventRepository.findAll({
      page: safePage,
      limit: safeLimit,
      sport,
      city,
      date,
      status,
      excludeCreatorIds: blockedIds,
    });

    return {
      data,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }
}

module.exports = ListEventsOperation;
