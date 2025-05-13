export const validateSchema = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Erro de validação',
        errors: result.error.format(),
      });
    }
    req.validatedBody = result.data;
    next();
  };
  