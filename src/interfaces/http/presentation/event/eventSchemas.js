const Joi = require('joi');

const VALID_SPORTS = ['volleyball', 'football', 'basketball', 'tennis', 'other'];
const VALID_STATUSES = ['open', 'confirmed', 'cancelled'];

module.exports = () => ({
  create: Joi.object({
    sport: Joi.string().valid(...VALID_SPORTS).required(),
    totalPlayers: Joi.number().integer().min(2).max(50).required(),
    duration: Joi.number().integer().min(15).max(480).required(),
    clubName: Joi.string().min(2).max(200).required(),
    location: Joi.string().min(2).max(200).required(),
    city: Joi.string().min(2).max(100).required(),
    dateTime: Joi.date().iso().greater('now').required(),
    pricePerPerson: Joi.number().min(0).required(),
    preFilledPlayers: Joi.number().integer().min(0).default(0),
    skillLevel: Joi.string().valid('easy', 'medium', 'hard', '').default(''),
  }),

  update: Joi.object({
    sport: Joi.string().valid(...VALID_SPORTS).optional(),
    totalPlayers: Joi.number().integer().min(2).max(50).optional(),
    duration: Joi.number().integer().min(15).max(480).optional(),
    clubName: Joi.string().min(2).max(200).optional(),
    location: Joi.string().min(2).max(200).optional(),
    city: Joi.string().min(2).max(100).optional(),
    dateTime: Joi.date().iso().greater('now').optional(),
    pricePerPerson: Joi.number().min(0).optional(),
    preFilledPlayers: Joi.number().integer().min(0).optional(),
    skillLevel: Joi.string().valid('easy', 'medium', 'hard', '').optional(),
  }).min(1),

  kick: Joi.object({
    userId: Joi.string().uuid().required(),
  }),

  getById: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  list: Joi.object({
    sport: Joi.string().valid(...VALID_SPORTS).optional(),
    city: Joi.string().max(100).optional(),
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
    status: Joi.string().valid(...VALID_STATUSES).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
});
