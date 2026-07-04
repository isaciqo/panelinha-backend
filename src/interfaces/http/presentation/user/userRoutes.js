const authMiddleware = require('../../middlewares/authMiddleware');
const userSchemas = require('./userSchemas')();

module.exports = [
  {
    method: 'post',
    path: '/users/:id/block',
    handler: 'userController.blockUser',
    middlewares: [authMiddleware],
    validation: { params: userSchemas.getById },
    swagger: {
      tags: ['Users'],
      summary: 'Bloquear um usuário',
      security: [{ BearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        204: { description: 'Usuário bloqueado' },
        400: { description: 'INVALID_INPUT' },
        401: { description: 'UNAUTHORIZED' },
        404: { description: 'USER_NOT_FOUND' },
      },
    },
  },
  {
    method: 'delete',
    path: '/users/:id/block',
    handler: 'userController.unblockUser',
    middlewares: [authMiddleware],
    validation: { params: userSchemas.getById },
    swagger: {
      tags: ['Users'],
      summary: 'Desbloquear um usuário',
      security: [{ BearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        204: { description: 'Usuário desbloqueado' },
        401: { description: 'UNAUTHORIZED' },
        404: { description: 'USER_NOT_FOUND' },
      },
    },
  },
  {
    method: 'get',
    path: '/users',
    handler: 'userController.listUsers',
    middlewares: [authMiddleware],
    validation: { query: userSchemas.list },
    swagger: {
      tags: ['Users'],
      summary: 'Listar usuários (com paginação e busca por nome)',
      security: [{ BearerAuth: [] }],
      parameters: [
        { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
        { in: 'query', name: 'limit', schema: { type: 'integer', default: 20, maximum: 100 } },
        { in: 'query', name: 'search', schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Lista paginada de usuários' },
        401: { description: 'UNAUTHORIZED' },
      },
    },
  },
  {
    method: 'get',
    path: '/users/:id',
    handler: 'userController.getUser',
    middlewares: [authMiddleware],
    validation: { params: userSchemas.getById },
    swagger: {
      tags: ['Users'],
      summary: 'Buscar perfil de um usuário por ID',
      security: [{ BearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: { description: 'Perfil do usuário' },
        401: { description: 'UNAUTHORIZED' },
        404: { description: 'USER_NOT_FOUND' },
      },
    },
  },
  {
    method: 'patch',
    path: '/users/me/password',
    handler: 'userController.changePassword',
    middlewares: [authMiddleware],
    validation: { body: userSchemas.changePassword },
    swagger: {
      tags: ['Users'],
      summary: 'Alterar senha do usuário autenticado',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['currentPassword', 'newPassword'],
              properties: {
                currentPassword: { type: 'string' },
                newPassword: { type: 'string', minLength: 6 },
              },
            },
          },
        },
      },
      responses: {
        204: { description: 'Senha alterada com sucesso' },
        400: { description: 'INVALID_PASSWORD ou INVALID_INPUT' },
        401: { description: 'UNAUTHORIZED' },
        404: { description: 'USER_NOT_FOUND' },
      },
    },
  },
  {
    method: 'patch',
    path: '/users/me',
    handler: 'userController.updateProfile',
    middlewares: [authMiddleware],
    validation: { body: userSchemas.updateProfile },
    swagger: {
      tags: ['Users'],
      summary: 'Atualizar perfil do usuário autenticado',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 2, maxLength: 100 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Perfil atualizado' },
        401: { description: 'UNAUTHORIZED' },
      },
    },
  },
];
