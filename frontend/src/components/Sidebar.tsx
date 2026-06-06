import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquareQuote, 
  CheckSquare, 
  ShoppingCart, 
  Receipt, 
  BarChart3, 
  Activity 
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  roles: string[]; // Which roles can see this item
}

const allNavItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'VENDOR'] },
  { name: 'Vendors', path: '/vendors', icon: Users, roles: ['ADMIN', 'PROCUREMENT_OFFICER'] },
  { name: "RFQ's", path: '/rfqs', icon: FileText, roles: ['ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'VENDOR'] },
  { name: 'Quotations', path: '/quotations', icon: MessageSquareQuote, roles: ['VENDOR'] },
  { name: 'Compare Quotes', path: '/compare', icon: MessageSquareQuote, roles: ['ADMIN', 'PROCUREMENT_OFFICER'] },
  { name: 'Approvals', path: '/approvals', icon: CheckSquare, roles: ['MANAGER', 'ADMIN'] },
  { name: 'Purchase orders', path: '/purchase-orders', icon: ShoppingCart, roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR'] },
  { name: 'Invoices', path: '/invoices', icon: Receipt, roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR'] },
  { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['ADMIN'] },
  { name: 'Activity', path: '/activity', icon: Activity, roles: ['ADMIN'] },
];

// Get visible nav items based on user role
function getVisibleNavItems(role: string): NavItem[] {
  return allNavItems.filter(item => item.roles.includes(role));
}

export function Sidebar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role: string = user.role || '';
  const navItems = getVisibleNavItems(role);

  return (
    <div className="w-64 h-screen bg-[#0A0A0A] border-r border-zinc-800 flex flex-col fixed top-0 left-0">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
          <div className="w-2 h-6 bg-emerald-500 rounded-sm"></div>
          VendorBridge
        </h1>
      </div>
      <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-emerald-900/20 text-emerald-500 border border-emerald-900/50" 
                  : "text-gray-400 hover:text-gray-200 hover:bg-zinc-800/50 border border-transparent"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}