import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ username, password });
      navigate('/');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { error?: string } } };
        setError(error.response?.data?.error || 'Login failed');
      } else {
        setError('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-vanilla-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-vanilla-900 mb-2 tracking-tight">PlanCake 🥞</h1>
          <h2 className="text-xl font-medium text-neutral-600 tracking-tight">
            Sign in to your account
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-maple-200 p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-neutral-900 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-maple-300 rounded-xl focus:ring-2 focus:ring-vanilla-400 focus:border-vanilla-400 outline-none transition-all duration-200 text-neutral-900"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-900 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-maple-300 rounded-xl focus:ring-2 focus:ring-vanilla-400 focus:border-vanilla-400 outline-none transition-all duration-200 text-neutral-900"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-br from-vanilla-600 to-vanilla-700 hover:from-vanilla-700 hover:to-vanilla-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] active:scale-[0.98] tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-vanilla-700 hover:text-vanilla-800 font-medium"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
