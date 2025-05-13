import { z } from 'zod';

export const championshipStatisticsSchema = z.object({
    championship_id: z.number().int('ID do campeonato deve ser um número inteiro'),
    participant_id: z.number().int('ID do participante deve ser um número inteiro'),
    team_id: z.number().int('ID da equipe deve ser um número inteiro'),
    kills: z.number().int().min(0, 'Kills deve ser um número inteiro >= 0'),
    assists: z.number().int().min(0, 'Assists deve ser um número inteiro >= 0'),
    deaths: z.number().int().min(0, 'Deaths deve ser um número inteiro >= 0'),
    spike_plants: z.number().int().min(0, 'Spike plants deve ser um número inteiro >= 0'),
    spike_defuses: z.number().int().min(0, 'Spike defuses deve ser um número inteiro >= 0'),
    MVPs: z.number().int().min(0, 'MVPs deve ser um número inteiro >= 0'),
    first_kills: z.number().int().min(0, 'First kills deve ser um número inteiro >= 0'),
});





