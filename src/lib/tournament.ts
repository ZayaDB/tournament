import { prisma } from "./prisma";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function createTournament(
  name: string,
  danceStyle: string,
  participantCount: number,
  eventId: string
) {
  // Create tournament
  const tournament = await prisma.tournament.create({
    data: {
      name,
      danceStyle,
      participantCount,
      status: "PENDING",
      eventId,
    },
  });

  // Calculate number of rounds needed
  const numRounds = Math.ceil(Math.log2(participantCount));

  // Create empty matches for the tournament
  let matchNumber = 1;

  for (let round = 1; round <= numRounds; round++) {
    const matchesInRound = Math.pow(2, numRounds - round);

    for (let i = 0; i < matchesInRound; i++) {
      await prisma.match.create({
        data: {
          round,
          matchNumber: matchNumber++,
          tournamentId: tournament.id,
        },
      });
    }
  }

  return tournament;
}

export async function generateBrackets(tournamentId: string) {
  // Get all participants for this tournament
  const participants = await prisma.participant.findMany({
    where: {
      tournamentId: tournamentId,
    },
    orderBy: {
      registrationNumber: "asc",
    },
  });

  if (participants.length < 2) {
    throw new Error("Need at least 2 participants to generate brackets");
  }

  // Shuffle participants for random seeding
  const shuffledParticipants = shuffleArray(participants);

  // Get all matches for this tournament
  const matches = await prisma.match.findMany({
    where: {
      tournamentId: tournamentId,
    },
    orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
  });

  // Connect participants to first round matches
  let participantIndex = 0;
  const firstRoundMatches = matches.filter((match) => match.round === 1);

  for (const match of firstRoundMatches) {
    const participant1 = shuffledParticipants[participantIndex++];
    const participant2 = shuffledParticipants[participantIndex++];

    if (participant1 && participant2) {
      await prisma.match.update({
        where: { id: match.id },
        data: {
          participants: {
            connect: [{ id: participant1.id }, { id: participant2.id }],
          },
        },
      });
    }
  }

  // For subsequent rounds, create automatic advancement
  // This creates a proper bracket structure where winners advance
  const totalRounds = Math.max(...matches.map((m) => m.round));

  for (let round = 2; round <= totalRounds; round++) {
    const currentRoundMatches = matches.filter((m) => m.round === round);
    const previousRoundMatches = matches.filter((m) => m.round === round - 1);

    for (let i = 0; i < currentRoundMatches.length; i++) {
      const currentMatch = currentRoundMatches[i];
      const match1Index = i * 2;
      const match2Index = i * 2 + 1;

      // Get the two previous round matches that feed into this match
      const previousMatch1 = previousRoundMatches[match1Index];
      const previousMatch2 = previousRoundMatches[match2Index];

      if (previousMatch1 && previousMatch2) {
        // For now, we'll leave these matches empty (TBD)
        // They will be populated when the previous round matches are completed
        // This creates the proper bracket structure
        console.log(
          `Round ${round} Match ${i + 1} will be populated from Round ${
            round - 1
          } Matches ${match1Index + 1} and ${match2Index + 1}`
        );
      }
    }
  }

  // Update tournament status to READY_TO_BRACKET (not ACTIVE yet)
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: "READY_TO_BRACKET" },
  });

  return matches;
}
