import { z } from 'zod';

export const matchSchema = z.object({
  championship_id: z.number().int('ID do campeonato deve ser um número inteiro'),
  teamA_id: z.number().int('ID da equipe A deve ser um número inteiro'),
  teamB_id: z.number().int('ID da equipe B deve ser um número inteiro'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Data deve estar no formato YYYY-MM-DD'),
  stage: z.string().min(1, 'A fase da partida é obrigatória'),
  winner_team_id: z.number().int().nullable().optional(),
  score: z.record(z.number()).nullable().optional(), // ex: { teamA: 13, teamB: 11 }
  map: z.string().min(1, 'Nome do mapa é obrigatório'),
});