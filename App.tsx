
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GamblingSite, SiteStatus, AgentLog } from './types';
import { performDiscovery } from './services/geminiService';
import ArchitectureDiagram from './components/ArchitectureDiagram';

const App: React.FC = () => {
  const [sites, setSites] = useState<GamblingSite[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [searchQuery, setSearchQuery] = useState('situs slot gacor terbaru 2024');
  const [isCopied, setIsCopied] = useState(false);
  const [autoCycleCount, setAutoCycleCount] = useState(0);
  const [nextCycleCountdown, setNextCycleCountdown] = useState(0);
  
  const timerRef = useRef<number | null>(null);

  const addLog = useCallback((message: string, type: AgentLog['type'] = 'info') => {
    setLogs(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }, ...prev].slice(0, 50));
  }, []);

  const handleDiscovery = async (customQuery?: string) => {
    const queryToUse = customQuery || searchQuery;
    if (!queryToUse.trim() || isSearching) return;
    
    setIsSearching(true);
    
    // Step 1: Learning Phase
    setIsAnalyzing(true);
    addLog(`Analyzing current registry for existing patterns...`, 'info');
    const knownPatterns = sites.map(s => s.normalized_name);
    if (knownPatterns.length > 0) {
      addLog(`Knowledge base primed with ${knownPatterns.length} existing entries.`, 'success');
    }
    
    await new Promise(r => setTimeout(r, 1000));
    setIsAnalyzing(false);

    // Step 2: Discovery Phase
    addLog(`Initiating context-aware search for: "${queryToUse}"`, 'info');
    
    try {
      const { sites: newSites, sources } = await performDiscovery(queryToUse, knownPatterns);
      
      if (sources.length > 0) {
        addLog(`Successfully indexed ${sources.length} public sources.`, 'success');
      }

      setSites(prev => {
        const combined = [...newSites, ...prev];
        const unique = Array.from(new Map(combined.map(item => [item.normalized_name, item])).values());
        
        const newCount = unique.length - prev.length;
        if (newCount > 0) {
            addLog(`Learned ${newCount} new unique site signatures.`, 'success');
        } else {
            addLog(`No new unique signatures found in this cycle.`, 'warning');
        }
        
        return unique;
      });

      addLog(`Discovery cycle complete.`, 'success');
      if (isAutonomous) {
        setAutoCycleCount(c => c + 1);
        startCountdown();
      }
    } catch (error) {
      console.error(error);
      addLog(`Error during discovery: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      if (isAutonomous) startCountdown(); // Retry after delay even on error
    } finally {
      setIsSearching(false);
    }
  };

  const startCountdown = () => {
    setNextCycleCountdown(15); // 15 second delay between auto-cycles
  };

  // Autonomous Logic
  useEffect(() => {
    if (isAutonomous && !isSearching && nextCycleCountdown === 0) {
      // Logic to pick a "seed" from known database to evolve the search
      let nextQuery = searchQuery;
      if (sites.length > 0) {
        const randomSite = sites[Math.floor(Math.random() * sites.length)];
        const strategies = [
          `link alternatif ${randomSite.site_name}`,
          `situs serupa ${randomSite.site_name}`,
          `daftar agen ${randomSite.site_name.split('.')[0]}`,
          `promo terbaru ${randomSite.site_name}`
        ];
        nextQuery = strategies[Math.floor(Math.random() * strategies.length)];
      }
      
      addLog(`Autonomous trigger: Evolving search based on "${nextQuery}"`, 'info');
      handleDiscovery(nextQuery);
    }
  }, [isAutonomous, isSearching, nextCycleCountdown]);

  // Countdown timer effect
  useEffect(() => {
    if (isAutonomous && nextCycleCountdown > 0) {
      const timer = window.setInterval(() => {
        setNextCycleCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isAutonomous, nextCycleCountdown]);

  const getCleanedList = () => {
    return sites
      .filter(s => s.status !== SiteStatus.FALSE_POSITIVE)
      .map(s => s.normalized_name)
      .join(' ');
  };

  const downloadTxt = () => {
    const content = getCleanedList();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gambling_filter_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog(`Exported ${sites.length} sites to filter.txt`, 'success');
  };

  const copyToClipboard = async () => {
    const content = getCleanedList();
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      addLog(`Copied ${sites.length} keywords to clipboard.`, 'success');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      addLog(`Failed to copy to clipboard.`, 'error');
    }
  };

  const toggleStatus = (id: string) => {
    setSites(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === SiteStatus.ACTIVE ? SiteStatus.FALSE_POSITIVE : SiteStatus.ACTIVE;
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-500 p-2 rounded-lg relative overflow-hidden group">
               <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <i className="fas fa-shield-halved text-white text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">GamblShield <span className="text-emerald-500">Discovery</span></h1>
          </div>
          <p className="text-slate-400 max-w-2xl">
            Intelligent extraction agent. Use <span className="text-indigo-400 font-bold">Autonomous Mode</span> to let the agent self-evolve and hunt for new signatures without manual input.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={copyToClipboard}
            disabled={sites.length === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all border ${
              isCopied 
                ? 'bg-emerald-500 text-white border-emerald-400' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <i className={`fas ${isCopied ? 'fa-check' : 'fa-copy'}`}></i>
            {isCopied ? 'Copied!' : 'Copy List'}
          </button>
          <button 
            onClick={downloadTxt}
            disabled={sites.length === 0}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg font-medium transition-colors border border-slate-700"
          >
            <i className="fas fa-file-export"></i>
            Export TXT
          </button>
        </div>
      </header>

      <ArchitectureDiagram />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Controls & Stats */}
        <div className="space-y-6">
          <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative overflow-hidden">
            {isAutonomous && (
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 overflow-hidden">
                <div className="h-full bg-indigo-400 animate-pulse" style={{ width: '100%' }}></div>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-100">
                <i className={`fas fa-brain ${isAutonomous ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`}></i>
                Intelligence Base
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Auto Mode</span>
                <button 
                  onClick={() => {
                    setIsAutonomous(!isAutonomous);
                    if (!isAutonomous) {
                      addLog("Autonomous Mode ACTIVATED. Agent will now evolve self-queries.", "warning");
                    } else {
                      addLog("Autonomous Mode DEACTIVATED.", "info");
                    }
                  }}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isAutonomous ? 'bg-indigo-600' : 'bg-slate-700'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isAutonomous ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Learned</div>
                <div className="text-2xl font-bold text-emerald-400">{sites.length}</div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Self-Cycles</div>
                <div className="text-2xl font-bold text-indigo-400">{autoCycleCount}</div>
              </div>
            </div>

            <div className="space-y-4">
              {isAutonomous ? (
                <div className="bg-slate-900/80 p-4 rounded-lg border border-indigo-500/30 text-center">
                  {isSearching ? (
                    <div className="flex flex-col items-center gap-2">
                      <i className="fas fa-radar text-indigo-400 animate-ping text-xl mb-2"></i>
                      <span className="text-xs text-indigo-300 font-mono">BROADCASTING EVOLVED QUERY...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Next Self-Evolution In</span>
                      <span className="text-3xl font-black text-indigo-400 font-mono">{nextCycleCountdown}s</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1.5">Seed Query Focus</label>
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. situs judi slot online..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => handleDiscovery()}
                    disabled={isSearching}
                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all group overflow-hidden relative ${
                      isSearching 
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                    }`}
                  >
                    <i className="fas fa-bolt"></i>
                    Manual Discovery
                  </button>
                </>
              )}
            </div>
          </section>

          <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-[330px] flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-terminal text-slate-500"></i>
              Intelligence Stream
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
              {logs.length === 0 && (
                <p className="text-slate-500 text-center py-10 text-sm">Agent idle. Initiate cycle or activate Auto-Mode.</p>
              )}
              {logs.map((log, i) => (
                <div key={i} className="text-[11px] font-mono border-l-2 border-slate-700 pl-3 py-1 bg-slate-900/20 rounded-r">
                  <span className="text-slate-500 mr-2 opacity-50">[{log.timestamp}]</span>
                  <span className={`${
                    log.type === 'success' ? 'text-emerald-400 font-bold' : 
                    log.type === 'error' ? 'text-rose-400' : 
                    log.type === 'warning' ? 'text-indigo-400 animate-pulse' : 
                    'text-slate-300'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Database View */}
        <div className="lg:col-span-2">
          <section className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-800/80 backdrop-blur border-b border-slate-700 flex items-center justify-between sticky top-0 z-20">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <i className={`fas fa-database ${isAutonomous ? 'text-indigo-400' : 'text-emerald-500'}`}></i>
                Evolving Registry
              </h2>
              <div className="flex items-center gap-3">
                {isAutonomous && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">Self-Learning Active</span>
                  </div>
                )}
                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                  {sites.length} Identified
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/50 text-slate-500 uppercase text-[10px] tracking-widest sticky top-[60px] z-10">
                  <tr>
                    <th className="px-6 py-4 font-bold">Platform Identifier</th>
                    <th className="px-6 py-4 font-bold">Keyword Signature</th>
                    <th className="px-6 py-4 font-bold text-center">Confidence</th>
                    <th className="px-6 py-4 font-bold text-center">Context</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {sites.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-24 text-center text-slate-500">
                        <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                          <i className="fas fa-search-plus text-2xl opacity-20"></i>
                        </div>
                        <p className="font-medium text-slate-400">Knowledge base awaiting seeds.</p>
                      </td>
                    </tr>
                  ) : (
                    sites.map((site) => (
                      <tr key={site.id} className="hover:bg-slate-700/30 transition-all group">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{site.site_name}</div>
                          <div className="text-[9px] text-slate-500 mt-0.5 font-mono">DISCOVERED: {new Date(site.first_seen).toLocaleTimeString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-900 px-2 py-1 rounded font-mono text-indigo-400 text-xs border border-indigo-500/10">
                            {site.normalized_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center">
                            <span className={`text-[10px] font-black ${
                              site.confidence_score > 0.8 ? 'text-emerald-400' : 
                              site.confidence_score > 0.5 ? 'text-amber-400' : 'text-slate-400'
                            }`}>
                              {(site.confidence_score * 100).toFixed(0)}%
                            </span>
                            <div className="w-16 h-1 bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${
                                  site.confidence_score > 0.8 ? 'bg-emerald-500' : 
                                  site.confidence_score > 0.5 ? 'bg-amber-500' : 'bg-slate-500'
                                }`}
                                style={{ width: `${site.confidence_score * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                             <span className="text-slate-400 font-bold text-xs">
                              {site.source_count}
                            </span>
                            <i className="fas fa-link text-[10px] text-slate-600"></i>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                            site.status === SiteStatus.ACTIVE 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {site.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => toggleStatus(site.id)}
                            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 transition-all flex items-center justify-center mx-auto"
                            title={site.status === SiteStatus.ACTIVE ? "Flag False Positive" : "Restore"}
                          >
                            <i className={`fas ${site.status === SiteStatus.ACTIVE ? 'fa-shield-slash' : 'fa-check'}`}></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
      
      {/* Footer Info */}
      <footer className="mt-12 pt-8 border-t border-slate-800 text-slate-500 text-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ${isAutonomous ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`}></div> 
            Status: {isAutonomous ? 'Autonomous Hunting' : 'Active - Ready'}
          </span>
          <span className="flex items-center gap-2">
            <i className="fas fa-microchip text-indigo-400"></i>
            Grounding Engine: Gemini-3-Flash
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-slate-600 tracking-tighter uppercase">Intelligent Content Discovery Agent</span>
          <span className="bg-slate-800 px-2 py-1 rounded text-slate-400 uppercase">v2.6.0-AutoEvolve</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
