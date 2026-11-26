/** IDs dos usuários que o usuário autenticado bloqueou. */
class ListBlockedUsersOperation {
  constructor({ userBlockRepository }) {
    this.userBlockRepository = userBlockRepository;
  }

  async execute(blockerId) {
    const blockedIds = await this.userBlockRepository.getBlockedByUser(blockerId);
    return { blockedIds };
  }
}

module.exports = ListBlockedUsersOperation;
