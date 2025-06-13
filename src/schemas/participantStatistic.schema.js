import { z } from 'zod';

export const participantStatisticsSchema = z.object({
  match_id: z.number().int('ID da partida deve ser um número inteiro'),
  participant_id: z.number().int('ID do participante deve ser um número inteiro'),
  agent_id: z.number().int('ID do agente deve ser um número inteiro'),
  kills: z.number().int().min(0, 'Kills deve ser um número inteiro >= 0'),
  assists: z.number().int().min(0, 'Assists deve ser um número inteiro >= 0'),
  deaths: z.number().int().min(0, 'Deaths deve ser um número inteiro >= 0'),
  spike_plants: z.number().int().min(0, 'Spike plants deve ser um número inteiro >= 0'),
  spike_defuses: z.number().int().min(0, 'Spike defuses deve ser um número inteiro >= 0'),
  MVP: z.boolean(),
  first_kill: z.boolean(),
});