import { z } from 'zod';

export const participantSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  nickname: z.string().min(2, 'O nickname deve ter no mínimo 2 caracteres'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento deve estar no formato YYYY-MM-DD'),
  phone: z.number().int('Telefone deve ser um número'),
  team_id: z.number().int('ID da equipe deve ser um número inteiro').nullable().optional(),
  is_coach: z.boolean(),
  user_id: z.number().int('ID do usuário criador deve ser um número inteiro'),
});