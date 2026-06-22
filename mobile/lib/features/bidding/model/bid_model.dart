class BidModel {
  final String id;
  final String projectId;
  final String specialistId;
  final String? specialistName;
  final String? specialistUserId;
  final double proposedValue;
  final int estimatedDays;
  final String coverLetter;
  final String status;
  final String createdAt;

  const BidModel({
    required this.id,
    required this.projectId,
    required this.specialistId,
    this.specialistName,
    this.specialistUserId,
    required this.proposedValue,
    required this.estimatedDays,
    required this.coverLetter,
    required this.status,
    required this.createdAt,
  });

  factory BidModel.fromJson(Map<String, dynamic> json) => BidModel(
        id: json['id'] as String,
        projectId: json['projectId'] as String,
        specialistId: json['specialistId'] as String,
        specialistName: json['specialistName'] as String?,
        specialistUserId: json['specialistUserId'] as String?,
        proposedValue: double.parse(json['proposedBudget'].toString()),
        estimatedDays: int.parse(json['estimatedDuration'].toString()),
        coverLetter: json['coverLetter'] as String? ?? '',
        status: json['status'] as String? ?? 'PENDING',
        createdAt: json['createdAt'] as String? ?? '',
      );

  bool get isPending => status == 'PENDING';
  bool get isAccepted => status == 'ACCEPTED';
  bool get isRejected => status == 'REJECTED';
}
