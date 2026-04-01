class ListUsersOperation {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute({ page = 1, limit = 20, search } = {}) {
    const safeLimit = Math.min(Number(limit), 100);
    const safePage = Math.max(Number(page), 1);

    const { data, total } = await this.userRepository.findAll({
      page: safePage,
      limit: safeLimit,
      search,
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

module.exports = ListUsersOperation;
