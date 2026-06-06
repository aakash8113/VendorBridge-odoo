import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#121212]">
      <div className="w-full max-w-2xl bg-[#1E1E1E] border border-zinc-800 rounded-lg p-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-gray-400 mb-8">
          <User className="w-8 h-8" />
        </div>
        
        <div className="w-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="First Name" 
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
            />
            <input 
              type="text" 
              placeholder="Last Name" 
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
            />
            <input 
              type="tel" 
              placeholder="Phone Number" 
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
            />
            <input 
              type="text" 
              placeholder="Role (Admin, officer)" 
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
            />
            <input 
              type="text" 
              placeholder="Country" 
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <textarea 
            placeholder="Additional Information ...." 
            rows={4}
            className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors resize-none"
          ></textarea>
          
          <div className="flex flex-col items-center gap-4 pt-4">
            <Link to="/login" className="w-full max-w-[200px] block">
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg px-4 py-3 transition-colors">
                Register
              </button>
            </Link>
            <div className="text-sm text-gray-400">
              Already have an account? <Link to="/login" className="text-blue-500 hover:text-blue-400">Login here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
