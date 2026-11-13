import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, trend, color = 'ocean' }) {
  const colorMap = {
    navy: 'bg-navy-50 text-navy-800 border-navy-200 icon-navy-600',
    ocean: 'bg-ocean-50 text-ocean-700 border-ocean-200 icon-ocean-600',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 icon-emerald-600',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 icon-amber-600',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 icon-rose-600',
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-xl lg:text-2xl font-extrabold text-navy-900 tracking-tight font-mono">{value}</h3>
          {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.ocean}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          <span className={`font-bold ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend > 0 ? `+${trend}%` : `${trend}%`}
          </span>
          <span className="text-slate-400">vs previous period</span>
        </div>
      )}
    </div>
  );
}

