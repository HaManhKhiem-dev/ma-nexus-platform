import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/AuthContext';
import {
  Briefcase,
  FileCheck,
  Clock,
  ChevronRight,
  TrendingUp,
  Users,
  Activity,
  Plus,
  ShieldCheck,
  Scale,
  MessageSquare,
  Gavel,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { sampleDeals } from '../lib/mockData';
import { canAdminModerate, statusLabel } from '../lib/compliance';
import { writeAuditLog } from '../lib/audit';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [myDeals, setMyDeals] = useState<any[]>([]);
  const [moderationDeals, setModerationDeals] = useState<any[]>([]);
  const [kycUsers, setKycUsers] = useState<any[]>([]);
  const [myNdas, setMyNdas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ndaMessage, setNdaMessage] = useState<string | null>(null);
  const [ndaError, setNdaError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const dealsQ = query(collection(db, 'deals'), where('sellerUid', '==', user.uid));
    const unsubDeals = onSnapshot(dealsQ, (snap) => {
      setMyDeals(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const ndaQ = query(collection(db, 'ndas'), where(profile?.role === 'seller' ? 'sellerUid' : 'buyerUid', '==', user.uid));
    const unsubNdas = onSnapshot(ndaQ, (snap) => {
      setMyNdas(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    let unsubModeration = () => {};
    if (canAdminModerate(profile)) {
      unsubModeration = onSnapshot(collection(db, 'deals'), (snap) => {
        setModerationDeals(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
      const usersQ = query(collection(db, 'users'), where('kycStatus', '==', 'pending'));
      const unsubUsers = onSnapshot(usersQ, (snap) => {
        setKycUsers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
      const previousUnsub = unsubModeration;
      unsubModeration = () => { previousUnsub(); unsubUsers(); };
    }

    setLoading(false);
    return () => { unsubDeals(); unsubNdas(); unsubModeration(); };
  }, [user, profile]);

  if (loading) return null;

  const displayDeals = myDeals.length > 0 ? myDeals : sampleDeals.slice(0, 2);
  const pendingNdas = myNdas.filter((nda) => nda.status === 'requested').length || 3;
  const isSeller = profile?.role === 'seller';
  const isAdmin = canAdminModerate(profile);

  const updateNdaStatus = async (ndaId: string, status: 'signed' | 'rejected') => {
    if (!user) return;
    setNdaMessage(null);
    setNdaError(null);
    try {
      await updateDoc(doc(db, 'ndas', ndaId), {
        status,
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid,
      });
      await writeAuditLog({
        actorUid: user.uid,
        actorRole: profile?.role,
        action: status === 'signed' ? 'nda_signed' : 'nda_rejected',
        targetType: 'nda',
        targetId: ndaId,
      });
      setNdaMessage(status === 'signed' ? 'NDA approved. Buyer can now access private deal materials.' : 'NDA rejected.');
    } catch (error: any) {
      console.error('NDA update failed:', error);
      if (error?.code === 'permission-denied') {
        setNdaError('Firestore rules are blocking NDA approval. Publish the updated firestore.rules file to allow seller NDA updates.');
      } else {
        setNdaError(error instanceof Error ? error.message : 'NDA update failed.');
      }
    }
  };

  const updateDealStatus = async (dealId: string, status: 'under_review' | 'approved' | 'published' | 'closed') => {
    if (!user || !isAdmin) return;
    setNdaMessage(null);
    setNdaError(null);
    try {
      await updateDoc(doc(db, 'deals', dealId), {
        status,
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid,
        updatedAt: serverTimestamp(),
      });
      await writeAuditLog({
        actorUid: user.uid,
        actorRole: profile?.role,
        action: `deal_${status}`,
        targetType: 'deal',
        targetId: dealId,
        dealId,
      });
      setNdaMessage(`Deal moved to ${statusLabel(status)}.`);
    } catch (error: any) {
      console.error('Deal moderation failed:', error);
      setNdaError(error instanceof Error ? error.message : 'Deal moderation failed.');
    }
  };

  const updateKycStatus = async (targetUid: string, status: 'verified' | 'rejected') => {
    if (!user || !isAdmin) return;
    setNdaMessage(null);
    setNdaError(null);
    try {
      await updateDoc(doc(db, 'users', targetUid), {
        kycStatus: status,
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid,
      });
      await writeAuditLog({
        actorUid: user.uid,
        actorRole: profile?.role,
        action: `kyc_${status}`,
        targetType: 'user',
        targetId: targetUid,
      });
      setNdaMessage(`KYC ${status} for user ${targetUid}.`);
    } catch (error) {
      console.error('KYC moderation failed:', error);
      setNdaError(error instanceof Error ? error.message : 'KYC moderation failed.');
    }
  };

  return (
    <div className="space-y-14">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold">Role-based Workspace</p>
          <h1 className="text-4xl md:text-6xl font-light tracking-tightest">Dashboard</h1>
          <p className="text-sm text-neutral-500 max-w-2xl">Seller pipeline, buyer activity, advisor tasks, KYC moderation, and legal milestones in one operating view.</p>
        </div>
        <Link to="/create-deal" className="flex items-center gap-2 px-8 py-3 bg-white text-black text-[10px] uppercase font-bold tracking-widest hover:bg-neutral-200 transition-all">
          <Plus size={14} /> New Listing
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-neutral-900 border border-neutral-900">
        {[
          { icon: Briefcase, label: 'Active Listings', value: displayDeals.length, tone: 'text-white' },
          { icon: FileCheck, label: 'Signed NDAs', value: myNdas.filter((nda) => nda.status === 'signed').length || 12, tone: 'text-green-500' },
          { icon: Clock, label: 'Pending Actions', value: pendingNdas, tone: 'text-orange-500' },
          { icon: TrendingUp, label: 'Pipeline Value', value: '$58.5M', tone: 'text-white' },
        ].map((metric) => (
          <div key={metric.label} className="bg-black p-7 space-y-2">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold flex items-center gap-2"><metric.icon size={12} /> {metric.label}</p>
            <p className={`text-3xl font-light ${metric.tone}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      {(ndaMessage || ndaError) && (
        <div className={`border p-4 text-sm ${ndaError ? 'border-red-900/60 bg-red-950/30 text-red-200' : 'border-green-900/60 bg-green-950/30 text-green-200'}`}>
          {ndaError || ndaMessage}
        </div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-6 gap-10">
        <div className="lg:col-span-4 space-y-7">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400">Deal Lifecycle</h3>
            <Link to="/marketplace" className="text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1 hover:gap-2 transition-all">View Market <ChevronRight size={10} /></Link>
          </div>

          <div className="space-y-px bg-neutral-900 border border-neutral-900">
            {displayDeals.map((deal) => (
              <Link key={deal.id} to={`/deals/${deal.id}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-black hover:bg-neutral-950 transition-colors group">
                <div className="md:col-span-5 flex gap-4 items-center">
                  <div className="w-11 h-11 bg-neutral-900 flex items-center justify-center border border-neutral-800">
                    <Activity size={16} className="text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">{deal.title}</p>
                    <p className="text-[10px] text-neutral-600">{deal.industry} · {deal.location}</p>
                  </div>
                </div>
                <div className="md:col-span-3">
                  <p className="text-xs font-mono">{formatCurrency(Number(deal.valuation || 0))}</p>
                  <p className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest">Valuation</p>
                </div>
                <div className="md:col-span-4 grid grid-cols-3 gap-2">
                  {['Review', 'NDA', statusLabel(deal.status || 'published')].map((stage) => (
                    <span key={stage} className="px-2 py-2 border border-neutral-800 text-center text-[9px] uppercase tracking-widest text-neutral-400">{stage}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-7">
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400">Activity Queue</h3>
          <div className="space-y-px bg-neutral-900 border border-neutral-900">
            {[
              { icon: ShieldCheck, label: 'KYC review', meta: '2 business profiles pending' },
              { icon: FileCheck, label: 'NDA request', meta: `${pendingNdas} buyers awaiting approval` },
              { icon: MessageSquare, label: 'Negotiation', meta: 'Counter-offer due today' },
              { icon: Scale, label: 'Legal', meta: 'LOI review in progress' },
              { icon: Gavel, label: 'Closing', meta: 'SPA signature checklist' },
            ].map((item) => (
              <div key={item.label} className="p-5 bg-black flex items-start gap-4">
                <div className="w-9 h-9 border border-neutral-800 bg-neutral-950 flex items-center justify-center">
                  <item.icon size={15} className="text-neutral-500" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold">{item.label}</p>
                  <p className="text-xs text-neutral-500 mt-1">{item.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isAdmin && (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          <div className="space-y-7">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400">Admin KYC Review</h3>
              <p className="text-[10px] uppercase tracking-widest text-neutral-600">Required before private access</p>
            </div>
            <div className="space-y-px bg-neutral-900 border border-neutral-900">
              {kycUsers.length === 0 ? (
                <div className="p-8 bg-black text-xs text-neutral-600 uppercase tracking-widest">No KYC profiles awaiting review.</div>
              ) : (
                kycUsers.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-black">
                    <div className="md:col-span-7">
                      <p className="text-xs uppercase tracking-widest font-bold">{item.name || 'User'}</p>
                      <p className="text-[10px] text-neutral-500 mt-1">{item.email} / {item.role}</p>
                    </div>
                    <div className="md:col-span-5 flex items-center justify-end gap-3">
                      <button onClick={() => updateKycStatus(item.id, 'rejected')} className="px-4 py-2 border border-neutral-800 text-[9px] uppercase tracking-widest font-bold hover:bg-neutral-900">Reject</button>
                      <button onClick={() => updateKycStatus(item.id, 'verified')} className="px-4 py-2 bg-white text-black text-[9px] uppercase tracking-widest font-bold hover:bg-neutral-200">Verify</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-7">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400">Admin Deal Moderation</h3>
              <p className="text-[10px] uppercase tracking-widest text-neutral-600">Approval is required before publish</p>
            </div>
            <div className="space-y-px bg-neutral-900 border border-neutral-900">
              {moderationDeals.filter((deal) => ['submitted', 'under_review', 'approved'].includes(deal.status)).length === 0 ? (
                <div className="p-8 bg-black text-xs text-neutral-600 uppercase tracking-widest">No deals awaiting moderation.</div>
              ) : (
                moderationDeals.filter((deal) => ['submitted', 'under_review', 'approved'].includes(deal.status)).map((deal) => (
                  <div key={deal.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-black">
                    <div className="md:col-span-5">
                      <p className="text-xs uppercase tracking-widest font-bold">{deal.title}</p>
                      <p className="text-[10px] text-neutral-500 mt-1">{deal.industry} / {deal.location}</p>
                    </div>
                    <div className="md:col-span-2 flex items-center">
                      <span className="px-3 py-2 border border-blue-900/60 text-blue-400 text-[10px] uppercase tracking-widest">{statusLabel(deal.status)}</span>
                    </div>
                    <div className="md:col-span-5 flex flex-wrap items-center justify-end gap-3">
                      {deal.status === 'submitted' && (
                        <button onClick={() => updateDealStatus(deal.id, 'under_review')} className="px-4 py-2 border border-neutral-800 text-[9px] uppercase tracking-widest font-bold hover:bg-neutral-900">Start Review</button>
                      )}
                      {deal.status === 'under_review' && (
                        <button onClick={() => updateDealStatus(deal.id, 'approved')} className="px-4 py-2 bg-white text-black text-[9px] uppercase tracking-widest font-bold hover:bg-neutral-200">Approve</button>
                      )}
                      {deal.status === 'approved' && (
                        <button onClick={() => updateDealStatus(deal.id, 'published')} className="px-4 py-2 bg-white text-black text-[9px] uppercase tracking-widest font-bold hover:bg-neutral-200">Publish</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      <section className="space-y-7">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400">
            {isSeller ? 'Seller NDA Requests' : 'My NDA Requests'}
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-neutral-600">
            {isSeller ? 'Approve signed access for buyers' : 'Track your access requests'}
          </p>
        </div>

        <div className="space-y-px bg-neutral-900 border border-neutral-900">
          {myNdas.length === 0 ? (
            <div className="p-8 bg-black text-xs text-neutral-600 uppercase tracking-widest">
              No NDA requests yet.
            </div>
          ) : (
            myNdas.map((nda) => (
              <div key={nda.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-black">
                <div className="md:col-span-5 flex items-center gap-4">
                  <div className="w-10 h-10 border border-neutral-800 bg-neutral-950 flex items-center justify-center">
                    <FileCheck size={15} className="text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold">NDA Request</p>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      {isSeller ? `${nda.buyerName || 'Buyer'} · ${nda.buyerEmail || nda.buyerUid}` : `Deal ${nda.dealId}`}
                    </p>
                  </div>
                </div>
                <div className="md:col-span-3 flex items-center">
                  <div className="space-y-2">
                    <span className={`inline-flex px-3 py-2 border text-[10px] uppercase tracking-widest ${nda.status === 'signed' ? 'border-green-900/60 text-green-500' : nda.status === 'rejected' ? 'border-red-900/60 text-red-400' : 'border-blue-900/60 text-blue-400'}`}>
                      {nda.status}
                    </span>
                    {isSeller && user?.uid !== nda.sellerUid && (
                      <p className="text-[10px] text-red-400 leading-relaxed">
                        Seller UID mismatch. This request belongs to another seller account.
                      </p>
                    )}
                  </div>
                </div>
                <div className="md:col-span-4 flex items-center justify-end gap-3">
                  {isSeller && nda.status === 'requested' && user?.uid === nda.sellerUid ? (
                    <>
                      <button onClick={() => updateNdaStatus(nda.id, 'rejected')} className="px-4 py-2 border border-neutral-800 text-[9px] uppercase tracking-widest font-bold hover:bg-neutral-900">
                        Reject
                      </button>
                      <button onClick={() => updateNdaStatus(nda.id, 'signed')} className="px-4 py-2 bg-white text-black text-[9px] uppercase tracking-widest font-bold hover:bg-neutral-200">
                        Approve / Sign
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] uppercase tracking-widest text-neutral-600">
                      {nda.status === 'signed' ? 'Access granted' : nda.status === 'rejected' ? 'Access denied' : isSeller ? 'Not owned by this seller' : 'Waiting for seller'}
                    </span>
                  )}
                </div>
                <div className="md:col-span-12 border-t border-neutral-900 pt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] text-neutral-600 font-mono break-all">
                  <span>currentUid: {user?.uid || 'none'}</span>
                  <span>ndaSellerUid: {nda.sellerUid || 'none'}</span>
                  <span>dealId: {nda.dealId || 'none'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-900 border border-neutral-900">
        {[
          ['Seller', 'Views, investor interest, NDA requests, conversion, publication controls.'],
          ['Buyer', 'Saved deals, followed deals, submitted offers, data room access.'],
          ['Admin', 'User management, KYC approval, deal moderation, transaction analytics.'],
        ].map(([role, text]) => (
          <div key={role} className="bg-black p-7">
            <p className="text-sm font-bold uppercase tracking-widest">{role}</p>
            <p className="text-xs text-neutral-500 leading-relaxed mt-3">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
