const CreateFeedbackOperation = require('../src/app/operations/feedback/CreateFeedbackOperation');
const ForgotPasswordOperation = require('../src/app/operations/auth/ForgotPasswordOperation');
const ResetPasswordOperation = require('../src/app/operations/auth/ResetPasswordOperation');
const ChangePasswordOperation = require('../src/app/operations/user/ChangePasswordOperation');
const GetUserOperation = require('../src/app/operations/user/GetUserOperation');
const UpdateProfileOperation = require('../src/app/operations/user/UpdateProfileOperation');
const SendSupportOperation = require('../src/app/operations/support/SendSupportOperation');
const { HOUR, makeEvent, mockRepo } = require('./helpers');

describe('CreateFeedbackOperation', () => {
  const finished = (overrides = {}) => makeEvent({
    dateTime: new Date(Date.now() - 3 * HOUR),
    participants: [{ userId: 'creator' }, { userId: 'u1' }],
    ...overrides,
  });

  function setup(event) {
    const feedbackRepository = mockRepo(['findDuplicate', 'create', 'getAverageRating'], {
      create: async data => ({ ...data, createdAt: new Date() }),
      getAverageRating: async () => 4,
    });
    const eventRepository = mockRepo(['findById'], { findById: async () => event });
    const userRepository = mockRepo(['findById', 'update'], { findById: async () => ({ name: 'Ana' }) });
    return new CreateFeedbackOperation({ feedbackRepository, eventRepository, userRepository });
  }

  const input = { toUserId: 'creator', eventId: 'evt-1', rating: 5, comment: 'Top' };

  it('participante avalia o criador depois do jogo', async () => {
    const fb = await setup(finished()).execute(input, 'u1');
    expect(fb.toUserId).toBe('creator');
  });

  it('não deixa avaliar antes de o jogo terminar', async () => {
    await expect(setup(finished({ dateTime: new Date(Date.now() + HOUR) })).execute(input, 'u1'))
      .rejects.toMatchObject({ code: 'EVENT_NOT_FINISHED' });
  });

  it('não deixa avaliar jogo cancelado', async () => {
    await expect(setup(finished({ status: 'cancelled' })).execute(input, 'u1'))
      .rejects.toMatchObject({ code: 'EVENT_CANCELLED' });
  });

  it('quem saiu ou foi removido (fora do elenco) não avalia', async () => {
    await expect(setup(finished({ participants: [{ userId: 'creator' }] })).execute(input, 'u1'))
      .rejects.toMatchObject({ code: 'NOT_PARTICIPANT' });
  });
});

describe('ForgotPasswordOperation', () => {
  it('não revela se o email existe', async () => {
    const userRepository = mockRepo(['findByEmail'], { findByEmail: async () => null });
    const op = new ForgotPasswordOperation({
      userRepository,
      passwordResetTokenRepository: mockRepo(['invalidateByUserId', 'create']),
      emailService: mockRepo(['sendPasswordReset']),
    });
    await expect(op.execute({ email: 'nao@existe.com' })).resolves.toBeUndefined();
  });

  it('não falha a requisição se o envio do email falhar', async () => {
    const op = new ForgotPasswordOperation({
      userRepository: mockRepo(['findByEmail'], { findByEmail: async () => ({ user_id: 'u1', email: 'a@b.com' }) }),
      passwordResetTokenRepository: mockRepo(['invalidateByUserId', 'create']),
      emailService: mockRepo(['sendPasswordReset'], { sendPasswordReset: async () => { throw new Error('down'); } }),
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(op.execute({ email: 'a@b.com' })).resolves.toBeUndefined();
    console.error.mockRestore();
  });
});

describe('ResetPasswordOperation', () => {
  it('recusa quando outro pedido usou o token primeiro (corrida)', async () => {
    const userRepository = mockRepo(['update']);
    const op = new ResetPasswordOperation({
      userRepository,
      passwordResetTokenRepository: mockRepo(['findByToken', 'markUsedIfUnused'], {
        findByToken: async () => ({ token_id: 't1', userId: 'u1', usedAt: null, expiresAt: new Date(Date.now() + HOUR) }),
        markUsedIfUnused: async () => null,
      }),
      hashPasswordService: mockRepo(['hash']),
    });
    await expect(op.execute({ token: 'x', password: 'nova123' })).rejects.toMatchObject({ code: 'TOKEN_ALREADY_USED' });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('grava passwordChangedAt para derrubar sessões antigas', async () => {
    const userRepository = mockRepo(['update']);
    const op = new ResetPasswordOperation({
      userRepository,
      passwordResetTokenRepository: mockRepo(['findByToken', 'markUsedIfUnused'], {
        findByToken: async () => ({ token_id: 't1', userId: 'u1', usedAt: null, expiresAt: new Date(Date.now() + HOUR) }),
        markUsedIfUnused: async () => ({}),
      }),
      hashPasswordService: mockRepo(['hash'], { hash: async () => 'hashed' }),
    });
    await op.execute({ token: 'x', password: 'nova123' });
    expect(userRepository.update).toHaveBeenCalledWith('u1', expect.objectContaining({
      password: 'hashed',
      passwordChangedAt: expect.any(Date),
    }));
  });
});

describe('ChangePasswordOperation', () => {
  it('retorna um token novo e marca passwordChangedAt', async () => {
    const userRepository = mockRepo(['findById', 'update'], {
      findById: async () => ({ user_id: 'u1', email: 'a@b.com', name: 'Ana', password: 'h' }),
    });
    const op = new ChangePasswordOperation({
      userRepository,
      hashPasswordService: mockRepo(['compare', 'hash'], { compare: async () => true, hash: async () => 'h2' }),
      tokenService: { generate: jest.fn(() => 'novo-token') },
    });
    const result = await op.execute('u1', { currentPassword: 'a', newPassword: 'b123456' });
    expect(result).toEqual({ token: 'novo-token' });
    expect(userRepository.update.mock.calls[0][1].passwordChangedAt).toBeInstanceOf(Date);
  });
});

describe('GetUserOperation', () => {
  const user = { user_id: 'u1', name: 'Ana', email: 'ana@x.com' };
  const op = new GetUserOperation({ userRepository: mockRepo(['findById'], { findById: async () => user }) });

  it('não expõe o email para outros usuários', async () => {
    expect(await op.execute('u1', 'outro')).not.toHaveProperty('email');
  });

  it('inclui o email para o próprio usuário', async () => {
    expect((await op.execute('u1', 'u1')).email).toBe('ana@x.com');
  });
});

describe('UpdateProfileOperation', () => {
  it('propaga a troca de nome para eventos e avaliações', async () => {
    const eventRepository = mockRepo(['renameUser']);
    const feedbackRepository = mockRepo(['renameUser']);
    const op = new UpdateProfileOperation({
      userRepository: mockRepo(['findById', 'update'], {
        findById: async () => ({ user_id: 'u1', name: 'Velho' }),
        update: async () => ({ user_id: 'u1', name: 'Novo' }),
      }),
      eventRepository,
      feedbackRepository,
    });
    await op.execute('u1', { name: 'Novo' });
    expect(eventRepository.renameUser).toHaveBeenCalledWith('u1', 'Novo');
    expect(feedbackRepository.renameUser).toHaveBeenCalledWith('u1', 'Novo');
  });
});

describe('SendSupportOperation', () => {
  const OLD_ENV = process.env.SUPPORT_EMAIL;
  beforeAll(() => { process.env.SUPPORT_EMAIL = 'suporte@x.com'; });
  afterAll(() => { process.env.SUPPORT_EMAIL = OLD_ENV; });
  const userRepository = mockRepo(['findById'], { findById: async () => ({ name: 'Ana', email: 'a@b.com' }) });

  it('falha se o email para a equipe não for enviado', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const op = new SendSupportOperation({
      userRepository,
      emailService: mockRepo(['sendSupportEmail', 'sendSupportConfirmation'], {
        sendSupportEmail: async () => { throw new Error('down'); },
      }),
    });
    await expect(op.execute({ type: 'support', subject: 's', message: 'm' }, 'u1'))
      .rejects.toMatchObject({ code: 'SUPPORT_SEND_FAILED' });
    console.error.mockRestore();
  });

  it('não falha se só a confirmação ao usuário falhar', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const op = new SendSupportOperation({
      userRepository,
      emailService: mockRepo(['sendSupportEmail', 'sendSupportConfirmation'], {
        sendSupportConfirmation: async () => { throw new Error('down'); },
      }),
    });
    const result = await op.execute({ type: 'support', subject: 's', message: 'm' }, 'u1');
    expect(result.protocol).toMatch(/^PNL-\d{8}-[0-9A-F]{6}$/);
    console.error.mockRestore();
  });
});
