export class QuestionInputDto {
  text: string;
  options: string[]; // exactly 4
  correctIndex: number; // 0-3
}

export class CreateSkillDto {
  displayName: string;
  questions: QuestionInputDto[];
}

export class AddQuestionsDto {
  questions: QuestionInputDto[];
}

export class AttemptQuizDto {
  answers: number[]; // one index per question
}
