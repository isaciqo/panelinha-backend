class ListEventsOperation {
  constructor({ eventRepository }) {
    this.eventRepository = eventRepository;
  }

  async execute({ page = 1, limit = 20, sport, city, date, status } = {}) {
    const safePage = Math.max(Number(page), 1);
    const safeLimit = Math.min(Number(limit), 100);

    const { data, total } = await this.eventRepository.findAll({
      page: safePage,
      limit: safeLimit,
      sport,
      city,
      date,
      status,
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
