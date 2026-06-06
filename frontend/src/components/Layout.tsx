import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { User, LogOut } from 'lucide-react';

export function Layout() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <header className="h-20 px-8 flex items-center justify-end">
          <button onClick={handleLogout} title="Logout" className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-700 flex items-center justify-center text-gray-400">
            <LogOut className="w-5 h-5" />
          </button>
        </header>
        <main className="flex-1 px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
