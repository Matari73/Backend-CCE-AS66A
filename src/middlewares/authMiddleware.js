import jwt from 'jsonwebtoken';
import { tokenBlacklist } from '../controllers/authController.js';
import dotenv from 'dotenv';
dotenv.config();



export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  if (tokenBlacklist.includes(token)) {
    return res.status(401).json({ message: 'Token inválido (logout realizado).' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Falha na autenticação do token.' });
    }

    req.user = decoded;
    next();
  });
};
