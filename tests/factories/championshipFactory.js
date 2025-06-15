import { faker } from '@faker-js/faker';

export const championshipFactory = {
  build: (overrides = {}) => ({
    id: faker.number.int({ min: 1, max: 1000 }),
    name: `${faker.company.name()} Championship`,
    description: faker.lorem.paragraph(),
    status: faker.helpers.arrayElement(['upcoming', 'ongoing', 'completed']),
    startDate: faker.date.future(),
    endDate: faker.date.future(),
    maxParticipants: faker.number.int({ min: 8, max: 64 }),
    prizePool: faker.number.float({ min: 1000, max: 50000, fractionDigits: 2 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides
  }),

  buildList: (count, overrides = {}) =>
    Array.from({ length: count }, (_, i) =>
      championshipFactory.build({ id: i + 1, ...overrides })
    ),

  buildUpcoming: (overrides = {}) =>
    championshipFactory.build({
      status: 'upcoming',
      startDate: faker.date.future(),
      ...overrides
    }),

  buildOngoing: (overrides = {}) =>
    championshipFactory.build({
      status: 'ongoing',
      startDate: faker.date.past(),
      endDate: faker.date.future(),
      ...overrides
    }),

  buildCompleted: (overrides = {}) =>
    championshipFactory.build({
      status: 'completed',
      startDate: faker.date.past(),
      endDate: faker.date.past(),
      ...overrides
    })
};
