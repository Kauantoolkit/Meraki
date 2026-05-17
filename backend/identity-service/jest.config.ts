export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  collectCoverageFrom: [
    'src/**/*.ts',
    // Excluídos da métrica: glue code de infra que não tem unit-test natural
    '!src/main.ts',
    '!src/app.module.ts',
    '!src/identity.module.ts',
    '!src/infrastructure/rabbitmq/**',
    '!src/infrastructure/database/**',
    '!src/infrastructure/repositories/**',
    '!src/domain/value-objects/phone.value-object.ts',
    '!src/domain/value-objects/cpf.value-object.ts',
    '!src/domain/value-objects/cnpj.value-object.ts',
  ],
  coverageDirectory: './coverage',
  coverageThreshold: {
    global: {
      statements: 70,
      lines: 70,
      branches: 60,
      functions: 60,
    },
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
