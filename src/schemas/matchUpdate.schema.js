// matchUpdate.schema.js
import { z } from 'zod';

export const matchUpdateSchema = z.object({
  winner_team_id: z.number().optional(),
  score: z
    .object({
      teamA: z.number(),
      teamB: z.number()
    })
    .optional()
});
