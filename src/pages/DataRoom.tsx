import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import {
  FileText,
  Lock,
  ShieldCheck,
  Download,
  Eye,
  MoreVertical,
  Search,
  TrendingUp,
  Scale,
  Users,
  Cpu,
  BriefcaseBusiness,
  Upload,
  Timer,
  Fingerprint,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  FileCode,
  FilePieChart
} from 'lucide-react';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { canAccessDataRoom, isKycVerified } from '../lib/compliance';
import { writeDataRoomEvent } from '../lib/audit';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const folders = [
  { name: 'Financial', icon: TrendingUp, count: 18, color: 'emerald' },
  { name: 'Legal', icon: Scale, count: 24, color: 'blue' },
  { name: 'HR', icon: Users, count: 9, color: 'purple' },
  { name: 'Contracts', icon: BriefcaseBusiness, count: 31, color: 'orange' },
  { name: 'Technology', icon: Cpu, count: 13, color: 'red' },
];

const files = [
  { name: 'FY25_Audited_Financials.pdf', category: 'Financial', size: '2.4 MB', viewed: '18m 42s', permission: 'Download', type: 'pdf' },
  { name: 'Quality_of_Earnings_Report.pdf', category: 'Financial', size: '5.8 MB', viewed: '11m 08s', permission: 'View only', type: 'pdf' },
  { name: 'Shareholder_Register.xlsx', category: 'Legal', size: '450 KB', viewed: '4m 22s', permission: 'View only', type: 'excel' },
  { name: 'Customer_Contracts_Index.pdf', category: 'Contracts', size: '3.8 MB', viewed: '26m 14s', permission: 'Download', type: 'pdf' },
  { name: 'IP_and_Source_Code_Inventory.pdf', category: 'Technology', size: '1.7 MB', viewed: '7m 39s', permission: 'Edit', type: 'code' },
];

export default function DataRoom() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const dealId = searchParams.get('dealId');
  const [activeFolder, setActiveFolder] = useState('Financial');
  const [deal, setDeal] = useState<any>(null);
  const [ndaStatus, setNdaStatus] = useState<string | null>(null);

  React.useEffect(() => {
    if (!dealId) return;
    const fetchDeal = async () => {
      try {
        const dealDoc = await getDoc(doc(db, 'deals', dealId));
        if (dealDoc.exists()) {
          setDeal(dealDoc.data());
        } else {
          import('../lib/mockData').then(({ sampleDeals }) => {
            const mockDeal = sampleDeals.find(d => d.id === dealId);
            if (mockDeal) setDeal(mockDeal);
          });
        }
      } catch (e) {
        console.error("Error fetching deal:", e);
      }
    };
    fetchDeal();
  }, [dealId]);

  React.useEffect(() => {
    if (!user || !dealId) return;
    const ndaQ = query(collection(db, 'ndas'), where('dealId', '==', dealId), where('buyerUid', '==', user.uid));
    return onSnapshot(ndaQ, (snap) => {
      setNdaStatus(snap.empty ? null : snap.docs[0].data().status);
    });
  }, [user, dealId]);

  const isSellerOwner = user?.uid === deal?.sellerUid;
  const accessAllowed = deal ? canAccessDataRoom(profile, ndaStatus, isSellerOwner, deal.status) : false;

  const logFileAction = async (action: 'view' | 'download', file: any) => {
    await writeDataRoomEvent({
      actorUid: user?.uid,
      actorRole: profile?.role,
      action: `dataroom_${action}`,
      targetType: 'dataroom_file',
      targetId: file.name,
      dealId,
      fileName: file.name,
      folder: file.category,
      metadata: {
        permission: file.permission,
        watermark: profile?.email || user?.email || 'unknown_viewer',
      },
    });
  };

  if (!accessAllowed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full bg-slate-900/40 border border-slate-800 p-12 rounded-[3rem] text-center space-y-8 backdrop-blur-xl">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto text-red-500 shadow-lg shadow-red-500/5">
            <Lock size={32} />
          </div>
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-red-500 font-black">{t('data_room.restricted_protocol')}</p>
            <h1 className="text-4xl font-bold text-white tracking-tighter uppercase">{t('data_room.locked_title')}</h1>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              {t('data_room.locked_description_prefix')} <span className="text-white font-medium">KYC</span> {t('data_room.locked_description_middle')} <span className="text-white font-medium">NDA</span> {t('data_room.locked_description_suffix')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {!isKycVerified(profile) && (
              <Link to="/profile" className="px-8 py-4 bg-white text-slate-950 text-xs uppercase font-black tracking-widest hover:bg-emerald-400 transition-all rounded-2xl shadow-lg">
                {t('data_room.complete_verification')}
              </Link>
            )}
            <Link to="/marketplace" className="px-8 py-4 bg-slate-800 text-white text-xs uppercase font-black tracking-widest hover:bg-slate-700 transition-all rounded-2xl border border-slate-700">
              {t('data_room.return_to_market')}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Dynamic Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-6">
        <div className="space-y-4">
          <Link to="/marketplace" className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors group">
            <ArrowLeft size={14} />
            <span className="text-[10px] uppercase font-black tracking-widest">{t('data_room.back_to_listing')}</span>
          </Link>
          <div className="flex items-center gap-2 text-emerald-500">
            <ShieldCheck size={14} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-black">{t('data_room.secure_repository')}</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase">{t('data_room.title')}</h1>
          <div className="flex items-center gap-4 text-slate-400">
             <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] text-emerald-500 font-black uppercase tracking-widest">
               {deal?.title || t('data_room.unknown_asset')}
             </div>
             <p className="text-xs font-light">ID: {dealId?.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-3 px-6 py-4 bg-slate-900 border border-slate-800 text-white text-xs uppercase font-black tracking-widest hover:bg-slate-800 transition-all rounded-2xl">
            <Upload size={16} /> {t('data_room.bulk_upload')}
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Eye, label: t('data_room.stats.audit_trail'), value: t('data_room.stats.views', { count: 412 }), color: 'blue' },
          { icon: Timer, label: t('data_room.stats.engagement'), value: '9m 31s', color: 'emerald' },
          { icon: Download, label: t('data_room.stats.exfiltration'), value: t('data_room.stats.downloads', { count: 86 }), color: 'orange' },
          { icon: Fingerprint, label: t('data_room.stats.protection'), value: t('data_room.stats.watermarked'), color: 'purple' },
        ].map((metric) => (
          <div key={metric.label} className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-[2rem] space-y-2">
            <div className={`text-${metric.color}-500 mb-4`}><metric.icon size={18} /></div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{metric.label}</p>
            <p className="text-xl font-bold text-white tracking-tight">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-8">
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500 px-4">{t('data_room.directory_stack')}</p>
            <div className="space-y-2">
              {folders.map((folder) => (
                <button
                  key={folder.name}
                  onClick={() => setActiveFolder(folder.name)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                    activeFolder === folder.name 
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-900/40 text-slate-400 hover:bg-slate-900 hover:text-white border border-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <folder.icon size={16} className={activeFolder === folder.name ? 'text-slate-950' : 'text-slate-500 group-hover:text-emerald-500'} />
                    <span className="text-[11px] font-black uppercase tracking-widest">{t(`data_room.folders.${folder.name.toLowerCase()}`, { defaultValue: folder.name })}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${activeFolder === folder.name ? 'opacity-60' : 'text-slate-600'}`}>{folder.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] space-y-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('data_room.vault_protected')}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase">
              {t('data_room.watermark_prefix')} <span className="text-white italic">{profile?.email || t('data_room.identity')}</span>. {t('data_room.watermark_suffix')}
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 p-4 rounded-3xl border border-slate-800/50">
            <div className="flex items-center gap-4 px-2">
              <h3 className="text-2xl font-bold text-white tracking-tighter uppercase">{t(`data_room.folders.${activeFolder.toLowerCase()}`, { defaultValue: activeFolder })}</h3>
              <div className="h-4 w-px bg-slate-800" />
              <span className="text-[10px] text-slate-500 font-mono">/root/{activeFolder.toLowerCase()}</span>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
              <input 
                className="bg-slate-950/50 border border-slate-800 py-3 pl-10 pr-6 text-[10px] uppercase tracking-widest font-bold text-white focus:outline-none focus:border-emerald-500/50 rounded-xl min-w-[280px] transition-all" 
                placeholder={t('data_room.search_placeholder')} 
              />
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {files
                .filter((file) => activeFolder === 'Financial' || file.category === activeFolder)
                .map((file, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={file.name}
                    className="flex flex-col md:flex-row gap-6 p-5 bg-slate-900/30 border border-slate-800/60 rounded-3xl hover:border-emerald-500/40 hover:bg-slate-900/50 transition-all group items-center"
                  >
                    <div className="flex-1 flex gap-5 items-center">
                      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                        {file.type === 'pdf' ? <FilePieChart className="text-slate-500 group-hover:text-emerald-500" size={20} /> : 
                         file.type === 'excel' ? <TrendingUp className="text-slate-500 group-hover:text-emerald-500" size={20} /> :
                         <FileCode className="text-slate-500 group-hover:text-emerald-500" size={20} />}
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-white group-hover:text-emerald-400 transition-colors">{file.name}</span>
                        <div className="flex gap-3 mt-1">
                          <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{file.size}</p>
                          <span className="text-[9px] text-slate-800">•</span>
                          <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{t(`data_room.permissions.${file.permission.toLowerCase().replace(/\s+/g, '_')}`, { defaultValue: file.permission })}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="hidden xl:block text-right">
                        <p className="text-[10px] text-slate-400 font-mono">{file.viewed}</p>
                        <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest">{t('data_room.avg_session')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => logFileAction('view', file)}
                          className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:bg-white hover:text-slate-950 transition-all"
                          title={t('data_room.view_document')}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => logFileAction('download', file)}
                          className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-lg shadow-emerald-500/0 hover:shadow-emerald-500/20"
                          title={t('data_room.download_secure_file')}
                        >
                          <Download size={16} />
                        </button>
                        <button className="p-3 text-slate-600 hover:text-white transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {[
              { label: t('data_room.policy.export_policy'), text: t('data_room.policy.export_text'), icon: AlertCircle },
              { label: t('data_room.policy.audit_trail'), text: t('data_room.policy.audit_text'), icon: Fingerprint },
              { label: t('data_room.policy.security'), text: t('data_room.policy.security_text'), icon: Lock },
            ].map((item) => (
              <div key={item.label} className="p-5 bg-slate-900/20 border border-slate-800/40 rounded-2xl flex gap-3 items-start">
                <item.icon size={14} className="text-slate-600 mt-0.5" />
                <div className="space-y-1">
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                   <p className="text-[10px] text-slate-600 font-medium uppercase leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
