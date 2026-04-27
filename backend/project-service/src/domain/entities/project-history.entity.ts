import { ProjectHistoryAction } from '../enums/project-history-action.enum';

export class ProjectHistory {
  id: string;
  projectId: string;
  action: ProjectHistoryAction;
  description: string;
  createdAt: Date;
}
