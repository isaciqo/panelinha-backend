const authMiddleware = require('../../middlewares/authMiddleware');
const eventSchemas = require('./eventSchemas')();

module.exports = [
  {
    method: 'post',
    path: '/events',
    handler: 'eventController.createEvent',
    middlewares: [authMiddleware],
    validation: { body: eventSchemas.create },
    swagger: {
      tags: ['Events'],
      summary: 'Criar novo evento (panelinha)',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['sport', 'totalPlayers', 'clubName', 'location', 'city', 'dateTime', 'pricePerPerson'],
              properties: {
                sport: { type: 'string', enum: ['volleyball', 'football', 'basketball', 'tennis', 'other'] },
                totalPlayers: { type: 'integer', minimum: 2, maximum: 50 },
                clubName: { type: 'string' },
                location: { type: 'string' },
                city: { type: 'string' },
                dateTime: { type: 'string', format: 'date-time' },
                pricePerPerson: { type: 'number', minimum: 0 },
                preFilledPlayers: { type: 'integer', minimum: 0, default: 0 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Evento criado com sucesso' },
        400: { description: 'INVALID_INPUT | PAST_DATE' },
        401: { description: 'UNAUTHORIZED' },
      },
    },
  },
  {
    method: 'get',
    path: '/events',
    handler: 'eventController.listEvents',
    middlewares: [authMiddleware],
    validation: { query: eventSchemas.list },
    swagger: {
      tags: ['Events'],
      summary: 'Listar eventos com filtros opcionais',
      security: [{ BearerAuth: [] }],
      parameters: [
        { in: 'query', name: 'sport', schema: { type: 'string', enum: ['volleyball', 'football', 'basketball', 'tennis', 'other'] } },
        { in: 'query', name: 'city', schema: { type: 'string' } },
        { in: 'query', name: 'date', schema: { type: 'string' } },
        { in: 'query', name: 'status', schema: { type: 'string', enum: ['open', 'confirmed', 'cancelled'] } },
        { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
        { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
      ],
      responses: {
        200: { description: 'Lista paginada de eventos' },
        401: { description: 'UNAUTHORIZED' },
      },
    },
  },
  {
    method: 'get',
    path: '/events/:id',
    handler: 'eventController.getEvent',
    middlewares: [authMiddleware],
    validation: { params: eventSchemas.getById },
    swagger: {
      tags: ['Events'],
      summary: 'Buscar detalhes de um evento',
      security: [{ BearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: { description: 'Detalhes do evento' },
        404: { description: 'EVENT_NOT_FOUND' },
      },
    },
  },
  {
    method: 'patch',
    path: '/events/:id',
    handler: 'eventController.updateEvent',
    middlewares: [authMiddleware],
    validation: { params: eventSchemas.getById, body: eventSchemas.update },
    swagger: {
      tags: ['Events'],
      summary: 'Editar evento (somente o criador, apenas eventos "open")',
      security: [{ BearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: { description: 'Evento atualizado' },
        403: { description: 'NOT_CREATOR' },
        400: { description: 'INVALID_STATUS | PAST_DATE' },
      },
    },
  },
  {
    method: 'patch',
    path: '/events/:id/confirm',
    handler: 'eventController.confirmEvent',
    middlewares: [authMiddleware],
    validation: { params: eventSchemas.getById },
    swagger: {
      tags: ['Events'],
      summary: 'Confirmar evento (somente o criador, até 2h antes)',
      security: [{ BearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: { description: 'Evento confirmado' },
        400: { description: 'TOO_LATE_TO_CONFIRM | INVALID_STATUS' },
        403: { description: 'NOT_CREATOR' },
      },
    },
  },
  {
    method: 'delete',
    path: '/events/:id',
    handler: 'eventController.cancelEvent',
    middlewares: [authMiddleware],
    validation: { params: eventSchemas.getById },
    swagger: {
      tags: ['Events'],
      summary: 'Cancelar evento (somente o criador)',
      security: [{ BearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: { description: 'Evento cancelado' },
        403: { description: 'NOT_CREATOR' },
      },
    },
  },
  {
    method: 'post',
    path: '/events/:id/join',
    handler: 'eventController.joinEvent',
    middlewares: [authMiddleware],
    validation: { params: eventSchemas.getById },
    swagger: {
      tags: ['Participation'],
      summary: 'Entrar em um evento',
      security: [{ BearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: { description: 'Entrou no evento' },
        400: { description: 'EVENT_FULL | ALREADY_PARTICIPANT | EVENT_NOT_OPEN' },
      },
    },
  },
  {
    method: 'post',
    path: '/events/:id/leave',
    handler: 'eventController.leaveEvent',
    middlewares: [authMiddleware],
    validation: { params: eventSchemas.getById },
    swagger: {
      tags: ['Participation'],
      summary: 'Sair de um evento (pode aplicar penalidade se < 3h)',
      security: [{ BearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: { description: 'Saiu do evento. Campo penalty indica se houve penalidade.' },
        400: { description: 'NOT_PARTICIPANT | CREATOR_CANNOT_LEAVE' },
      },
    },
  },
  {
    method: 'post',
    path: '/events/:id/kick',
    handler: 'eventController.kickParticipant',
    middlewares: [authMiddleware],
    validation: { params: eventSchemas.getById, body: eventSchemas.kick },
    swagger: {
      tags: ['Participation'],
      summary: 'Remover participante do evento (apenas o criador, status open)',
      security: [{ BearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['userId'],
              properties: {
                userId: { type: 'string', format: 'uuid' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Participante removido, retorna evento atualizado' },
        400: { description: 'NOT_PARTICIPANT | CREATOR_CANNOT_BE_KICKED | EVENT_NOT_OPEN' },
        403: { description: 'NOT_CREATOR' },
      },
    },
  },
];
