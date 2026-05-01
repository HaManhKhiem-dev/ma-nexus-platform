import React from 'react';
import { useAuth } from '../components/AuthContext';
import { motion } from 'motion/react';
import { 
    ShieldCheck, 
    AtSign, 
    Globe, 
    User, 
    Briefcase,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    Camera
} from 'lucide-react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Profile() {
    const { user, profile } = useAuth();
    const [updating, setUpdating] = React.useState(false);

    const startKYC = async () => {
        if (!user) return;
        setUpdating(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                kycStatus: 'pending'
            });
            alert("Verification started. Our compliance team will review your identity.");
        } catch (error) {
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    if (!profile) return null;

    return (
        <div className="max-w-4xl mx-auto py-10 space-y-16">
            <header className="space-y-2">
                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold">Account Settings</p>
                <h1 className="text-4xl font-light">Identity & Profile</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                {/* Left Side: Photo & Status */}
                <div className="space-y-8">
                    <div className="relative group w-32 h-32 mx-auto md:mx-0">
                         {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} className="w-full h-full rounded-full border-4 border-neutral-800" />
                         ) : (
                            <div className="w-full h-full rounded-full bg-neutral-900 border-4 border-neutral-800 flex items-center justify-center">
                                <User size={48} className="text-neutral-700" />
                            </div>
                         )}
                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center cursor-pointer">
                            <Camera size={24} />
                         </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-neutral-950 border border-neutral-900 space-y-2 text-center md:text-left">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">KYC Status</p>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                {profile.kycStatus === 'verified' ? (
                                    <>
                                        <CheckCircle2 size={16} className="text-green-500" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-green-500 tracking-tighter">Verified</span>
                                    </>
                                ) : profile.kycStatus === 'pending' ? (
                                    <>
                                        <ShieldCheck size={16} className="text-orange-500" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-orange-500 tracking-tighter">In Review</span>
                                    </>
                                ) : (
                                    <>
                                        <ShieldAlert size={16} className="text-neutral-500" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 tracking-tighter">Not Verified</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {profile.kycStatus === 'not_started' && (
                            <button 
                                onClick={startKYC}
                                disabled={updating}
                                className="w-full py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50"
                            >
                                Start Identity Verification
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Side: Details */}
                <div className="md:col-span-2 space-y-12">
                     <section className="space-y-8">
                        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-500 border-b border-neutral-900 pb-2">Business Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Legal Name</label>
                                <p className="text-lg font-medium">{profile.name}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Primary Role</label>
                                <p className="text-lg font-medium capitalize">{profile.role}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Email Address</label>
                                <p className="text-lg font-medium">{profile.email}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Country of Residence</label>
                                <p className="text-lg font-medium">United States</p> {/* Static for now */}
                            </div>
                        </div>
                     </section>

                     <section className="space-y-8 p-10 bg-neutral-950 border border-neutral-900">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-neutral-500" />
                            <h3 className="text-xs uppercase tracking-[0.2em] font-bold">2FA Authentication</h3>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-neutral-500 max-w-sm">Enhance your account security by enabling Two-Factor Authentication for all deal interactions.</p>
                            <button className="px-6 py-2 border border-neutral-800 text-[10px] uppercase font-bold tracking-widest hover:bg-neutral-900 transition-all">Enable</button>
                        </div>
                     </section>
                </div>
            </div>
        </div>
    );
}
