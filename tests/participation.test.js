const JoinEventOperation = require('../src/app/operations/participation/JoinEventOperation');
const LeaveEventOperation = require('../src/app/operations/participation/LeaveEventOperation');
const KickParticipantOperation = require('../src/app/operations/participation/KickParticipantOperation');
const { HOUR, makeEvent, mockRepo } = require('./helpers');

function setupJoin(event, { atomicResult } = {}) {
  const eventRepository = mockRepo(['findById', 'addParticipantIfAvailable'], {
    findById: async () => event,
    addParticipantIfAvailable: async (id, p) =>
      atomicResult !== undefined ? atomicResult : { ...event, participants: [...event.participants, p] },
  });
  const participationRepository = mockRepo(['upsertJoin']);
  const userRepository = mockRepo(['findById', 'update'], {
    findById: async () => ({ user_id: 'u1', name: 'Ana' }),
  });
  const userBlockRepository = mockRepo(['exists'], { exists: async () => false });
  const op = new JoinEventOperation({ eventRepository, participationRepository, userRepository, userBlockRepository });
  return { op, eventRepository, participationRepository, userRepository };
}

describe('JoinEventOperation', () => {
  it('entra no evento e registra a participação com upsert (permite reentrar depois de sair)', async () => {
    const { op, participationRepository, userRepository } = setupJoin(makeEvent());
    const result = await op.execute('evt-1', 'u1');

    expect(result.event.participants.map(p => p.userId)).toContain('u1');
    expect(participationRepository.upsertJoin).toHaveBeenCalledWith('u1', 'evt-1', expect.any(Date));
    expect(userRepository.update).toHaveBeenCalledWith('u1', { $inc: { gamesParticipated: 1 } });
  });

  it('recusa evento que já começou', async () => {
    const { op } = setupJoin(makeEvent({ dateTime: new Date(Date.now() - HOUR) }));
    await expect(op.execute('evt-1', 'u1')).rejects.toMatchObject({ code: 'EVENT_ALREADY_STARTED' });
  });

  it('recusa evento lotado contando os jogadores fechados por fora', async () => {
    const { op } = setupJoin(makeEvent({ totalPlayers: 3, preFilledPlayers: 2 }));
    await expect(op.execute('evt-1', 'u1')).rejects.toMatchObject({ code: 'EVENT_FULL' });
  });

  it('retorna EVENT_FULL quando a última vaga é pega entre a leitura e a escrita', async () => {
    const event = makeEvent({ totalPlayers: 2 });
    const { op, eventRepository, participationRepository } = setupJoin(event, { atomicResult: null });
    eventRepository.findById
      .mockResolvedValueOnce(event)
      .mockResolvedValueOnce({ ...event, participants: [...event.participants, { userId: 'other' }] });

    await expect(op.execute('evt-1', 'u1')).rejects.toMatchObject({ code: 'EVENT_FULL' });
    expect(participationRepository.upsertJoin).not.toHaveBeenCalled();
  });

  it('recusa quem foi removido pelo criador', async () => {
    const { op } = setupJoin(makeEvent({ kickedUsers: ['u1'] }));
    await expect(op.execute('evt-1', 'u1')).rejects.toMatchObject({ code: 'USER_KICKED' });
  });
});

function setupLeave(event) {
  const eventRepository = mockRepo(['findById', 'update'], {
    findById: async () => event,
    update: async () => ({ ...event, participants: event.participants.filter(p => p.userId !== 'u1') }),
  });
  const participationRepository = mockRepo(['markLeft']);
  const userRepository = mockRepo(['update']);
  const op = new LeaveEventOperation({ eventRepository, participationRepository, userRepository });
  return { op, participationRepository, userRepository };
}

const withU1 = overrides => makeEvent({
  participants: [{ userId: 'creator', userName: 'C' }, { userId: 'u1', userName: 'Ana' }],
  ...overrides,
});

describe('LeaveEventOperation', () => {
  it('sai sem penalidade com mais de 3h de antecedência e decrementa o contador', async () => {
    const { op, userRepository } = setupLeave(withU1());
    const result = await op.execute('evt-1', 'u1');
    expect(result.penalty).toBe(false);
    expect(userRepository.update).toHaveBeenCalledWith('u1', { $inc: { gamesParticipated: -1 } });
  });

  it('aplica penalidade com menos de 3h', async () => {
    const { op, userRepository } = setupLeave(withU1({ dateTime: new Date(Date.now() + HOUR) }));
    const result = await op.execute('evt-1', 'u1');
    expect(result.penalty).toBe(true);
    expect(userRepository.update).toHaveBeenCalledWith('u1', {
      $inc: { gamesParticipated: -1, lastMinuteCancellations: 1 },
    });
  });

  it('não penaliza quem sai de jogo cancelado, mesmo em cima da hora', async () => {
    const { op } = setupLeave(withU1({ status: 'cancelled', dateTime: new Date(Date.now() + HOUR) }));
    const result = await op.execute('evt-1', 'u1');
    expect(result.penalty).toBe(false);
  });

  it('não deixa sair de jogo que já começou', async () => {
    const { op } = setupLeave(withU1({ dateTime: new Date(Date.now() - HOUR) }));
    await expect(op.execute('evt-1', 'u1')).rejects.toMatchObject({ code: 'EVENT_ALREADY_STARTED' });
  });
});

describe('KickParticipantOperation', () => {
  it('remove, encerra a participação e decrementa o contador do removido', async () => {
    const event = withU1();
    const eventRepository = mockRepo(['findById', 'update'], {
      findById: async () => event,
      update: async () => ({ ...event, participants: [event.participants[0]], kickedUsers: ['u1'] }),
    });
    const participationRepository = mockRepo(['markLeft']);
    const userRepository = mockRepo(['update']);
    const op = new KickParticipantOperation({ eventRepository, participationRepository, userRepository });

    const result = await op.execute('evt-1', 'u1', 'creator');

    expect(result.kickedUsers).toEqual(['u1']);
    expect(participationRepository.markLeft).toHaveBeenCalledWith('u1', 'evt-1', false);
    expect(userRepository.update).toHaveBeenCalledWith('u1', { $inc: { gamesParticipated: -1 } });
  });
});
