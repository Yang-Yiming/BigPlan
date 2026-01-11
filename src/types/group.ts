/**
 * 群组相关类型定义
 */

export interface Group {
  id: number;
  name: string;
  description?: string | null;
  ownerId: number;
  inviteCode?: string; // 群组邀请码
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface GroupMember {
  id: number;
  groupId: number;
  userId: number;
  username: string;
  avatarUrl?: string | null;
  role: MemberRole;
  joinedAt: Date | string;
}

export type MemberRole = 'owner' | 'member';

export interface CreateGroupInput {
  name: string;
  description?: string;
}

export interface JoinGroupInput {
  inviteCode: string;
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
}

export interface GroupInvite {
  groupId: number;
  code: string;
  expiresAt?: Date | string | null;
}

export interface GroupMemberSettings {
  userId: number;
  showKiss: boolean; // KISS 表显示/隐藏设置
}
