class PaymentModel {
  final String id;
  final String projectId;
  final String milestoneId;
  final String specialistId;
  final double amount;
  final double platformFee;
  final double specialistAmount;
  final String status;
  final String createdAt;

  const PaymentModel({
    required this.id,
    required this.projectId,
    required this.milestoneId,
    required this.specialistId,
    required this.amount,
    required this.platformFee,
    required this.specialistAmount,
    required this.status,
    required this.createdAt,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) => PaymentModel(
        id: json['id'] as String,
        projectId: json['projectId'] as String,
        milestoneId: json['milestoneId'] as String,
        specialistId: json['specialistId'] as String,
        amount: double.parse(json['amount'].toString()),
        platformFee: double.parse((json['platformFee'] ?? 0).toString()),
        specialistAmount: double.parse((json['specialistAmount'] ?? 0).toString()),
        status: json['status'] as String? ?? 'PENDING',
        createdAt: json['createdAt'] as String? ?? '',
      );

  bool get isReleased => status == 'RELEASED';
}
