import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../hooks/useFirebase';
import { motion } from 'motion/react';
import { 
    ShieldCheck, 
    ArrowLeft, 
    BarChart3, 
    FileText, 
    Lock, 
    Unlock,
    Info,
    ChevronRight,
    TrendingUp,
    MapPin,
    DollarSign
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { getDealSummary } from '../lib/gemini';
import { useAuth } from '../components/AuthContext';
import { addDoc, collection, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function DealDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { deal, loading } = useDeal(id!);
    const { user, profile } = useAuth();
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [ndaStatus, setNdaStatus] = useState<string | null>(null);
    const [requestingNda, setRequestingNda] = useState(false);

    useEffect(() => {
        if (deal && !aiSummary) {
            getDealSummary(deal).then(setAiSummary);
        }
    }, [deal]);

    useEffect(() => {
        if (!user || !id) return;
        const q = query(collection(db, 'ndas'), where('dealId', '==', id), where('buyerUid', '==', user.uid));
        return onSnapshot(q, (snap) => {
            if (!snap.empty) setNdaStatus(snap.docs[0].data().status);
        });
    }, [user, id]);

    const requestNDA = async () => {
        if (!user || !deal) return;
        setRequestingNda(true);
        try {
            await addDoc(collection(db, 'ndas'), {
                dealId: id,
                buyerUid: user.uid,
                sellerUid: deal.sellerUid,
                status: 'requested',
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error(error);
        } finally {
            setRequestingNda(false);
        }
    };

    if (loading) return null;
    if (!deal) return <div className="p-20 text-center">Deal not found.</div>;

    const isAuthorized = ndaStatus === 'signed' || user?.uid === deal.sellerUid;

    return (
        <div className="space-y-12">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold">
                <ArrowLeft size={14} /> Back to marketplace
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-16">
                    <header className="space-y-6">
                        <div className="flex items-center gap-4">
                             <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-[9px] uppercase tracking-widest rounded-full">{deal.industry}</span>
                             <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-[9px] uppercase tracking-widest rounded-full flex items-center gap-1">
                                <MapPin size={10} /> {deal.location}
                             </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-light tracking-tightest">{deal.title}</h1>
                        <p className="text-xl text-neutral-400 font-serif leading-relaxed italic border-l-4 border-neutral-800 pl-8 py-2">
                            "{deal.summary || 'A strategic opportunity in the ' + deal.industry + ' sector with strong growth potential.'}"
                        </p>
                    </header>

                    {/* Snapshot */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-900 border border-neutral-900">
                         <div className="bg-black p-8 space-y-2">
                            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Asking Price / Valuation</p>
                            <p className="text-2xl font-mono">{formatCurrency(deal.valuation)}</p>
                         </div>
                         <div className="bg-black p-8 space-y-2">
                            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Equity Offered</p>
                            <p className="text-2xl font-mono">{deal.equityOffered}%</p>
                         </div>
                         <div className="bg-black p-8 space-y-2">
                            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">EBITDA</p>
                            <p className="text-2xl font-mono">{formatCurrency(deal.ebitda)}</p>
                         </div>
                    </section>

                    {/* AI Insights */}
                    <section className="bg-neutral-950 p-10 border border-neutral-900 space-y-6">
                        <div className="flex items-center gap-2 text-neutral-400">
                             <TrendingUp size={16} />
                             <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Nexus AI Intelligence Report</span>
                        </div>
                        {aiSummary ? (
                            <div className="prose prose-invert prose-sm max-w-none prose-neutral">
                                <p className="text-lg leading-relaxed text-neutral-300">
                                    {aiSummary}
                                </p>
                            </div>
                        ) : (
                            <div className="animate-pulse flex space-x-4">
                                <div className="flex-1 space-y-4 py-1">
                                    <div className="h-4 bg-neutral-900 rounded w-3/4"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-neutral-900 rounded"></div>
                                        <div className="h-4 bg-neutral-900 rounded w-5/6"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-8">
                    <div className="bg-neutral-950 border border-neutral-900 p-8 space-y-8">
                         <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Security Status</p>
                            <div className="flex items-center gap-2">
                                {isAuthorized ? <Unlock size={18} className="text-green-500" /> : <Lock size={18} className="text-neutral-500" />}
                                <span className={isAuthorized ? "text-green-500 text-xs font-bold uppercase tracking-widest" : "text-neutral-500 text-xs font-bold uppercase tracking-widest"}>
                                    {isAuthorized ? 'Access Granted' : 'Confidential Access Locked'}
                                </span>
                            </div>
                         </div>

                         {!isAuthorized && (
                            <div className="space-y-6">
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                    Detailed financials, contracts, and legal documents are protected by the Data Room. 
                                    You must sign a Non-Disclosure Agreement (NDA) to proceed.
                                </p>
                                {ndaStatus === 'requested' ? (
                                    <div className="w-full text-center py-4 border border-blue-900/50 bg-blue-950/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                                        NDA Request Pending
                                    </div>
                                ) : (
                                    <button 
                                        onClick={requestNDA}
                                        disabled={requestingNda}
                                        className="w-full py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        Request Secure Access <ChevronRight size={14} />
                                    </button>
                                )}
                            </div>
                         )}

                         {isAuthorized && (
                             <div className="space-y-4">
                                <button className="w-full py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center justify-center gap-2">
                                    Submit Binding Offer <DollarSign size={14} />
                                </button>
                                <button onClick={() => navigate('/data-room')} className="w-full py-4 border border-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-900 transition-all flex items-center justify-center gap-2">
                                    Open Data Room <ShieldCheck size={14} />
                                </button>
                             </div>
                         )}
                    </div>

                    <div className="bg-neutral-950 border border-neutral-900 p-8 space-y-4">
                         <div className="flex items-center gap-2 text-neutral-500">
                             <Info size={14} />
                             <span className="text-[10px] uppercase font-bold tracking-widest">Listing Managed By</span>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                                <Building size={18} className="text-neutral-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest">Institutional Advisor</p>
                                <p className="text-[10px] text-neutral-500">Tier 1 Verification</p>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
