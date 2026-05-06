import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Building2,
  Upload,
  FileCheck2,
  ShieldCheck,
  Lock,
  Landmark,
  Factory,
  BarChart3,
  BadgeDollarSign,
  FolderLock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  FileSignature,
  Globe2,
  Briefcase,
  Percent,
  TrendingUp,
  FileText,
  ShieldAlert
} from 'lucide-react';

import { db } from '../lib/firebase';
import { useAuth } from '../components/AuthContext';
import { dealStages } from '../lib/mockData';
import { canCreateDeal } from '../lib/compliance';
import { writeAuditLog } from '../lib/audit';
import { useTranslation } from 'react-i18next';

const optionKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

const industries = [
  'Technology',
  'Logistics',
  'Healthcare',
  'Consumer',
  'Financial Services',
  'Manufacturing',
  'Education'
];

const documents = [
  'Pitch deck',
  'Financial report',
  'Legal documents',
  'Business license',
  'Shareholder list'
];

const stepDefinitions = [
  { id: 1, key: 'legal_entity', icon: Landmark },
  { id: 2, key: 'operations', icon: Factory },
  { id: 3, key: 'financials', icon: BarChart3 },
  { id: 4, key: 'deal_terms', icon: BadgeDollarSign },
  { id: 5, key: 'documents', icon: FolderLock }
];

type DealFormData = {
  title: string;
  industry: string;
  location: string;
  dealType: string;
  valuation: string;
  equityOffered: string;
  revenue: string[];
  ebitda: string;
  netProfit: string;
  growthRate: string;
  summary: string;
  strategicReason: string;
  futurePlan: string;
  companyName: string;
  taxId: string;
  country: string;
  foundedYear: string;
  products: string;
  targetMarkets: string;
  founderOwnership: string;
  investorOwnership: string;
  esopOwnership: string;
  uploadedDocs: string[];
};

const initialFormData: DealFormData = {
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
  uploadedDocs: []
};

export default function CreateDeal() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DealFormData>(initialFormData);

  const createAllowed = canCreateDeal(profile);
  const steps = useMemo(() => stepDefinitions.map((item) => ({
    ...item,
    title: t(`create_deal.steps.${item.key}.title`),
    shortTitle: t(`create_deal.steps.${item.key}.short_title`),
    description: t(`create_deal.steps.${item.key}.description`)
  })), [t]);
  const translatedIndustries = useMemo(() => industries.map((item) => ({
    value: item,
    label: t(`create_deal.industries.${optionKey(item)}`)
  })), [t]);
  const activeStep = steps[step - 1];

  const completion = useMemo(() => {
    const checks = [
      !!formData.companyName,
      !!formData.taxId,
      !!formData.country,
      !!formData.title,
      !!formData.industry,
      !!formData.location,
      formData.revenue.some(Boolean),
      !!formData.valuation,
      !!formData.summary,
      formData.uploadedDocs.length > 0
    ];

    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [formData]);

  const setField = <K extends keyof DealFormData>(field: K, value: DealFormData[K]) => {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleNext = () => {
    setStep((current) => Math.min(current + 1, 5));
  };

  const handleBack = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const toggleDocument = (docName: string) => {
    const selected = formData.uploadedDocs.includes(docName);

    setField(
      'uploadedDocs',
      selected
        ? formData.uploadedDocs.filter((item) => item !== docName)
        : [...formData.uploadedDocs, docName]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      alert(t('create_deal.alerts.sign_in_required'));
      return;
    }

    if (!canCreateDeal(profile)) {
      alert(t('create_deal.alerts.kyc_seller_required'));
      return;
    }

    setLoading(true);

    try {
      const companyRef = await addDoc(collection(db, 'companies'), {
        legal: {
          name: formData.companyName,
          tax_code: formData.taxId,
          country: formData.country,
          founded_year: Number(formData.foundedYear || 0)
        },
        operation: {
          industry: formData.industry,
          product: formData.products,
          market: formData.targetMarkets
        },
        ownership: {
          founder_pct: Number(formData.founderOwnership || 0),
          investor_pct: Number(formData.investorOwnership || 0),
          esop_pct: Number(formData.esopOwnership || 0)
        },
        name: formData.companyName,
        taxId: formData.taxId,
        country: formData.country,
        foundedYear: Number(formData.foundedYear || 0),
        industry: formData.industry,
        products: formData.products,
        targetMarkets: formData.targetMarkets,
        ownershipLegacy: {
          founder: Number(formData.founderOwnership || 0),
          investor: Number(formData.investorOwnership || 0),
          esop: Number(formData.esopOwnership || 0)
        },
        ownerUid: user.uid,
        visibility: 'private',
        version: 1,
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, 'deals'), {
        basic: {
          title: formData.title,
          industry: formData.industry,
          location: formData.location
        },
        financial: {
          revenue_3y: formData.revenue.map((item) => Number(item || 0)),
          ebitda: Number(formData.ebitda || 0),
          net_profit: Number(formData.netProfit || 0),
          growth_rate: Number(formData.growthRate || 0)
        },
        deal: {
          type: formData.dealType,
          valuation: Number(formData.valuation || 0),
          equity_offered: Number(formData.equityOffered || 0)
        },
        strategy: {
          reason: formData.strategicReason,
          future_plan: formData.futurePlan
        },
        documents: formData.uploadedDocs,
        title: formData.title,
        industry: formData.industry,
        location: formData.location,
        type: formData.dealType,
        valuation: Number(formData.valuation || 0),
        equityOffered: Number(formData.equityOffered || 0),
        revenue: formData.revenue.map((item) => Number(item || 0)),
        ebitda: Number(formData.ebitda || 0),
        netProfit: Number(formData.netProfit || 0),
        growthRate: Number(formData.growthRate || 0),
        summary: formData.summary,
        strategicReason: formData.strategicReason,
        futurePlan: formData.futurePlan,
        uploadedDocs: formData.uploadedDocs,
        companyId: companyRef.id,
        sellerUid: user.uid,
        status: 'submitted',
        lifecycle: dealStages,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await writeAuditLog({
        actorUid: user.uid,
        actorRole: profile?.role,
        action: 'deal_submitted',
        targetType: 'deal',
        metadata: {
          title: formData.title,
          status: 'submitted'
        }
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Submission failed:', error);
      alert(t('create_deal.alerts.submission_failed'));
    } finally {
      setLoading(false);
    }
  };

  if (user && !createAllowed) {
    return <LockedDealCreation onNavigateProfile={() => navigate('/profile')} />;
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[40px] border border-slate-800 bg-[#0f172a]/80 p-7 md:p-10 shadow-2xl shadow-black/30">
        <div className="absolute -top-36 -right-28 w-96 h-96 rounded-full bg-emerald-500/10 blur-[110px]" />
        <div className="absolute -bottom-36 -left-28 w-96 h-96 rounded-full bg-cyan-500/10 blur-[110px]" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <FileSignature size={15} className="text-emerald-400" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-black">
                {t('create_deal.badge')}
              </span>
            </div>

            <div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white">
                {t('create_deal.title')}
              </h1>

              <p className="mt-5 max-w-2xl text-sm md:text-base text-slate-400 leading-8">
                {t('create_deal.description')}
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/10 p-5 min-w-[280px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-black">
                  {t('create_deal.completion')}
                </p>
                <p className="text-4xl font-black text-white mt-2">
                  {completion}%
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck size={24} className="text-emerald-400" />
              </div>
            </div>

            <div className="mt-5 h-2 rounded-full bg-slate-900 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
              />
            </div>

            <p className="text-xs text-slate-400 leading-6 mt-4">
              {t('create_deal.completion_note')}
            </p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-4 space-y-6">
          <section className="rounded-[32px] border border-slate-800 bg-[#0f172a]/70 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
                  {t('create_deal.progress')}
                </p>
                <h2 className="text-xl font-black text-white mt-2">
                  {t('create_deal.deal_builder')}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Building2 size={22} className="text-emerald-400" />
              </div>
            </div>

            <div className="space-y-3">
              {steps.map((item) => (
                <StepCard
                  key={item.id}
                  item={item}
                  active={item.id === step}
                  complete={item.id < step}
                  onClick={() => setStep(item.id)}
                />
              ))}
            </div>
          </section>

          <DealSnapshot formData={formData} />

          <section className="rounded-[28px] border border-orange-500/20 bg-orange-500/10 p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert size={18} className="text-orange-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-orange-300 font-black">
                  {t('create_deal.compliance_note')}
                </p>
                <p className="text-xs text-orange-100/70 leading-6 mt-2">
                  {t('create_deal.compliance_text')}
                </p>
              </div>
            </div>
          </section>
        </aside>

        <main className="lg:col-span-8">
          <section className="rounded-[36px] border border-slate-800 bg-[#0f172a]/70 shadow-2xl shadow-black/20 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-800 bg-[#0b1120]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <activeStep.icon size={25} className="text-emerald-400" />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-black">
                      {t('create_deal.step_of_total', { step, total: 5 })}
                    </p>

                    <h2 className="text-2xl md:text-3xl font-black text-white mt-2">
                      {activeStep.title}
                    </h2>

                    <p className="text-sm text-slate-500 leading-6 mt-2">
                      {activeStep.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {steps.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStep(item.id)}
                      className={`w-9 h-9 rounded-2xl border flex items-center justify-center text-[10px] font-black transition-all ${
                        item.id === step
                          ? 'bg-emerald-500 text-[#020617] border-emerald-500'
                          : item.id < step
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-700 bg-slate-900 text-slate-500'
                      }`}
                    >
                      {item.id < step ? <CheckCircle2 size={15} /> : item.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field
                        label={t('create_deal.fields.legal_entity_name')}
                        value={formData.companyName}
                        onChange={(value) => setField('companyName', value)}
                        required
                        icon={<Building2 size={15} />}
                      />

                      <Field
                        label={t('create_deal.fields.tax_id')}
                        value={formData.taxId}
                        onChange={(value) => setField('taxId', value)}
                        required
                        icon={<FileText size={15} />}
                      />

                      <Field
                        label={t('create_deal.fields.country_registration')}
                        value={formData.country}
                        onChange={(value) => setField('country', value)}
                        required
                        icon={<Globe2 size={15} />}
                      />

                      <Field
                        label={t('create_deal.fields.founded_year')}
                        type="number"
                        value={formData.foundedYear}
                        onChange={(value) => setField('foundedYear', value)}
                        icon={<Landmark size={15} />}
                      />

                      <Field
                        label={t('create_deal.fields.founder_ownership')}
                        type="number"
                        value={formData.founderOwnership}
                        onChange={(value) => setField('founderOwnership', value)}
                        icon={<Percent size={15} />}
                      />

                      <Field
                        label={t('create_deal.fields.investor_ownership')}
                        type="number"
                        value={formData.investorOwnership}
                        onChange={(value) => setField('investorOwnership', value)}
                        icon={<Percent size={15} />}
                      />

                      <Field
                        label={t('create_deal.fields.esop_ownership')}
                        type="number"
                        value={formData.esopOwnership}
                        onChange={(value) => setField('esopOwnership', value)}
                        icon={<Percent size={15} />}
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5">
                      <Field
                        label={t('create_deal.fields.deal_title')}
                        value={formData.title}
                        onChange={(value) => setField('title', value)}
                        required
                        icon={<Briefcase size={15} />}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <SelectField
                          label={t('create_deal.fields.industry')}
                          value={formData.industry}
                          onChange={(value) => setField('industry', value)}
                          options={translatedIndustries}
                          required
                        />

                        <Field
                          label={t('create_deal.fields.location')}
                          value={formData.location}
                          onChange={(value) => setField('location', value)}
                          required
                          icon={<Globe2 size={15} />}
                        />
                      </div>

                      <TextArea
                        label={t('create_deal.fields.products_services')}
                        value={formData.products}
                        onChange={(value) => setField('products', value)}
                      />

                      <TextArea
                        label={t('create_deal.fields.target_markets')}
                        value={formData.targetMarkets}
                        onChange={(value) => setField('targetMarkets', value)}
                      />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="rounded-[28px] border border-slate-800 bg-[#020617] p-5">
                        <div className="flex items-center justify-between gap-4 mb-5">
                          <div>
                            <p className="text-[10px] uppercase font-black tracking-[0.25em] text-slate-500">
                              {t('create_deal.fields.revenue')}
                            </p>

                            <h3 className="text-lg font-black text-white mt-2">
                              {t('create_deal.last_three_years')}
                            </h3>
                          </div>

                          <TrendingUp size={22} className="text-emerald-400" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {formData.revenue.map((rev, index) => (
                            <label key={index} className="block space-y-2">
                              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                                {t('create_deal.year_number', { year: index + 1 })}
                              </span>

                              <input
                                type="number"
                                placeholder="0"
                                className="input-shell"
                                value={rev}
                                onChange={(event) => {
                                  const revenue = [...formData.revenue];
                                  revenue[index] = event.target.value;
                                  setField('revenue', revenue);
                                }}
                              />
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <Field
                          label="EBITDA"
                          type="number"
                          value={formData.ebitda}
                          onChange={(value) => setField('ebitda', value)}
                          icon={<BadgeDollarSign size={15} />}
                        />

                        <Field
                          label={t('create_deal.fields.net_profit')}
                          type="number"
                          value={formData.netProfit}
                          onChange={(value) => setField('netProfit', value)}
                          icon={<BadgeDollarSign size={15} />}
                        />

                        <Field
                          label={t('create_deal.fields.growth_rate')}
                          type="number"
                          value={formData.growthRate}
                          onChange={(value) => setField('growthRate', value)}
                          icon={<TrendingUp size={15} />}
                        />
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-5">
                      <SelectField
                        label={t('create_deal.fields.deal_type')}
                        value={formData.dealType}
                        onChange={(value) => setField('dealType', value)}
                        options={[
                          { label: t('create_deal.deal_types.sell_100'), value: 'sell_100' },
                          { label: t('create_deal.deal_types.sell_equity'), value: 'sell_equity' },
                          { label: t('create_deal.deal_types.fundraising'), value: 'fundraising' }
                        ]}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field
                          label={t('create_deal.fields.valuation')}
                          type="number"
                          value={formData.valuation}
                          onChange={(value) => setField('valuation', value)}
                          icon={<BadgeDollarSign size={15} />}
                        />

                        <Field
                          label={t('create_deal.fields.equity_offered')}
                          type="number"
                          value={formData.equityOffered}
                          onChange={(value) => setField('equityOffered', value)}
                          icon={<Percent size={15} />}
                        />
                      </div>

                      <TextArea
                        label={t('create_deal.fields.deal_summary')}
                        value={formData.summary}
                        onChange={(value) => setField('summary', value)}
                      />

                      <TextArea
                        label={t('create_deal.fields.reason')}
                        value={formData.strategicReason}
                        onChange={(value) => setField('strategicReason', value)}
                      />

                      <TextArea
                        label={t('create_deal.fields.future_plan')}
                        value={formData.futurePlan}
                        onChange={(value) => setField('futurePlan', value)}
                      />
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.map((docName) => {
                          const selected = formData.uploadedDocs.includes(docName);

                          return (
                            <button
                              key={docName}
                              type="button"
                              onClick={() => toggleDocument(docName)}
                              className={`group rounded-[24px] border p-5 flex items-start justify-between gap-4 text-left transition-all ${
                                selected
                                  ? 'border-emerald-500/30 bg-emerald-500/10'
                                  : 'border-slate-800 bg-[#020617] hover:border-slate-700 hover:bg-slate-900/70'
                              }`}
                            >
                              <span className="flex items-start gap-4">
                                <span
                                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
                                    selected
                                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                      : 'border-slate-700 bg-slate-900 text-slate-500'
                                  }`}
                                >
                                  <Upload size={18} />
                                </span>

                                <span>
                                  <span className="block text-sm font-black text-white">
                                    {t(`create_deal.documents.${optionKey(docName)}`)}
                                  </span>

                                  <span className="block text-xs text-slate-500 mt-2 leading-5">
                                    {t('create_deal.document_prepared')}
                                  </span>
                                </span>
                              </span>

                              {selected ? (
                                <FileCheck2 size={19} className="text-emerald-400 shrink-0" />
                              ) : (
                                <ArrowUpRight size={17} className="text-slate-600 group-hover:text-slate-300 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="rounded-[24px] border border-slate-800 bg-[#020617] p-5">
                        <div className="flex items-start gap-3">
                          <AlertCircle size={18} className="text-slate-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-slate-500 leading-6">
                            {t('create_deal.document_demo_note')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-6 md:p-8 border-t border-slate-800 bg-[#0b1120] flex flex-col sm:flex-row gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-4 rounded-2xl border border-slate-700 text-slate-300 text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 hover:border-slate-600 transition-all"
                >
                  <ChevronLeft size={14} />
                  {t('common.back')}
                </button>
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-4 rounded-2xl bg-emerald-500 text-[#020617] text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  {t('create_deal.next_step')}
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 rounded-2xl bg-emerald-500 text-[#020617] text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      {t('common.submitting')}
                    </>
                  ) : (
                    <>
                      {t('create_deal.submit_for_review')}
                      <ArrowUpRight size={15} />
                    </>
                  )}
                </button>
              )}
            </div>
          </section>
        </main>
      </form>
    </div>
  );
}

function LockedDealCreation({
  onNavigateProfile
}: {
  onNavigateProfile: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative overflow-hidden max-w-2xl w-full rounded-[40px] border border-orange-500/20 bg-[#0f172a]/80 p-8 md:p-10 text-center shadow-2xl shadow-black/30"
      >
        <div className="absolute -top-36 -right-28 w-80 h-80 rounded-full bg-orange-500/10 blur-[100px]" />
        <div className="absolute -bottom-36 -left-28 w-80 h-80 rounded-full bg-emerald-500/10 blur-[100px]" />

        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto rounded-[28px] border border-orange-500/20 bg-orange-500/10 flex items-center justify-center mb-8">
            <Lock size={36} className="text-orange-400" />
          </div>

          <p className="text-[10px] uppercase tracking-[0.35em] text-orange-400 font-black mb-4">
            {t('kyc.required_eyebrow')}
          </p>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            {t('create_deal.locked_title')}
          </h1>

          <p className="text-sm text-slate-400 leading-7 mt-5 max-w-xl mx-auto">
            {t('create_deal.locked_description')}
          </p>

          <button
            type="button"
            onClick={onNavigateProfile}
            className="mt-8 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500 text-[#020617] text-[10px] uppercase tracking-widest font-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            {t('kyc.complete_kyc')}
            <ArrowUpRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function StepCard({
  item,
  active,
  complete,
  onClick
}: {
  item: {
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
  };
  active: boolean;
  complete: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[24px] border p-4 text-left transition-all ${
        active
          ? 'border-emerald-500/40 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
          : complete
          ? 'border-emerald-500/20 bg-[#020617]'
          : 'border-slate-800 bg-[#020617] hover:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
            active || complete
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-slate-700 bg-slate-900 text-slate-500'
          }`}
        >
          {complete ? <CheckCircle2 size={19} /> : <Icon size={19} />}
        </div>

        <div>
          <p
            className={`text-[10px] uppercase tracking-[0.25em] font-black ${
              active || complete ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            {t('create_deal.step_number', { step: item.id })}
          </p>

          <p className="text-sm font-black text-white mt-1">
            {item.title}
          </p>

          <p className="text-xs text-slate-500 leading-5 mt-2">
            {item.description}
          </p>
        </div>
      </div>
    </button>
  );
}

function DealSnapshot({ formData }: { formData: DealFormData }) {
  const { t } = useTranslation();

  const rows = [
    [t('create_deal.snapshot.company'), formData.companyName || t('common.not_set')],
    [t('create_deal.snapshot.industry'), formData.industry || t('common.not_set')],
    [t('create_deal.snapshot.valuation'), formData.valuation ? formatMoney(formData.valuation) : t('common.not_set')],
    [t('create_deal.snapshot.docs'), t('create_deal.snapshot.docs_selected', { selected: formData.uploadedDocs.length, total: documents.length })]
  ];

  return (
    <section className="rounded-[32px] border border-slate-800 bg-[#0f172a]/70 p-5 shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
            {t('create_deal.snapshot.live_snapshot')}
          </p>
          <h3 className="text-xl font-black text-white mt-2">
            {t('create_deal.snapshot.deal_preview')}
          </h3>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <BarChart3 size={22} className="text-cyan-400" />
        </div>
      </div>

      <div className="space-y-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#020617] px-4 py-3"
          >
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">
              {label}
            </span>

            <span className="text-xs text-slate-300 text-right truncate max-w-[150px]">
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  icon
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.22em] text-slate-500">
        {icon}
        {label}
        {required && <span className="text-emerald-400">*</span>}
      </span>

      <input
        required={required}
        type={type}
        className="input-shell"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<string | { label: string; value: string }>;
  required?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <label className="block space-y-2">
      <span className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.22em] text-slate-500">
        <Briefcase size={15} />
        {label}
        {required && <span className="text-emerald-400">*</span>}
      </span>

      <select
        required={required}
        className="input-shell"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {required && <option value="">{t('common.select_label', { label })}</option>}

        {options.map((item) => {
          const optionLabel = typeof item === 'string' ? item : item.label;
          const optionValue = typeof item === 'string' ? item : item.value;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.22em] text-slate-500">
        <FileText size={15} />
        {label}
      </span>

      <textarea
        rows={5}
        className="input-shell resize-none leading-7"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function formatMoney(value: string) {
  const numberValue = Number(value || 0);

  if (!numberValue) return '0';

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(numberValue);
}
