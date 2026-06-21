import { api } from './client'

export interface BidMilestoneProposal {
  milestoneId: string
  proposedAmount: number
  note?: string
}

export interface Bid {
  id: string
  projectId: string
  specialistId: string
  specialistName?: string
  specialistUserId?: string
  amount: number
  durationDays: number
  proposalText: string
  milestoneProposals: BidMilestoneProposal[]
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
  createdAt: string
}

export interface SubmitBidPayload {
  projectId: string
  amount: number
  durationDays: number
  proposalText: string
  milestoneProposals?: BidMilestoneProposal[]
}

/** Mapeia campos do backend → frontend */
function mapBid(raw: any): Bid {
  return {
    id: raw.id,
    projectId: raw.projectId,
    specialistId: raw.specialistId,
    specialistName: raw.specialistName,
    specialistUserId: raw.specialistUserId,
    amount: raw.proposedBudget ?? raw.amount,
    durationDays: raw.estimatedDuration ?? raw.durationDays,
    proposalText: raw.proposal ?? raw.proposalText,
    milestoneProposals: raw.milestoneProposals ?? [],
    status: raw.status,
    createdAt: raw.createdAt,
  }
}

export const bidsApi = {
  submit: (data: SubmitBidPayload) =>
    api.post<any>(`/bids/project/${data.projectId}`, {
      proposal: data.proposalText,
      proposedBudget: data.amount,
      estimatedDuration: data.durationDays,
      milestoneProposals: data.milestoneProposals,
    }).then(res => ({ ...res, data: mapBid(res.data) })),

  listForProject: (projectId: string) =>
    api.get<any[]>(`/bids/project/${projectId}`)
      .then(res => ({ ...res, data: (res.data ?? []).map(mapBid) })),

  myBids: () =>
    api.get<any[]>('/bids/my-bids')
      .then(res => ({ ...res, data: (res.data ?? []).map(mapBid) })),

  update: (bidId: string, data: { proposal?: string; proposedBudget?: number; estimatedDuration?: number; milestoneProposals?: BidMilestoneProposal[] }) =>
    api.put<any>(`/bids/${bidId}`, data)
      .then(res => ({ ...res, data: mapBid(res.data) })),

  accept: (bidId: string) =>
    api.put<any>(`/bids/${bidId}/accept`)
      .then(res => ({ ...res, data: mapBid(res.data) })),

  reject: (bidId: string) =>
    api.put<any>(`/bids/${bidId}/reject`)
      .then(res => ({ ...res, data: mapBid(res.data) })),

  withdraw: (bidId: string) =>
    api.put<void>(`/bids/${bidId}/withdraw`),
}
