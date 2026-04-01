const authMiddleware = require('../../middlewares/authMiddleware');
const feedbackSchemas = require('./feedbackSchemas')();

module.exports = [
  {
    method: 'post',
    path: '/feedback',
    handler: 'feedbackController.createFeedback',
    middlewares: [authMiddleware],
    validation: { body: feedbackSchemas.create },
    swagger: {
      tags: ['Feedback'],
      summary: 'Enviar avaliação para outro participante',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['toUserId', 'eventId', 'rating', 'comment'],
              properties: {
                toUserId: { type: 'string', format: 'uuid' },
                eventId: { type: 'string', format: 'uuid' },
                rating: { type: 'integer', minimum: 1, maximum: 5 },
                comment: { type: 'string', maxLength: 500 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Avaliação criada com sucesso' },
        400: { description: 'INVALID_RATING | SELF_FEEDBACK | DUPLICATE_FEEDBACK | NOT_PARTICIPANT' },
        401: { description: 'UNAUTHORIZED' },
      },
    },
  },
  {
    method: 'get',
    path: '/feedback/:userId',
    handler: 'feedbackController.listFeedback',
    middlewares: [authMiddleware],
    validation: { params: feedbackSchemas.getUserId, query: feedbackSchemas.list },
    swagger: {
      tags: ['Feedback'],
      summary: 'Listar avaliações recebidas por um usuário',
      security: [{ BearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'userId', required: true, schema: { type: 'string', format: 'uuid' } },
        { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
        { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
      ],
      responses: {
        200: { description: 'Lista paginada de avaliações' },
        401: { description: 'UNAUTHORIZED' },
      },
    },
  },
];
