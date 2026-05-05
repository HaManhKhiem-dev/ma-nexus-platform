import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/AuthContext';
import { motion } from 'motion/react';
import { ChevronRight, ChevronLeft, Building2, Upload, FileCheck2, ShieldCheck, Lock } from 'lucide-react';
import { dealStages } from '../lib/mockData';
import { canCreateDeal } from '../lib/compliance';
import { writeAuditLog } from '../lib/audit';

const industries = ['Technology', 'Logistics', 'Healthcare', 'Consumer', 'Financial Services', 'Manufacturing', 'Education'];

export default function CreateDeal() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    industry: '',
    location: '',
    dealType: 'sell_100',
    valuation: '',
    equityOffered: '',
    revenue: ['', '', ''],
    ebitda: '',
    netProfit: '',
    growthRate: '',
    summary: '',
    strategicReason: '',
    futurePlan: '',
    companyName: '',
    taxId: '',
    country: '',
    foundedYear: '',
    products: '',
    targetMarkets: '',
    founderOwnership: '',
    investorOwnership: '',
    esopOwnership: '',
    uploadedDocs: [] as string[],
  });

  const setField = (field: string, value: string | string[]) => setFormData((current) => ({ ...current, [field]: value }));
  const handleNext = () => setStep((current) => Math.min(current + 1, 5));
  const handleBack = () => setStep((current) => Math.max(current - 1, 1));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      alert('Please sign in before submitting a deal.');
      return;
    }
    if (!canCreateDeal(profile)) {
      alert('KYC verified seller/advisor account is required before creating a deal.');
      return;
    }
    setLoading(true);
    try {
      const companyRef = await addDoc(collection(db, 'companies'), {
        legal: {
          name: formData.companyName,
          tax_code: formData.taxId,
          country: formData.country,
          founded_year: Number(formData.foundedYear),
        },
        operation: {
          industry: formData.industry,
          product: formData.products,
          market: formData.targetMarkets,
        },
        ownership: {
          founder_pct: Number(formData.founderOwnership || 0),
          investor_pct: Number(formData.investorOwnership || 0),
          esop_pct: Number(formData.esopOwnership || 0),
        },
        name: formData.companyName,
        taxId: formData.taxId,
        country: formData.country,
        foundedYear: Number(formData.foundedYear),
        industry: formData.industry,
        products: formData.products,
        targetMarkets: formData.targetMarkets,
        ownershipLegacy: {
          founder: Number(formData.founderOwnership || 0),
          investor: Number(formData.investorOwnership || 0),
          esop: Number(formData.esopOwnership || 0),
        },
        ownerUid: user.uid,
        visibility: 'private',
        version: 1,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'deals'), {
        basic: {
          title: formData.title,
          industry: formData.industry,
          location: formData.location,
        },
        financial: {
          revenue_3y: formData.revenue.map(Number),
          ebitda: Number(formData.ebitda),
          net_profit: Number(formData.netProfit),
          growth_rate: Number(formData.growthRate),
        },
        deal: {
          type: formData.dealType,
          valuation: Number(formData.valuation),
          equity_offered: Number(formData.equityOffered),
        },
        strategy: {
          reason: formData.strategicReason,
          future_plan: formData.futurePlan,
        },
        documents: formData.uploadedDocs,
        title: formData.title,
        industry: formData.industry,
        location: formData.location,
        type: formData.dealType,
        valuation: Number(formData.valuation),
        equityOffered: Number(formData.equityOffered),
        revenue: formData.revenue.map(Number),
        ebitda: Number(formData.ebitda),
        netProfit: Number(formData.netProfit),
        growthRate: Number(formData.growthRate),
        summary: formData.summary,
        strategicReason: formData.strategicReason,
        futurePlan: formData.futurePlan,
        uploadedDocs: formData.uploadedDocs,
        companyId: companyRef.id,
        sellerUid: user.uid,
        status: 'submitted',
        lifecycle: dealStages,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await writeAuditLog({
        actorUid: user.uid,
        actorRole: profile?.role,
        action: 'deal_submitted',
        targetType: 'deal',
        metadata: { title: formData.title, status: 'submitted' },
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Submission failed. Please check Firestore rules and required fields.');
    } finally {
      setLoading(false);
    }
  };

  const stepTitle = ['Legal Entity', 'Operations', 'Financials', 'Deal Terms', 'Documents'][step - 1];
  const createAllowed = canCreateDeal(profile);

  if (user && !createAllowed) {
    return (
      <div className="max-w-3xl mx-auto py-20 space-y-6">
        <div className="w-14 h-14 border border-neutral-800 bg-neutral-950 flex items-center justify-center">
          <Lock size={22} className="text-neutral-500" />
        </div>
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold">KYC Required</p>
          <h1 className="text-4xl font-light">Deal creation is locked</h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Seller or advisor accounts must complete KYC, business license review, and shareholder verification before creating or submitting a deal.
          </p>
        </div>
        <button onClick={() => navigate('/profile')} className="px-7 py-3 bg-white text-black text-[10px] uppercase tracking-widest font-bold">
          Complete KYC
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-10">
      <header className="space-y-4">
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold">Seller Workflow</p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-light">Submit M&A Deal</h1>
            <p className="text-sm text-neutral-500 mt-3 max-w-2xl">Create the company record, transaction terms, diligence package, and moderation-ready deal profile.</p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <span key={item} className={`w-9 h-9 border flex items-center justify-center text-[10px] font-mono ${item === step ? 'bg-white text-black border-white' : item < step ? 'border-green-700 text-green-500' : 'border-neutral-800 text-neutral-600'}`}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <aside className="space-y-4">
          {['Company legal profile', 'Operations and market', 'Revenue, EBITDA, profit', 'Valuation and offer', 'Pitch, financial, legal docs'].map((label, index) => (
            <div key={label} className={`p-4 border ${index + 1 === step ? 'border-white bg-neutral-950' : 'border-neutral-900 bg-black'}`}>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Step {index + 1}</p>
              <p className="text-sm mt-1">{label}</p>
            </div>
          ))}
          <div className="p-5 border border-neutral-900 bg-neutral-950 space-y-3">
            <ShieldCheck size={18} className="text-neutral-400" />
            <p className="text-xs text-neutral-500 leading-relaxed">Seller KYC and business license checks are required before approval and publication.</p>
          </div>
        </aside>

        <main className="lg:col-span-2 border border-neutral-900 bg-black p-7 md:p-10 space-y-8">
          <div className="flex items-center gap-3">
            <Building2 size={18} className="text-neutral-500" />
            <h2 className="text-xs uppercase tracking-[0.25em] font-bold">{stepTitle}</h2>
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Legal Entity Name" value={formData.companyName} onChange={(value) => setField('companyName', value)} required />
              <Field label="Tax ID / Registration Number" value={formData.taxId} onChange={(value) => setField('taxId', value)} required />
              <Field label="Country of Registration" value={formData.country} onChange={(value) => setField('country', value)} required />
              <Field label="Founded Year" type="number" value={formData.foundedYear} onChange={(value) => setField('foundedYear', value)} />
              <Field label="Founder Ownership %" type="number" value={formData.founderOwnership} onChange={(value) => setField('founderOwnership', value)} />
              <Field label="Investor Ownership %" type="number" value={formData.investorOwnership} onChange={(value) => setField('investorOwnership', value)} />
              <Field label="ESOP Ownership %" type="number" value={formData.esopOwnership} onChange={(value) => setField('esopOwnership', value)} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Field label="Deal Title" value={formData.title} onChange={(value) => setField('title', value)} required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Industry</span>
                  <select required className="w-full bg-transparent border-b border-neutral-800 py-4 focus:outline-none focus:border-white" value={formData.industry} onChange={(event) => setField('industry', event.target.value)}>
                    <option value="">Select Industry</option>
                    {industries.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <Field label="Location" value={formData.location} onChange={(value) => setField('location', value)} required />
              </div>
              <TextArea label="Products / Services" value={formData.products} onChange={(value) => setField('products', value)} />
              <TextArea label="Target Markets" value={formData.targetMarkets} onChange={(value) => setField('targetMarkets', value)} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Revenue Last 3 Years</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formData.revenue.map((rev, index) => (
                    <input
                      key={index}
                      type="number"
                      placeholder={`Year ${index + 1}`}
                      className="bg-neutral-900/50 p-4 border border-neutral-800 focus:outline-none focus:border-white"
                      value={rev}
                      onChange={(event) => {
                        const revenue = [...formData.revenue];
                        revenue[index] = event.target.value;
                        setField('revenue', revenue);
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="EBITDA" type="number" value={formData.ebitda} onChange={(value) => setField('ebitda', value)} />
                <Field label="Net Profit" type="number" value={formData.netProfit} onChange={(value) => setField('netProfit', value)} />
                <Field label="Growth Rate %" type="number" value={formData.growthRate} onChange={(value) => setField('growthRate', value)} />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <label className="space-y-2 block">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Deal Type</span>
                <select className="w-full bg-transparent border-b border-neutral-800 py-4 focus:outline-none focus:border-white" value={formData.dealType} onChange={(event) => setField('dealType', event.target.value)}>
                  <option value="sell_100">Sell 100%</option>
                  <option value="sell_equity">Sell Equity Stake</option>
                  <option value="fundraising">Fundraising</option>
                </select>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Valuation" type="number" value={formData.valuation} onChange={(value) => setField('valuation', value)} />
                <Field label="Equity Offered %" type="number" value={formData.equityOffered} onChange={(value) => setField('equityOffered', value)} />
              </div>
              <TextArea label="Deal Summary" value={formData.summary} onChange={(value) => setField('summary', value)} />
              <TextArea label="Reason for Sale / Fundraising" value={formData.strategicReason} onChange={(value) => setField('strategicReason', value)} />
              <TextArea label="Future Plan" value={formData.futurePlan} onChange={(value) => setField('futurePlan', value)} />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {['Pitch deck', 'Financial report', 'Legal documents', 'Business license', 'Shareholder list'].map((docName) => {
                const selected = formData.uploadedDocs.includes(docName);
                return (
                  <button
                    key={docName}
                    type="button"
                    onClick={() => setField('uploadedDocs', selected ? formData.uploadedDocs.filter((item) => item !== docName) : [...formData.uploadedDocs, docName])}
                    className={`w-full p-5 border flex items-center justify-between text-left ${selected ? 'border-green-700 bg-green-950/20' : 'border-neutral-900 bg-neutral-950 hover:bg-neutral-900'}`}
                  >
                    <span className="flex items-center gap-3 text-sm"><Upload size={16} /> {docName}</span>
                    {selected && <FileCheck2 size={16} className="text-green-500" />}
                  </button>
                );
              })}
              <p className="text-xs text-neutral-500 leading-relaxed">This demo records document categories. A production build should connect these actions to Firebase Storage with per-file permissions and watermarking.</p>
            </motion.div>
          )}

          <div className="flex gap-4 pt-4 border-t border-neutral-900">
            {step > 1 && (
              <button type="button" onClick={handleBack} className="flex-1 py-4 border border-neutral-800 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                <ChevronLeft size={14} /> Back
              </button>
            )}
            {step < 5 ? (
              <button type="button" onClick={handleNext} className="flex-1 py-4 bg-white text-black text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                Next Step <ChevronRight size={14} />
              </button>
            ) : (
              <button type="submit" disabled={loading} className="flex-1 py-4 bg-white text-black text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit for Review'}
              </button>
            )}
          </div>
        </main>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="space-y-2">
      <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">{label}</span>
      <input
        required={required}
        type={type}
        className="w-full bg-transparent border-b border-neutral-800 py-4 focus:outline-none focus:border-white transition-colors"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 block">
      <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">{label}</span>
      <textarea
        rows={4}
        className="w-full bg-neutral-900/50 p-4 border border-neutral-800 focus:outline-none focus:border-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
