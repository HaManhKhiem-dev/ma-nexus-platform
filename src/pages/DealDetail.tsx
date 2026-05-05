import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../hooks/useFirebase';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  Unlock,
  Info,
  ChevronRight,
  TrendingUp,
  MapPin,
  DollarSign,
  Building2,
  Bookmark,
  FileSignature,
  MessagesSquare,
  CalendarDays,
  XCircle,
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { getDealSummary } from '../lib/gemini';
import { useAuth } from '../components/AuthContext';
import { collection, serverTimestamp, query, where, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sampleDeals } from '../lib/mockData';
import { canRequestNda, canViewPrivateDeal, isKycVerified, statusLabel } from '../lib/compliance';
import { writeAuditLog } from '../lib/audit';

export default function DealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deal: firestoreDeal, loading } = useDeal(id!);
  const fallbackDeal = sampleDeals.find((item) => item.id === id);
  const deal = firestoreDeal || fallbackDeal;
  const { user, profile } = useAuth();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [ndaStatus, setNdaStatus] = useState<string | null>(fallbackDeal ? 'requested' : null);
  const [showNdaModal, setShowNdaModal] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    if (deal && !aiSummary) {
      getDealSummary(deal).then(setAiSummary).catch(() => {
        setAiSummary('Strong strategic fit for buyers seeking revenue scale, defensible market position, and an organized diligence package. Key diligence priorities include customer concentration, owner dependency, legal encumbrances, and quality of earnings.');
      });
    }
  }, [deal, aiSummary]);

  useEffect(() => {
    if (!user || !id || fallbackDeal) return;
    const q = query(collection(db, 'ndas'), where('dealId', '==', id), where('buyerUid', '==', user.uid));
    return onSnapshot(q, (snap) => {
      if (!snap.empty) setNdaStatus(snap.docs[0].data().status);
    });
  }, [user, id, fallbackDeal]);

  const handleOpenNdaModal = () => {
    if (!canRequestNda(profile)) {
      alert('KYC verified buyer/advisor account is required before requesting an NDA.');
      return;
    }
    setShowNdaModal(true);
  };

  const signAndRequestNDA = async () => {
    if (!user || !deal) {
      setNdaStatus('requested');
      setShowNdaModal(false);
      return;
    }

    if (signatureName.trim().length < 2) {
      alert('Please enter your full legal name to sign.');
      return;
    }

    setIsSigning(true);
    try {
      // Fetch public IP address
      let clientIp = 'Unknown';
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        clientIp = data.ip;
      } catch (e) {
        console.warn('Could not fetch IP address');
      }

      const signatureData = {
        signerName: signatureName.trim(),
        ipAddress: clientIp,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      await setDoc(doc(db, 'ndas', `${user.uid}_${id}`), {
        dealId: id,
        buyerUid: user.uid,
        buyerName: profile?.name || user.displayName || 'Buyer',
        buyerEmail: user.email || profile?.email || '',
        sellerUid: deal.sellerUid,
        status: 'requested',
        signatureData: signatureData,
        createdAt: serverTimestamp(),
      });

      await writeAuditLog({
        actorUid: user.uid,
        actorRole: profile?.role,
        action: 'nda_signed_digitally',
        targetType: 'nda',
        dealId: id,
        metadata: {
          sellerUid: deal.sellerUid,
          signature: signatureData
        },
      });

      setShowNdaModal(false);
    } catch (err) {
      console.error('Failed to sign NDA:', err);
      alert('Failed to sign NDA. Please try again.');
    } finally {
      setIsSigning(false);
    }
  };

  const logDealAction = async (action: string) => {
    await writeAuditLog({
      actorUid: user?.uid,
      actorRole: profile?.role,
      action,
      targetType: 'deal',
      targetId: id,
      dealId: id,
    });
  };

  if (loading && !fallbackDeal) return null;
  if (!deal) return <div className="p-20 text-center">Deal not found.</div>;

  const isSellerOwner = user?.uid === deal.sellerUid;
  const isAuthorized = canViewPrivateDeal(profile, ndaStatus, isSellerOwner, deal.status);
  const latestRevenue = Number(deal.revenue?.[2] || 0);

  return (
    <div className="space-y-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold">
        <ArrowLeft size={14} /> Back to marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-14">
          <header className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-[9px] uppercase tracking-widest">{deal.industry}</span>
              <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-[9px] uppercase tracking-widest flex items-center gap-1">
                <MapPin size={10} /> {deal.location}
              </span>
              <span className="px-3 py-1 bg-green-950/30 border border-green-900/50 text-green-500 text-[9px] uppercase tracking-widest">{statusLabel(deal.status || 'published')}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-light tracking-tightest">{deal.title}</h1>
            <p className="text-lg text-neutral-400 leading-relaxed border-l-4 border-neutral-800 pl-6 py-2">
              {deal.summary || 'A strategic opportunity with strong growth potential and controlled private diligence access.'}
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-4 gap-px bg-neutral-900 border border-neutral-900">
            {[
              ['Valuation', deal.valuation ? formatCurrency(Number(deal.valuation)) : 'TBA'],
              ['Equity Offered', `${deal.equityOffered || 0}%`],
              ['Revenue', latestRevenue ? formatCurrency(latestRevenue) : 'Private'],
              ['EBITDA', deal.ebitda ? formatCurrency(Number(deal.ebitda)) : 'Private'],
            ].map(([label, value]) => (
              <div key={label} className="bg-black p-6 space-y-2">
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{label}</p>
                <p className="text-xl font-mono">{value}</p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-900 border border-neutral-900">
            {[
              ['Match Score', deal.matchScore || 82, 'Buyer mandate fit'],
              ['Risk Score', deal.riskScore || 35, 'Lower is better'],
              ['Growth Score', deal.growthScore || 78, 'Revenue momentum'],
            ].map(([label, value, hint]) => (
              <div key={label as string} className="bg-black p-6">
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{label as string}</p>
                <div className="flex items-end gap-3 mt-2">
                  <p className="text-4xl font-light">{value as number}</p>
                  <p className="text-xs text-neutral-500 pb-1">{hint as string}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="bg-neutral-950 p-8 border border-neutral-900 space-y-5">
            <div className="flex items-center gap-2 text-neutral-400">
              <TrendingUp size={16} />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">AI Deal Summary</span>
            </div>
            <p className="text-base leading-relaxed text-neutral-300">
              {aiSummary || 'Generating summary from deal profile, financial metrics, and strategic context...'}
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <h3 className="text-xs uppercase tracking-[0.25em] font-bold text-neutral-500">Public View</h3>
              {[
                ['Market Position', deal.marketPosition || 'Public market position summary available.'],
                ['Strategic Objective', deal.strategicReason || 'Seller is seeking strategic capital, exit, or growth partner.'],
                ['Next Step', 'Request NDA to unlock full financials, contracts, IP, HR and legal files.'],
              ].map(([label, text]) => (
                <div key={label} className="border border-neutral-900 bg-black p-5">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">{label}</p>
                  <p className="text-sm text-neutral-300 mt-2 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <div className="space-y-5">
              <h3 className="text-xs uppercase tracking-[0.25em] font-bold text-neutral-500">Private View</h3>
              {['Full 3-year financial model', 'Customer and supplier contracts', 'Corporate records and cap table', 'IP, technology, HR, and compliance documents'].map((item) => (
                <div key={item} className={`border border-neutral-900 bg-black p-5 flex items-center justify-between ${!isAuthorized ? 'opacity-60' : ''}`}>
                  <span className="text-sm">{item}</span>
                  {isAuthorized ? <Unlock size={16} className="text-green-500" /> : <Lock size={16} className="text-neutral-500" />}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <div className="bg-neutral-950 border border-neutral-900 p-7 space-y-7">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Security Status</p>
              <div className="flex items-center gap-2">
                {isAuthorized ? <Unlock size={18} className="text-green-500" /> : <Lock size={18} className="text-neutral-500" />}
                <span className={isAuthorized ? 'text-green-500 text-xs font-bold uppercase tracking-widest' : 'text-neutral-500 text-xs font-bold uppercase tracking-widest'}>
                  {isAuthorized ? 'Private Access Granted' : 'NDA Required'}
                </span>
              </div>
            </div>

            {!isAuthorized && (
              <div className="space-y-5">
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Buyer must complete KYC and request NDA before accessing contracts, full financials, IP, and legal diligence files.
                </p>
                {!isKycVerified(profile) && (
                  <div className="border border-orange-900/50 bg-orange-950/20 p-3 text-[10px] text-orange-300 uppercase tracking-widest font-bold">
                    KYC verification required first
                  </div>
                )}
                {ndaStatus === 'requested' ? (
                  <div className="w-full text-center py-4 border border-blue-900/50 bg-blue-950/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                    NDA Request Pending
                  </div>
                ) : (
                  <button
                    onClick={handleOpenNdaModal}
                    disabled={!canRequestNda(profile)}
                    className="w-full py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Review & Sign NDA <ChevronRight size={14} />
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Bookmark', icon: Bookmark },
                { label: 'Contact', icon: MessagesSquare },
                { label: 'Meeting', icon: CalendarDays },
                { label: 'Offer', icon: DollarSign },
              ].map((action) => (
                <button key={action.label} onClick={() => logDealAction(action.label.toLowerCase())} className="py-3 border border-neutral-800 text-[10px] uppercase font-bold tracking-widest hover:bg-neutral-900 transition-all flex items-center justify-center gap-2">
                  <action.icon size={13} /> {action.label}
                </button>
              ))}
            </div>

            {isAuthorized && (
              <button
                onClick={() => {
                  logDealAction('data_room_opened');
                  navigate(`/data-room?dealId=${id}`);
                }}
                className="w-full py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
              >
                Open Data Room <ShieldCheck size={14} />
              </button>
            )}

            {isSellerOwner && (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-4 border border-green-900/60 bg-green-950/20 text-green-400 text-[10px] font-bold uppercase tracking-widest hover:bg-green-950/40 transition-all flex items-center justify-center gap-2"
              >
                Manage NDA Requests <FileSignature size={14} />
              </button>
            )}
          </div>

          <div className="bg-neutral-950 border border-neutral-900 p-7 space-y-4">
            <div className="flex items-center gap-2 text-neutral-500">
              <Info size={14} />
              <span className="text-[10px] uppercase font-bold tracking-widest">Listing Managed By</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                <Building2 size={18} className="text-neutral-500" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest">Verified Seller / Advisor</p>
                <p className="text-[10px] text-neutral-500">KYC, company license, shareholder records</p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-900 p-7 space-y-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Legal Workflow</p>
            {['Generate NDA', 'Review LOI', 'Negotiate SPA', 'eSignature', 'Closing archive'].map((step, index) => (
              <div key={step} className="flex items-center gap-3 text-xs">
                <span className="w-6 h-6 border border-neutral-800 flex items-center justify-center text-[9px] text-neutral-500">{index + 1}</span>
                <FileSignature size={13} className="text-neutral-500" />
                {step}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* NDA eSignature Modal */}
      {showNdaModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowNdaModal(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white"
            >
              <XCircle size={24} />
            </button>

            <div className="p-6 border-b border-neutral-800">
              <h2 className="text-xl font-light">Non-Disclosure Agreement (NDA)</h2>
              <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mt-2">Digital Signature Required</p>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-neutral-400 font-mono">
              <p>This Non-Disclosure Agreement (the "Agreement") is entered into to prevent the unauthorized disclosure of Confidential Information.</p>
              <p><strong>1. Confidential Information:</strong> For purposes of this Agreement, "Confidential Information" shall include all information or material that has or could have commercial value or other utility in the business in which the Disclosing Party is engaged.</p>
              <p><strong>2. Exclusions from Confidential Information:</strong> Receiving Party's obligations under this Agreement do not extend to information that is: (a) publicly known at the time of disclosure or subsequently becomes publicly known through no fault of the Receiving Party; (b) discovered or created by the Receiving Party before disclosure by Disclosing Party.</p>
              <p><strong>3. Obligations of Receiving Party:</strong> Receiving Party shall hold and maintain the Confidential Information in strictest confidence for the sole and exclusive benefit of the Disclosing Party.</p>
              <p className="text-orange-400 mt-6 border-l-2 border-orange-500 pl-4 py-2 bg-orange-950/20">
                By electronically signing this document, you acknowledge that your IP address, device information, and a timestamp will be permanently recorded in our cryptographic audit log as legally binding proof of your consent.
              </p>
            </div>

            <div className="p-6 border-t border-neutral-800 bg-black space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                  Type your full legal name to sign
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-neutral-900 border border-neutral-800 p-3 text-sm focus:border-neutral-500 outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNdaModal(false)}
                  className="flex-1 py-3 border border-neutral-800 text-[10px] uppercase tracking-widest font-bold hover:bg-neutral-900"
                >
                  Cancel
                </button>
                <button
                  onClick={signAndRequestNDA}
                  disabled={isSigning || signatureName.trim().length < 2}
                  className="flex-1 py-3 bg-white text-black text-[10px] uppercase tracking-widest font-bold disabled:opacity-50 hover:bg-neutral-200 flex items-center justify-center gap-2"
                >
                  {isSigning ? 'Signing securely...' : 'I Agree & Sign NDA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
