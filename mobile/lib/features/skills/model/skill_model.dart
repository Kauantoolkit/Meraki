class SkillModel {
  final String id;
  final String name;
  final String displayName;
  final String createdByCompanyId;
  final String? createdAt;

  SkillModel({
    required this.id,
    required this.name,
    required this.displayName,
    required this.createdByCompanyId,
    this.createdAt,
  });

  factory SkillModel.fromJson(Map<String, dynamic> json) {
    return SkillModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      displayName: json['displayName'] ?? json['name'] ?? '',
      createdByCompanyId: json['createdByCompanyId'] ?? '',
      createdAt: json['createdAt'],
    );
  }
}

class SkillQuestionModel {
  final String id;
  final String skillId;
  final String text;
  final List<String> options;
  final int? correctIndex;

  SkillQuestionModel({
    required this.id,
    required this.skillId,
    required this.text,
    required this.options,
    this.correctIndex,
  });

  factory SkillQuestionModel.fromJson(Map<String, dynamic> json) {
    return SkillQuestionModel(
      id: json['id'] ?? '',
      skillId: json['skillId'] ?? '',
      text: json['text'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      correctIndex: json['correctIndex'],
    );
  }
}

class SkillValidationModel {
  final String id;
  final String skillId;
  final String skillName;
  final bool passed;
  final double score;
  final String? attemptedAt;

  SkillValidationModel({
    required this.id,
    required this.skillId,
    required this.skillName,
    required this.passed,
    required this.score,
    this.attemptedAt,
  });

  factory SkillValidationModel.fromJson(Map<String, dynamic> json) {
    return SkillValidationModel(
      id: json['id'] ?? '',
      skillId: json['skillId'] ?? '',
      skillName: json['skillName'] ?? '',
      passed: json['passed'] ?? false,
      score: (json['score'] ?? 0).toDouble(),
      attemptedAt: json['attemptedAt'],
    );
  }
}

class QuizResultModel {
  final bool passed;
  final double score;
  final int correctAnswers;
  final int totalQuestions;

  QuizResultModel({
    required this.passed,
    required this.score,
    required this.correctAnswers,
    required this.totalQuestions,
  });

  factory QuizResultModel.fromJson(Map<String, dynamic> json) {
    return QuizResultModel(
      passed: json['passed'] ?? false,
      score: (json['score'] ?? 0).toDouble(),
      correctAnswers: json['correctAnswers'] ?? 0,
      totalQuestions: json['totalQuestions'] ?? 0,
    );
  }
}

class CreateQuestionDto {
  final String text;
  final List<String> options;
  final int correctIndex;

  CreateQuestionDto({
    required this.text,
    required this.options,
    required this.correctIndex,
  });

  Map<String, dynamic> toJson() => {
        'text': text,
        'options': options,
        'correctIndex': correctIndex,
      };
}
