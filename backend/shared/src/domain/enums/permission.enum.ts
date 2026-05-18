export enum Permission {
  // Identity
  USERS_READ = 'users:read',
  USERS_WRITE = 'users:write',
  USERS_DELETE = 'users:delete',

  // Projects
  PROJECTS_READ = 'projects:read',
  PROJECTS_CREATE = 'projects:create',
  PROJECTS_UPDATE = 'projects:update',
  PROJECTS_DELETE = 'projects:delete',

  // Milestones
  MILESTONES_READ = 'milestones:read',
  MILESTONES_CREATE = 'milestones:create',
  MILESTONES_UPDATE = 'milestones:update',

  // Bids
  BIDS_READ = 'bids:read',
  BIDS_CREATE = 'bids:create',
  BIDS_ACCEPT = 'bids:accept',
  BIDS_REJECT = 'bids:reject',
  BIDS_WITHDRAW = 'bids:withdraw',

  // Deliveries
  DELIVERIES_READ = 'deliveries:read',
  DELIVERIES_CREATE = 'deliveries:create',
  DELIVERIES_UPDATE = 'deliveries:update',

  // Payments
  PAYMENTS_READ = 'payments:read',
  PAYMENTS_CREATE = 'payments:create',
  PAYMENTS_UPDATE = 'payments:update',

  // Portfolio
  PORTFOLIO_READ = 'portfolio:read',
  PORTFOLIO_WRITE = 'portfolio:write',
}
