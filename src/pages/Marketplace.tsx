import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeals } from '../hooks/useFirebase';
import { formatCurrency } from '../lib/utils';
import { sampleDeals } from '../lib/mockData';
import { Search, Filter, MapPin, ChevronRight, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
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
      <div className="space-y-12 animate-pulse">
        <div className="h-20 bg-neutral-900 w-1/3"></div>
        <div className="h-64 bg-neutral-900 w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold">Deal Discovery</p>
          <h2 className="text-4xl md:text-6xl font-light tracking-tightest">Marketplace</h2>
          <p className="text-sm text-neutral-500 max-w-2xl">
            Browse public deal snapshots, request NDA access, and prioritize targets with match, risk, and growth signals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-white transition-colors" size={16} />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="bg-neutral-950 border border-neutral-900 py-3 pl-12 pr-6 text-xs uppercase tracking-widest focus:outline-none focus:border-neutral-600 transition-all w-full md:w-80"
              placeholder="Keyword or semantic search"
            />
          </div>
          <button className="p-3 border border-neutral-900 hover:bg-neutral-900 transition-colors" aria-label="Open filters">
            <Filter size={16} />
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-px bg-neutral-900 border border-neutral-900">
        {[
          ['Industry', industry, setIndustry, industries],
          ['Geography', geography, setGeography, geographies],
          ['Deal Size', dealSize, setDealSize, sizes],
        ].map(([label, value, setter, options]) => (
          <label key={label as string} className="bg-black p-5 space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">{label as string}</span>
            <select
              value={value as string}
              onChange={(event) => (setter as React.Dispatch<React.SetStateAction<string>>)(event.target.value)}
              className="w-full bg-neutral-950 border border-neutral-900 p-3 text-xs uppercase tracking-widest focus:outline-none focus:border-neutral-600"
            >
              {(options as string[]).map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        ))}
        <div className="bg-black p-5 space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">AI Suggestions</span>
          <div className="flex items-center gap-2 text-xs text-neutral-300 p-3 border border-neutral-900 bg-neutral-950">
            <Sparkles size={14} />
            Top matches for verified buyers
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-px bg-neutral-900 border border-neutral-900">
        <div className="hidden md:grid grid-cols-12 p-4 bg-neutral-950 text-[10px] uppercase tracking-widest font-bold text-neutral-500 italic">
          <span className="col-span-4">Strategic Asset</span>
          <span className="col-span-2">Metrics</span>
          <span className="col-span-2">Valuation</span>
          <span className="col-span-2">AI Score</span>
          <span className="col-span-2 text-right">Action</span>
        </div>

        {filteredDeals.length === 0 ? (
          <div className="p-20 text-center bg-black text-neutral-600 text-xs uppercase tracking-widest border-t border-neutral-900">
            No deals match the selected filters.
          </div>
        ) : (
          filteredDeals.map((deal, idx) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Link
                to={`/deals/${deal.id}`}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 p-7 bg-black hover:bg-neutral-950 transition-all group border-t border-neutral-900 relative active:scale-[0.99]"
              >
                <div className="md:col-span-4 flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 border border-neutral-800 text-[9px] uppercase tracking-widest text-neutral-400">{deal.industry}</span>
                    <span className="px-2 py-1 border border-neutral-800 text-[9px] uppercase tracking-widest text-neutral-400">{deal.type || 'M&A'}</span>
                    <span className="px-2 py-1 border border-green-900/50 text-[9px] uppercase tracking-widest text-green-500">{statusLabel(deal.status || 'published')}</span>
                  </div>
                  <h3 className="text-lg font-medium group-hover:text-neutral-300 transition-colors leading-tight">{deal.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                    <MapPin size={10} /> {deal.location}
                  </div>
                </div>
                <div className="md:col-span-2 flex md:block items-center gap-6 text-xs font-mono text-neutral-400">
                  <p>Revenue: {deal.revenue?.[2] ? formatCurrency(Number(deal.revenue[2])) : 'Private'}</p>
                  <p className="mt-2">EBITDA: {deal.ebitda ? formatCurrency(Number(deal.ebitda)) : 'Private'}</p>
                </div>
                <div className="md:col-span-2 flex items-center text-lg font-mono text-white">
                  {deal.valuation ? formatCurrency(Number(deal.valuation)) : 'TBA'}
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center text-sm font-mono">
                    {deal.matchScore || 78}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-neutral-500">
                    <p className="text-green-500 flex items-center gap-1"><TrendingUp size={10} /> Match</p>
                    <p>Risk {deal.riskScore || 35}</p>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center justify-end gap-3">
                  <span className="hidden lg:flex items-center gap-1 text-[10px] uppercase tracking-widest text-neutral-500">
                    <ShieldCheck size={12} /> NDA gated
                  </span>
                  <div className="w-10 h-10 border border-neutral-800 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <ChevronRight size={14} />
                  </div>
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-0 group-hover:w-1 bg-white transition-all"></div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
