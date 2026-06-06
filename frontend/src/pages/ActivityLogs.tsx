import { CheckCircle2, Clock, FileText, UserPlus } from 'lucide-react';

export function ActivityLogs() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold text-gray-100">Activity & Logs</h1>
        <p className="text-sm text-gray-400 mt-1">Procurement audit trail</p>
      </div>

      <div className="flex gap-2 pb-4">
        {['All', 'RFQ', 'Approvals', 'Invoices', 'Vendors'].map((filter, i) => (
          <button 
            key={i} 
            className={`px-6 py-1.5 rounded-full text-sm font-medium border ${i === 0 ? 'bg-blue-600 border-blue-500 text-white' : 'bg-transparent border-zinc-700 text-gray-400 hover:text-white hover:bg-zinc-800'}`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {[
          {
            icon: CheckCircle2,
            iconColor: "text-emerald-500",
            title: "Quotation selected - Infra supplies pvt ltd selected for office furniture Q2",
            date: "23 may 2025, 9:15 PM"
          },
          {
            icon: Clock,
            iconColor: "text-blue-500",
            title: "Approval pending - PO-2024 awaiting L2 approval by priya shah",
            date: "22 may 2025, 09:15 AM"
          },
          {
            icon: FileText,
            iconColor: "text-gray-300",
            title: "RFQ published - office furniture Q2 sent to 3 vendors",
            date: "19 may 2025"
          },
          {
            icon: UserPlus,
            iconColor: "text-red-400",
            title: "Vendor added - FastLog transport registered and pending verifications",
            date: "18 may, 2025 , 3:20 PM"
          }
        ].map((log, i) => {
          const Icon = log.icon;
          return (
            <div key={i} className="flex gap-4 items-start border-b border-zinc-800 pb-6 last:border-0 hover:bg-zinc-900/30 p-2 -mx-2 rounded transition-colors">
              <div className="bg-zinc-800/50 p-2 rounded-full mt-1 border border-zinc-700/50">
                <Icon className={`w-5 h-5 ${log.iconColor}`} />
              </div>
              <div className="space-y-1">
                <p className="text-gray-200 text-sm leading-relaxed">{log.title}</p>
                <p className="text-xs text-gray-500">{log.date}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
