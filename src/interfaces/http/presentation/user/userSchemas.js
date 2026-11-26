const Joi = require('joi');

// bcrypt só considera os primeiros 72 bytes da senha
const PASSWORD_MAX = 72;

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
    name: Joi.string().trim().min(2).max(100).optional(),
    // string vazia = remover a cidade
    city: Joi.string().trim().max(100).allow('').optional(),
  }).min(1),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(PASSWORD_MAX).required(),
  }),
});
