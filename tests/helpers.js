const HOUR = 60 * 60 * 1000;

function makeEvent(overrides = {}) {
  return {
    event_id: 'evt-1',
    sport: 'football',
    totalPlayers: 10,
    duration: 60,
    clubName: 'Arena',
    location: 'Rua A, 1',
    city: 'São Paulo',
    dateTime: new Date(Date.now() + 24 * HOUR),
    pricePerPerson: 20,
    preFilledPlayers: 0,
    skillLevel: '',
    creatorId: 'creator',
    creatorName: 'Criador',
    status: 'open',
    participants: [{ userId: 'creator', userName: 'Criador', joinedAt: new Date() }],
    kickedUsers: [],
    createdAt: new Date(),
    ...overrides,
  };
}

/** Cria um objeto em que cada método listado é um jest.fn() assíncrono. */
function mockRepo(methods, impl = {}) {
  const repo = {};
  for (const m of methods) {
    repo[m] = jest.fn(impl[m] || (async () => undefined));
  }
  return repo;
}

module.exports = { HOUR, makeEvent, mockRepo };
