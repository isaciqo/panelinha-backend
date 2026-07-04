const Joi = require('joi');
const authMiddleware = require('../../middlewares/authMiddleware');

const sendSchema = Joi.object({
  type: Joi.string().valid('support', 'suggestion').required(),
  subject: Joi.string().min(1).max(100).required(),
  message: Joi.string().min(1).max(1000).required(),
});

module.exports = [
  {
    method: 'post',
    path: '/support',
    handler: 'supportController.send',
    middlewares: [authMiddleware],
    validation: { body: sendSchema },
    swagger: {
      tags: ['Support'],
      summary: 'Enviar solicitação de suporte ou sugestão de melhoria',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['type', 'subject', 'message'],
              properties: {
                type: { type: 'string', enum: ['support', 'suggestion'] },
                subject: { type: 'string', maxLength: 100 },
                message: { type: 'string', maxLength: 1000 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Solicitação enviada com sucesso' },
        401: { description: 'UNAUTHORIZED' },
        500: { description: 'SUPPORT_EMAIL_NOT_CONFIGURED' },
      },
    },
  },
];
