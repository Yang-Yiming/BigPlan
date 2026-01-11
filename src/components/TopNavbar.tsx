/**
 * 顶部导航栏组件
 * 提供应用标题、群组切换、用户信息和操作按钮
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Group } from '../types/group';

interface TopNavbarProps {
  username: string;
  currentGroup: Group | null;
  availableGroups: Group[];
  isViewingOwnData: boolean;
  currentViewUsername?: string;
  onGroupChange: (groupId: number) => void;
  onLogout: () => void;
  onMobileMenuToggle?: () => void;
}

export function TopNavbar({
  username,
  currentGroup,
  availableGroups,
  isViewingOwnData,
  currentViewUsername,
  onGroupChange,
  onLogout,
  onMobileMenuToggle,
}: TopNavbarProps) {
  const navigate = useNavigate();
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleGroupSelect = (groupId: number) => {
    onGroupChange(groupId);
    setShowGroupSelector(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    onMobileMenuToggle?.();
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 左侧：Logo 和群组选择器 */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* 移动端菜单按钮 */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Logo */}
            <h1 className="text-xl md:text-2xl font-bold text-primary-600 flex items-center gap-2">
              <span className="hidden sm:inline">📋</span>
              BigPlans
            </h1>

            {/* 群组选择器 */}
            {currentGroup && (
              <div className="relative">
                <button
                  onClick={() => setShowGroupSelector(!showGroupSelector)}
                  className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-all duration-200 text-sm md:text-base"
                  aria-label="Select group"
                >
                  <span className="font-medium max-w-[120px] md:max-w-none truncate">
                    {currentGroup.name}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showGroupSelector ? 'rotate-180' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* 群组下拉菜单 */}
                {showGroupSelector && availableGroups.length > 1 && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px] max-w-[300px] z-50 animate-slide-up">
                    {availableGroups.map(group => (
                      <button
                        key={group.id}
                        onClick={() => handleGroupSelect(group.id)}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 text-sm transition-colors ${
                          group.id === currentGroup?.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {group.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 右侧：用户信息和操作按钮 */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* 群组管理按钮（仅在没有群组时显示） */}
            {!currentGroup && (
              <button
                onClick={() => navigate('/groups')}
                className="hidden sm:flex px-3 md:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm md:text-base font-medium shadow-sm"
              >
                群组管理
              </button>
            )}

            {/* 用户信息 */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm text-gray-600">欢迎回来</div>
                <div className="text-sm font-medium text-gray-900">{username}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold shadow-md">
                {username.slice(0, 2).toUpperCase()}
              </div>
            </div>

            {/* 查看提示（移动端隐藏） */}
            {!isViewingOwnData && currentViewUsername && (
              <div className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{currentViewUsername}</span>
              </div>
            )}

            {/* 退出登录按钮 */}
            <button
              onClick={onLogout}
              className="px-3 md:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm md:text-base font-medium"
              title="退出登录"
            >
              <span className="hidden sm:inline">退出</span>
              <span className="sm:hidden">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-slide-up">
          <div className="px-4 py-3 space-y-3">
            {/* 用户信息 */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                {username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{username}</div>
                <div className="text-xs text-gray-500">已登录</div>
              </div>
            </div>

            {/* 查看提示 */}
            {!isViewingOwnData && currentViewUsername && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span>正在查看 <strong>{currentViewUsername}</strong> 的数据</span>
              </div>
            )}

            {/* 群组管理按钮 */}
            {!currentGroup && (
              <button
                onClick={() => {
                  navigate('/groups');
                  setShowMobileMenu(false);
                }}
                className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                群组管理
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
