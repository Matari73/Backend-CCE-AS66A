import { faker } from '@faker-js/faker';

export const userFactory = {
  build: (overrides = {}) => ({
    id: faker.number.int({ min: 1, max: 1000 }),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides
  }),

  buildValid: (overrides = {}) => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: 'ValidPassword123!',
    ...overrides
  }),

  buildInvalid: (field) => {
    const base = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'ValidPassword123!'
    };

    switch (field) {
      case 'email':
        return { ...base, email: 'invalid-email' };
      case 'password':
        return { ...base, password: '123' }; // weak password
      case 'name':
        return { ...base, name: '' };
      default:
        return base;
    }
  },

  buildList: (count, overrides = {}) => {
    return Array.from({ length: count }, (_, index) => 
      this.build({
        name: `Test User ${index + 1}`,
        email: `test${index + 1}@example.com`,
        ...overrides
      })
    );
  }
};
