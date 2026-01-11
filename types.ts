
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  REQUIRES_ADJUSTMENT = 'REQUIRES_ADJUSTMENT',
  APPROVED = 'APPROVED'
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD'
}

export interface User {
  id: string;
  username: string;
  password?: string; // Simple mock password storage
  name: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword?: boolean;
  isRoot?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  assignedUsers: string[]; // IDs of users
  comments?: Comment[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: string; // User ID
  dueDate: string;
  comments: Comment[];
  progress: number; // 0-100
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
}
