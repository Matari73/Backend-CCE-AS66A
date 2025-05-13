import { z } from 'zod';

export const teamSchema = z.object({
  name: z.string().min(1, 'O nome da equipe é obrigatório'),
  ranking: z.number().int('Ranking deve ser um número inteiro'),
  user_id: z.number().int('ID do usuário deve ser um número inteiro'),
});