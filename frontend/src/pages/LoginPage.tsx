import { User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { apiFetch } from '../lib/api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/'); // Redirect to dashboard
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#121212]">
      <div className="w-full max-w-sm bg-[#1E1E1E] border border-zinc-800 rounded-lg p-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-gray-400 mb-8">
          <User className="w-8 h-8" />
        </div>
        
        <form onSubmit={handleLogin} className="w-full space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div>
            <input 
              type="text" 
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex justify-between items-center text-sm px-1">
            <Link to="/signup" className="text-gray-400 hover:text-white transition-colors">Create account</Link>
            <a href="#" className="text-blue-500 hover:text-blue-400 transition-colors">Forgot password?</a>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-3 mt-4 transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
