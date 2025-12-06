const gradients = {
  indigo: 'from-indigo-500 to-purple-500',
  emerald: 'from-emerald-500 to-teal-500',
  blue: 'from-blue-500 to-cyan-500',
  purple: 'from-purple-500 to-pink-500',
  amber: 'from-amber-500 to-orange-500',
};

const bgColors = {
  indigo: 'bg-indigo-50',
  emerald: 'bg-emerald-50',
  blue: 'bg-blue-50',
  purple: 'bg-purple-50',
  amber: 'bg-amber-50',
};

const iconColors = {
  indigo: 'text-indigo-600',
  emerald: 'text-emerald-600',
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  amber: 'text-amber-600',
};

export default function StatCard({ title, value, icon: Icon, color = 'indigo', trend, subtitle }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover group">
      <div className="flex items-start justify-between">
        <div className={`w-14 h-14 ${bgColors[color]} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-7 h-7 ${iconColors[color]}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full ${
            trend > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
          }`}>
            <svg className={`w-4 h-4 ${trend > 0 ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div className="mt-5">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className={`text-3xl font-bold mt-1 bg-gradient-to-r ${gradients[color]} bg-clip-text text-transparent`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
