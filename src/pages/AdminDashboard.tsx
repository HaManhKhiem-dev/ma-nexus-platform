import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/AuthContext';
import { canAdminModerate } from '../lib/compliance';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Search,
  Clock,
  ShieldCheck,
  FileText,
  Eye,
  Loader2,
  RefreshCcw,
  UserCheck,
  UserX,
  Globe2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface PendingKycUser {
  id: string;
  name: string;
  email: string;
  kycStatus: string;
  role: string;
  country?: string;
  documents?: string[];
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();

  const [pendingUsers, setPendingUsers] = useState<PendingKycUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = !!profile && canAdminModerate(profile);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    fetchPendingKyc();
  }, [isAdmin]);

  const fetchPendingKyc = async () => {
    setLoading(true);

    try {
      const q = query(collection(db, 'users'), where('kycStatus', '==', 'pending'));
      const snapshot = await getDocs(q);

      const users: PendingKycUser[] = [];

      for (const userDoc of snapshot.docs) {
        const userData = userDoc.data() as Omit<PendingKycUser, 'id'>;
        const kycProfileDoc = await getDoc(doc(db, 'kyc_profiles', userDoc.id));

        let documents: string[] = [];

        if (kycProfileDoc.exists()) {
          documents = kycProfileDoc.data().documents || [];
        }

        users.push({
          id: userDoc.id,
          ...userData,
          documents
        });
      }

      setPendingUsers(users);
    } catch (error) {
      console.error('Error fetching pending KYC:', error);
    } finally {
      setLoading(false);
    }
  };

  const reviewKyc = async (userId: string, action: 'verified' | 'rejected') => {
    if (!user) return;

    setProcessingId(userId);

    try {
      const batch = writeBatch(db);

      const userRef = doc(db, 'users', userId);
      const kycRef = doc(db, 'kyc_profiles', userId);
      const reviewLogRef = doc(collection(db, 'kyc_reviews'));

      batch.update(userRef, {
        kycStatus: action
      });

      batch.set(
        kycRef,
        {
          status: action === 'verified' ? 'approved' : 'rejected',
          reviewedAt: new Date().toISOString(),
          reviewedBy: user.uid
        },
        { merge: true }
      );

      batch.set(reviewLogRef, {
        kyc_profile_id: userId,
        admin_id: user.uid,
        action,
        reviewed_at: new Date().toISOString()
      });

      await batch.commit();

      setPendingUsers((prev) => prev.filter((item) => item.id !== userId));
    } catch (error) {
      console.error('Error reviewing KYC:', error);
      alert(t('admin.review_error'));
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return pendingUsers;

    return pendingUsers.filter((item) => {
      const target = `${item.name} ${item.email} ${item.role} ${item.country || ''}`.toLowerCase();
      return target.includes(keyword);
    });
  }, [pendingUsers, searchTerm]);

  const totalDocuments = useMemo(() => {
    return pendingUsers.reduce((total, item) => total + (item.documents?.length || 0), 0);
  }, [pendingUsers]);

  const usersWithDocuments = useMemo(() => {
    return pendingUsers.filter((item) => item.documents && item.documents.length > 0).length;
  }, [pendingUsers]);

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full text-center bg-[#0f172a]/80 border border-red-500/20 rounded-[32px] p-10 shadow-2xl shadow-red-950/20"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8">
            <ShieldAlert size={40} className="text-red-400" />
          </div>

          <p className="text-[10px] uppercase tracking-[0.35em] text-red-400 font-black mb-4">
            {t('admin.restricted_area')}
          </p>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-5">
            {t('admin.access_denied')}
          </h1>

          <p className="text-sm text-slate-400 leading-7">
            {t('admin.access_denied_description')}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[36px] border border-slate-800 bg-[#0f172a]/80 p-8 md:p-10 shadow-2xl shadow-black/30">
        <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px]" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-black">
                {t('admin.command_center')}
              </span>
            </div>

            <div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white">
                {t('admin.title')}
              </h1>

              <p className="mt-5 max-w-2xl text-sm md:text-base text-slate-400 leading-8">
                {t('admin.description')}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={fetchPendingKyc}
              disabled={loading}
              className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-emerald-500/60 hover:text-white transition-all disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCcw size={16} />
              )}
              <span className="text-[10px] uppercase tracking-widest font-black">
                {t('admin.refresh')}
              </span>
            </button>

            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <Clock size={16} className="text-emerald-400" />
              <span className="text-[10px] uppercase tracking-widest font-black text-emerald-400">
                {t('admin.live_queue')}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Clock size={20} />}
          label={t('admin.stats.pending_reviews')}
          value={pendingUsers.length}
          helper={t('admin.stats.users_waiting')}
        />

        <StatCard
          icon={<FileText size={20} />}
          label={t('admin.stats.submitted_documents')}
          value={totalDocuments}
          helper={t('admin.stats.files_attached')}
        />

        <StatCard
          icon={<UserCheck size={20} />}
          label={t('admin.stats.ready_to_inspect')}
          value={usersWithDocuments}
          helper={t('admin.stats.profiles_with_documents')}
        />
      </section>

      <section className="rounded-[32px] border border-slate-800 bg-[#0f172a]/70 shadow-2xl shadow-black/20 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Clock size={20} className="text-orange-400" />
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  {t('admin.pending_kyc_reviews')}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {t('admin.pending_count', { visible: filteredUsers.length, total: pendingUsers.length })}
                </p>
              </div>
            </div>
          </div>

          <div className="relative w-full lg:w-[360px]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('admin.search_placeholder')}
              className="w-full bg-[#020617] border border-slate-800 py-4 pl-11 pr-4 rounded-2xl text-xs text-white placeholder:text-slate-600 focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
            />
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-[#020617] text-[10px] uppercase tracking-[0.24em] font-black text-slate-600 border-b border-slate-800">
          <div className="col-span-3">{t('admin.table.user')}</div>
          <div className="col-span-3">{t('admin.table.email')}</div>
          <div className="col-span-2">{t('admin.table.role')}</div>
          <div className="col-span-2">{t('admin.table.documents')}</div>
          <div className="col-span-2 text-right">{t('admin.table.actions')}</div>
        </div>

        <div className="divide-y divide-slate-800">
          {loading ? (
            <LoadingRows />
          ) : filteredUsers.length === 0 ? (
            <EmptyState hasSearch={searchTerm.trim().length > 0} />
          ) : (
            filteredUsers.map((item, index) => (
              <KycUserRow
                key={item.id}
                user={item}
                index={index}
                processingId={processingId}
                onApprove={() => reviewKyc(item.id, 'verified')}
                onReject={() => reviewKyc(item.id, 'rejected')}
                onViewImage={setViewingImage}
              />
            ))
          )}
        </div>
      </section>

      <AnimatePresence>
        {viewingImage && (
          <ImageViewer image={viewingImage} onClose={() => setViewingImage(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  helper
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-[#0f172a]/70 p-6 shadow-xl shadow-black/20"
    >
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full" />

      <div className="relative z-10 flex items-start justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
            {label}
          </p>

          <p className="text-4xl font-black text-white mt-4">{value}</p>

          <p className="text-xs text-slate-500 mt-3">{helper}</p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function KycUserRow({
  user,
  index,
  processingId,
  onApprove,
  onReject,
  onViewImage
}: {
  user: PendingKycUser;
  index: number;
  processingId: string | null;
  onApprove: () => void;
  onReject: () => void;
  onViewImage: (url: string) => void;
}) {
  const { t } = useTranslation();
  const isProcessing = processingId === user.id;
  const initials = getInitials(user.name || user.email);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.2) }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 md:p-6 bg-[#0b1120]/70 hover:bg-slate-900/70 transition-all"
    >
      <div className="lg:col-span-3 flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-[#020617] flex items-center justify-center font-black uppercase shrink-0 shadow-lg shadow-emerald-500/20">
          {initials}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">
            {user.name || t('admin.unnamed_user')}
          </p>

          <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
            <Clock size={11} className="text-orange-400" />
            <span className="text-[9px] uppercase tracking-widest font-black text-orange-300">
              {t('admin.pending')}
            </span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 min-w-0">
        <LabelMobile>{t('admin.table.email')}</LabelMobile>
        <p className="text-xs text-slate-400 break-all leading-6">
          {user.email || t('admin.no_email')}
        </p>
      </div>

      <div className="lg:col-span-2">
        <LabelMobile>{t('admin.role_country')}</LabelMobile>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] uppercase tracking-widest font-black text-slate-300">
            {user.role || t('admin.member')}
          </span>

          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] uppercase tracking-widest font-black text-slate-400">
            <Globe2 size={11} />
            {user.country || t('common.not_applicable')}
          </span>
        </div>
      </div>

      <div className="lg:col-span-2">
        <LabelMobile>{t('admin.table.documents')}</LabelMobile>
        <DocumentList documents={user.documents || []} onViewImage={onViewImage} />
      </div>

      <div className="lg:col-span-2 flex lg:justify-end items-center gap-3">
        <button
          onClick={onApprove}
          disabled={isProcessing}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-[#020617] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('admin.approve_kyc')}
        >
          {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          <span className="text-[10px] uppercase tracking-widest font-black">
            {t('admin.approve')}
          </span>
        </button>

        <button
          onClick={onReject}
          disabled={isProcessing}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('admin.reject_kyc')}
        >
          {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
          <span className="text-[10px] uppercase tracking-widest font-black">
            {t('admin.reject')}
          </span>
        </button>
      </div>
    </motion.div>
  );
}

function DocumentList({
  documents,
  onViewImage
}: {
  documents: string[];
  onViewImage: (url: string) => void;
}) {
  const { t } = useTranslation();

  if (!documents.length) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[10px] uppercase tracking-widest font-black text-slate-500">
        <FileText size={13} />
        {t('admin.no_documents')}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {documents.map((url, index) => {
        if (url === 'mock_document_url') {
          return (
            <span
              key={`${url}-${index}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] uppercase tracking-widest font-black text-emerald-400"
            >
              <ShieldCheck size={13} />
              {t('admin.mock_verified')}
            </span>
          );
        }

        if (url.startsWith('data:image/')) {
          return (
            <button
              key={`${url}-${index}`}
              onClick={() => onViewImage(url)}
              className="group relative w-20 h-14 rounded-xl overflow-hidden border border-slate-700 hover:border-emerald-500 transition-all"
              title={t('admin.view_document_image')}
            >
              <img
                src={url}
                alt={t('admin.kyc_document_alt', { index: index + 1 })}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye size={16} className="text-white" />
              </div>
            </button>
          );
        }

        return (
          <a
            key={`${url}-${index}`}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] uppercase tracking-widest font-black text-blue-300 hover:bg-blue-500 hover:text-white transition-all"
          >
            <Eye size={13} />
            {t('admin.file_number', { index: index + 1 })}
          </a>
        );
      })}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-px">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-6 bg-[#0b1120]/70"
        >
          <div className="lg:col-span-3 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 animate-pulse" />
            <div className="space-y-3 flex-1">
              <div className="h-3 w-32 bg-slate-800 rounded-full animate-pulse" />
              <div className="h-2 w-20 bg-slate-800 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="lg:col-span-3 h-3 bg-slate-800 rounded-full animate-pulse" />
          <div className="lg:col-span-2 h-3 bg-slate-800 rounded-full animate-pulse" />
          <div className="lg:col-span-2 h-3 bg-slate-800 rounded-full animate-pulse" />
          <div className="lg:col-span-2 h-3 bg-slate-800 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  const { t } = useTranslation();

  return (
    <div className="p-12 text-center bg-[#0b1120]/70">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-5">
        {hasSearch ? (
          <Search size={28} className="text-slate-500" />
        ) : (
          <UserX size={28} className="text-slate-500" />
        )}
      </div>

      <h3 className="text-xl font-black text-white">
        {hasSearch ? t('admin.no_matching_records') : t('admin.queue_clear')}
      </h3>

      <p className="text-sm text-slate-500 mt-3 max-w-md mx-auto leading-7">
        {hasSearch
          ? t('admin.no_match_description')
          : t('admin.queue_clear_description')}
      </p>
    </div>
  );
}

function ImageViewer({ image, onClose }: { image: string; onClose: () => void }) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#020617]/95 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative max-w-6xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-black">
              {t('admin.document_preview')}
            </p>
            <h3 className="text-xl font-black text-white mt-1">
              {t('admin.kyc_submitted_file')}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-red-500/60 transition-all flex items-center justify-center"
          >
            <X size={22} />
          </button>
        </div>

        <div className="rounded-[28px] overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl shadow-black/40">
          <img
            src={image}
            alt={t('admin.full_size_kyc_document')}
            className="w-full max-h-[78vh] object-contain bg-black"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function LabelMobile({ children }: { children: React.ReactNode }) {
  return (
    <p className="lg:hidden text-[9px] uppercase tracking-[0.25em] text-slate-600 font-black mb-2">
      {children}
    </p>
  );
}

function getInitials(value: string) {
  if (!value) return 'U';

  const parts = value.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}