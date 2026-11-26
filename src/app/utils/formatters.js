const DEFAULT_DURATION_MIN = 60;

function isEventPast(event, now = new Date()) {
  const start = new Date(event.dateTime).getTime();
  const durationMs = (event.duration || DEFAULT_DURATION_MIN) * 60 * 1000;
  return start + durationMs < now.getTime();
}

function formatEvent(event) {
  if (!event) return null;
  return {
    id: event.event_id,
    sport: event.sport,
    totalPlayers: event.totalPlayers,
    duration: event.duration,
    clubName: event.clubName,
    location: event.location,
    city: event.city,
    dateTime: event.dateTime,
    pricePerPerson: event.pricePerPerson,
    preFilledPlayers: event.preFilledPlayers || 0,
    skillLevel: event.skillLevel || '',
    creatorId: event.creatorId,
    creatorName: event.creatorName,
    status: event.status,
    isPast: isEventPast(event),
    participants: event.participants || [],
    kickedUsers: event.kickedUsers || [],
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

/**
 * Formata o usuário para resposta da API.
 * O email só é incluído quando `includeEmail` é true (o próprio usuário).
 */
function formatUser(user, { includeEmail = false } = {}) {
  if (!user) return null;
  return {
    id: user.user_id,
    name: user.name,
    ...(includeEmail ? { email: user.email } : {}),
    city: user.city || null,
    avatarUrl: user.avatarUrl || null,
    averageRating: user.averageRating,
    gamesCreated: user.gamesCreated,
    gamesParticipated: user.gamesParticipated,
    lastMinuteCancellations: user.lastMinuteCancellations,
    createdAt: user.createdAt,
  };
}

function formatFeedback(f) {
  return {
    id: f.feedback_id,
    fromUserId: f.fromUserId,
    fromUserName: f.fromUserName,
    toUserId: f.toUserId,
    eventId: f.eventId,
    rating: f.rating,
    comment: f.comment,
    createdAt: f.createdAt,
  };
}

module.exports = { formatEvent, formatUser, formatFeedback, isEventPast };
