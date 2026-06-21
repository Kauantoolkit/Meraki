import { Injectable, NotFoundException } from '@nestjs/common';
import { SpecialistProfileRepository } from '../../infrastructure/repositories/specialist-profile.repository';
import { WorkHistoryRepository } from '../../infrastructure/repositories/work-history.repository';
import { ReviewRepository } from '../../infrastructure/repositories/review.repository';
import { CertificationRepository } from '../../infrastructure/repositories/certification.repository';

@Injectable()
export class GetPublicProfileUseCase {
  constructor(
    private readonly profileRepo: SpecialistProfileRepository,
    private readonly historyRepo: WorkHistoryRepository,
    private readonly reviewRepo: ReviewRepository,
    private readonly certRepo: CertificationRepository,
  ) {}

  async getSpecialistProfile(userId: string) {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) throw new NotFoundException('Perfil não encontrado');

    // Related data is indexed by identity's specialistId, not userId
    const lookupId = profile.identitySpecialistId || userId;

    const [history, reviews, certifications] = await Promise.all([
      this.historyRepo.findBySpecialist(lookupId),
      this.reviewRepo.findBySpecialist(lookupId),
      this.certRepo.findBySpecialist(lookupId),
    ]);

    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.name ?? '',
      bio: profile.bio ?? '',
      skills: profile.skills ?? [],
      skillBadges: profile.skillBadges ?? {},
      links: profile.links ?? [],
      rating: Number(profile.rating ?? 0),
      completedProjects: profile.completedProjects ?? 0,
      avatarUrl: profile.avatarUrl ?? null,
      workHistory: history.map((h) => ({
        projectId: h.projectId,
        projectTitle: h.projectTitle ?? '',
        companyName: h.companyId ?? '',
        completedAt: h.completedAt ? h.completedAt.toISOString() : '',
        amount: Number(h.amountEarned ?? 0),
      })),
      reviews: reviews.map((r) => ({
        id: r.id,
        projectId: r.projectId,
        rating: Number(r.rating),
        comment: r.comment ?? '',
        createdAt: r.createdAt,
      })),
      certifications: certifications.map((c) => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        issueDate: c.issueDate ? c.issueDate.toISOString() : null,
        credentialUrl: c.credentialUrl ?? null,
      })),
    };
  }

  getAllSpecialists() {
    return this.profileRepo.findAll();
  }

  getWorkHistory(specialistId: string) {
    return this.historyRepo.findBySpecialist(specialistId);
  }
}
