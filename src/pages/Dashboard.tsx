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
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../lib/utils';
import { sampleDeals } from '../lib/mockData';
import { canAdminModerate, statusLabel, normalizeDealStatus } from '../lib/compliance';
import { writeAuditLog } from '../lib/audit';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
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
  const dealStatusLabel = (status?: string) => t(`statuses.deals.${normalizeDealStatus(status)}`, { defaultValue: statusLabel(status) });
  const ndaStatusLabel = (status?: string) => t(`statuses.nda.${String(status || 'requested').toLowerCase().replace(/\s+/g, '_')}`, { defaultValue: status || 'requested' });

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
      setNdaMessage(status === 'signed' ? t('dashboard.messages.nda_approved') : t('dashboard.messages.nda_rejected'));
    } catch (error: any) {
      console.error('NDA update failed:', error);
      if (error?.code === 'permission-denied') {
        setNdaError(t('dashboard.errors.firestore_rules_blocking_nda'));
      } else {
setNdaError(error instanceof Error ? error.message : t('dashboard.errors.nda_update_failed'));
      }
    }
  };

  const updateDealStatus = async (
  dealId: string,
  status: 'under_review' | 'approved' | 'published' | 'closed'
) => {
  if (!user || !isAdmin) return;

  setNdaMessage(null);
  setNdaError(null);

  try {
    await updateDoc(doc(db, 'deals', dealId), {
      status,
      reviewStatus: status === 'published' ? 'approved' : status,
      reviewedAt: serverTimestamp(),
      reviewedBy: user.uid,
      updatedAt: serverTimestamp(),
      ...(status === 'published'
        ? {
            publishedAt: serverTimestamp(),
          }
        : {}),
    });

    await writeAuditLog({
      actorUid: user.uid,
      actorRole: profile?.role,
      action: `deal_${status}`,
      targetType: 'deal',
      targetId: dealId,
      dealId,
    });

    setNdaMessage(
      t('dashboard.messages.deal_moved', {
        status: dealStatusLabel(status),
      })
    );
  } catch (error: any) {
    console.error('Deal moderation failed:', error);
    setNdaError(
      error instanceof Error
        ? error.message
        : t('dashboard.errors.deal_moderation_failed')
    );
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
      setNdaMessage(t('dashboard.messages.kyc_status_for_user', { status, user: targetUid }));
    } catch (error) {
      console.error('KYC moderation failed:', error);
      setNdaError(error instanceof Error ? error.message : t('dashboard.errors.kyc_moderation_failed'));
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-500">
            <Activity size={14} className="animate-pulse" />
            <p className="text-[10px] uppercase tracking-[0.4em] font-black">{t('dashboard.live_operations')}</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase">{t('dashboard.title')}</h1>
          <p className="text-slate-400 max-w-2xl font-light leading-relaxed">
            {t('dashboard.welcome_prefix')} <span className="text-white font-medium">{profile?.name || t('dashboard.default_name')}</span>. {t('dashboard.welcome_suffix')}
          </p>
        </div>
        <Link to="/create-deal" className="group flex items-center gap-3 px-8 py-4 bg-emerald-500 text-slate-950 text-xs uppercase font-black tracking-widest hover:bg-emerald-400 transition-all rounded-2xl shadow-lg shadow-emerald-500/10">
          <Plus size={16} /> {t('dashboard.new_asset_listing')}
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Briefcase, label: t('dashboard.stats.active_listings'), value: displayDeals.length, trend: '+12%', color: 'emerald' },
          { icon: FileCheck, label: t('dashboard.stats.signed_ndas'), value: myNdas.filter((n) => n.status === 'signed').length || 12, trend: '+5%', color: 'blue' },
          { icon: Clock, label: t('dashboard.stats.pending_actions'), value: pendingNdas, trend: t('dashboard.high_priority'), color: 'orange' },
          { icon: TrendingUp, label: t('dashboard.stats.pipeline_value'), value: '$58.5M', trend: '+2.4M', color: 'white' },
        ].map((metric, idx) => (
          <motion.div 
            key={metric.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-[2rem] space-y-4 relative overflow-hidden group hover:border-emerald-500/30 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-${metric.color}-500/10 flex items-center justify-center text-${metric.color}-500`}>
              <metric.icon size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{metric.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white tracking-tighter">{metric.value}</p>
                <span className="text-[10px] text-emerald-500 font-bold">{metric.trend}</span>
              </div>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <metric.icon size={80} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {(ndaMessage || ndaError) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-medium ${ndaError ? 'border-red-500/20 bg-red-500/5 text-red-400' : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'}`}
          >
            <AlertCircle size={18} />
            {ndaError || ndaMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Deal Lifecycle */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] uppercase tracking-[0.4em] font-black text-slate-500 flex items-center gap-2">
              <Activity size={14} className="text-emerald-500" /> {t('dashboard.portfolio_health')}
            </h3>
            <Link to="/marketplace" className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-white transition-colors">{t('dashboard.explorer_marketplace')}</Link>
          </div>

          <div className="space-y-3">
            {displayDeals.map((deal) => (
              <Link key={deal.id} to={`/deals/${deal.id}`} 
                className="flex flex-col md:flex-row gap-6 p-6 bg-slate-900/30 border border-slate-800/60 rounded-3xl hover:border-emerald-500/40 hover:bg-slate-900/50 transition-all group relative overflow-hidden"
              >
                <div className="flex-1 flex gap-5 items-center">
                  <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <Activity size={24} className="text-slate-500 group-hover:text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight">{deal.title}</p>
                    <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest mt-1">{deal.industry} • {deal.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-white tracking-tighter">{formatCurrency(Number(deal.valuation || 0))}</p>
                    <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mt-1 text-right">{t('dashboard.valuation')}</p>
                  </div>
                  <div className="flex gap-2">
                    {[t('dashboard.audit'), dealStatusLabel(deal.status || 'published')].map((stage) => (
                      <span key={stage} className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-[9px] uppercase tracking-widest font-black text-slate-400">
                        {stage}
                      </span>
                    ))}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Activity Queue */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-[11px] uppercase tracking-[0.4em] font-black text-slate-500 px-2">{t('dashboard.action_items')}</h3>
          <div className="bg-slate-900/20 border border-slate-800/60 rounded-[2.5rem] divide-y divide-slate-800/60 overflow-hidden">
            {[
              { icon: ShieldCheck, label: t('dashboard.actions.kyc_review'), meta: t('dashboard.actions.profiles_pending', { count: 2 }), color: 'emerald' },
              { icon: FileCheck, label: t('dashboard.actions.nda_request'), meta: t('dashboard.actions.awaiting_approval', { count: pendingNdas }), color: 'blue' },
              { icon: MessageSquare, label: t('dashboard.actions.negotiation'), meta: t('dashboard.actions.new_message'), color: 'purple' },
              { icon: Gavel, label: t('dashboard.actions.legal_milestone'), meta: t('dashboard.actions.spa_draft_ready'), color: 'orange' },
            ].map((item) => (
              <div key={item.label} className="p-6 flex items-start gap-5 hover:bg-slate-900/40 transition-colors cursor-pointer group">
                <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-500 group-hover:scale-110 transition-transform`}>
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-black text-white">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium italic group-hover:text-slate-300 transition-colors">{item.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Section (Enhanced) */}
      {isAdmin && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 bg-emerald-500/[0.02] border border-emerald-500/10 p-10 rounded-[3rem]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tighter uppercase flex items-center gap-3">
                <ShieldCheck className="text-emerald-500" /> {t('dashboard.admin.protocol')}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">{t('dashboard.admin.description')}</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-emerald-500/10 rounded-full text-[9px] text-emerald-500 font-black tracking-widest uppercase">{t('dashboard.admin.lvl4_auth')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* KYC Admin Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('dashboard.admin.identity_verification')}</span>
                <span className="text-[10px] text-emerald-500 font-bold">{t('dashboard.admin.pending_count', { count: kycUsers.length })}</span>
              </div>
              <div className="divide-y divide-slate-800">
                {kycUsers.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-600 font-bold uppercase tracking-widest italic">{t('dashboard.admin.all_identities_cleared')}</div>
                ) : (
                  kycUsers.map((item) => (
                    <div key={item.id} className="p-6 flex items-center justify-between bg-transparent hover:bg-slate-800/30 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight uppercase">{item.name || t('dashboard.admin.anonymous')}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">{item.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateKycStatus(item.id, 'rejected')} className="px-4 py-2 bg-slate-800 rounded-xl text-[9px] font-black uppercase text-red-400 hover:bg-red-500/20 transition-all">{t('dashboard.admin.reject')}</button>
                        <button onClick={() => updateKycStatus(item.id, 'verified')} className="px-4 py-2 bg-white rounded-xl text-[9px] font-black uppercase text-slate-950 hover:bg-emerald-400 transition-all">{t('dashboard.admin.verify')}</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Deal Admin Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('dashboard.admin.asset_moderation')}</span>
                <span className="text-[10px] text-emerald-500 font-bold">{t('dashboard.admin.priority_review')}</span>
              </div>
              <div className="divide-y divide-slate-800 text-white">
                {moderationDeals.filter(d => ['submitted', 'under_review'].includes(d.status)).length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-600 font-bold uppercase tracking-widest italic">{t('dashboard.admin.asset_pipeline_empty')}</div>
                ) : (
                  moderationDeals.filter(d => ['submitted', 'under_review'].includes(d.status)).map((deal) => (
                    <div key={deal.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">{deal.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{deal.industry} • {deal.location}</p>
                      </div>
                      <button
                        onClick={() => updateDealStatus(deal.id, 'published')}
                        className="px-5 py-2.5 bg-emerald-500 rounded-xl text-[10px] font-black uppercase text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        {t('dashboard.admin.review_asset')}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* NDA Section (Enhanced) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[11px] uppercase tracking-[0.4em] font-black text-slate-500">{t('dashboard.nda.title')}</h3>
          <ShieldCheck size={14} className="text-slate-600" />
        </div>
        <div className="bg-slate-900/20 border border-slate-800/60 rounded-[2.5rem] overflow-hidden shadow-xl">
          {myNdas.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-600 font-black uppercase tracking-[0.2em] italic">{t('dashboard.nda.no_active_requests')}</div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {myNdas.map((nda) => {
                // Defensive check: ensure NDA has required fields
                if (!nda.id || !nda.dealId) {
                  console.warn('Invalid NDA record detected:', nda);
                  return null;
                }
                
                return (
                  <div key={nda.id} className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-transparent hover:bg-slate-900/40 transition-colors">
                    <div className="lg:col-span-4 flex items-center gap-5">
                      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-500">
                        <FileCheck size={20} />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest font-black text-white">{t('dashboard.nda.mutual_request')}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1 italic">{isSeller ? nda.buyerEmail || nda.buyerUid : `${t('dashboard.nda.asset_id')}: ${nda.dealId.slice(0, 8)}...`}</p>
                      </div>
                    </div>
                    <div className="lg:col-span-3">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                        nda.status === 'signed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                        nda.status === 'rejected' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                        'bg-blue-500/10 border-blue-500/30 text-blue-500'
                      }`}>
                        {ndaStatusLabel(nda.status)}
                      </span>
                    </div>
                    <div className="lg:col-span-5 flex justify-end items-center gap-4">
                      {isSeller && nda.status === 'requested' ? (
                        <div className="flex gap-2">
                           <button onClick={() => updateNdaStatus(nda.id, 'rejected')} className="px-5 py-2.5 bg-slate-800 rounded-xl text-[10px] font-black uppercase text-red-400 hover:bg-red-500/20 transition-all">{t('dashboard.nda.deny')}</button>
                           <button onClick={() => updateNdaStatus(nda.id, 'signed')} className="px-5 py-2.5 bg-white rounded-xl text-[10px] font-black uppercase text-slate-950 hover:bg-emerald-400 transition-all">{t('dashboard.nda.execute_sign')}</button>
                        </div>
                      ) : (
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-600">
                          {nda.status === 'signed' ? t('dashboard.nda.watermarked_access_granted') : t('dashboard.nda.awaiting_counter_signature')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer System Info */}
      <footer className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-slate-800/60">
        {[
          { title: t('dashboard.footer.encrypted_infrastructure'), desc: t('dashboard.footer.encrypted_desc') },
          { title: t('dashboard.footer.global_compliance'), desc: t('dashboard.footer.compliance_desc') },
          { title: t('dashboard.footer.realtime_audit'), desc: t('dashboard.footer.audit_desc') },
        ].map(item => (
          <div key={item.title} className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-white">{item.title}</p>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase">{item.desc}</p>
          </div>
        ))}
      </footer>
    </div>
  );
}
