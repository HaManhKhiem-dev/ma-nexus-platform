import React from 'react';
import { useAuth } from '../components/AuthContext';
import { 
    Folder, 
    FileText, 
    Lock, 
    ShieldCheck, 
    Download, 
    Eye, 
    MoreVertical,
    Search,
    ChevronRight,
    TrendingUp,
    Scale,
    Users
} from 'lucide-react';
import { motion } from 'motion/react';

export default function DataRoom() {
    const { profile } = useAuth();
    
    const folders = [
        { name: '01 FINANCIALS', icon: TrendingUp, count: 8 },
        { name: '02 LEGAL & CORPORATE', icon: Scale, count: 12 },
        { name: '03 HR & EMPLOYMENT', icon: Users, count: 5 },
        { name: '04 CONTRACTS & IP', icon: FileText, count: 14 },
    ];

    const files = [
        { name: 'FY23_Audited_Financials.pdf', category: 'Financial', size: '2.4 MB', date: '2024-03-12' },
        { name: 'Board_Meeting_Minutes_Q4.pdf', category: 'Legal', size: '1.1 MB', date: '2024-03-10' },
        { name: 'Capital_Structure_Table.xlsx', category: 'Legal', size: '450 KB', date: '2024-03-05' },
        { name: 'Master_Services_Agreement.pdf', category: 'Contracts', size: '3.8 MB', date: '2024-02-28' },
    ];

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold">Encrypted Repository</p>
                    <h1 className="text-4xl md:text-6xl font-light tracking-tightest">Secure <span className="font-serif italic text-neutral-400">Data Room</span></h1>
                </div>
                <div className="flex items-center gap-4">
                     <span className="px-4 py-2 border border-green-900/50 bg-green-950/20 text-green-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Lock size={12} /> AES-256 Encrypted
                     </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* File Tree / Sidebar */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-2">Directories</p>
                        <div className="space-y-1">
                            {folders.map(folder => (
                                <button key={folder.name} className="w-full flex items-center justify-between p-4 bg-neutral-950 border border-neutral-900 hover:bg-neutral-900 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <folder.icon size={14} className="text-neutral-500 group-hover:text-white transition-colors" />
                                        <span className="text-[11px] font-bold uppercase tracking-widest">{folder.name}</span>
                                    </div>
                                    <span className="text-[10px] text-neutral-600 font-mono">{folder.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-neutral-950 border border-neutral-900 space-y-4">
                         <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Access Policy</p>
                         <p className="text-xs text-neutral-500 leading-relaxed italic">
                            All document views are watermarked with your identity ({profile?.email}) and timestamped.
                         </p>
                         <div className="h-px bg-neutral-900"></div>
                         <div className="flex items-center gap-2 text-green-500">
                             <ShieldCheck size={14} />
                             <span className="text-[10px] font-bold uppercase tracking-widest">Signed NDA Active</span>
                         </div>
                    </div>
                </div>

                {/* Main File List */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                         <div className="flex items-center gap-4">
                            <h3 className="text-lg font-serif italic">Recent Documents</h3>
                            <span className="text-[10px] text-neutral-600 font-mono">142 total objects</span>
                         </div>
                         <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-700" size={14} />
                             <input className="bg-transparent border border-neutral-900 py-2 pl-10 pr-4 text-xs uppercase tracking-widest focus:outline-none focus:border-neutral-700" placeholder="Filter files..." />
                         </div>
                    </div>

                    <div className="grid grid-cols-1 gap-px bg-neutral-900">
                         <div className="grid grid-cols-6 p-4 bg-neutral-950 text-[9px] uppercase tracking-widest font-bold text-neutral-600 italic">
                            <span className="col-span-3">Item Name</span>
                            <span>Category</span>
                            <span>Size</span>
                            <span className="text-right">Action</span>
                         </div>
                         
                         {files.map(file => (
                             <div key={file.name} className="grid grid-cols-6 p-6 bg-black hover:bg-neutral-950 transition-colors group">
                                <div className="col-span-3 flex items-center gap-4">
                                     <FileText size={18} className="text-neutral-500 group-hover:text-white transition-colors" />
                                     <span className="text-xs font-bold uppercase tracking-widest">{file.name}</span>
                                </div>
                                <div className="flex items-center text-[10px] text-neutral-500 font-mono">{file.category}</div>
                                <div className="flex items-center text-[10px] text-neutral-500 font-mono">{file.size}</div>
                                <div className="flex items-center justify-end gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <button className="text-neutral-400 hover:text-white"><Eye size={16} /></button>
                                    <button className="text-neutral-400 hover:text-white"><Download size={16} /></button>
                                    <button className="text-neutral-400 hover:text-white"><MoreVertical size={16} /></button>
                                </div>
                             </div>
                         ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
