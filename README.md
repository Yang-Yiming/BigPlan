# BigPlans

A modern full-stack project management application.

## Frontend

Built with Vite, React, TypeScript, and Tailwind CSS.

### Tech Stack

- **Vite** - Fast build tool and dev server
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Features

- User authentication (login/register)
- Protected routes
- Automatic token refresh
- Persistent authentication state
- Modern, responsive UI

### Project Structure

```
src/
├── components/      # Reusable React components
│   └── ProtectedRoute.tsx
├── contexts/        # React contexts
│   └── AuthContext.tsx
├── pages/          # Page components
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── services/       # API service modules
│   └── auth.service.ts
├── lib/            # Library configurations
│   └── api-client.ts
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
│   └── auth.ts
├── utils/          # Utility functions
└── db/             # Database schema and client
```

### Getting Started

#### Install dependencies

```bash
npm install
```

#### Environment Setup

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Update the `VITE_API_BASE_URL` with your API endpoint.

#### Development

```bash
npm run dev
```

#### Build

```bash
npm run build
```

#### Preview production build

```bash
npm run preview
```

### Code Quality

#### Linting

```bash
# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix
```

#### Formatting

```bash
# Check code formatting
npm run format:check

# Format code
npm run format
```

### Configuration Files

- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `eslint.config.js` - ESLint configuration
- `.prettierrc` - Prettier configuration

## Authentication System

The application includes a complete authentication system with the following components:

### Components

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Manages global authentication state
   - Provides `useAuth()` hook for accessing auth state and methods
   - Handles automatic token verification on app load

2. **API Client** (`src/lib/api-client.ts`)
   - Axios instance with request/response interceptors
   - Automatically attaches Bearer tokens to requests
   - Handles 401 unauthorized responses

3. **Auth Service** (`src/services/auth.service.ts`)
   - Handles login, register, and token verification
   - Manages localStorage for token and user data
   - Provides helper methods for authentication checks

4. **Protected Routes** (`src/components/ProtectedRoute.tsx`)
   - Protects routes that require authentication
   - Redirects unauthenticated users to login
   - Shows loading state during authentication check

### Usage

#### Using the Auth Hook

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  // Access current user
  console.log(user?.username);

  // Check authentication status
  if (isAuthenticated) {
    // User is logged in
  }

  // Login
  await login({ username: 'user', password: 'pass' });

  // Logout
  logout();
}
```

#### Protected Routes

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
  </Route>
</Routes>
```

#### API Calls

The API client automatically includes authentication tokens:

```tsx
import { apiClient } from '../lib/api-client';

// Token is automatically included in Authorization header
const response = await apiClient.get('/api/protected-resource');
```

### Authentication Flow

1. User visits the app
2. AuthProvider checks for cached token and verifies it
3. If valid, user is automatically logged in
4. If invalid or missing, user sees login page
5. After successful login, token is stored in localStorage
6. All API requests include the token in headers
7. On 401 response, user is logged out and redirected to login
