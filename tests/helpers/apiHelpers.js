import request from 'supertest';
import jwt from 'jsonwebtoken';

export const generateTestToken = (userData = {}) => {
  const user = userFactory.build(userData);
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

export const authenticatedRequest = async (app, endpoint, method = 'GET', data = null, userData = {}) => {
  const token = generateTestToken(userData);
  const req = request(app)[method.toLowerCase()](endpoint);
  
  req.set('Authorization', `Bearer ${token}`);
  
  if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
    req.send(data);
  }
  
  return req;
};

export const expectValidationError = (response, field, message = null) => {
  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty('success', false);
  
  if (field) {
    expect(response.body.error).toContain(field);
  }
  
  if (message) {
    expect(response.body.errors).toContainEqual(
      expect.objectContaining({ message: expect.stringContaining(message) })
    );
  }
};

export const expectSuccessResponse = (response, statusCode = 200) => {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty('success', true);
};

export const expectErrorResponse = (response, statusCode, expectedMessage = null) => {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty('success', false);
  
  if (expectedMessage) {
    expect(response.body.error).toContain(expectedMessage);
  }
};

export const expectPaginatedResponse = (response, expectedStatus = 200) => {
  expectSuccessResponse(response, expectedStatus);
  expect(response.body).toHaveProperty('data');
  expect(response.body).toHaveProperty('pagination');
  expect(response.body.pagination).toHaveProperty('page');
  expect(response.body.pagination).toHaveProperty('limit');
  expect(response.body.pagination).toHaveProperty('total');
  expect(response.body.pagination).toHaveProperty('totalPages');
};
