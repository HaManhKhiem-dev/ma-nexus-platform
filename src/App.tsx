import React, { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation
} from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Building2,
  FileSignature,
  X,
  ArrowUpRight,
  Fingerprint,
  Mail,
  Chrome,
  Landmark,
  Briefcase,
  User,
  ArrowLeft,
  LockKeyhole,
  ShieldAlert,
  CheckCircle2,
  Menu,
  ChevronRight,
  CircleDot
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

// IMPORT PAGES
import Marketplace from './pages/Marketplace';
import Dashboard from './pages/Dashboard';
import DealDetail from './pages/DealDetail';
import CreateDeal from './pages/CreateDeal';
import Profile from './pages/Profile';
import DataRoom from './pages/DataRoom';
import AdminDashboard from './pages/AdminDashboard';

type AuthMode = 'login' | 'register' | 'otp';

type NavItem = {
  name: string;
  path: string;
  icon: React.ElementType;
  protected?: boolean;
};

const openAuthModalGlobally = () => {
  window.dispatchEvent(new Event('nexus:open-auth-modal'));
};

const isKycVerified = (profile: any) => {
  return profile?.kycStatus === 'verified';
};

const getRoleLabel = (role: string | undefined, t: TFunction) => {
  if (!role) return t('roles.buyer');
  return t(`roles.${role}`, { defaultValue: role });
};

const getKycMeta = (status: string | undefined, t: TFunction) => {
  if (status === 'verified') {
    return {
      label: t('kyc.verified_label'),
      tone: 'emerald',
      description: t('kyc.verified_description'),
      icon: CheckCircle2,
      className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
    };
  }

  if (status === 'pending') {
    return {
      label: t('kyc.pending_label'),
      tone: 'orange',
      description: t('kyc.pending_description'),
      icon: ShieldCheck,
      className: 'border-orange-500/20 bg-orange-500/10 text-orange-400'
    };
  }

  if (status === 'rejected') {
    return {
      label: t('kyc.rejected_label'),
      tone: 'red',
      description: t('kyc.rejected_description'),
      icon: ShieldAlert,
      className: 'border-red-500/20 bg-red-500/10 text-red-400'
    };
  }

  return {
    label: t('kyc.not_verified_label'),
    tone: 'slate',
    description: t('kyc.not_verified_description'),
    icon: LockKeyhole,
    className: 'border-slate-700 bg-slate-900 text-slate-400'
  };
};

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      type="button"
      onClick={toggleLang}
      className="flex items-center justify-center w-10 h-10 rounded-2xl border border-slate-800 bg-slate-900/70 text-emerald-500 hover:border-emerald-500/50 transition-all font-black text-[10px] tracking-widest uppercase"
      title={i18n.language === 'vi' ? t('navbar.switch_to_english') : t('navbar.switch_to_vietnamese')}
    >
      {i18n.language === 'vi' ? t('navbar.lang_en') : t('navbar.lang_vi')}
    </button>
  );
};

// AUTH MODAL
const AuthModal = ({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    sendOtpEmail,
    verifyOtp,
    signingIn,
    authError,
    user,
    clearAuthError
  } = useAuth();

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('buyer');
  const [otpInput, setOtpInput] = useState('');

  const roleItems = useMemo(
    () => [
      { id: 'buyer', icon: <Landmark size={15} />, label: t('roles.buyer') },
      { id: 'seller', icon: <Briefcase size={15} />, label: t('roles.seller') },
      { id: 'advisor', icon: <User size={15} />, label: t('roles.advisor') }
    ],
    [t]
  );

  useEffect(() => {
    if (user) onClose();
  }, [user, onClose]);

  if (!isOpen) return null;

  const resetAuthError = () => {
    if (clearAuthError) clearAuthError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetAuthError();

    if (authMode === 'login') {
      await signInWithEmail(email, password);
      return;
    }

    if (authMode === 'register') {
      const success = await sendOtpEmail(email, name);
      if (success) setAuthMode('otp');
      return;
    }

    if (authMode === 'otp') {
      const isValid = await verifyOtp(email, otpInput);
      if (isValid) {
        await signUpWithEmail(email, password, name, role);
      }
    }
  };

  const handleBackOrSwitch = () => {
    resetAuthError();

    if (authMode === 'otp') {
      setAuthMode('register');
      return;
    }

    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-2xl flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.22 }}
        className="relative w-full max-w-[460px] overflow-hidden rounded-[36px] border border-slate-800 bg-[#0f172a] shadow-2xl shadow-black/50"
      >
        <div className="absolute -top-28 -right-24 w-72 h-72 bg-emerald-500/10 blur-[90px] rounded-full" />
        <div className="absolute -bottom-28 -left-24 w-72 h-72 bg-cyan-500/10 blur-[90px] rounded-full" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-7 right-7 z-10 w-10 h-10 rounded-2xl border border-slate-800 bg-slate-950/70 text-slate-500 hover:text-white hover:border-red-500/50 transition-all flex items-center justify-center"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-[28px] flex items-center justify-center mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              {authMode === 'otp' ? (
                <Mail size={36} className="text-emerald-400" />
              ) : (
                <Fingerprint size={36} className="text-emerald-400" />
              )}
            </div>

            <p className="text-[10px] text-emerald-400 uppercase tracking-[0.35em] mb-3 font-black">
              {t('auth.terminal')}
            </p>

            <h2 className="text-3xl font-black text-white tracking-tight">
              {authMode === 'login'
                ? t('auth.title_login')
                : authMode === 'register'
                ? t('auth.title_register')
                : t('auth.title_otp')}
            </h2>

            <p className="text-xs text-slate-500 mt-3 mb-8 leading-6 max-w-sm">
              {authMode === 'otp'
                ? t('auth.otp_description', { email })
                : t('auth.secure_description')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {roleItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id)}
                      className={`flex flex-col items-center gap-2 py-3 rounded-2xl border transition-all ${
                        role === item.id
                          ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10'
                          : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      {item.icon}
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>

                <FieldLabel label={t('auth.full_name')}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input-dark"
                  />
                </FieldLabel>
              </>
            )}

            {authMode !== 'otp' && (
              <>
                <FieldLabel label={t('auth.corporate_email')}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-dark"
                  />
                </FieldLabel>

                <FieldLabel label={t('auth.access_key')}>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-dark"
                  />
                </FieldLabel>
              </>
            )}

            {authMode === 'otp' && (
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-black tracking-widest text-slate-500 ml-1">
                  {t('auth.verification_code')}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  autoFocus
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950 border border-emerald-500/40 p-6 rounded-2xl text-3xl text-center tracking-[0.5em] text-emerald-400 font-black outline-none focus:ring-2 focus:ring-emerald-500/10"
                  placeholder={t('auth.otp_placeholder')}
                />
              </div>
            )}

            {authError && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-[10px] text-red-300 text-center font-black uppercase tracking-widest">
                  {authError}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={signingIn}
              className="w-full py-4 bg-emerald-500 text-[#020617] text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60"
            >
              {signingIn
                ? t('auth.processing')
                : authMode === 'login'
                ? t('auth.enter_workspace')
                : authMode === 'register'
                ? t('auth.send_verification')
                : t('auth.confirm_account')}
            </button>
          </form>

          {authMode !== 'otp' && (
            <div className="mt-6">
              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-slate-800" />
                <span className="mx-4 text-[8px] text-slate-600 font-black uppercase tracking-widest">
                  {t('auth.or_continue_with')}
                </span>
                <div className="flex-grow border-t border-slate-800" />
              </div>

              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-300 text-[10px] font-black uppercase flex items-center justify-center gap-3 hover:bg-slate-800 hover:border-slate-700 transition-all"
              >
                <Chrome size={16} className="text-red-400" />
                {t('auth.google_sso')}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleBackOrSwitch}
            className="mt-8 w-full text-[10px] uppercase font-black tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
          >
            {authMode === 'otp' ? (
              <>
                <ArrowLeft size={12} />
                {t('auth.back_to_register')}
              </>
            ) : authMode === 'login' ? (
              t('auth.register_switch')
            ) : (
              t('auth.sign_in_switch')
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

function FieldLabel({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 ml-1">
        {label}
      </span>
      {children}
    </label>
  );
}

// HOME PAGE
const Home = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const verified = isKycVerified(profile);

  const lifecycle = useMemo(
    () => [
      { label: t('home.lifecycle.listing_label'), value: t('home.lifecycle.listing_value') },
      { label: t('home.lifecycle.matching_label'), value: t('home.lifecycle.matching_value') },
      { label: t('home.lifecycle.diligence_label'), value: t('home.lifecycle.diligence_value') },
      { label: t('home.lifecycle.negotiation_label'), value: t('home.lifecycle.negotiation_value') },
      { label: t('home.lifecycle.legal_label'), value: t('home.lifecycle.legal_value') },
      { label: t('home.lifecycle.closing_label'), value: t('home.lifecycle.closing_value') }
    ],
    [t]
  );

  const metrics = useMemo(
    () => [
      [t('home.metrics.verified_users_label'), t('home.metrics.verified_users_value')],
      [t('home.metrics.deal_flow_label'), t('home.metrics.deal_flow_value')],
      [t('home.metrics.data_rooms_label'), t('home.metrics.data_rooms_value')],
      [t('home.metrics.compliance_label'), t('home.metrics.compliance_value')]
    ],
    [t]
  );

  const ctaLabel = !user
    ? t('home.cta_initialize_access')
    : verified
    ? t('home.cta_enter_marketplace')
    : t('home.cta_complete_kyc');

  const ctaPath = verified ? '/marketplace' : '/profile';

  return (
    <div className="space-y-32 pt-8 md:pt-12">
      <section className="relative overflow-hidden rounded-[44px] border border-slate-800 bg-[#0f172a]/70 px-6 py-10 md:p-12 shadow-2xl shadow-black/30">
        <div className="absolute -top-48 -right-40 w-[620px] h-[620px] bg-emerald-600/10 blur-[130px] rounded-full" />
        <div className="absolute -bottom-52 -left-44 w-[620px] h-[620px] bg-cyan-600/10 blur-[130px] rounded-full" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-7">
              <motion.div
                initial={{ opacity: 0, scale: 0.86 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
              >
                <CircleDot size={12} className="text-emerald-400" />
                <p className="text-[10px] text-emerald-400 uppercase tracking-[0.3em] font-black">
                  {t('home.hero_badge')}
                </p>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-white"
              >
                {t('home.hero_title_line_1')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  {t('home.hero_title_gradient')}
                </span>{' '}
                <br />
                {t('home.hero_title_line_3')}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.16 }}
                className="max-w-2xl text-base md:text-lg text-slate-400 leading-8"
              >
                {t('home.hero_description')}
              </motion.p>
            </div>

            <div className="flex flex-wrap gap-4">
              {!user ? (
                <button
                  type="button"
                  onClick={openAuthModalGlobally}
                  className="px-9 py-5 bg-emerald-500 text-[#020617] font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-emerald-400 hover:scale-[1.03] transition-all flex items-center gap-2 shadow-xl shadow-emerald-500/20"
                >
                  {ctaLabel}
                  <ArrowUpRight size={16} />
                </button>
              ) : (
                <Link
                  to={ctaPath}
                  className="px-9 py-5 bg-emerald-500 text-[#020617] font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-emerald-400 hover:scale-[1.03] transition-all flex items-center gap-2 shadow-xl shadow-emerald-500/20"
                >
                  {ctaLabel}
                  <ArrowUpRight size={16} />
                </Link>
              )}

              <Link
                to={verified ? '/create-deal' : '/profile'}
                className="px-9 py-5 border border-slate-700 text-white font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-slate-800 hover:border-slate-600 transition-all flex items-center gap-2"
              >
                {t('home.submit_asset')}
                {!verified && user && <LockKeyhole size={14} className="text-orange-400" />}
              </Link>
            </div>

            {user && <KycInlineStatus profile={profile} />}
          </div>

          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] -z-10 rounded-3xl" />

            <div className="bg-[#020617]/70 backdrop-blur-md border border-slate-700 rounded-[34px] overflow-hidden shadow-2xl">
              <div className="p-7 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                    {t('home.deal_operating_system')}
                  </p>
                  <h3 className="text-2xl font-black text-white mt-2">
                    {t('home.compliance_layer')}
                  </h3>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck size={22} className="text-emerald-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-slate-800">
                {metrics.map(([label, value]) => (
                  <div key={label} className="bg-[#0f172a] p-7">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">
                      {label}
                    </p>
                    <p className="text-xl font-black mt-3 text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-7 space-y-5">
                {lifecycle.map((item, idx) => (
                  <div key={item.label} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-2xl border border-slate-700 bg-slate-950 flex items-center justify-center text-[10px] text-slate-500 font-black">
                        {idx + 1}
                      </span>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-300 group-hover:text-emerald-400 transition-colors">
                        {item.label}
                      </p>
                    </div>

                    <div className="h-px flex-1 mx-4 bg-slate-800" />

                    <p className="text-[10px] text-slate-500 italic hidden sm:block">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

function KycInlineStatus({ profile }: { profile: any }) {
  const { t } = useTranslation();
  const meta = getKycMeta(profile?.kycStatus, t);
  const Icon = meta.icon;

  return (
    <div className={`max-w-xl rounded-[24px] border px-5 py-4 ${meta.className}`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-black">
            {t('kyc.status_with_label', { label: meta.label })}
          </p>
          <p className="text-xs mt-2 leading-6 opacity-80">
            {meta.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// LOADING SCREEN
const LoadingScreen = () => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center z-50 text-center space-y-4 flex-col">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-emerald-500/20 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>

      <motion.p
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-emerald-500 uppercase font-black text-[10px] tracking-[0.5em] mt-4"
      >
        {t('common.loading_initializing_nexus')}
      </motion.p>
    </div>
  );
};

function AuthRequiredScreen() {
  const { t } = useTranslation();

  return (
    <AccessPanel
      icon={<Fingerprint size={38} className="text-emerald-400" />}
      eyebrow={t('auth.sign_in_required')}
      title={t('auth.secure_access_only')}
      description={t('auth.sign_in_before_accessing')}
      actionLabel={t('auth.sign_in')}
      actionType="button"
      onAction={openAuthModalGlobally}
      tone="emerald"
    />
  );
}

function KycRequiredScreen() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const meta = getKycMeta(profile?.kycStatus, t);
  const Icon = meta.icon;

  return (
    <AccessPanel
      icon={<Icon size={38} className="text-orange-400" />}
      eyebrow={t('kyc.required_eyebrow')}
      title={t('kyc.verification_required')}
      description={t('kyc.required_description')}
      actionLabel={t('kyc.complete_kyc')}
      actionType="link"
      actionHref="/profile"
      tone="orange"
      helper={meta.description}
    />
  );
}

function AccessPanel({
  icon,
  eyebrow,
  title,
  description,
  actionLabel,
  actionType,
  actionHref,
  onAction,
  tone,
  helper
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  actionType: 'button' | 'link';
  actionHref?: string;
  onAction?: () => void;
  tone: 'emerald' | 'orange';
  helper?: string;
}) {
  const { t } = useTranslation();
  const toneClass =
    tone === 'emerald'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
      : 'border-orange-500/20 bg-orange-500/10 text-orange-400';

  const actionClass =
    tone === 'emerald'
      ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
      : 'bg-orange-400 hover:bg-orange-300 shadow-orange-500/20';

  const actionNode =
    actionType === 'link' ? (
      <Link
        to={actionHref || '/profile'}
        className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl ${actionClass} text-[#020617] text-[10px] uppercase tracking-widest font-black transition-all shadow-lg`}
      >
        {actionLabel}
        <ArrowUpRight size={16} />
      </Link>
    ) : (
      <button
        type="button"
        onClick={onAction}
        className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl ${actionClass} text-[#020617] text-[10px] uppercase tracking-widest font-black transition-all shadow-lg`}
      >
        {actionLabel}
        <ArrowUpRight size={16} />
      </button>
    );

  return (
    <div className="min-h-[65vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative overflow-hidden max-w-xl w-full text-center rounded-[40px] border border-slate-800 bg-[#0f172a]/80 p-8 md:p-10 shadow-2xl shadow-black/30"
      >
        <div className="absolute -top-36 -right-28 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-36 -left-28 w-80 h-80 bg-orange-500/10 blur-[100px] rounded-full" />

        <div className="relative z-10">
          <div className={`w-20 h-20 mx-auto rounded-[28px] border flex items-center justify-center mb-8 ${toneClass}`}>
            {icon}
          </div>

          <p className={`text-[10px] uppercase tracking-[0.35em] font-black mb-4 ${tone === 'emerald' ? 'text-emerald-400' : 'text-orange-400'}`}>
            {eyebrow}
          </p>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-5">
            {title}
          </h1>

          <p className="text-sm text-slate-400 leading-7 mb-6">
            {description}
          </p>

          {helper && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 mb-8">
              <p className="text-xs text-slate-500 leading-6">
                {t('kyc.current_status', { status: helper })}
              </p>
            </div>
          )}

          {actionNode}
        </div>
      </motion.div>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <AuthRequiredScreen />;
  }

  return <>{children}</>;
}

function RequireKyc({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!profile) {
    return <LoadingScreen />;
  }

  if (!isKycVerified(profile)) {
    return <KycRequiredScreen />;
  }

  return <>{children}</>;
}

// MAIN LAYOUT
function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { user, profile, logout } = useAuth();
  const location = useLocation();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const verified = isKycVerified(profile);
  const lockedByKyc = !!user && !verified;
  const meta = getKycMeta(profile?.kycStatus, t);

  useEffect(() => {
    const open = () => setIsLoginModalOpen(true);

    window.addEventListener('nexus:open-auth-modal', open);

    return () => {
      window.removeEventListener('nexus:open-auth-modal', open);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navItems = useMemo<NavItem[]>(() => {
    const baseItems: NavItem[] = [
      { name: t('navbar.marketplace'), path: '/marketplace', icon: Search, protected: true },
      { name: t('navbar.dashboard'), path: '/dashboard', icon: LayoutDashboard, protected: true },
      { name: t('navbar.data_room'), path: '/data-room', icon: ShieldCheck, protected: true },
      { name: t('navbar.submit_deal'), path: '/create-deal', icon: FileSignature, protected: true }
    ];

    if (profile?.role === 'admin') {
      baseItems.push({
        name: t('navbar.admin'),
        path: '/admin',
        icon: ShieldCheck,
        protected: true
      });
    }

    return baseItems;
  }, [profile?.role, t]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/30 font-sans antialiased">
      <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#020617]/82 backdrop-blur-2xl">
        <div className="max-w-[1540px] mx-auto px-5 md:px-6 h-20 md:h-24 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 bg-emerald-500 flex items-center justify-center rounded-2xl shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform duration-300">
              <Building2 size={22} className="text-[#020617]" />
            </div>

            <div>
              <span className="text-sm font-black uppercase tracking-[0.3em] block leading-none text-white">
                {t('navbar.brand')}
              </span>
              <span className="text-[8px] text-emerald-500 uppercase tracking-widest mt-1 block">
                {t('navbar.brand_subtitle')}
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-4 xl:gap-6 2xl:gap-9">
            {navItems.map((item) => (
              <DesktopNavItem
                key={item.path}
                item={item}
                active={location.pathname === item.path}
                locked={lockedByKyc && !!item.protected}
              />
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2 md:gap-3 xl:gap-5">
            <LanguageSwitcher />
            {user && (
              <Link
                to="/profile"
                className={`hidden xl:inline-flex shrink-0 items-center gap-2 px-4 py-2 rounded-full border text-[9px] uppercase tracking-widest font-black whitespace-nowrap ${meta.className}`}
              >
                <meta.icon size={13} />
                {meta.label}
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2 md:gap-3 xl:gap-5">
                <Link
                  to="/profile"
                  className="flex min-w-0 max-w-[210px] 2xl:max-w-[280px] items-center gap-3 bg-slate-900/70 p-1.5 pr-4 rounded-full border border-slate-800 hover:border-emerald-500/50 transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center overflow-hidden uppercase font-black text-[#020617] text-xs">
                    {profile?.name?.charAt(0) || 'U'}
                  </div>

                  <div className="hidden xl:block min-w-0 text-left">
                    <p className="max-w-[135px] 2xl:max-w-[205px] truncate text-[9px] font-black uppercase tracking-widest leading-none text-white">
                      {profile?.name || t('auth.authorized_user')}
                    </p>
                    <p className="max-w-[135px] 2xl:max-w-[205px] truncate text-[8px] text-emerald-500 uppercase tracking-widest mt-1">
                      {getRoleLabel(profile?.role, t)}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="hidden md:flex w-10 h-10 rounded-2xl border border-slate-800 bg-slate-900/70 text-slate-500 hover:text-red-400 hover:border-red-500/40 transition-colors items-center justify-center"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="hidden md:inline-flex px-8 py-3 bg-white text-[#020617] text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-emerald-500 transition-all active:scale-95 shadow-xl shadow-white/5"
              >
                {t('navbar.sign_in')}
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="lg:hidden w-11 h-11 rounded-2xl border border-slate-800 bg-slate-900/70 text-slate-300 flex items-center justify-center"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="lg:hidden border-t border-slate-800 bg-[#020617]/98 px-5 py-5"
            >
              <div className="space-y-2">
                {navItems.map((item) => (
                  <MobileNavItem
                    key={item.path}
                    item={item}
                    active={location.pathname === item.path}
                    locked={lockedByKyc && !!item.protected}
                  />
                ))}

                <Link
                  to="/profile"
                  className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4 text-slate-300"
                >
                  <span className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-black">
                    <User size={15} />
                    {t('navbar.profile_kyc')}
                  </span>
                  <ChevronRight size={16} />
                </Link>

                {!user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                    className="w-full mt-3 rounded-2xl bg-emerald-500 px-4 py-4 text-[#020617] text-[10px] uppercase tracking-widest font-black"
                  >
                    {t('navbar.sign_in')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-red-300 text-[10px] uppercase tracking-widest font-black"
                  >
                    {t('navbar.log_out')}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {lockedByKyc && location.pathname !== '/profile' && (
        <div className="border-b border-orange-500/20 bg-orange-500/10">
          <div className="max-w-7xl mx-auto px-5 md:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-start gap-3">
              <LockKeyhole size={16} className="text-orange-400 mt-0.5 shrink-0" />
              <p className="text-xs text-orange-200 leading-6">
                {t('navbar.kyc_locked_banner')}
              </p>
            </div>

            <Link
              to="/profile"
              className="text-[10px] uppercase tracking-widest font-black text-orange-300 hover:text-orange-200 inline-flex items-center gap-2"
            >
              {t('navbar.go_to_kyc')}
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isLoginModalOpen && (
          <AuthModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-5 md:px-6 py-8 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.32, ease: 'circOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-5 md:px-6 py-10 md:py-12 border-t border-slate-800 flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-[9px] uppercase tracking-[0.3em] text-slate-600 font-black">
        <span>{t('navbar.footer_copyright')}</span>

        <div className="flex flex-wrap gap-5 md:gap-8">
          <span className="text-emerald-500/60">{t('navbar.kyc_gated')}</span>
          <span>{t('navbar.encrypted')}</span>
          <span>{t('navbar.rbac_enabled')}</span>
        </div>
      </footer>
    </div>
  );
}

function DesktopNavItem({
  item,
  active,
  locked
}: {
  item: NavItem;
  active: boolean;
  locked: boolean;
}) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const target = locked ? '/profile' : item.path;

  return (
    <Link
      to={target}
      title={locked ? t('navbar.kyc_required_title') : item.name}
      className={`whitespace-nowrap text-[10px] uppercase tracking-[0.2em] font-black transition-all relative py-2 flex items-center gap-2 ${
        locked
          ? 'text-slate-600 hover:text-orange-400'
          : active
          ? 'text-emerald-400'
          : 'text-slate-500 hover:text-white'
      }`}
    >
      <Icon size={14} />
      {item.name}
      {locked && <LockKeyhole size={12} className="text-orange-500" />}

      {active && !locked && (
        <motion.div
          layoutId="nav-underline"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"
        />
      )}
    </Link>
  );
}

function MobileNavItem({
  item,
  active,
  locked
}: {
  item: NavItem;
  active: boolean;
  locked: boolean;
}) {
  const Icon = item.icon;
  const target = locked ? '/profile' : item.path;

  return (
    <Link
      to={target}
      className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${
        locked
          ? 'border-orange-500/20 bg-orange-500/10 text-orange-300'
          : active
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          : 'border-slate-800 bg-slate-900/60 text-slate-300'
      }`}
    >
      <span className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-black">
        <Icon size={15} />
        {item.name}
      </span>

      {locked ? <LockKeyhole size={15} /> : <ChevronRight size={16} />}
    </Link>
  );
}

// AUTH CONTENT
function AuthContent() {
  const { t } = useTranslation();
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        <Route
          path="/marketplace"
          element={
            <RequireAuth>
              <RequireKyc>
                <Marketplace />
              </RequireKyc>
            </RequireAuth>
          }
        />

        <Route
          path="/deal/:id"
          element={
            <RequireAuth>
              <RequireKyc>
                <DealDetail />
              </RequireKyc>
            </RequireAuth>
          }
        />

        <Route
          path="/deals/:id"
          element={
            <RequireAuth>
              <RequireKyc>
                <DealDetail />
              </RequireKyc>
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <RequireKyc>
                <Dashboard />
              </RequireKyc>
            </RequireAuth>
          }
        />

        <Route
          path="/data-room"
          element={
            <RequireAuth>
              <RequireKyc>
                <DataRoom />
              </RequireKyc>
            </RequireAuth>
          }
        />

        <Route
          path="/dataroom/:id"
          element={
            <RequireAuth>
              <RequireKyc>
                <DataRoom />
              </RequireKyc>
            </RequireAuth>
          }
        />

        <Route
          path="/create-deal"
          element={
            <RequireAuth>
              <RequireKyc>
                <CreateDeal />
              </RequireKyc>
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireKyc>
                <AdminDashboard />
              </RequireKyc>
            </RequireAuth>
          }
        />

        <Route
          path="*"
          element={
            <AccessPanel
              icon={<ShieldAlert size={38} className="text-orange-400" />}
              eyebrow={t('auth.route_not_found')}
              title={t('auth.page_not_exist')}
              description={t('auth.route_unavailable')}
              actionLabel={t('auth.back_to_home')}
              actionType="link"
              actionHref="/"
              tone="orange"
            />
          }
        />
      </Routes>
    </AppLayout>
  );
}

// MAIN APP
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthContent />
      </AuthProvider>
    </Router>
  );
}
