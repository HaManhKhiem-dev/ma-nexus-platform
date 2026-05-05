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
} from 'lucide-react';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { canAccessDataRoom, isKycVerified } from '../lib/compliance';
import { writeDataRoomEvent } from '../lib/audit';

const folders = [
  { name: 'Financial', icon: TrendingUp, count: 18, permission: 'Download' },
  { name: 'Legal', icon: Scale, count: 24, permission: 'View only' },
  { name: 'HR', icon: Users, count: 9, permission: 'View only' },
  { name: 'Contracts', icon: BriefcaseBusiness, count: 31, permission: 'Download' },
  { name: 'Technology', icon: Cpu, count: 13, permission: 'Edit' },
];

const files = [
  { name: 'FY25_Audited_Financials.pdf', category: 'Financial', size: '2.4 MB', viewed: '18m 42s', permission: 'Download' },
  { name: 'Quality_of_Earnings_Report.pdf', category: 'Financial', size: '5.8 MB', viewed: '11m 08s', permission: 'View only' },
  { name: 'Shareholder_Register.xlsx', category: 'Legal', size: '450 KB', viewed: '4m 22s', permission: 'View only' },
  { name: 'Customer_Contracts_Index.pdf', category: 'Contracts', size: '3.8 MB', viewed: '26m 14s', permission: 'Download' },
  { name: 'IP_and_Source_Code_Inventory.pdf', category: 'Technology', size: '1.7 MB', viewed: '7m 39s', permission: 'Edit' },
];

export default function DataRoom() {
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
          // Check mock data fallback
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

  const logFileAction = async (action: 'view' | 'download', file: typeof files[number]) => {
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
      <div className="max-w-3xl mx-auto py-20 space-y-6">
        <div className="w-14 h-14 border border-neutral-800 bg-neutral-950 flex items-center justify-center">
          <Lock size={22} className="text-neutral-500" />
        </div>
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold">NDA-Gated Data Room</p>
          <h1 className="text-4xl font-light">Private diligence is locked</h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Data room access requires verified KYC and a signed NDA for a specific deal. Every view and download is watermarked and logged.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {!isKycVerified(profile) && (
            <Link to="/profile" className="px-7 py-3 bg-white text-black text-[10px] uppercase tracking-widest font-bold">
              Complete KYC
            </Link>
          )}
          <Link to="/marketplace" className="px-7 py-3 border border-neutral-800 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-neutral-900">
            Find Deal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold">Due Diligence Core</p>
          <h1 className="text-4xl md:text-6xl font-light tracking-tightest">Data Room</h1>
          <p className="text-sm text-neutral-500 max-w-2xl">Encrypted document repository with role permissions, watermarking, view tracking, and diligence audit trails.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-4 py-2 border border-green-900/50 bg-green-950/20 text-green-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Lock size={12} /> AES-256 Encrypted
          </span>
          <button className="px-4 py-2 border border-neutral-800 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-neutral-900">
            <Upload size={12} /> Upload
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-px bg-neutral-900 border border-neutral-900">
        {[
          { icon: Eye, label: 'Document Views', value: '412' },
          { icon: Timer, label: 'Avg View Time', value: '9m 31s' },
          { icon: Download, label: 'Downloads', value: '86' },
          { icon: Fingerprint, label: 'Watermarked', value: '100%' },
        ].map((metric) => (
          <div key={metric.label} className="bg-black p-6">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold flex items-center gap-2"><metric.icon size={12} /> {metric.label}</p>
            <p className="text-3xl font-light mt-2">{metric.value}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="space-y-8">
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-2">Directories</p>
            <div className="space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder.name}
                  onClick={() => setActiveFolder(folder.name)}
                  className={`w-full flex items-center justify-between p-4 border transition-colors group ${activeFolder === folder.name ? 'bg-white text-black border-white' : 'bg-neutral-950 border-neutral-900 hover:bg-neutral-900'}`}
                >
                  <div className="flex items-center gap-3">
                    <folder.icon size={14} className={activeFolder === folder.name ? 'text-black' : 'text-neutral-500 group-hover:text-white transition-colors'} />
                    <span className="text-[11px] font-bold uppercase tracking-widest">{folder.name}</span>
                  </div>
                  <span className="text-[10px] font-mono">{folder.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-neutral-950 border border-neutral-900 space-y-4">
            <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Access Policy</p>
            <p className="text-xs text-neutral-500 leading-relaxed">
              All document views are watermarked with {profile?.email || 'viewer identity'}, IP metadata, and timestamp.
            </p>
            <div className="h-px bg-neutral-900"></div>
            <div className="flex items-center gap-2 text-green-500">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Signed NDA Active</span>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-900 pb-4 gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-medium">{activeFolder}</h3>
              <span className="text-[10px] text-neutral-600 font-mono">95 total objects</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-700" size={14} />
              <input className="bg-transparent border border-neutral-900 py-2 pl-10 pr-4 text-xs uppercase tracking-widest focus:outline-none focus:border-neutral-700" placeholder="Filter files" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-px bg-neutral-900">
            <div className="hidden md:grid grid-cols-12 p-4 bg-neutral-950 text-[9px] uppercase tracking-widest font-bold text-neutral-600 italic">
              <span className="col-span-4">Item Name</span>
              <span className="col-span-2">Category</span>
              <span className="col-span-2">Permission</span>
              <span className="col-span-2">View Time</span>
              <span className="col-span-2 text-right">Action</span>
            </div>

            {files.filter((file) => activeFolder === 'Financial' || file.category === activeFolder).map((file) => (
              <div key={file.name} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-black hover:bg-neutral-950 transition-colors group">
                <div className="md:col-span-4 flex items-center gap-4">
                  <FileText size={18} className="text-neutral-500 group-hover:text-white transition-colors" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest">{file.name}</span>
                    <p className="text-[10px] text-neutral-600 mt-1">{file.size}</p>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center text-[10px] text-neutral-500 font-mono">{file.category}</div>
                <div className="md:col-span-2 flex items-center text-[10px] text-neutral-300 uppercase tracking-widest">{file.permission}</div>
                <div className="md:col-span-2 flex items-center text-[10px] text-neutral-500 font-mono">{file.viewed}</div>
                <div className="md:col-span-2 flex items-center justify-end gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => logFileAction('view', file)} className="text-neutral-400 hover:text-white" aria-label="View"><Eye size={16} /></button>
                  <button onClick={() => logFileAction('download', file)} className="text-neutral-400 hover:text-white" aria-label="Download"><Download size={16} /></button>
                  <button className="text-neutral-400 hover:text-white" aria-label="More"><MoreVertical size={16} /></button>
                </div>
              </div>
            ))}
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-900 border border-neutral-900">
            {['View only prevents raw file export', 'Download access is audited per user', 'Screenshot blocking is flagged as advanced control'].map((item) => (
              <div key={item} className="bg-black p-5 text-xs text-neutral-500 leading-relaxed">{item}</div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
