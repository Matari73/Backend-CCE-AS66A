import User from '../models/user.js';

// Helper para filtrar dados sensíveis
const filterUserData = (user) => {
  if (!user) return null;
  const { password, ...safeData } = user.dataValues;
  return safeData;
};

// Retorna todos os usuários (público)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    const safeUsers = users.map(filterUserData);
    res.status(200).json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
};

// Retorna um usuário específico (público)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.status(200).json(filterUserData(user));
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
};

// Atualiza usuário (apenas o próprio usuário)
export const updateUser = async (req, res) => {
  const { id } = req.params;
  
  // Verifica se o usuário está tentando atualizar ele mesmo
  if (req.user.user_id !== parseInt(id)) {
    return res.status(403).json({ message: 'Você só pode atualizar seu próprio perfil' });
  }

  try {
    const { name, email } = req.body;
    const [updated] = await User.update(
      { name, email },
      { where: { user_id: id } }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const updatedUser = await User.findByPk(id);
    res.status(200).json(filterUserData(updatedUser));
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
};

// Deletar usuário (apenas o próprio usuário)
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  // Verifica se o usuário está tentando deletar ele mesmo
  if (req.user.user_id !== parseInt(id)) {
    return res.status(403).json({ message: 'Você só pode deletar seu próprio perfil' });
  }

  try {
    const deleted = await User.destroy({ where: { user_id: id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar usuário' });
  }
};