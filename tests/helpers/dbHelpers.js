export const createTestUser = async (testDb, userData = {}) => {
  const defaultUserData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123'
  };
  
  // If testDb is our TestDatabase class instance
  if (testDb && testDb.User) {
    return await testDb.User.create({ ...defaultUserData, ...userData });
  }
  
  // Fallback for mock
  return { id: 1, ...defaultUserData, ...userData };
};

export const createTestChampionship = async (testDb, championshipData = {}) => {
  const defaultData = {
    name: 'Test Championship',
    status: 'upcoming'
  };
  
  if (testDb && testDb.Championship) {
    return await testDb.Championship.create({ ...defaultData, ...championshipData });
  }
  
  return { id: 1, ...defaultData, ...championshipData };
};

export const clearAllTables = async (testDb) => {
  if (testDb && testDb.reset) {
    await testDb.reset();
  }
  // For mocks, just return
  return Promise.resolve();
};

export const seedTestData = async (testDb) => {
  const user = await createTestUser(testDb, {
    name: 'Seed User',
    email: 'seed@example.com'
  });
  
  const championship = await createTestChampionship(testDb, {
    name: 'Seed Championship'
  }, user.id);
  
  return { user, championship };
};
