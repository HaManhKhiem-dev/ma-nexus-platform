import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/AuthContext';
import { motion } from 'motion/react';
import { 
    Briefcase, 
    FileCheck, 
    Clock, 
    ChevronRight, 
    TrendingUp, 
    Users,
    Activity,
    Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';

export default function Dashboard() {
    const { user, profile } = useAuth();
    const [myDeals, setMyDeals] = useState<any[]>([]);
    const [myNdas, setMyNdas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        
        // My Listings
        const dealsQ = query(collection(db, 'deals'), where('sellerUid', '==', user.uid));
        const unsubDeals = onSnapshot(dealsQ, (snap) => {
            setMyDeals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // My NDA Requests (as buyer or seller)
        const ndaQ = query(collection(db, 'ndas'), where(profile?.role === 'seller' ? 'sellerUid' : 'buyerUid', '==', user.uid));
        const unsubNdas = onSnapshot(ndaQ, (snap) => {
            setMyNdas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        setLoading(false);
        return () => { unsubDeals(); unsubNdas(); };
    }, [user, profile]);

    if (loading) return null;

    return (
        <div className="space-y-16">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold">Workspace</p>
                    <h1 className="text-4xl md:text-6xl font-light tracking-tightest">Your <span className="font-serif italic text-neutral-400">Dashboard</span></h1>
                </div>
                <Link to="/create-deal" className="flex items-center gap-2 px-8 py-3 bg-white text-black text-[10px] uppercase font-bold tracking-widest hover:bg-neutral-200 transition-all">
                    <Plus size={14} /> New Listing
                </Link>
            </header>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-neutral-900 border border-neutral-900">
                <div className="bg-black p-8 space-y-2">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold flex items-center gap-2"><Briefcase size={12}/> Active Listings</p>
                    <p className="text-3xl font-light">{myDeals.length}</p>
                </div>
                <div className="bg-black p-8 space-y-2">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold flex items-center gap-2"><FileCheck size={12}/> Signed NDAs</p>
                    <p className="text-3xl font-light">{myNdas.filter(n => n.status === 'signed').length}</p>
                </div>
                <div className="bg-black p-8 space-y-2">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold flex items-center gap-2"><Clock size={12}/> Pending Actions</p>
                    <p className="text-3xl font-light text-orange-500">{myNdas.filter(n => n.status === 'requested').length}</p>
                </div>
                <div className="bg-black p-8 space-y-2">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold flex items-center gap-2"><TrendingUp size={12}/> Deal Velocity</p>
                    <p className="text-3xl font-light text-green-500">High</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                 {/* My Active Deals */}
                 <section className="space-y-8">
                    <div className="flex items-center justify-between">
                         <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400">Portfolio</h3>
                         <Link to="/marketplace" className="text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1 hover:gap-2 transition-all">View All <ChevronRight size={10} /></Link>
                    </div>
                    
                    <div className="space-y-px bg-neutral-900 border border-neutral-900">
                        {myDeals.length === 0 ? (
                            <div className="p-12 text-center bg-black text-neutral-600 text-xs uppercase tracking-widest font-mono">No active listings in your portfolio.</div>
                        ) : (
                            myDeals.map(deal => (
                                <Link key={deal.id} to={`/deals/${deal.id}`} className="flex items-center justify-between p-6 bg-black hover:bg-neutral-950 transition-colors group">
                                    <div className="flex gap-4 items-center">
                                         <div className="w-10 h-10 bg-neutral-900 flex items-center justify-center border border-neutral-800">
                                            <Activity size={16} className="text-neutral-500" />
                                         </div>
                                         <div>
                                            <p className="text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">{deal.title}</p>
                                            <p className="text-[10px] text-neutral-600">{deal.status}</p>
                                         </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-mono">{formatCurrency(deal.valuation)}</p>
                                        <p className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest">Valuation</p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                 </section>

                 {/* Incoming Interactions */}
                 <section className="space-y-8">
                     <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400">Activity & Requests</h3>
                     <div className="space-y-px bg-neutral-900 border border-neutral-900">
                        {myNdas.length === 0 ? (
                             <div className="p-12 text-center bg-black text-neutral-600 text-xs uppercase tracking-widest font-mono">No recent activity found.</div>
                        ) : (
                            myNdas.map(nda => (
                                <div key={nda.id} className="flex items-center justify-between p-6 bg-black">
                                    <div className="flex gap-4 items-center">
                                         <div className="w-10 h-10 bg-neutral-900 flex items-center justify-center border border-neutral-800">
                                            <Users size={16} className="text-neutral-500" />
                                         </div>
                                         <div>
                                            <p className="text-xs font-bold uppercase tracking-widest">NDA Request</p>
                                            <p className="text-[10px] text-neutral-600">From ID: {nda.buyerUid.slice(0, 8)}...</p>
                                         </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {nda.status === 'requested' ? (
                                            <>
                                                <button className="px-4 py-2 border border-neutral-800 text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-900 transition-colors">Reject</button>
                                                <button className="px-4 py-2 bg-white text-black text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors">Sign & Authorize</button>
                                            </>
                                        ) : (
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-green-500">Authorized</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                     </div>
                 </section>
            </div>
        </div>
    );
}
