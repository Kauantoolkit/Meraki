class KanbanCardModel {
  final String id;
  final String title;
  final String columnId;
  final String? milestoneId;
  final int order;

  const KanbanCardModel({
    required this.id,
    required this.title,
    required this.columnId,
    this.milestoneId,
    required this.order,
  });

  factory KanbanCardModel.fromJson(Map<String, dynamic> json) =>
      KanbanCardModel(
        id: json['id'] as String,
        title: json['title'] as String,
        columnId: json['columnId'] as String,
        milestoneId: json['milestoneId'] as String?,
        order: json['order'] as int? ?? 0,
      );
}

class KanbanColumnModel {
  final String id;
  final String name;
  final int order;
  final List<KanbanCardModel> cards;

  const KanbanColumnModel({
    required this.id,
    required this.name,
    required this.order,
    required this.cards,
  });

  factory KanbanColumnModel.fromJson(Map<String, dynamic> json) =>
      KanbanColumnModel(
        id: json['id'] as String,
        name: json['title'] as String? ?? json['name'] as String? ?? '',
        order: json['order'] as int? ?? 0,
        cards: (json['cards'] as List<dynamic>?)
                ?.map((e) =>
                    KanbanCardModel.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
      );
}

class DeliveryModel {
  final String id;
  final String milestoneId;
  final String description;
  final String status;
  final String submittedAt;
  final String? feedback;

  const DeliveryModel({
    required this.id,
    required this.milestoneId,
    required this.description,
    required this.status,
    required this.submittedAt,
    this.feedback,
  });

  factory DeliveryModel.fromJson(Map<String, dynamic> json) => DeliveryModel(
        id: json['id'] as String,
        milestoneId: json['milestoneId'] as String,
        description: json['description'] as String? ?? '',
        status: json['status'] as String? ?? 'PENDING',
        submittedAt: json['submittedAt'] as String? ??
            json['createdAt'] as String? ??
            '',
        feedback: json['feedback'] as String?,
      );
}
