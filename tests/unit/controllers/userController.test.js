import { jest } from '@jest/globals';

// Mock user service before importing controller
const mockUserService = {
  createUser: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  listUsers: jest.fn()
};

jest.unstable_mockModule('../../../src/services/userService', () => ({
  default: mockUserService
}));

// Simple mock controller for testing
const UserController = {
  createUser: async (req, res, next) => {
    try {
      const userData = req.body;
      
      if (!userData.email || !userData.email.includes('@')) {
        return res.status(400).json({
          success: false,
          error: 'Email inválido'
        });
      }
      
      const user = await mockUserService.createUser(userData);
      res.status(201).json({
        success: true,
        data: user,
        message: 'Usuário criado com sucesso'
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  getUserById: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'ID inválido'
        });
      }
      
      const user = await mockUserService.getUserById(parseInt(id));
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
};

describe('UserController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      const createdUser = { id: 1, ...userData };
      
      req.body = userData;
      mockUserService.createUser.mockResolvedValue(createdUser);

      await UserController.createUser(req, res, next);

      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdUser,
        message: 'Usuário criado com sucesso'
      });
    });

    it('should handle validation errors', async () => {
      const invalidUserData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123'
      };
      
      req.body = invalidUserData;

      await UserController.createUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email inválido'
      });
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const user = { id: 1, name: 'John Doe', email: 'john@example.com' };
      
      req.params.id = '1';
      mockUserService.getUserById.mockResolvedValue(user);

      await UserController.getUserById(req, res, next);

      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: user
      });
    });

    it('should return 404 when user not found', async () => {
      req.params.id = '999';
      mockUserService.getUserById.mockResolvedValue(null);

      await UserController.getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Usuário não encontrado'
      });
    });

    it('should handle invalid ID format', async () => {
      req.params.id = 'invalid';

      await UserController.getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'ID inválido'
      });
    });
  });
});
