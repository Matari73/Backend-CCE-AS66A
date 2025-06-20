import jwt from 'jsonwebtoken';
import { tokenBlacklist } from '../controllers/authController.js';
import dotenv from 'dotenv';
dotenv.config();

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Autenticação necessária',
        details: 'Token não fornecido'
      });
    }

    if (tokenBlacklist.includes(token)) {
      return res.status(401).json({ 
        error: 'Sessão inválida', 
        details: 'Token inválido (logout realizado)' 
      });
    }

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    if (!decoded?.user_id) {
      return res.status(403).json({ 
        error: 'Token inválido',
        details: 'Payload do token malformado'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ 
      error: 'Falha na autenticação',
      details: 'Token inválido ou expirado'
    });
  }
};