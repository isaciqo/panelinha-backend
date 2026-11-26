const Joi = require('joi');

// bcrypt só considera os primeiros 72 bytes da senha
const PASSWORD_MAX = 72;

module.exports = () => ({
  register: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(6).max(PASSWORD_MAX).required(),
    city: Joi.string().trim().min(2).max(100).optional(),
  }),

  login: Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().trim().email().required(),
  }),

  validateToken: Joi.object({
    token: Joi.string().required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).max(PASSWORD_MAX).required(),
  }),
});
