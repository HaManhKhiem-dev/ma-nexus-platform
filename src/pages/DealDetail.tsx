import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  BadgeDollarSign,
  BarChart3,
  Sparkles,
  FolderLock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

import { useDeal } from '../hooks/useFirebase';
import { formatCurrency } from '../lib/utils';
import { getDealSummary, explainDealForInvestor } from '../lib/gemini';
import { useAuth } from '../components/AuthContext';
import {
  collection,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  setDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sampleDeals } from '../lib/mockData';
import {
  canRequestNda,
  canViewPrivateDeal,
  isKycVerified,
  statusLabel,
  normalizeDealStatus,
  canRequestNdaForDeal,
} from '../lib/compliance';
import { writeAuditLog } from '../lib/audit';
import { useTranslation } from 'react-i18next';
import { scoreDealForInvestor } from '../lib/recommendation';

export default function DealDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { deal: firestoreDeal, loading } = useDeal(id!);
  const fallbackDeal = sampleDeals.find((item) => item.id === id);
  const deal = firestoreDeal || fallbackDeal;

  const { user, profile } = useAuth();

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [investorMemo, setInvestorMemo] = useState<any | null>(null);
  const [investorMemoLoading, setInvestorMemoLoading] = useState(false);
  const [ndaStatus, setNdaStatus] = useState<string | null>(
    fallbackDeal ? 'requested' : null
  );
  const [showNdaModal, setShowNdaModal] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  const dealStatusLabel = (status?: string) =>
    t(`statuses.deals.${normalizeDealStatus(status)}`, {
      defaultValue: statusLabel(status),
    });

  const investorAnalysis = useMemo(() => {
    const result = scoreDealForInvestor(
  deal,
  profile?.investorPreference,
  i18n.language === 'vi' ? 'vi' : 'en'
);

    return {
      score: result.score,
      reasons: result.reasons,
      risks: result.risks,
      label:
        result.score >= 85
          ? t('deal_detail.investor_memo.strong_fit')
          : result.score >= 70
          ? t('deal_detail.investor_memo.good_fit')
          : result.score >= 55
          ? t('deal_detail.investor_memo.moderate_fit')
          : t('deal_detail.investor_memo.low_fit'),
    };
 }, [deal, profile?.investorPreference, t, i18n.language]);

  useEffect(() => {
  if (!deal) return;

  let cancelled = false;
  const lang = i18n.language === 'vi' ? 'vi' : 'en';
  const cacheKey = `ai-summary:${deal.id}:${lang}`;

  const cached = window.localStorage.getItem(cacheKey);
  if (cached) {
    setAiSummary(cached);
    return;
  }

  setAiSummary(null);

  getDealSummary(deal, lang)
    .then((summary) => {
      if (!cancelled) {
        const finalSummary = summary || t('deal_detail.ai_fallback');
        setAiSummary(finalSummary);
        window.localStorage.setItem(cacheKey, finalSummary);
      }
    })
    .catch(() => {
      if (!cancelled) {
        setAiSummary(t('deal_detail.ai_fallback'));
      }
    });

  return () => {
    cancelled = true;
  };
}, [deal?.id, i18n.language, t]);

useEffect(() => {
  if (!deal || !profile?.investorPreference || !investorAnalysis) return;

  let cancelled = false;
  const lang = i18n.language === 'vi' ? 'vi' : 'en';
  const cacheKey = `investor-memo:${deal.id}:${lang}:${investorAnalysis.score}`;

  const cached = window.localStorage.getItem(cacheKey);
  if (cached) {
    try {
      setInvestorMemo(JSON.parse(cached));
      return;
    } catch {
      window.localStorage.removeItem(cacheKey);
    }
  }

  const generateInvestorMemo = async () => {
    setInvestorMemoLoading(true);
    setInvestorMemo(null);

    try {
      const memo = await explainDealForInvestor(
        deal,
        profile.investorPreference,
        investorAnalysis,
        lang
      );

      if (!cancelled) {
        setInvestorMemo(memo);
        window.localStorage.setItem(cacheKey, JSON.stringify(memo));
      }
    } finally {
      if (!cancelled) {
        setInvestorMemoLoading(false);
      }
    }
  };

  generateInvestorMemo();

  return () => {
    cancelled = true;
  };
}, [deal?.id, profile?.investorPreference, investorAnalysis.score, i18n.language]);

  useEffect(() => {
    if (!user || !id || fallbackDeal) return;

    const q = query(
      collection(db, 'ndas'),
      where('dealId', '==', id),
      where('buyerUid', '==', user.uid)
    );

    return onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setNdaStatus(snap.docs[0].data().status);
      }
    });
  }, [user, id, fallbackDeal]);

  const handleOpenNdaModal = () => {
    if (fallbackDeal && !firestoreDeal) {
      alert(t('deal_detail.alerts.real_deals_only'));
      return;
    }

    const validation = canRequestNdaForDeal(profile, deal, deal?.status);

    if (!validation.canRequest) {
      alert(validation.reason || t('deal_detail.alerts.cannot_request_nda'));
      return;
    }

    setShowNdaModal(true);
  };

  const signAndRequestNDA = async () => {
    if (!user) {
      alert(t('deal_detail.alerts.sign_in_to_request_nda'));
      return;
    }

    if (!deal) {
      alert(t('deal_detail.alerts.deal_info_missing'));
      return;
    }

    if (fallbackDeal && !firestoreDeal) {
      alert(t('deal_detail.alerts.no_sample_nda'));
      return;
    }

    if (!deal.sellerUid || typeof deal.sellerUid !== 'string' || deal.sellerUid.trim().length === 0) {
      console.error('NDA Creation Failed: deal.sellerUid is missing or invalid', {
        dealId: id,
        dealSellerUid: deal.sellerUid,
        dealTitle: deal.title,
      });

      alert(t('deal_detail.alerts.seller_missing'));

      await writeAuditLog({
        actorUid: user.uid,
        actorRole: profile?.role,
        action: 'nda_request_failed_missing_seller',
        targetType: 'nda',
        dealId: id,
        metadata: {
          dealSellerUid: deal.sellerUid,
          dealTitle: deal.title,
          reason: 'sellerUid validation failed',
        },
      });

      return;
    }

    if (deal.sellerUid === 'sample-seller') {
      console.error('NDA Creation Blocked: Invalid sample sellerUid');

      alert(t('deal_detail.alerts.seller_invalid'));

      await writeAuditLog({
        actorUid: user.uid,
        actorRole: profile?.role,
        action: 'nda_request_blocked_sample_seller',
        targetType: 'nda',
        dealId: id,
        metadata: {
          reason: 'Sample seller detected',
        },
      });

      return;
    }

    if (signatureName.trim().length < 2) {
      alert(t('deal_detail.alerts.enter_legal_name'));
      return;
    }

    setIsSigning(true);

    try {
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
        sellerUid: deal.sellerUid.trim(),
        status: 'requested',
        signatureData,
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
          signature: signatureData,
        },
      });

      setNdaStatus('requested');
      setShowNdaModal(false);
      setSignatureName('');
    } catch (err) {
      console.error('Failed to sign NDA:', err);

      await writeAuditLog({
        actorUid: user.uid,
        actorRole: profile?.role,
        action: 'nda_creation_error',
        targetType: 'nda',
        dealId: id,
        metadata: {
          error: err instanceof Error ? err.message : t('common.unknown_error'),
          dealSellerUid: deal.sellerUid,
        },
      });

      alert(t('deal_detail.alerts.sign_nda_failed'));
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

  if (loading && !fallbackDeal) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={34} className="text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-xl text-center rounded-[36px] border border-slate-800 bg-[#0f172a]/80 p-10 shadow-2xl shadow-black/30">
          <div className="w-20 h-20 mx-auto rounded-[28px] bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-7">
            <AlertTriangle size={38} className="text-red-400" />
          </div>

          <p className="text-[10px] uppercase tracking-[0.35em] text-red-400 font-black mb-4">
            {t('deal_detail.not_found.eyebrow')}
          </p>

          <h1 className="text-4xl font-black text-white">
            {t('deal_detail.not_found.title')}
          </h1>

          <p className="text-sm text-slate-500 leading-7 mt-4">
            {t('deal_detail.not_found.description')}
          </p>

          <button
            onClick={() => navigate('/marketplace')}
            className="mt-8 inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-emerald-500 text-[#020617] text-[10px] uppercase tracking-widest font-black hover:bg-emerald-400 transition-all"
          >
            {t('deal_detail.back_to_marketplace')}
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  const isSellerOwner = user?.uid === deal.sellerUid;
  const isAuthorized = canViewPrivateDeal(profile, ndaStatus, isSellerOwner, deal.status);
  const latestRevenue = Number(deal.revenue?.[2] || 0);
  const verifiedKyc = isKycVerified(profile); 
  const metrics = [
    {
      label: t('deal_detail.metrics.valuation'),
      value: deal.valuation ? formatCurrency(Number(deal.valuation)) : t('common.tba'),
      icon: BadgeDollarSign,
    },
    {
      label: t('deal_detail.metrics.equity_offered'),
      value: `${deal.equityOffered || 0}%`,
      icon: DollarSign,
    },
    {
      label: t('deal_detail.metrics.revenue'),
      value: latestRevenue ? formatCurrency(latestRevenue) : t('common.private'),
      icon: TrendingUp,
    },
    {
      label: t('deal_detail.metrics.ebitda'),
      value: deal.ebitda ? formatCurrency(Number(deal.ebitda)) : t('common.private'),
      icon: BarChart3,
    },
  ];

  const scores = [
    {
      label: t('deal_detail.scores.match'),
      value: Number(deal.matchScore || 82),
      hint: t('deal_detail.scores.buyer_fit'),
    },
    {
      label: t('deal_detail.scores.risk'),
      value: Number(deal.riskScore || 35),
      hint: t('deal_detail.scores.lower_better'),
    },
    {
      label: t('deal_detail.scores.growth'),
      value: Number(deal.growthScore || 78),
      hint: t('deal_detail.scores.revenue_momentum'),
    },
  ];

  return (
    <div className="space-y-10">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-black"
      >
        <ArrowLeft size={14} />
        {t('deal_detail.back_to_marketplace')}
      </button>

      <section className="relative overflow-hidden rounded-[44px] border border-slate-800 bg-[#0f172a]/80 p-7 md:p-10 shadow-2xl shadow-black/30">
        <div className="absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full bg-emerald-500/10 blur-[130px]" />
        <div className="absolute -bottom-44 -left-32 w-[520px] h-[520px] rounded-full bg-cyan-500/10 blur-[130px]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8 space-y-7">
            <div className="flex flex-wrap items-center gap-3">
              
              <StatusPill label={deal.industry} icon={<Building2 size={12} />} />
              <StatusPill label={deal.location} icon={<MapPin size={12} />} />
              <StatusPill
                label={dealStatusLabel(deal.status || 'published')}
                tone="emerald"
                icon={<ShieldCheck size={12} />}
              />
              {fallbackDeal && !firestoreDeal && (
                <StatusPill label={t('deal_detail.sample_deal')} tone="orange" icon={<Info size={12} />} />
              )}
            </div>

            <div>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-black tracking-tight leading-[0.92] text-white"
              >
                {deal.title}
              </motion.h1>

              <p className="mt-6 text-base md:text-lg text-slate-400 leading-8 max-w-3xl border-l-4 border-emerald-500/30 pl-6">
                {deal.summary ||
                  t('deal_detail.default_summary')}
              </p>
            </div>
          </div>

          <div className="lg:col-span-4">
            <AccessStatusCard
              isAuthorized={isAuthorized}
              ndaStatus={ndaStatus}
              verifiedKyc={verifiedKyc}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <main className="xl:col-span-8 space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {metrics.map((item) => (
              <MetricCard key={item.label} {...item} />
            ))}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scores.map((item) => (
              <ScoreCard key={item.label} {...item} />
            ))}
          </section>
              <InvestorMemoCard
            score={investorAnalysis.score}
            label={investorAnalysis.label}
            reasons={investorAnalysis.reasons}
            risks={investorAnalysis.risks}
            aiMemo={investorMemo}
            aiMemoLoading={investorMemoLoading}
          />
          <section className="rounded-[34px] border border-slate-800 bg-[#0f172a]/70 p-6 md:p-8 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Sparkles size={22} className="text-emerald-400" />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-black">
                  {t('deal_detail.ai_deal_intelligence')}
                </p>

                <h2 className="text-2xl font-black text-white mt-1">
                  {t('deal_detail.strategic_summary')}
                </h2>
              </div>
            </div>

            <p className="text-sm md:text-base leading-8 text-slate-300">
              {aiSummary ||
                t('deal_detail.generating_summary')}
            </p>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContentPanel
              title={t('deal_detail.public_view.title')}
              eyebrow={t('deal_detail.public_view.eyebrow')}
              icon={<Info size={20} />}
            >
              {[
                [
                  t('deal_detail.public_view.market_position'),
                  deal.marketPosition || t('deal_detail.public_view.market_position_default'),
                ],
                [
                  t('deal_detail.public_view.strategic_objective'),
                  deal.strategicReason ||
                    t('deal_detail.public_view.strategic_objective_default'),
                ],
                [
                  t('deal_detail.public_view.next_step'),
                  t('deal_detail.public_view.next_step_text'),
                ],
              ].map(([label, text]) => (
                <InfoBlock key={label} label={label} text={text} />
              ))}
            </ContentPanel>

            <ContentPanel
              title={t('deal_detail.private_view.title')}
              eyebrow={t('deal_detail.private_view.eyebrow')}
              icon={<FolderLock size={20} />}
            >
              {[
                t('deal_detail.private_view.full_financial_model'),
                t('deal_detail.private_view.contracts'),
                t('deal_detail.private_view.corporate_records'),
                t('deal_detail.private_view.ip_documents'),
              ].map((item) => (
                <PrivateAccessItem
                  key={item}
                  label={item}
                  unlocked={isAuthorized}
                />
              ))}
            </ContentPanel>
          </section>
        </main>

        <aside className="xl:col-span-4 space-y-6">
          <DealActionPanel
            id={id}
            isAuthorized={isAuthorized}
            isSellerOwner={isSellerOwner}
            ndaStatus={ndaStatus}
            verifiedKyc={verifiedKyc}
            onRequestNda={handleOpenNdaModal}
            onLogAction={logDealAction}
            onNavigate={navigate}
            canRequest={canRequestNda(profile)}
          />

          <SellerPanel />

          <LegalWorkflowPanel />
        </aside>
      </div>

      <AnimatePresence>
        {showNdaModal && (
          <NdaModal
            signatureName={signatureName}
            setSignatureName={setSignatureName}
            isSigning={isSigning}
            onClose={() => setShowNdaModal(false)}
            onSign={signAndRequestNDA}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


function InvestorMemoCard({
  score,
  label,
  reasons,
  risks,
  aiMemo,
  aiMemoLoading,
}: {
  score: number;
  label: string;
  reasons: string[];
  risks: string[];
  aiMemo?: any | null;
  aiMemoLoading?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  const nextSteps = [
    t('deal_detail.investor_memo.next_step_data_room'),
    t('deal_detail.investor_memo.next_step_financials'),
    t('deal_detail.investor_memo.next_step_risks'),
  ];

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-emerald-500/20 bg-emerald-500/[0.04] p-6 md:p-8 shadow-2xl shadow-black/20">
      <div className="absolute -top-32 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-[100px]" />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Sparkles size={24} className="text-emerald-400" />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-black">
                {t('deal_detail.investor_memo.eyebrow')}
              </p>

              <h2 className="text-2xl md:text-3xl font-black text-white mt-2">
                {t('deal_detail.investor_memo.title')}
              </h2>

              <p className="text-sm text-slate-400 leading-7 mt-3 max-w-2xl">
                {t('deal_detail.investor_memo.description')}
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-emerald-500/20 bg-[#020617]/70 px-6 py-5 min-w-[180px]">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">
              {t('deal_detail.investor_memo.fit_score')}
            </p>

            <div className="flex items-end gap-2 mt-2">
              <p className="text-5xl font-black text-white">
                {normalizedScore}
              </p>
              <p className="text-sm text-slate-500 pb-2">%</p>
            </div>

            <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-black mt-3">
              {label}
            </p>

            <div className="mt-4 h-2 rounded-full bg-slate-900 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${normalizedScore}%` }}
                transition={{ duration: 0.7 }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MemoColumn
            title={t('deal_detail.investor_memo.why_fit')}
            tone="emerald"
            items={
              reasons.length > 0
                ? reasons.slice(0, 4)
                : [t('deal_detail.investor_memo.no_reasons')]
            }
          />

          <MemoColumn
            title={t('deal_detail.investor_memo.key_risks')}
            tone="orange"
            items={
              risks.length > 0
                ? risks.slice(0, 4)
                : [t('deal_detail.investor_memo.no_major_risks')]
            }
          />

          <MemoColumn
            title={t('deal_detail.investor_memo.suggested_next_steps')}
            tone="slate"
            items={nextSteps}
          />
        </div>
        <div className="mt-6 rounded-[26px] border border-slate-800 bg-[#020617]/70 p-5">
  <div className="flex items-center justify-between gap-4 mb-5">
    <div>
      <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-black">
        {t('deal_detail.investor_memo.ai_commentary')}
      </p>

      <h3 className="text-xl font-black text-white mt-1">
        {t('deal_detail.investor_memo.ai_commentary_title')}
      </h3>
    </div>

    {aiMemoLoading && (
      <Loader2 size={18} className="text-emerald-400 animate-spin" />
    )}
  </div>

  {aiMemoLoading ? (
    <p className="text-sm text-slate-500 leading-7">
      {t('deal_detail.investor_memo.ai_commentary_loading')}
    </p>
  ) : aiMemo ? (
    <div className="space-y-5">
      <p className="text-sm text-slate-300 leading-7">
        {aiMemo.summary}
      </p>

      <MemoTextList
        title={t('deal_detail.investor_memo.ai_highlights')}
        items={aiMemo.highlights || []}
      />

      <MemoTextList
        title={t('deal_detail.investor_memo.ai_risks')}
        items={aiMemo.risks || []}
      />

      <MemoTextList
        title={t('deal_detail.investor_memo.ai_questions')}
        items={aiMemo.dueDiligenceQuestions || []}
      />

      {aiMemo.nextAction && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-black mb-2">
            {t('deal_detail.investor_memo.ai_next_action')}
          </p>
          <p className="text-xs text-emerald-100/80 leading-6">
            {aiMemo.nextAction}
          </p>
        </div>
      )}
    </div>
  ) : (
    <p className="text-sm text-slate-500 leading-7">
      {t('deal_detail.investor_memo.ai_commentary_unavailable')}
    </p>
  )}
</div>
      </div>
    </section>
  );
}

function MemoColumn({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'emerald' | 'orange' | 'slate';
}) {
  const toneClass =
    tone === 'emerald'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
      : tone === 'orange'
      ? 'border-orange-500/20 bg-orange-500/10 text-orange-300'
      : 'border-slate-800 bg-[#020617] text-slate-300';

  return (
    <div className="rounded-[26px] border border-slate-800 bg-[#020617]/70 p-5">
      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black mb-4">
        {title}
      </p>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className={`rounded-2xl border px-4 py-3 text-xs leading-6 ${toneClass}`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
function MemoTextList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-3">
        {title}
      </p>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-300 leading-6"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
function StatusPill({
  label,
  icon,
  tone = 'slate',
}: {
  label: string;
  icon?: React.ReactNode;
  tone?: 'slate' | 'emerald' | 'orange';
}) {
  const className =
    tone === 'emerald'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
      : tone === 'orange'
      ? 'border-orange-500/20 bg-orange-500/10 text-orange-300'
      : 'border-slate-800 bg-slate-900/70 text-slate-400';

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-[9px] uppercase tracking-widest font-black ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}

function AccessStatusCard({
  isAuthorized,
  ndaStatus,
  verifiedKyc,
}: {
  isAuthorized: boolean;
  ndaStatus: string | null;
  verifiedKyc: boolean;
}) {
  const { t, i18n } = useTranslation();

  return (
    <div
      className={`rounded-[30px] border p-6 ${
        isAuthorized
          ? 'border-emerald-500/20 bg-emerald-500/10'
          : 'border-orange-500/20 bg-orange-500/10'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${
            isAuthorized
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
              : 'border-orange-500/20 bg-orange-500/10 text-orange-400'
          }`}
        >
          {isAuthorized ? <Unlock size={26} /> : <Lock size={26} />}
        </div>

        <div>
          <p
            className={`text-[10px] uppercase tracking-[0.3em] font-black ${
              isAuthorized ? 'text-emerald-400' : 'text-orange-400'
            }`}
          >
            {t('deal_detail.security_status')}
          </p>

          <h3 className="text-2xl font-black text-white mt-2">
            {isAuthorized ? t('deal_detail.access_granted') : t('deal_detail.nda_required')}
          </h3>

          <p className="text-xs text-slate-400 leading-6 mt-3">
            {isAuthorized
              ? t('deal_detail.private_content_available')
              : ndaStatus === 'requested'
              ? t('deal_detail.nda_pending')
              : verifiedKyc
              ? t('deal_detail.sign_nda_to_request')
              : t('deal_detail.kyc_required_for_nda')}
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-[28px] border border-slate-800 bg-[#0f172a]/70 p-5 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
          {label}
        </p>

        <Icon size={18} className="text-emerald-400" />
      </div>

      <p className="text-xl font-black text-white mt-4">
        {value}
      </p>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  const normalized = Math.min(Math.max(value, 0), 100);

  return (
    <div className="rounded-[28px] border border-slate-800 bg-[#0f172a]/70 p-6 shadow-xl shadow-black/20">
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
        {label}
      </p>

      <div className="flex items-end gap-3 mt-3">
        <p className="text-5xl font-black text-white">
          {value}
        </p>

        <p className="text-xs text-slate-500 pb-2">
          {hint}
        </p>
      </div>

      <div className="mt-5 h-2 rounded-full bg-slate-900 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${normalized}%` }}
          transition={{ duration: 0.6 }}
          className="h-full rounded-full bg-emerald-500"
        />
      </div>
    </div>
  );
}

function ContentPanel({
  title,
  eyebrow,
  icon,
  children,
}: {
  title: string;
  eyebrow: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[34px] border border-slate-800 bg-[#0f172a]/70 p-6 shadow-2xl shadow-black/20">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
          {icon}
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
            {eyebrow}
          </p>

          <h3 className="text-xl font-black text-white mt-1">
            {title}
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {children}
      </div>
    </section>
  );
}

function InfoBlock({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#020617] p-5">
      <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">
        {label}
      </p>

      <p className="text-sm text-slate-300 mt-3 leading-7">
        {text}
      </p>
    </div>
  );
}

function PrivateAccessItem({
  label,
  unlocked,
}: {
  label: string;
  unlocked: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 flex items-center justify-between gap-4 ${
        unlocked
          ? 'border-emerald-500/20 bg-emerald-500/10'
          : 'border-slate-800 bg-[#020617] opacity-70'
      }`}
    >
      <span className="text-sm text-slate-200">
        {label}
      </span>

      {unlocked ? (
        <Unlock size={17} className="text-emerald-400 shrink-0" />
      ) : (
        <Lock size={17} className="text-slate-500 shrink-0" />
      )}
    </div>
  );
}

function DealActionPanel({
  id,
  isAuthorized,
  isSellerOwner,
  ndaStatus,
  verifiedKyc,
  onRequestNda,
  onLogAction,
  onNavigate,
  canRequest,
}: {
  id?: string;
  isAuthorized: boolean;
  isSellerOwner: boolean;
  ndaStatus: string | null;
  verifiedKyc: boolean;
  onRequestNda: () => void;
  onLogAction: (action: string) => void;
  onNavigate: (path: string) => void;
  canRequest: boolean;
}) {
  const { t, i18n } = useTranslation();

  const actions = [
    { label: t('deal_detail.actions.bookmark'), icon: Bookmark, action: 'bookmark' },
    { label: t('deal_detail.actions.contact'), icon: MessagesSquare, action: 'contact' },
    { label: t('deal_detail.actions.meeting'), icon: CalendarDays, action: 'meeting' },
    { label: t('deal_detail.actions.offer'), icon: DollarSign, action: 'offer' },
  ];

  return (
    <section className="rounded-[34px] border border-slate-800 bg-[#0f172a]/70 p-6 shadow-2xl shadow-black/20">
      <div className="space-y-2 mb-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
          {t('deal_detail.deal_control')}
        </p>

        <h3 className="text-2xl font-black text-white">
          {t('deal_detail.access_actions')}
        </h3>
      </div>

      {!isAuthorized && (
        <div className="space-y-4 mb-6">
          <p className="text-xs text-slate-500 leading-7">
            {t('deal_detail.access_requirement')}
          </p>

          {!verifiedKyc && (
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert size={16} className="text-orange-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-orange-200 uppercase tracking-widest font-black leading-5">
                  {t('deal_detail.kyc_required_first')}
                </p>
              </div>
            </div>
          )}

          {ndaStatus === 'requested' ? (
            <div className="w-full text-center py-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-[10px] font-black uppercase tracking-widest">
              {t('deal_detail.nda_request_pending')}
            </div>
          ) : (
            <button
              onClick={onRequestNda}
              disabled={!canRequest}
              className="w-full py-4 rounded-2xl bg-emerald-500 text-[#020617] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {t('deal_detail.review_sign_nda')}
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {actions.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => onLogAction(item.action)}
              className="py-4 rounded-2xl border border-slate-800 bg-[#020617] text-[10px] uppercase font-black tracking-widest hover:bg-slate-900 hover:border-slate-700 transition-all flex items-center justify-center gap-2 text-slate-300"
            >
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
      </div>

      {isAuthorized && (
        <button
          onClick={() => {
            onLogAction('data_room_opened');
            onNavigate(`/data-room?dealId=${id}`);
          }}
          className="w-full mt-4 py-4 rounded-2xl bg-emerald-500 text-[#020617] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          {t('deal_detail.open_data_room')}
          <ShieldCheck size={14} />
        </button>
      )}

      {isSellerOwner && (
        <button
          onClick={() => onNavigate('/dashboard')}
          className="w-full mt-4 py-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-[#020617] transition-all flex items-center justify-center gap-2"
        >
          {t('deal_detail.manage_nda_requests')}
          <FileSignature size={14} />
        </button>
      )}
    </section>
  );
}

function SellerPanel() {
  const { t, i18n } = useTranslation();

  return (
    <section className="rounded-[34px] border border-slate-800 bg-[#0f172a]/70 p-6 shadow-2xl shadow-black/20">
      <div className="flex items-center gap-2 text-slate-500 mb-5">
        <Info size={14} />
        <span className="text-[10px] uppercase font-black tracking-widest">
          {t('deal_detail.seller.listing_managed_by')}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
          <Building2 size={20} className="text-emerald-400" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-widest text-white">
            {t('deal_detail.seller.verified_seller_advisor')}
          </p>

          <p className="text-[10px] text-slate-500 mt-1">
            {t('deal_detail.seller.kyc_license_records')}
          </p>
        </div>
      </div>
    </section>
  );
}

function LegalWorkflowPanel() {
  const { t, i18n } = useTranslation();

  const workflow = [
    t('deal_detail.workflow.generate_nda'),
    t('deal_detail.workflow.review_loi'),
    t('deal_detail.workflow.negotiate_spa'),
    t('deal_detail.workflow.esignature'),
    t('deal_detail.workflow.closing_archive'),
  ];

  return (
    <section className="rounded-[34px] border border-slate-800 bg-[#0f172a]/70 p-6 shadow-2xl shadow-black/20">
      <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-5">
        {t('deal_detail.workflow.title')}
      </p>

      <div className="space-y-3">
        {workflow.map((item, index) => (
          <div key={item} className="flex items-center gap-3 text-xs text-slate-300">
            <span className="w-8 h-8 rounded-xl border border-slate-800 bg-[#020617] flex items-center justify-center text-[10px] text-slate-500 font-black">
              {index + 1}
            </span>

            <FileSignature size={14} className="text-emerald-400" />

            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function NdaModal({
  signatureName,
  setSignatureName,
  isSigning,
  onClose,
  onSign,
}: {
  signatureName: string;
  setSignatureName: (value: string) => void;
  isSigning: boolean;
  onClose: () => void;
  onSign: () => void;
}) {
  const { t, i18n } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#020617]/95 flex items-center justify-center p-4 backdrop-blur-2xl"
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.96 }}
        className="relative max-w-3xl w-full max-h-[90vh] overflow-hidden rounded-[36px] border border-slate-800 bg-[#0f172a] shadow-2xl shadow-black/50"
      >
        <div className="absolute -top-36 -right-28 w-80 h-80 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute -bottom-36 -left-28 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px]" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-11 h-11 rounded-2xl border border-slate-800 bg-slate-950/80 text-slate-500 hover:text-white hover:border-red-500/50 transition-all flex items-center justify-center"
        >
          <XCircle size={22} />
        </button>

        <div className="relative z-10 flex flex-col max-h-[90vh]">
          <div className="p-7 md:p-8 border-b border-slate-800">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <FileSignature size={26} className="text-emerald-400" />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-emerald-400">
                  {t('deal_detail.nda_modal.digital_signature_required')}
                </p>

                <h2 className="text-2xl md:text-3xl font-black text-white mt-2">
                  {t('deal_detail.nda_modal.title')}
                </h2>
              </div>
            </div>
          </div>

          <div className="p-7 md:p-8 overflow-y-auto flex-1 space-y-5 text-sm text-slate-400 leading-7">
            <p>
              {t('deal_detail.nda_modal.intro')}
            </p>

            <NdaClause
              number="1"
              title={t('deal_detail.nda_modal.clause_confidential_title')}
              text={t('deal_detail.nda_modal.clause_confidential_text')}
            />

            <NdaClause
              number="2"
              title={t('deal_detail.nda_modal.clause_exclusions_title')}
              text={t('deal_detail.nda_modal.clause_exclusions_text')}
            />

            <NdaClause
              number="3"
              title={t('deal_detail.nda_modal.clause_obligations_title')}
              text={t('deal_detail.nda_modal.clause_obligations_text')}
            />

            <div className="rounded-[24px] border border-orange-500/20 bg-orange-500/10 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-orange-400 mt-0.5 shrink-0" />

                <p className="text-xs text-orange-100/80 leading-6">
                  {t('deal_detail.nda_modal.audit_notice')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-7 md:p-8 border-t border-slate-800 bg-[#020617] space-y-4">
            <label className="block space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">
                {t('deal_detail.nda_modal.type_legal_name')}
              </span>

              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder={t('deal_detail.nda_modal.name_placeholder')}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
              />
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl border border-slate-700 text-slate-300 text-[10px] uppercase tracking-widest font-black hover:bg-slate-900 transition-all"
              >
                {t('common.cancel')}
              </button>

              <button
                onClick={onSign}
                disabled={isSigning || signatureName.trim().length < 2}
                className="flex-1 py-4 rounded-2xl bg-emerald-500 text-[#020617] text-[10px] uppercase tracking-widest font-black disabled:opacity-50 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {isSigning ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    {t('deal_detail.nda_modal.signing_securely')}
                  </>
                ) : (
                  <>
                    {t('deal_detail.nda_modal.agree_sign')}
                    <CheckCircle2 size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function NdaClause({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  const { t, i18n } = useTranslation();

  return (
    <div className="rounded-[22px] border border-slate-800 bg-[#020617] p-5">
      <p className="text-[10px] uppercase tracking-widest font-black text-emerald-400">
        {t('deal_detail.nda_modal.clause_number', { number })}
      </p>

      <h3 className="text-sm font-black text-white mt-2">
        {title}
      </h3>

      <p className="text-xs text-slate-500 leading-6 mt-3">
        {text}
      </p>
    </div>
  );
}
