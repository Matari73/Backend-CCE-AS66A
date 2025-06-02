import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import dotenv from 'dotenv';
dotenv.config();

// Lista negra de tokens (para logout)
export let tokenBlacklist = [];

const generateToken = (user) => {
  return jwt.sign(
    { 
      user_id: user.user_id
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Validações básicas
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    // Verifica se o usuário já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso.' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria novo usuário
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Gera token
    const token = generateToken(user);

    res.status(201).json({ 
      message: 'Usuário registrado com sucesso.',
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email
      },
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao registrar usuário.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = generateToken(user);

    res.status(200).json({ 
      message: 'Login realizado com sucesso.',
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email
      },
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao fazer login.' });
  }
};

export const logout = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(400).json({ message: 'Token não fornecido.' });
  }

  try {
    // Verifica se o token é válido antes de adicionar à lista negra
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        return res.status(401).json({ message: 'Token inválido.' });
      }
    });

    tokenBlacklist.push(token);
    res.status(200).json({ message: 'Logout realizado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao fazer logout.' });
  }
};