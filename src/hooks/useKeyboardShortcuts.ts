import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcuts) {
        const {
          key,
          ctrl = false,
          shift = false,
          alt = false,
          meta = false,
          handler,
          preventDefault = true,
        } = shortcut;

        const keyMatch = event.key.toLowerCase() === key.toLowerCase();
        const ctrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shift === event.shiftKey;
        const altMatch = alt === event.altKey;
        const metaMatch = meta === event.metaKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          if (preventDefault) {
            event.preventDefault();
          }
          handler(event);
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

// 预定义的快捷键组合
export const shortcuts = {
  newTask: { key: 'n', ctrl: true, description: '创建新任务' },
  save: { key: 's', ctrl: true, description: '保存' },
  cancel: { key: 'Escape', description: '取消/关闭' },
  search: { key: 'k', ctrl: true, description: '搜索' },
  delete: { key: 'Delete', description: '删除' },
  edit: { key: 'e', ctrl: true, description: '编辑' },
  refresh: { key: 'r', ctrl: true, description: '刷新' },
  help: { key: '?', shift: true, description: '显示帮助' },
  nextDay: { key: 'ArrowRight', ctrl: true, description: '下一天' },
  prevDay: { key: 'ArrowLeft', ctrl: true, description: '上一天' },
  today: { key: 't', ctrl: true, description: '返回今天' },
};
