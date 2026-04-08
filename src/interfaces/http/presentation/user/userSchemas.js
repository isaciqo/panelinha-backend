const Joi = require('joi');

module.exports = () => ({
  getById: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().max(100).optional(),
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    city: Joi.string().min(2).max(100).optional(),
  }).min(1),
});
