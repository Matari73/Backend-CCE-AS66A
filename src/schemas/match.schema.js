import { z } from 'zod';

export const matchSchema = z.object({
  championship_id: z.number().int(),
  teamA_id: z.number().int(),
  teamB_id: z.number().int(),
  date: z.string().optional(),
  stage: z.string(),
  map: z.string(),
  status: z.string().optional(),
  score: z.record(z.string(), z.number()).optional(), // ex: { teamA: 13, teamB: 7 }
  winner_team_id: z.number().int().optional()
});
