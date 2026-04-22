import { Injectable } from '@nestjs/common';
import { SpecialistProfileRepository } from '../../infrastructure/repositories/specialist-profile.repository';
import { CertificationRepository } from '../../infrastructure/repositories/certification.repository';
import { ReviewRepository } from '../../infrastructure/repositories/review.repository';
import { WorkHistoryRepository } from '../../infrastructure/repositories/work-history.repository';
import { SpecialistPublicProfile } from '../../domain/entities/specialist-public-profile.entity';

export interface MyPortfolioDto {
  id: string;
  specialistId: string;
  bio: string;
  skills: string[];
  rating: number;
  completedProjects: number;
  certifications: Array<{
    id: string;
    title: string;
    institution: string;
    issuedAt: string;
    credentialUrl: string | null;
  }>;
  reviews: Array<{
    id: string;
    reviewerName: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
  workHistory: Array<{
    id: string;
    projectId: string;
    projectTitle: string;
    companyName: string;
    earnedAmount: number;
    completedAt: string;
  }>;
}

@Injectable()
export class GetMyPortfolioUseCase {
  constructor(
    private readonly profileRepo: SpecialistProfileRepository,
    private readonly certRepo: CertificationRepository,
    private readonly reviewRepo: ReviewRepository,
    private readonly historyRepo: WorkHistoryRepository,
  ) {}

  async execute(specialistId: string): Promise<MyPortfolioDto> {
    let profile = await this.profileRepo.findByUserId(specialistId);
    if (!profile) {
      const blank = new SpecialistPublicProfile();
      blank.userId = specialistId;
      profile = await this.profileRepo.save(blank);
    }

    const [certifications, reviews, history] = await Promise.all([
      this.certRepo.findBySpecialist(specialistId),
      this.reviewRepo.findBySpecialist(specialistId),
      this.historyRepo.findBySpecialist(specialistId),
    ]);

    return {
      id: profile.id,
      specialistId: profile.userId,
      bio: profile.bio ?? '',
      skills: profile.skills ?? [],
      rating: Number(profile.rating ?? 0),
      completedProjects: profile.completedProjects ?? 0,
      certifications: certifications.map((c) => ({
        id: c.id,
        title: c.name,
        institution: c.issuer,
        issuedAt: c.issueDate ? c.issueDate.toISOString() : new Date().toISOString(),
        credentialUrl: c.credentialUrl ?? null,
      })),
      reviews: reviews.map((r) => ({
        id: r.id,
        reviewerName: 'Anônimo',
        rating: Number(r.rating),
        comment: r.comment ?? '',
        createdAt: r.createdAt,
      })),
      workHistory: history.map((h) => ({
        id: h.id,
        projectId: h.projectId,
        projectTitle: h.projectTitle ?? '',
        companyName: h.companyId ?? '',
        earnedAmount: Number(h.amountEarned ?? 0),
        completedAt: h.completedAt ? h.completedAt.toISOString() : '',
      })),
    };
  }
}
