
import React from 'react';

const ArchitectureDiagram: React.FC = () => {
  const steps = [
    { icon: 'fa-search', label: 'Search Engine', color: 'bg-blue-500' },
    { icon: 'fa-brain', label: 'Contextual Agent', color: 'bg-indigo-500' },
    { icon: 'fa-filter', label: 'Extractor', color: 'bg-emerald-500' },
    { icon: 'fa-database', label: 'Local Registry', color: 'bg-amber-500' },
    { icon: 'fa-file-export', label: 'Export Service', color: 'bg-rose-500' },
  ];

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mb-8 overflow-x-auto relative">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Autonomous Processing Pipeline</h3>
      
      {/* Feedback Loop Path */}
      <div className="absolute top-[88px] left-[15%] right-[30%] h-12 border-b-2 border-l-2 border-slate-700 rounded-bl-3xl border-dashed opacity-30 -z-10"></div>
      <div className="absolute top-[135px] left-[15%] text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
        Context Feedback Loop
      </div>

      <div className="flex items-center justify-between min-w-[800px] relative">
        {steps.map((step, idx) => (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center group relative z-10">
              <div className={`${step.color} w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg shadow-${step.color.split('-')[1]}-500/20 mb-2 transition-transform group-hover:scale-110`}>
                <i className={`fas ${step.icon} text-xl`}></i>
              </div>
              <span className="text-xs font-medium text-slate-300 text-center w-24">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-1 h-px bg-slate-700 relative mx-4">
                <div className="absolute top-1/2 -translate-y-1/2 right-0 w-2 h-2 border-t border-r border-slate-700 rotate-45"></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ArchitectureDiagram;
