class MilestoneModel {
  final String id;
  final String title;
  final String description;
  final double value;
  final int order;
  final String status;

  const MilestoneModel({
    required this.id,
    required this.title,
    required this.description,
    required this.value,
    required this.order,
    required this.status,
  });

  factory MilestoneModel.fromJson(Map<String, dynamic> json) => MilestoneModel(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String,
        value: (json['value'] as num).toDouble(),
        order: json['order'] as int,
        status: json['status'] as String? ?? 'PENDING',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'value': value,
        'order': order,
        'status': status,
      };
}

class ProjectModel {
  final String id;
  final String title;
  final String description;
  final double budget;
  final String deadline;
  final String status;
  final String companyId;
  final String? specialistId;
  final List<String> requirements;
  final List<MilestoneModel> milestones;
  final String createdAt;

  const ProjectModel({
    required this.id,
    required this.title,
    required this.description,
    required this.budget,
    required this.deadline,
    required this.status,
    required this.companyId,
    this.specialistId,
    required this.requirements,
    required this.milestones,
    required this.createdAt,
  });

  factory ProjectModel.fromJson(Map<String, dynamic> json) => ProjectModel(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String,
        budget: double.parse(json['budget'].toString()),
        deadline: json['deadline'] as String,
        status: json['status'] as String? ?? 'OPEN',
        companyId: json['companyId'] as String,
        specialistId: json['specialistId'] as String?,
        requirements: (json['requirements'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
        milestones: (json['milestones'] as List<dynamic>?)
                ?.map((e) => MilestoneModel.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
        createdAt: json['createdAt'] as String? ?? '',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'budget': budget,
        'deadline': deadline,
        'status': status,
        'companyId': companyId,
        'specialistId': specialistId,
        'requirements': requirements,
        'milestones': milestones.map((m) => m.toJson()).toList(),
        'createdAt': createdAt,
      };

  bool get isOpen => status == 'OPEN';
  bool get isInProgress => status == 'IN_PROGRESS';
  bool get isCompleted => status == 'COMPLETED';
}
