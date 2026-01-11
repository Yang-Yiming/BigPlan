/**
 * 成员头像列表组件
 * 用于显示群组成员的头像，支持点击切换查看不同成员的数据
 */

import { useState } from 'react';
import type { GroupMember } from '../types/group';

interface MemberAvatarListProps {
  members: GroupMember[];
  currentUserId: number | null;
  selectedMemberId: number | null;
  onMemberSelect: (memberId: number | null) => void;
  memberKissSettings: Map<number, boolean>; // userId -> showKiss
  onToggleKiss: (userId: number) => void;
}

export function MemberAvatarList({
  members,
  currentUserId,
  selectedMemberId,
  onMemberSelect,
  memberKissSettings,
  onToggleKiss,
}: MemberAvatarListProps) {
  const [showSettings, setShowSettings] = useState(false);

  const handleAvatarClick = (memberId: number) => {
    if (selectedMemberId === memberId) {
      // 如果点击的是当前选中的成员，则切换回查看自己的数据
      onMemberSelect(null);
    } else {
      onMemberSelect(memberId);
    }
  };

  const getAvatarInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (userId: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    return colors[userId % colors.length];
  };

  return (
    <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-20 bg-gray-100 border-r border-gray-300 flex flex-col items-center py-4 space-y-3 overflow-y-auto">
      {/* 自己的头像始终在最上方 */}
      {currentUserId && (
        <div
          className={`relative cursor-pointer transition-transform hover:scale-110 ${
            selectedMemberId === null ? 'ring-4 ring-blue-400' : ''
          }`}
          onClick={() => onMemberSelect(null)}
          title="查看我的数据"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md ${getAvatarColor(
              currentUserId
            )}`}
          >
            我
          </div>
          {selectedMemberId === null && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
          )}
        </div>
      )}

      {/* 分隔线 */}
      {members.length > 0 && (
        <div className="w-12 h-px bg-gray-300 my-2"></div>
      )}

      {/* 其他成员头像 */}
      {members
        .filter((member) => member.userId !== currentUserId)
        .map((member) => {
          const isSelected = selectedMemberId === member.userId;
          const showKiss = memberKissSettings.get(member.userId) ?? true;

          return (
            <div key={member.id} className="relative group">
              <div
                className={`relative cursor-pointer transition-transform hover:scale-110 ${
                  isSelected ? 'ring-4 ring-blue-400' : ''
                }`}
                onClick={() => handleAvatarClick(member.userId)}
                title={`查看 ${member.username} 的数据`}
              >
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.username}
                    className="w-12 h-12 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md ${getAvatarColor(
                      member.userId
                    )}`}
                  >
                    {getAvatarInitials(member.username)}
                  </div>
                )}
                {isSelected && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* KISS 显示/隐藏控制 */}
              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleKiss(member.userId);
                  }}
                  className="absolute -right-1 top-0 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center text-xs hover:bg-gray-100 transition-colors"
                  title={showKiss ? '隐藏 KISS 复盘' : '显示 KISS 复盘'}
                >
                  {showKiss ? '👁' : '🚫'}
                </button>
              )}

              {/* 悬停显示用户名 */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-800 text-white text-sm px-2 py-1 rounded whitespace-nowrap">
                  {member.username}
                  {member.role === 'owner' && (
                    <span className="ml-1 text-yellow-400">👑</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

      {/* 设置按钮 */}
      <div className="mt-auto pt-4 border-t border-gray-300 w-full flex justify-center">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
          title="群组设置"
        >
          ⚙️
        </button>
      </div>

      {/* 设置面板（简化版，后续可扩展） */}
      {showSettings && (
        <div className="absolute left-full ml-2 bottom-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-48 z-50">
          <div className="text-sm font-semibold mb-2">群组设置</div>
          <button
            onClick={() => {
              setShowSettings(false);
              // 这里可以跳转到群组管理页面
              window.location.href = '/groups';
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
          >
            管理群组
          </button>
          <button
            onClick={() => setShowSettings(false)}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm text-gray-600 mt-1"
          >
            关闭
          </button>
        </div>
      )}
    </div>
  );
}
