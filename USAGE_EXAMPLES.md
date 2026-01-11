# UI/UX 优化功能使用示例

## 快速开始

所有的 UI/UX 优化功能已经集成到项目中，以下是各个功能的使用示例。

## 1. Toast 通知

```tsx
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast('操作成功！', 'success', 3000);
  };

  const handleError = () => {
    showToast('操作失败，请重试', 'error');
  };

  const handleWarning = () => {
    showToast('请注意这个警告', 'warning');
  };

  const handleInfo = () => {
    showToast('这是一条提示信息', 'info', 5000);
  };

  return (
    <div>
      <button onClick={handleSuccess}>成功通知</button>
      <button onClick={handleError}>错误通知</button>
      <button onClick={handleWarning}>警告通知</button>
      <button onClick={handleInfo}>信息通知</button>
    </div>
  );
}
```

## 2. 确认对话框

```tsx
import { useConfirm } from '../contexts/ConfirmDialogContext';
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
  const { confirm } = useConfirm();
  const { showToast } = useToast();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: '删除确认',
      message: '确定要删除这个项目吗？此操作无法撤销。',
      confirmText: '删除',
      cancelText: '取消',
      type: 'danger',
    });

    if (confirmed) {
      // 执行删除操作
      await deleteItem();
      showToast('删除成功', 'success');
    }
  };

  return <button onClick={handleDelete}>删除</button>;
}
```

## 3. 表单验证

```tsx
import { useFormValidation, validators } from '../hooks';
import { FormField } from '../components';

function MyForm() {
  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useFormValidation(
      {
        username: '',
        email: '',
        age: 0,
      },
      {
        username: [
          validators.required('用户名不能为空'),
          validators.minLength(3, '用户名至少3个字符'),
          validators.maxLength(20, '用户名最多20个字符'),
        ],
        email: [
          validators.required('邮箱不能为空'),
          validators.email('请输入有效的邮箱地址'),
        ],
        age: [
          validators.required('年龄不能为空'),
          validators.min(18, '必须年满18岁'),
          validators.max(120, '年龄不合法'),
        ],
      }
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateAll()) {
      // 验证通过，提交表单
      await submitForm(values);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="用户名"
        error={errors.username}
        touched={touched.username}
        required
      >
        <input
          type="text"
          value={values.username}
          onChange={(e) => handleChange('username')(e.target.value)}
          onBlur={handleBlur('username')}
          className="w-full px-3 py-2 border rounded"
        />
      </FormField>

      <FormField
        label="邮箱"
        error={errors.email}
        touched={touched.email}
        required
      >
        <input
          type="email"
          value={values.email}
          onChange={(e) => handleChange('email')(e.target.value)}
          onBlur={handleBlur('email')}
          className="w-full px-3 py-2 border rounded"
        />
      </FormField>

      <FormField
        label="年龄"
        error={errors.age}
        touched={touched.age}
        required
        helpText="必须年满18岁"
      >
        <input
          type="number"
          value={values.age}
          onChange={(e) => handleChange('age')(Number(e.target.value))}
          onBlur={handleBlur('age')}
          className="w-full px-3 py-2 border rounded"
        />
      </FormField>

      <button type="submit">提交</button>
    </form>
  );
}
```

## 4. 快捷键

```tsx
import { useState } from 'react';
import { useKeyboardShortcuts, shortcuts } from '../hooks';
import { ShortcutHelp } from '../components';

function MyPage() {
  const [showHelp, setShowHelp] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useKeyboardShortcuts([
    {
      ...shortcuts.newTask,
      handler: () => setShowForm(true),
    },
    {
      ...shortcuts.cancel,
      handler: () => setShowForm(false),
    },
    {
      key: '?',
      shift: true,
      handler: () => setShowHelp(true),
      description: '显示快捷键帮助',
    },
  ]);

  return (
    <div>
      <h1>我的页面</h1>
      <p>按 Ctrl+N 创建新任务</p>
      <p>按 ? 查看所有快捷键</p>

      {showForm && <TaskForm />}
      <ShortcutHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
```

## 5. 拖拽排序

```tsx
import { useState } from 'react';
import { useDragAndDrop } from '../hooks';

interface Task {
  id: number;
  title: string;
  order: number;
}

function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: '任务 1', order: 0 },
    { id: 2, title: '任务 2', order: 1 },
    { id: 3, title: '任务 3', order: 2 },
  ]);

  const { getDragHandleProps } = useDragAndDrop(tasks, (reorderedTasks) => {
    setTasks(reorderedTasks);
    // 可选：保存到后端
    // await saveTaskOrder(reorderedTasks);
  });

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          {...getDragHandleProps(task)}
          className="p-4 bg-white rounded-lg shadow cursor-move"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <span>{task.title}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## 组合使用示例

```tsx
import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmDialogContext';
import { useKeyboardShortcuts, shortcuts, useDragAndDrop } from '../hooks';

function AdvancedTaskList() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // 拖拽排序
  const { getDragHandleProps } = useDragAndDrop(tasks, async (reorderedTasks) => {
    setTasks(reorderedTasks);
    await saveTaskOrder(reorderedTasks);
    showToast('顺序已更新', 'success', 2000);
  });

  // 快捷键
  useKeyboardShortcuts([
    {
      ...shortcuts.newTask,
      handler: () => setShowForm(true),
    },
    {
      ...shortcuts.cancel,
      handler: () => setShowForm(false),
    },
  ]);

  // 删除任务
  const handleDelete = async (taskId: number) => {
    const confirmed = await confirm({
      title: '删除任务',
      message: '确定要删除这个任务吗？',
      type: 'danger',
    });

    if (confirmed) {
      try {
        await deleteTask(taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
        showToast('任务已删除', 'success');
      } catch (error) {
        showToast('删除失败', 'error');
      }
    }
  };

  return (
    <div>
      <button onClick={() => setShowForm(true)}>
        新建任务 (Ctrl+N)
      </button>

      <div className="mt-4 space-y-2">
        {tasks.map(task => (
          <div key={task.id} {...getDragHandleProps(task)}>
            <TaskCard task={task} onDelete={handleDelete} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 最佳实践

### 1. Toast 使用建议
- ✅ 成功操作：简短的确认消息，2-3秒后自动消失
- ✅ 错误信息：稍长的错误描述，3-5秒后消失
- ✅ 警告信息：需要用户注意的提示，5秒后消失
- ❌ 避免：过于频繁的通知会打扰用户

### 2. 确认对话框建议
- ✅ 危险操作（删除、清空）：使用 type='danger'
- ✅ 重要操作（保存、发布）：使用 type='warning'
- ✅ 普通提示：使用 type='info'
- ❌ 避免：过度使用确认框会降低用户体验

### 3. 表单验证建议
- ✅ 实时验证：在 onBlur 时验证，提供即时反馈
- ✅ 提交验证：在提交时使用 validateAll() 确保所有字段有效
- ✅ 错误提示：清晰明确的错误消息
- ❌ 避免：在用户输入时立即显示错误（等待 blur 事件）

### 4. 快捷键建议
- ✅ 使用标准快捷键（Ctrl+S 保存，Esc 取消）
- ✅ 提供快捷键帮助（? 键）
- ✅ 在按钮上显示快捷键提示
- ❌ 避免：与浏览器快捷键冲突

### 5. 拖拽建议
- ✅ 提供清晰的拖拽手柄（图标）
- ✅ 拖拽时提供视觉反馈
- ✅ 拖拽完成后提示用户
- ❌ 避免：在移动端使用（需要额外处理触摸事件）
