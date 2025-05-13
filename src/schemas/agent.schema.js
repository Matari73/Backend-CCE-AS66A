import { z } from 'zod';

export const agentSchema = z.object({
    name: z.string().min(1, 'O nome do agente é obrigatório'),
});