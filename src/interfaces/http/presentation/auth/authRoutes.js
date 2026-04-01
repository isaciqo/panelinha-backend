const authSchemas = require('./authSchemas')();

module.exports = [
  {
    method: 'post',
    path: '/auth/register',
    handler: 'authController.register',
    middlewares: [],
    validation: { body: authSchemas.register },
    swagger: {
      tags: ['Auth'],
      summary: 'Registrar novo usuário',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password'],
              properties: {
                name: { type: 'string', minLength: 2, maxLength: 100, example: 'Carlos Silva' },
                email: { type: 'string', format: 'email', example: 'carlos@email.com' },
                password: { type: 'string', minLength: 6, example: 'senha123' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Usuário criado com sucesso, retorna token JWT' },
        400: { description: 'INVALID_INPUT — Campos inválidos' },
        409: { description: 'EMAIL_ALREADY_EXISTS — Email já cadastrado' },
      },
    },
  },
  {
    method: 'post',
    path: '/auth/login',
    handler: 'authController.login',
    middlewares: [],
    validation: { body: authSchemas.login },
    swagger: {
      tags: ['Auth'],
      summary: 'Autenticar usuário',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email', example: 'carlos@email.com' },
                password: { type: 'string', example: 'senha123' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Login realizado, retorna token JWT e dados do usuário' },
        401: { description: 'INVALID_CREDENTIALS — Email ou senha incorretos' },
      },
    },
  },
];
