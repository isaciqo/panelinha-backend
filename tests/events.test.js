const CreateEventOperation = require('../src/app/operations/event/CreateEventOperation');
const UpdateEventOperation = require('../src/app/operations/event/UpdateEventOperation');
const CancelEventOperation = require('../src/app/operations/event/CancelEventOperation');
const { HOUR, makeEvent, mockRepo } = require('./helpers');

describe('CreateEventOperation', () => {
  const input = {
    sport: 'football',
    totalPlayers: 10,
    duration: 60,
    clubName: 'Arena',
    location: 'Rua A',
    city: 'SP',
    dateTime: new Date(Date.now() + 24 * HOUR).toISOString(),
    pricePerPerson: 0,
  };

  function setup() {
    const eventRepository = mockRepo(['create'], { create: async data => ({ ...data, createdAt: new Date() }) });
    const userRepository = mockRepo(['findById', 'update'], {
      findById: async () => ({ user_id: 'creator', name: 'Criador' }),
    });
    const participationRepository = mockRepo(['upsertJoin']);
    const op = new CreateEventOperation({ eventRepository, userRepository, participationRepository });
    return { op, participationRepository };
  }

  it('cria o registro de participação do criador (para ele poder avaliar e ser avaliado)', async () => {
    const { op, participationRepository } = setup();
    const event = await op.execute(input, 'creator');
    expect(event.participants[0].userId).toBe('creator');
    expect(participationRepository.upsertJoin).toHaveBeenCalledWith('creator', event.id, expect.any(Date));
  });

  it('recusa jogadores fechados por fora que, somados ao criador, passam do total', async () => {
    const { op } = setup();
    await expect(op.execute({ ...input, totalPlayers: 5, preFilledPlayers: 5 }, 'creator'))
      .rejects.toMatchObject({ code: 'INVALID_CAPACITY' });
  });
});

describe('UpdateEventOperation', () => {
  function setup(event) {
    const eventRepository = mockRepo(['findById', 'update'], {
      findById: async () => event,
      update: async (id, data) => ({ ...event, ...data }),
    });
    return new UpdateEventOperation({ eventRepository });
  }

  const crowded = () => makeEvent({
    participants: [{ userId: 'creator' }, { userId: 'a' }, { userId: 'b' }, { userId: 'c' }],
    preFilledPlayers: 2,
  });

  it('não deixa o total ficar abaixo de inscritos + fechados por fora', async () => {
    await expect(setup(crowded()).execute('evt-1', { totalPlayers: 5 }, 'creator'))
      .rejects.toMatchObject({ code: 'INVALID_CAPACITY' });
  });

  it('aceita o total exatamente igual à ocupação', async () => {
    const updated = await setup(crowded()).execute('evt-1', { totalPlayers: 6 }, 'creator');
    expect(updated.totalPlayers).toBe(6);
  });

  it('não muta o objeto recebido', async () => {
    const data = { dateTime: new Date(Date.now() + 48 * HOUR).toISOString() };
    const copy = { ...data };
    await setup(makeEvent()).execute('evt-1', data, 'creator');
    expect(data).toEqual(copy);
  });
});

describe('CancelEventOperation', () => {
  it('não cancela jogo que já aconteceu', async () => {
    const event = makeEvent({ dateTime: new Date(Date.now() - 3 * HOUR) });
    const eventRepository = mockRepo(['findById', 'update'], { findById: async () => event });
    const op = new CancelEventOperation({ eventRepository });
    await expect(op.execute('evt-1', 'creator')).rejects.toMatchObject({ code: 'EVENT_ALREADY_HAPPENED' });
  });

  it('cancela jogo confirmado no futuro', async () => {
    const event = makeEvent({ status: 'confirmed' });
    const eventRepository = mockRepo(['findById', 'update'], {
      findById: async () => event,
      update: async (id, data) => ({ ...event, ...data }),
    });
    const op = new CancelEventOperation({ eventRepository });
    const result = await op.execute('evt-1', 'creator');
    expect(result.status).toBe('cancelled');
  });
});
