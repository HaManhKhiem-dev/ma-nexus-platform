import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeals } from '../hooks/useFirebase';
import { formatCurrency } from '../lib/utils';
import { sampleDeals } from '../lib/mockData';
import { Search, Filter, MapPin, ChevronRight, ShieldCheck, Sparkles, TrendingUp, ArrowUpRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { statusLabel } from '../lib/compliance';

const industries = ['All', 'Technology', 'Healthcare', 'Logistics', 'Consumer', 'Financial Services'];
const geographies = ['All', 'Vietnam', 'Singapore', 'Thailand', 'Indonesia', 'United States'];
const sizes = ['All', '< $10M', '$10M - $25M', '$25M+'];

export default function Marketplace() {
  const { deals, loading } = useDeals('published');
  const [keyword, setKeyword] = useState('');
  const [industry, setIndustry] = useState('All');
  const [geography, setGeography] = useState('All');
  const [dealSize, setDealSize] = useState('All');

  const sourceDeals = deals.length > 0 ? deals : sampleDeals;
  
  const filteredDeals = useMemo(() => {
    return sourceDeals.filter((deal) => {
      const text = `${deal.title} ${deal.industry} ${deal.location} ${deal.summary || ''}`.toLowerCase();
      const valuation = Number(deal.valuation || 0);
      const matchesKeyword = !keyword || text.includes(keyword.toLowerCase());
      const matchesIndustry = industry === 'All' || deal.industry === industry;
      const matchesGeography = geography === 'All' || deal.location === geography;
      const matchesSize = dealSize === 'All'
        || (dealSize === '< $10M' && valuation < 10000000)
        || (dealSize === '$10M - $25M' && valuation >= 10000000 && valuation <= 25000000)
        || (dealSize === '$25M+' && valuation > 25000000);
      return matchesKeyword && matchesIndustry && matchesGeography && matchesSize;
    });
  }, [sourceDeals, keyword, industry, geography, dealSize]);

  if (loading && deals.length === 0) {
    return (
      <div className="space-y-12 animate-pulse p-8">
        <div className="h-20 bg-slate-800/50 rounded-2xl w-1/3"></div>
        <div className="h-96 bg-slate-800/30 rounded-3xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* INJECTED CUSTOM CSS FOR DROPDOWNS */}
      <style>{`
        /* Sửa lỗi màu xanh mặc định trên dropdown */
        .custom-select-option option {
          background-color: #0f172a !important;
          color: white !important;
          padding: 12px !important;
        }
        
        /* Hiệu ứng focus cho input */
        .glass-input:focus {
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
          background-color: rgba(15, 23, 42, 0.8);
        }

        /* Tùy chỉnh thanh cuộn cho dropdown nếu quá dài */
        .custom-select-option::-webkit-scrollbar {
          width: 8px;
        }
        .custom-select-option::-webkit-scrollbar-track {
          background: #020617;
        }
        .custom-select-option::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
      `}</style>

      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-6">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-emerald-400"
          >
            <Sparkles size={14} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-black">Capital Market Portal</p>
          </motion.div>
          <h2 className="text-6xl md:text-8xl font-bold tracking-tighter text-white">Marketplace</h2>
          <p className="text-lg text-slate-400 max-w-2xl font-light leading-relaxed">
            Hệ thống niêm yết tài sản số hóa. Khám phá các cơ hội M&A được bảo mật và định giá theo thời gian thực.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="glass-input w-full md:w-96 bg-slate-900/40 border border-slate-800 py-5 pl-14 pr-6 rounded-2xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="Search assets, industries..."
            />
          </div>
          <button className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-600 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </header>

      {/* Filter Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Industry', industry, setIndustry, industries],
          ['Geography', geography, setGeography, geographies],
          ['Deal Size', dealSize, setDealSize, sizes],
        ].map(([label, value, setter, options]) => (
          <div key={label as string} className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl space-y-3 hover:border-emerald-500/30 transition-all group relative">
            <span className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-black group-hover:text-emerald-500 transition-colors ml-1">
              {label as string}
            </span>
            <div className="relative flex items-center">
              <select
                value={value as string}
                onChange={(e) => (setter as any)(e.target.value)}
                className="custom-select-option w-full bg-transparent text-[13px] text-white font-bold appearance-none cursor-pointer focus:outline-none relative z-10 pr-8"
              >
                {(options as string[]).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-0 text-slate-600 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
        ))}
        
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl flex items-center gap-4 group hover:bg-emerald-500/10 transition-all">
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-black">AI Recommendations</p>
            <p className="text-xs text-white/70 font-medium">8 Opportunities found</p>
          </div>
        </div>
      </section>

      {/* Deals List */}
      <div className="space-y-4">
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-12 px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-black text-slate-600">
          <span className="col-span-5">Strategic Asset Name</span>
          <span className="col-span-2">Core Metrics</span>
          <span className="col-span-2">Target Valuation</span>
          <span className="col-span-2 text-center">AI Compatibility</span>
          <span className="col-span-1 text-right">Action</span>
        </div>

        <AnimatePresence mode="popLayout">
          {filteredDeals.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-20 text-center bg-slate-900/10 border border-slate-800/50 rounded-3xl text-slate-500 font-light italic">
              No matching assets were identified in the current quarter.
            </motion.div>
          ) : (
            filteredDeals.map((deal, idx) => (
              <motion.div
                key={deal.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.03 }}
              >
                <Link
                  to={`/deals/${deal.id}`}
                  className="group block bg-[#0f172a]/30 border border-slate-800/50 rounded-[2rem] hover:border-emerald-500/40 hover:bg-[#0f172a]/60 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 items-center relative z-10">
                    {/* Info */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-slate-800/80 rounded-lg text-[9px] font-bold text-slate-400 border border-slate-700/50 uppercase tracking-widest">
                          {deal.industry}
                        </span>
                        <span className="px-3 py-1 bg-emerald-500/10 rounded-lg text-[9px] font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                          {statusLabel(deal.status || 'published')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight">
                          {deal.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-slate-500 font-medium text-xs">
                          <MapPin size={12} className="text-emerald-500" /> {deal.location}
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="lg:col-span-2 space-y-3">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-slate-600 font-black mb-1">Revenue (TTM)</p>
                        <p className="text-sm font-mono text-white/90">
                          {deal.revenue?.[2] ? formatCurrency(Number(deal.revenue[2])) : 'Confidential'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="h-1 w-1 rounded-full bg-emerald-500"></div>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">EBITDA: {deal.ebitda ? formatCurrency(Number(deal.ebitda)) : 'N/A'}</p>
                      </div>
                    </div>

                    {/* Valuation */}
                    <div className="lg:col-span-2">
                      <p className="text-[9px] uppercase tracking-widest text-slate-600 font-black mb-1">Indicative Value</p>
                      <p className="text-2xl font-bold text-white tracking-tighter">
                        {deal.valuation ? formatCurrency(Number(deal.valuation)) : 'TBA'}
                      </p>
                    </div>

                    {/* Match Score */}
                    <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-2">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-800" />
                          <motion.circle 
                            cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" 
                            strokeDasharray={176} 
                            initial={{ strokeDashoffset: 176 }}
                            animate={{ strokeDashoffset: 176 - (176 * (deal.matchScore || 78)) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="text-emerald-500" 
                          />
                        </svg>
                        <span className="absolute text-xs font-mono font-black text-white">{deal.matchScore || 78}%</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-500">
                         <TrendingUp size={12} />
                         <span className="text-[9px] font-black uppercase tracking-tighter">High Affinity</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="lg:col-span-1 flex justify-end">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-900 transition-all duration-500 shadow-lg group-hover:shadow-emerald-500/20">
                        <ArrowUpRight size={24} />
                      </div>
                    </div>
                  </div>

                  {/* Gradient Glow Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </Link>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <footer className="pt-10 flex justify-center">
         <div className="px-8 py-4 bg-slate-900/30 border border-slate-800/50 rounded-full flex items-center gap-4 backdrop-blur-sm">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black">Forensic Watermarking Enabled for all Data Rooms</span>
         </div>
      </footer>
    </div>
  );
}