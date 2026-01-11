/**
 * 群组相关 API 服务
 */

import { apiClient } from '../lib/api-client';
import type {
  Group,
  GroupMember,
  CreateGroupInput,
  JoinGroupInput,
  GroupWithMembers,
  GroupInvite,
} from '../types/group';

interface GroupsResponse {
  groups: Group[];
}

interface GroupResponse {
  group: GroupWithMembers;
}

interface GroupMembersResponse {
  members: GroupMember[];
}

interface GroupInviteResponse {
  invite: GroupInvite;
}

export const groupService = {
  /**
   * 获取当前用户的所有群组
   */
  async getMyGroups(): Promise<Group[]> {
    const response = await apiClient.get<GroupsResponse>('/groups');
    return response.data.groups;
  },

  /**
   * 获取指定群组详情（包含成员信息）
   */
  async getGroup(groupId: number): Promise<GroupWithMembers> {
    const response = await apiClient.get<GroupResponse>(`/groups/${groupId}`);
    return response.data.group;
  },

  /**
   * 创建新群组
   */
  async createGroup(data: CreateGroupInput): Promise<GroupWithMembers> {
    const response = await apiClient.post<GroupResponse>('/groups', data);
    return response.data.group;
  },

  /**
   * 通过邀请码加入群组
   */
  async joinGroup(data: JoinGroupInput): Promise<GroupWithMembers> {
    const response = await apiClient.post<GroupResponse>('/groups/join', data);
    return response.data.group;
  },

  /**
   * 获取群组成员列表
   */
  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    const response = await apiClient.get<GroupMembersResponse>(
      `/groups/${groupId}/members`
    );
    return response.data.members;
  },

  /**
   * 生成群组邀请码
   */
  async generateInviteCode(groupId: number): Promise<GroupInvite> {
    const response = await apiClient.post<GroupInviteResponse>(
      `/groups/${groupId}/invite`
    );
    return response.data.invite;
  },

  /**
   * 离开群组
   */
  async leaveGroup(groupId: number): Promise<void> {
    await apiClient.post(`/groups/${groupId}/leave`);
  },

  /**
   * 删除群组（仅群主）
   */
  async deleteGroup(groupId: number): Promise<void> {
    await apiClient.delete(`/groups/${groupId}`);
  },

  /**
   * 移除群组成员（仅群主）
   */
  async removeMember(groupId: number, userId: number): Promise<void> {
    await apiClient.delete(`/groups/${groupId}/members/${userId}`);
  },
};
