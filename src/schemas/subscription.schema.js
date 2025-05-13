import { z } from 'zod';

export const subscriptionSchema = z.object({
    championship_id: z.number().int('ID do campeonato deve ser um número inteiro'),
    team_id: z.number().int('ID da equipe deve ser um número inteiro'),
    subscription_date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Data deve estar no formato YYYY-MM-DD'),
    status: z.string().min(1, 'Status é obrigatório'),
});