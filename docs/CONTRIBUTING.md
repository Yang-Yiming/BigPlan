# Contributing to BigPlans

Thank you for your interest in contributing to BigPlans! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How to Contribute](#how-to-contribute)
4. [Development Workflow](#development-workflow)
5. [Coding Standards](#coding-standards)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Testing](#testing)
9. [Documentation](#documentation)
10. [Community](#community)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**
- Harassment, trolling, or derogatory comments
- Publishing others' private information
- Unprofessional or unwelcoming conduct
- Any form of discrimination

### Enforcement

Violations may result in temporary or permanent ban from the project. Report issues to project maintainers.

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** 18 or higher
- **npm** or **pnpm**
- **Git** for version control
- **Code editor** (VS Code recommended)
- **GitHub account**

### Fork and Clone

1. **Fork the repository** on GitHub
   - Click "Fork" button in top right

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/BigPlans.git
   cd BigPlans
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/BigPlans.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

6. **Initialize database**
   ```bash
   npm run db:push
   ```

7. **Start development servers**
   ```bash
   # Terminal 1
   npm run dev:server

   # Terminal 2
   npm run dev
   ```

8. **Verify everything works**
   - Open http://localhost:5173
   - Register an account
   - Create a task
   - Everything working? You're ready!

---

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

#### 1. Bug Reports

Found a bug? Please report it!

**Before reporting:**
- Check if it's already reported in [Issues](https://github.com/your-org/BigPlans/issues)
- Try to reproduce on latest version
- Gather relevant information

**What to include:**
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (browser, OS, Node version)
- Error messages or logs

**Template:**
```markdown
**Bug Description**
A clear description of the bug.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- Browser: Chrome 120
- OS: macOS 14
- Node: 20.10.0

**Screenshots**
[If applicable]
```

#### 2. Feature Requests

Have an idea? We'd love to hear it!

**Before requesting:**
- Check if it's already requested
- Think about how it fits the project
- Consider if it benefits most users

**What to include:**
- Problem you're trying to solve
- Proposed solution
- Alternative solutions considered
- Additional context

**Template:**
```markdown
**Feature Description**
Clear description of the feature.

**Problem**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives**
What other options did you consider?

**Additional Context**
Mockups, examples, etc.
```

#### 3. Code Contributions

Ready to write code? Great!

**Good first issues:**
- Look for `good-first-issue` label
- These are beginner-friendly
- Maintainers will guide you

**Areas to contribute:**
- Bug fixes
- New features
- Performance improvements
- UI/UX enhancements
- Documentation
- Tests

#### 4. Documentation

Documentation is crucial!

**What you can improve:**
- Fix typos or unclear explanations
- Add examples
- Write tutorials
- Translate to other languages
- Create video guides

#### 5. Design

Designers welcome!

**Contribute:**
- UI mockups
- UX improvements
- Icons and graphics
- Accessibility enhancements

---

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/amazing-feature

# Or for bug fix
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

**Examples:**
```bash
feature/task-templates
fix/recurring-task-generation
docs/api-examples
refactor/auth-service
test/task-api-endpoints
chore/update-dependencies
```

### 2. Make Changes

**Follow these principles:**
- Make focused, single-purpose changes
- Write clean, readable code
- Add comments for complex logic
- Follow existing code style
- Test your changes thoroughly

**While coding:**
```bash
# Run dev servers
npm run dev:server
npm run dev

# Check linting as you go
npm run lint

# Format code
npm run format
```

### 3. Test Your Changes

**Manual testing:**
- Test the specific feature/fix
- Test related features (don't break existing functionality)
- Test on different browsers if UI change
- Test edge cases

**Automated testing:**
```bash
# Run existing tests
npx tsx test-auth.ts
npx tsx test-tasks.ts

# Add new tests if needed
```

### 4. Commit Your Changes

See [Commit Guidelines](#commit-guidelines) below for details.

```bash
git add .
git commit -m "feat: add task templates feature"
```

### 5. Push to Your Fork

```bash
git push origin feature/amazing-feature
```

### 6. Create Pull Request

See [Pull Request Process](#pull-request-process) below.

---

## Coding Standards

### TypeScript

**General guidelines:**
- Use TypeScript for all new code
- Avoid `any` type - use proper types
- Export types for reusability
- Use interfaces for objects

**Example:**
```typescript
// ✅ Good
interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
}

function createTask(data: Omit<Task, 'id'>): Task {
  return {
    id: generateId(),
    ...data,
  };
}

// ❌ Bad
function createTask(data: any) {
  return {
    id: generateId(),
    ...data,
  };
}
```

### React Components

**Component structure:**
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { TaskCard } from '../components/TaskCard';
import { taskService } from '../services/task.service';

// 2. Types/Interfaces
interface TaskListProps {
  date: string;
  userId: number;
}

// 3. Component
export function TaskList({ date, userId }: TaskListProps) {
  // 3a. State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // 3b. Effects
  useEffect(() => {
    loadTasks();
  }, [date]);

  // 3c. Functions
  const loadTasks = async () => {
    // ...
  };

  // 3d. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

**Best practices:**
- Use functional components
- Extract complex logic to hooks
- Keep components focused (single responsibility)
- Use meaningful prop names
- Provide prop types

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Variables** | camelCase | `const userName = 'John'` |
| **Constants** | UPPER_SNAKE_CASE | `const MAX_TASKS = 100` |
| **Functions** | camelCase | `function loadTasks() {}` |
| **Components** | PascalCase | `function TaskCard() {}` |
| **Interfaces** | PascalCase | `interface Task {}` |
| **Types** | PascalCase | `type TaskStatus = 'pending'` |
| **Files** | kebab-case | `task-service.ts` |
| **Directories** | kebab-case | `task-components/` |

### File Organization

**Frontend structure:**
```
src/
├── components/       # Reusable components
│   └── TaskCard.tsx
├── pages/           # Page components
│   └── HomePage.tsx
├── services/        # API services
│   └── task.service.ts
├── hooks/           # Custom hooks
│   └── useAuth.ts
├── contexts/        # React contexts
│   └── AuthContext.tsx
├── types/           # Type definitions
│   └── task.ts
├── utils/           # Utility functions
│   └── date.ts
└── lib/             # Library configs
    └── api-client.ts
```

**Backend structure:**
```
src/server/
├── routes/          # Route handlers
│   └── tasks.ts
├── middleware/      # Middleware
│   └── auth.ts
└── utils/           # Server utilities
    └── jwt.ts
```

### Code Style

**Use ESLint and Prettier:**
```bash
# Check linting
npm run lint

# Auto-fix
npm run lint:fix

# Format code
npm run format
```

**Key rules:**
- **Indentation:** 2 spaces
- **Quotes:** Single quotes for strings
- **Semicolons:** Yes
- **Trailing commas:** Yes
- **Max line length:** 100 characters
- **Arrow functions:** Prefer over function expressions

### Comments

**When to comment:**
- Complex algorithms
- Non-obvious logic
- Workarounds or hacks
- TODO items

**When NOT to comment:**
- Obvious code
- Redundant explanations

**Examples:**
```typescript
// ✅ Good - Explains WHY
// Using setTimeout to defer execution until after React's batch update
setTimeout(() => updateState(), 0);

// ✅ Good - Documents complex logic
/**
 * Generates recurring task instances for a date range
 * Supports daily, weekly, and monthly frequencies
 * @param task - The recurring task template
 * @param startDate - Start of range (ISO format)
 * @param endDate - End of range (ISO format)
 */
function generateRecurringTasks(task, startDate, endDate) {
  // ...
}

// ❌ Bad - States the obvious
// Increment counter by 1
counter = counter + 1;

// ❌ Bad - Redundant
// Get the user's name
const name = user.getName();
```

---

## Commit Guidelines

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add task templates` |
| `fix` | Bug fix | `fix: resolve recurring task generation` |
| `docs` | Documentation | `docs: update API examples` |
| `style` | Code style (formatting) | `style: format with prettier` |
| `refactor` | Code refactoring | `refactor: simplify auth logic` |
| `test` | Add/update tests | `test: add task API tests` |
| `chore` | Maintenance | `chore: update dependencies` |
| `perf` | Performance improvement | `perf: optimize task queries` |

### Scope

Optional, indicates what part of codebase:

- `auth` - Authentication
- `tasks` - Task management
- `kiss` - KISS reflections
- `groups` - Group collaboration
- `comments` - Comments system
- `api` - API endpoints
- `ui` - User interface
- `db` - Database

**Examples:**
```
feat(tasks): add drag-and-drop reordering
fix(auth): resolve token expiration bug
docs(api): add group endpoints examples
refactor(db): optimize query performance
```

### Description

- Use imperative mood: "add" not "added" or "adds"
- Don't capitalize first letter
- No period at the end
- Keep under 72 characters

**Good:**
```
feat: add task templates feature
fix: resolve CORS error on login
docs: update contribution guidelines
```

**Bad:**
```
feat: Added task templates feature.
fix: Fixes the CORS error on login endpoint
docs: Updated the contribution guidelines
```

### Body (Optional)

Provide additional context if needed:

```
feat(tasks): add bulk task operations

Allow users to select multiple tasks and perform batch operations:
- Mark multiple as complete
- Delete multiple tasks
- Move multiple to different date

Closes #123
```

### Footer (Optional)

Reference issues:

```
Fixes #123
Closes #456
Related to #789
```

### Examples

**Simple feature:**
```
feat: add task export to CSV
```

**Bug fix with details:**
```
fix(auth): prevent token refresh loop

The token refresh was triggering infinitely when the server
returned 401. Now we only refresh once and logout on failure.

Fixes #234
```

**Breaking change:**
```
feat(api)!: change task API response format

BREAKING CHANGE: Task API now returns { task: {...} } instead
of direct task object. Update all API calls.

Closes #345
```

---

## Pull Request Process

### Before Creating PR

**Checklist:**
- [ ] Code follows project standards
- [ ] All tests pass
- [ ] Linting passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Commits follow guidelines
- [ ] Branch is up to date with main
- [ ] Changes are tested manually

**Update your branch:**
```bash
git fetch upstream
git rebase upstream/main
# Resolve conflicts if any
git push -f origin feature/your-feature
```

### Creating the PR

1. **Go to your fork on GitHub**

2. **Click "New Pull Request"**

3. **Select branches:**
   - Base: `main` (upstream)
   - Compare: `feature/your-feature` (your fork)

4. **Fill in the template:**

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## How Has This Been Tested?
- [ ] Manual testing
- [ ] Added unit tests
- [ ] Tested on Chrome, Firefox, Safari

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] Tests pass
```

5. **Click "Create Pull Request"**

### After Creating PR

**What happens next:**

1. **Automated checks run**
   - Linting
   - Tests
   - Build verification

2. **Maintainers review**
   - May request changes
   - May ask questions
   - May approve

3. **Address feedback**
   - Make requested changes
   - Push to same branch
   - PR updates automatically

4. **Approval and merge**
   - Once approved, maintainer merges
   - Your contribution is live!

### Responding to Review

**When changes requested:**

```bash
# Make changes
git add .
git commit -m "refactor: address PR review comments"
git push origin feature/your-feature
```

**Tips:**
- Be receptive to feedback
- Ask questions if unclear
- Explain your decisions politely
- Don't take it personally
- Thank reviewers for their time

---

## Testing

### Manual Testing

**Always test:**
- The specific change you made
- Related functionality
- Edge cases
- Different browsers (for UI changes)

**Testing checklist:**
- [ ] Feature works as expected
- [ ] No console errors
- [ ] No broken existing features
- [ ] Works on different screen sizes (responsive)
- [ ] Handles errors gracefully

### Automated Testing

**Run existing tests:**
```bash
npx tsx test-auth.ts
npx tsx test-tasks.ts
npx tsx test-kiss.ts
npx tsx test-db.ts
```

**Add tests for new features:**

Create a test file:
```typescript
// test-feature.ts
import { apiClient } from './src/lib/api-client';

async function testNewFeature() {
  console.log('Testing new feature...');

  try {
    const response = await apiClient.post('/api/new-endpoint', {
      data: 'test'
    });

    if (response.data.success) {
      console.log('✅ Test passed');
    } else {
      console.log('❌ Test failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testNewFeature();
```

Run it:
```bash
npx tsx test-feature.ts
```

---

## Documentation

### When to Update Documentation

Update docs when you:
- Add a new feature
- Change existing behavior
- Add/modify API endpoints
- Change configuration
- Fix a common issue

### What to Document

**README.md:**
- Major features
- Installation steps
- Quick start guide

**docs/API.md:**
- New API endpoints
- Changed request/response formats
- New query parameters

**docs/USER_MANUAL.md:**
- New user-facing features
- Changed workflows
- New keyboard shortcuts

**Code comments:**
- Complex algorithms
- Non-obvious decisions
- Workarounds

### Documentation Style

**Be clear and concise:**
```markdown
# ✅ Good
To create a task, click the "+ New Task" button and fill in the form.

# ❌ Bad
Tasks can be created by clicking on the button that says "+ New Task"
which will open a form that you need to fill in with the task details.
```

**Use examples:**
```markdown
# ✅ Good
**Example:**
\`\`\`typescript
const task = await createTask({
  title: 'Write documentation',
  date: '2025-01-11'
});
\`\`\`

# ❌ Bad
Use the createTask function to create tasks.
```

**Keep it updated:**
- Remove outdated information
- Update screenshots when UI changes
- Verify examples still work

---

## Community

### Communication Channels

- **GitHub Issues:** Bug reports, feature requests
- **GitHub Discussions:** Questions, ideas, general chat
- **Pull Requests:** Code review, technical discussion

### Getting Help

**Stuck? Here's how to get help:**

1. **Check documentation** (`/docs`)
2. **Search existing issues**
3. **Ask in Discussions**
4. **Create an issue** if it's a bug

**When asking for help:**
- Be specific about your problem
- Include relevant code/errors
- Describe what you've tried
- Be patient and respectful

### Recognizing Contributors

We value all contributions! Contributors are:
- Mentioned in release notes
- Listed in CONTRIBUTORS.md
- Thanked in commits

---

## Additional Resources

### Helpful Links

- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **React Documentation:** https://react.dev
- **Drizzle ORM Docs:** https://orm.drizzle.team
- **Conventional Commits:** https://www.conventionalcommits.org/

### Tools We Use

- **Vite:** Build tool
- **ESLint:** Linting
- **Prettier:** Formatting
- **Drizzle Kit:** Database migrations
- **Hono:** Backend framework

### Learning Resources

New to these technologies? Start here:

- **TypeScript:** [TypeScript in 5 minutes](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- **React:** [React Tutorial](https://react.dev/learn)
- **Git:** [Git Handbook](https://guides.github.com/introduction/git-handbook/)

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

## Thank You!

Thank you for contributing to BigPlans! Every contribution, no matter how small, helps make the project better for everyone.

**Happy coding! 🚀**

---

**Questions?** Open an issue or discussion. We're here to help!
