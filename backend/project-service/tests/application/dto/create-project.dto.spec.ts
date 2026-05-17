/**
 * Valida o CreateProjectDto (camada HTTP) com class-validator.
 * Esses são os mesmos checks que o NestJS ValidationPipe roda antes
 * de o request chegar no controller → garantem HTTP 400 (RN01).
 */
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProjectDto } from '../../../src/application/dto/create-project.dto';

function validPayload() {
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);
  return {
    title: 'Projeto de Teste Completo',
    description: 'Descrição do projeto',
    requirements: ['Node.js', 'TypeScript'],
    budget: 10000,
    deadline: futureDate.toISOString().substring(0, 10),
  };
}

async function validatePayload(payload: any) {
  const dto = plainToInstance(CreateProjectDto, payload);
  const errors = await validate(dto, { whitelist: true });
  return errors;
}

describe('CreateProjectDto — RN01 (validação HTTP)', () => {
  it('payload válido passa pela validação', async () => {
    const errors = await validatePayload(validPayload());
    expect(errors).toHaveLength(0);
  });

  it('RN01: título com menos de 10 chars → erro (MinLength)', async () => {
    const errors = await validatePayload({ ...validPayload(), title: 'Curto' });
    expect(errors.length).toBeGreaterThan(0);
    const titleErr = errors.find((e) => e.property === 'title');
    expect(titleErr?.constraints).toHaveProperty('minLength');
  });

  it('RN01: budget = 0 → erro (Min)', async () => {
    const errors = await validatePayload({ ...validPayload(), budget: 0 });
    expect(errors.length).toBeGreaterThan(0);
    const budgetErr = errors.find((e) => e.property === 'budget');
    expect(budgetErr?.constraints).toHaveProperty('min');
  });

  it('RN01: budget negativo → erro (Min)', async () => {
    const errors = await validatePayload({ ...validPayload(), budget: -500 });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'budget')).toBeDefined();
  });

  it('RN01: requirements vazio → erro (ArrayMinSize)', async () => {
    const errors = await validatePayload({ ...validPayload(), requirements: [] });
    expect(errors.length).toBeGreaterThan(0);
    const reqErr = errors.find((e) => e.property === 'requirements');
    expect(reqErr?.constraints).toHaveProperty('arrayMinSize');
  });

  it('RN01: deadline em formato inválido → erro (IsDateString)', async () => {
    const errors = await validatePayload({ ...validPayload(), deadline: 'data-quebrada' });
    expect(errors.length).toBeGreaterThan(0);
    const deadlineErr = errors.find((e) => e.property === 'deadline');
    expect(deadlineErr?.constraints).toHaveProperty('isDateString');
  });
});
