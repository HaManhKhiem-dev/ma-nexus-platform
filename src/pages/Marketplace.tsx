import React from 'react';
import { Link } from 'react-router-dom';
import { useDeals } from '../hooks/useFirebase';
import { formatCurrency } from '../lib/utils';
import { Search, Filter, MapPin, TrendingUp, Building2, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Marketplace() {
    const { deals, loading } = useDeals();

    if (loading) return (
        <div className="space-y-12 animate-pulse">
            <div className="h-20 bg-neutral-900 w-1/3"></div>
            <div className="h-64 bg-neutral-900 w-full"></div>
        </div>
    );

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold">Institutional Flow</p>
                    <h2 className="text-4xl md:text-6xl font-light tracking-tightest">Deal <span className="font-serif italic text-neutral-400">Market</span></h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-white transition-colors" size={16} />
                         <input 
                            className="bg-neutral-950 border border-neutral-900 py-3 pl-12 pr-6 text-xs uppercase tracking-widest focus:outline-none focus:border-neutral-600 transition-all w-64"
                            placeholder="Search Assets..."
                         />
                    </div>
                    <button className="p-3 border border-neutral-900 hover:bg-neutral-900 transition-colors">
                        <Filter size={16} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-px bg-neutral-900 border border-neutral-900">
                <div className="grid grid-cols-6 p-4 bg-neutral-950 text-[10px] uppercase tracking-widest font-bold text-neutral-500 italic">
                    <span className="col-span-2">Strategic Asset</span>
                    <span>Industry</span>
                    <span>EBITDA</span>
                    <span>Valuation</span>
                    <span className="text-right">Action</span>
                </div>
                
                {deals.length === 0 ? (
                    <div className="p-20 text-center bg-black text-neutral-600 text-xs uppercase tracking-widest border-t border-neutral-900">
                        No active deals found. Be the first to list.
                    </div>
                ) : (
                    deals.map((deal, idx) => (
                        <motion.div
                            key={deal.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Link 
                                to={`/deals/${deal.id}`}
                                className="grid grid-cols-6 p-8 bg-black hover:bg-neutral-950 transition-all group border-t border-neutral-900 relative active:scale-[0.99]"
                            >
                                <div className="col-span-2 flex flex-col gap-1">
                                    <h3 className="text-xl font-medium group-hover:text-neutral-300 transition-colors leading-tight">{deal.title}</h3>
                                    <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                                        <MapPin size={10} /> {deal.location}
                                    </div>
                                </div>
                                <div className="flex items-center text-xs font-mono text-neutral-500 uppercase">{deal.industry}</div>
                                <div className="flex items-center text-xs font-mono text-neutral-400">
                                    {deal.ebitda ? formatCurrency(deal.ebitda) : 'Confidential'}
                                </div>
                                <div className="flex items-center text-lg font-mono text-white">
                                    {deal.valuation ? formatCurrency(deal.valuation) : 'TBA'}
                                </div>
                                <div className="flex items-center justify-end">
                                     <div className="w-10 h-10 border border-neutral-800 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                        <ChevronRight size={14} />
                                     </div>
                                </div>

                                {/* Hover indicator line */}
                                <div className="absolute left-0 top-0 bottom-0 w-0 group-hover:w-1 bg-white transition-all"></div>
                            </Link>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Performance Stats Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10 border-t border-neutral-900">
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Live Deals</p>
                    <p className="text-2xl font-light italic font-serif">{deals.length}+</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Market Value</p>
                    <p className="text-2xl font-light italic font-serif">$240M+</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Avg. Growth</p>
                    <p className="text-2xl font-light italic font-serif">24.5%</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Buyers Active</p>
                    <p className="text-2xl font-light italic font-serif">1.2K</p>
                </div>
            </div>
        </div>
    );
}
