class EventController {
  constructor({
    createEventOperation,
    listEventsOperation,
    getEventOperation,
    updateEventOperation,
    confirmEventOperation,
    cancelEventOperation,
    joinEventOperation,
    leaveEventOperation,
  }) {
    this.createEventOperation = createEventOperation;
    this.listEventsOperation = listEventsOperation;
    this.getEventOperation = getEventOperation;
    this.updateEventOperation = updateEventOperation;
    this.confirmEventOperation = confirmEventOperation;
    this.cancelEventOperation = cancelEventOperation;
    this.joinEventOperation = joinEventOperation;
    this.leaveEventOperation = leaveEventOperation;
  }

  async createEvent(req, res) {
    const result = await this.createEventOperation.execute(req.body, req.user.user_id);
    res.status(201).json(result);
  }

  async listEvents(req, res) {
    const result = await this.listEventsOperation.execute(req.query, req.user.user_id);
    res.status(200).json(result);
  }

  async getEvent(req, res) {
    const result = await this.getEventOperation.execute(req.params.id);
    res.status(200).json(result);
  }

  async updateEvent(req, res) {
    const result = await this.updateEventOperation.execute(req.params.id, req.body, req.user.user_id);
    res.status(200).json(result);
  }

  async confirmEvent(req, res) {
    const result = await this.confirmEventOperation.execute(req.params.id, req.user.user_id);
    res.status(200).json(result);
  }

  async cancelEvent(req, res) {
    const result = await this.cancelEventOperation.execute(req.params.id, req.user.user_id);
    res.status(200).json(result);
  }

  async joinEvent(req, res) {
    const result = await this.joinEventOperation.execute(req.params.id, req.user.user_id);
    res.status(200).json(result);
  }

  async leaveEvent(req, res) {
    const result = await this.leaveEventOperation.execute(req.params.id, req.user.user_id);
    res.status(200).json(result);
  }
}

module.exports = EventController;
