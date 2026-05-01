import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/AuthContext';
import { motion } from 'motion/react';
import { Briefcase, DollarSign, MapPin, BarChart3, ChevronRight, ChevronLeft, Building } from 'lucide-react';

export default function CreateDeal() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        industry: '',
        location: '',
        type: 'sell_100',
        valuation: '',
        equityOffered: '',
        revenue: ['', '', ''],
        ebitda: '',
        netProfit: '',
        summary: '',
        companyName: '',
        taxId: '',
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            // 1. Create company record
            const companyRef = await addDoc(collection(db, 'companies'), {
                name: formData.companyName,
                taxId: formData.taxId,
                industry: formData.industry,
                ownerUid: user.uid,
                createdAt: serverTimestamp(),
            });

            // 2. Create deal record
            await addDoc(collection(db, 'deals'), {
                title: formData.title,
                industry: formData.industry,
                location: formData.location,
                type: formData.type,
                valuation: Number(formData.valuation),
                equityOffered: Number(formData.equityOffered),
                revenue: formData.revenue.map(Number),
                ebitda: Number(formData.ebitda),
                netProfit: Number(formData.netProfit),
                summary: formData.summary,
                companyId: companyRef.id,
                sellerUid: user.uid,
                status: 'published', // Automatically publish for demo
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            navigate('/marketplace');
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Submission failed. Check rules.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10">
            <header className="mb-12">
                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold mb-2">Deal Entry</p>
                <h1 className="text-4xl font-light">List your business</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12">
                {step === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <div className="space-y-2">
                             <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Opportunity Title</label>
                             <input 
                                required
                                className="w-full bg-transparent border-b border-neutral-800 py-4 text-2xl focus:outline-none focus:border-white transition-colors"
                                placeholder="..."
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                             />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Industry</label>
                                <select 
                                    className="w-full bg-transparent border-b border-neutral-800 py-4 focus:outline-none focus:border-white"
                                    value={formData.industry}
                                    onChange={e => setFormData({...formData, industry: e.target.value})}
                                >
                                    <option value="">Select Industry</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Logistics">Logistics</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Consumer">Consumer</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Location</label>
                                <input 
                                    className="w-full bg-transparent border-b border-neutral-800 py-4 focus:outline-none focus:border-white"
                                    placeholder="City, Country"
                                    value={formData.location}
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                />
                            </div>
                        </div>
                         <button type="button" onClick={handleNext} className="w-full py-4 bg-white text-black text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                            Next Step <ChevronRight size={14} />
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Valuation ($)</label>
                                <input 
                                    type="number"
                                    className="w-full bg-transparent border-b border-neutral-800 py-4 focus:outline-none focus:border-white"
                                    placeholder="Amount"
                                    value={formData.valuation}
                                    onChange={e => setFormData({...formData, valuation: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Equity Offered %</label>
                                <input 
                                    type="number"
                                    className="w-full bg-transparent border-b border-neutral-800 py-4 focus:outline-none focus:border-white"
                                    placeholder="0-100"
                                    value={formData.equityOffered}
                                    onChange={e => setFormData({...formData, equityOffered: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                             <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Revenue (Last 3 Years)</label>
                             <div className="grid grid-cols-3 gap-4">
                                {formData.revenue.map((rev, i) => (
                                    <input 
                                        key={i}
                                        type="number"
                                        placeholder={`Year ${3-i}`}
                                        className="bg-neutral-900/50 p-4 border border-neutral-800 focus:outline-none focus:border-white"
                                        value={rev}
                                        onChange={e => {
                                            const newRev = [...formData.revenue];
                                            newRev[i] = e.target.value;
                                            setFormData({...formData, revenue: newRev});
                                        }}
                                    />
                                ))}
                             </div>
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={handleBack} className="flex-1 py-4 border border-neutral-800 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                                <ChevronLeft size={14} /> Back
                            </button>
                            <button type="button" onClick={handleNext} className="flex-1 py-4 bg-white text-black text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                                Next Step <ChevronRight size={14} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Company Name</label>
                                <input 
                                    className="w-full bg-transparent border-b border-neutral-800 py-4 focus:outline-none focus:border-white"
                                    placeholder="Legal Name"
                                    value={formData.companyName}
                                    onChange={e => setFormData({...formData, companyName: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Tax ID / Registration Number</label>
                                <input 
                                    className="w-full bg-transparent border-b border-neutral-800 py-4 focus:outline-none focus:border-white"
                                    placeholder="GST / VAT / EIN"
                                    value={formData.taxId}
                                    onChange={e => setFormData({...formData, taxId: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Deal Summary</label>
                                <textarea 
                                    rows={4}
                                    className="w-full bg-neutral-900/50 p-4 border border-neutral-800 focus:outline-none focus:border-white"
                                    placeholder="Provide a high-level overview..."
                                    value={formData.summary}
                                    onChange={e => setFormData({...formData, summary: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={handleBack} className="flex-1 py-4 border border-neutral-800 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                                <ChevronLeft size={14} /> Back
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="flex-1 py-4 bg-white text-black text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Submit Deal'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </form>
        </div>
    );
}
