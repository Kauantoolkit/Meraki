class WorkHistoryModel {
  final String id;
  final String projectId;
  final String projectTitle;
  final String? companyId;
  final String companyName;
  final double earnedAmount;
  final String completedAt;

  const WorkHistoryModel({
    required this.id,
    required this.projectId,
    required this.projectTitle,
    this.companyId,
    required this.companyName,
    required this.earnedAmount,
    required this.completedAt,
  });

  factory WorkHistoryModel.fromJson(Map<String, dynamic> json) =>
      WorkHistoryModel(
        id: json['id'] as String,
        projectId: json['projectId'] as String,
        projectTitle: json['projectTitle'] as String? ?? '',
        companyId: json['companyId'] as String?,
        companyName: json['companyName'] as String? ?? '',
        earnedAmount: double.parse((json['earnedAmount'] ?? json['amountEarned'] ?? 0).toString()),
        completedAt: json['completedAt'] as String? ?? '',
      );
}

// ─── Company public profile (RF13) ───────────────────────────────────────────

class CompanyProfileModel {
  final String id;
  final String userId;
  final String companyName;
  final String? description;
  final String? website;
  final String? sector;
  final int totalProjectsCreated;
  final double rating;

  const CompanyProfileModel({
    required this.id,
    required this.userId,
    required this.companyName,
    this.description,
    this.website,
    this.sector,
    required this.totalProjectsCreated,
    required this.rating,
  });

  factory CompanyProfileModel.fromJson(Map<String, dynamic> json) =>
      CompanyProfileModel(
        id: json['id'] as String,
        userId: json['userId'] as String,
        companyName: json['companyName'] as String? ?? '',
        description: json['description'] as String?,
        website: json['website'] as String?,
        sector: json['sector'] as String?,
        totalProjectsCreated: json['totalProjectsCreated'] as int? ?? 0,
        rating: double.parse((json['rating'] ?? 0).toString()),
      );
}

class CertificationModel {
  final String id;
  final String title;
  final String institution;
  final String issuedAt;
  final String? credentialUrl;

  const CertificationModel({
    required this.id,
    required this.title,
    required this.institution,
    required this.issuedAt,
    this.credentialUrl,
  });

  factory CertificationModel.fromJson(Map<String, dynamic> json) =>
      CertificationModel(
        id: json['id'] as String,
        title: json['title'] as String,
        institution: json['institution'] as String,
        issuedAt: json['issuedAt'] as String,
        credentialUrl: json['credentialUrl'] as String?,
      );
}

class ReviewModel {
  final String id;
  final String reviewerName;
  final int rating;
  final String comment;
  final String createdAt;

  const ReviewModel({
    required this.id,
    required this.reviewerName,
    required this.rating,
    required this.comment,
    required this.createdAt,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) => ReviewModel(
        id: json['id'] as String,
        reviewerName: json['reviewerName'] as String? ?? 'Anônimo',
        rating: json['rating'] as int,
        comment: json['comment'] as String? ?? '',
        createdAt: json['createdAt'] as String? ?? '',
      );
}

class PortfolioModel {
  final String id;
  final String specialistId;
  final String bio;
  final List<String> skills;
  final double rating;
  final int completedProjects;
  final List<WorkHistoryModel> workHistory;
  final List<CertificationModel> certifications;
  final List<ReviewModel> reviews;

  const PortfolioModel({
    required this.id,
    required this.specialistId,
    required this.bio,
    required this.skills,
    required this.rating,
    required this.completedProjects,
    required this.workHistory,
    required this.certifications,
    required this.reviews,
  });

  factory PortfolioModel.fromJson(Map<String, dynamic> json) => PortfolioModel(
        id: json['id'] as String,
        specialistId: json['specialistId'] as String,
        bio: json['bio'] as String? ?? '',
        skills: (json['skills'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
        rating: double.parse((json['rating'] ?? 0).toString()),
        completedProjects: json['completedProjects'] as int? ?? 0,
        workHistory: (json['workHistory'] as List<dynamic>?)
                ?.map((e) =>
                    WorkHistoryModel.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
        certifications: (json['certifications'] as List<dynamic>?)
                ?.map((e) =>
                    CertificationModel.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
        reviews: (json['reviews'] as List<dynamic>?)
                ?.map((e) => ReviewModel.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
      );
}

// ─── Resumo do especialista para listagem ─────────────────────────────────────

class SpecialistSummaryModel {
  final String id;
  final String userId;
  final String name;
  final String bio;
  final List<String> skills;
  final double rating;
  final int completedProjects;

  const SpecialistSummaryModel({
    required this.id,
    required this.userId,
    required this.name,
    required this.bio,
    required this.skills,
    required this.rating,
    required this.completedProjects,
  });

  factory SpecialistSummaryModel.fromJson(Map<String, dynamic> json) =>
      SpecialistSummaryModel(
        id: json['id'] as String,
        userId: json['userId'] as String,
        name: json['name'] as String? ?? 'Especialista',
        bio: json['bio'] as String? ?? '',
        skills: (json['skills'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
        rating: double.parse((json['rating'] ?? 0).toString()),
        completedProjects: json['completedProjects'] as int? ?? 0,
      );
}
