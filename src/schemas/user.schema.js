import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('Formato de e-mail inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
});
