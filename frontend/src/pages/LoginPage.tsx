import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#121212]">
      <div className="w-full max-w-sm bg-[#1E1E1E] border border-zinc-800 rounded-lg p-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-gray-400 mb-8">
          <User className="w-8 h-8" />
        </div>
        
        <div className="w-full space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="Username" 
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex justify-between items-center text-sm px-1">
            <Link to="/signup" className="text-gray-400 hover:text-white transition-colors">Create account</Link>
            <a href="#" className="text-blue-500 hover:text-blue-400 transition-colors">Forgot password?</a>
          </div>
          <Link to="/" className="w-full block">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-3 mt-4 transition-colors">
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
