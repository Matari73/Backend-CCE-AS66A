import { z } from 'zod';

export const championshipSchema = z.object({
    name: z.string().min(1, 'O nome do campeonato é obrigatório'),
    description: z.string().min(1, 'A descrição é obrigatória'),
    format: z.string().min(1, 'O formato é obrigatório'),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Data de início inválida (formato esperado: YYYY-MM-DD)'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Data de término inválida (formato esperado: YYYY-MM-DD)'),
    location: z.string().min(1, 'A localização é obrigatória'),
    status: z.string().min(1, 'O status é obrigatório'),
    user_id: z.number().int('ID do usuário deve ser um número inteiro'),
});