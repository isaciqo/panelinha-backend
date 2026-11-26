const Joi = require('joi');

module.exports = () => ({
  create: Joi.object({
    toUserId: Joi.string().uuid().required(),
    eventId: Joi.string().uuid().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().trim().min(1).max(500).required(),
  }),

  getEventId: Joi.object({
    eventId: Joi.string().uuid().required(),
  }),

  getUserId: Joi.object({
    userId: Joi.string().uuid().required(),
  }),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
});
