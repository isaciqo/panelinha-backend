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
  {
    method: 'post',
    path: '/auth/forgot-password',
    handler: 'authController.forgotPassword',
    middlewares: [],
    validation: { body: authSchemas.forgotPassword },
    swagger: {
      tags: ['Auth'],
      summary: 'Solicitar recuperação de senha',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email'],
              properties: {
                email: { type: 'string', format: 'email', example: 'carlos@email.com' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Instruções enviadas (ou email não encontrado, mesma resposta por segurança)' },
        404: { description: 'EMAIL_NOT_FOUND — Email não cadastrado' },
      },
    },
  },
  {
    method: 'post',
    path: '/auth/validate-token',
    handler: 'authController.validateToken',
    middlewares: [],
    validation: { body: authSchemas.validateToken },
    swagger: {
      tags: ['Auth'],
      summary: 'Validar token de recuperação de senha',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['token'],
              properties: {
                token: { type: 'string', example: 'abc123...' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: '{ valid: true }' },
        400: { description: 'TOKEN_EXPIRED | TOKEN_ALREADY_USED' },
        404: { description: 'INVALID_TOKEN — Token não encontrado' },
      },
    },
  },
  {
    method: 'post',
    path: '/auth/reset-password',
    handler: 'authController.resetPassword',
    middlewares: [],
    validation: { body: authSchemas.resetPassword },
    swagger: {
      tags: ['Auth'],
      summary: 'Redefinir senha com token válido',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['token', 'password'],
              properties: {
                token: { type: 'string', example: 'abc123...' },
                password: { type: 'string', minLength: 6, example: 'novaSenha123' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Senha redefinida com sucesso' },
        400: { description: 'TOKEN_EXPIRED | TOKEN_ALREADY_USED | WEAK_PASSWORD' },
        404: { description: 'INVALID_TOKEN — Token não encontrado' },
      },
    },
  },
];
