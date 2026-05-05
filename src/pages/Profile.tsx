import React from 'react';
import { useAuth } from '../components/AuthContext';
import {
  ShieldCheck,
  User,
  Briefcase,
  ShieldAlert,
  CheckCircle2,
  Camera,
  KeyRound,
  Landmark,
  FileBadge,
} from 'lucide-react';
import { updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { kycChecklist } from '../lib/mockData';

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Compress to JPEG with 0.6 quality to keep it under 100KB for Firestore
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function Profile() {
  const { user, profile } = useAuth();
  const [updating, setUpdating] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [role, setRole] = React.useState(profile?.role || 'buyer');
  const [country, setCountry] = React.useState(profile?.country || 'Vietnam');
  const [showKycForm, setShowKycForm] = React.useState(false);
  const [kycType, setKycType] = React.useState('individual');
  const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState<string | null>(null);

  React.useEffect(() => {
    setRole(profile?.role || 'buyer');
    setCountry(profile?.country || 'Vietnam');
  }, [profile]);

  const updateProfile = async (data: Record<string, string>) => {
    if (!user) return;
    setUpdating(true);
    setMessage(null);
    setError(null);
    try {
      await updateDoc(doc(db, 'users', user.uid), data);
      setMessage('Profile saved. Role and country have been updated.');
    } catch (updateError: any) {
      console.error('Profile update failed:', updateError);
      if (updateError?.code === 'permission-denied') {
        window.localStorage.setItem(`ma-nexus-profile-${user.uid}`, JSON.stringify(data));
        setMessage('Firestore rules are still blocking this update, so the role was saved locally for this browser. Refresh the page to see the navbar update.');
        setError('For production, publish the updated firestore.rules file to the same Firestore database used by this app.');
      } else {
        setError(updateError instanceof Error ? updateError.message : 'Profile update failed.');
      }
    } finally {
      setUpdating(false);
    }
  };

  const submitKYC = async () => {
    if (!user) return;
    if (!selectedFiles || selectedFiles.length === 0) {
      setError('Please select at least one document to upload.');
      return;
    }
    
    setUpdating(true);
    setUploadProgress('Uploading documents...');
    try {
      const uploadedUrls: string[] = [];
      
      // Compress and convert each file to Base64
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(`Compressing ${file.name} (${i + 1}/${selectedFiles.length})...`);
        const base64Str = await compressImage(file);
        uploadedUrls.push(base64Str);
      }

      setUploadProgress('Saving profile...');

      // 1. Update user profile
      await updateDoc(doc(db, 'users', user.uid), { kycStatus: 'pending' });
      
      // 2. Create KYC Profile record
      await setDoc(doc(db, 'kyc_profiles', user.uid), {
        userId: user.uid,
        kycType: kycType,
        status: 'pending',
        documents: uploadedUrls,
        submittedAt: new Date().toISOString(),
      });

      setMessage('Verification submitted successfully. System is verifying your documents.');
      setShowKycForm(false);
      setSelectedFiles(null);
    } catch (err: any) {
      console.error('KYC submission failed:', err);
      setError(err instanceof Error ? err.message : 'KYC submission failed.');
    } finally {
      setUpdating(false);
      setUploadProgress(null);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-12">
      <header className="space-y-2">
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold">User System</p>
        <h1 className="text-4xl md:text-5xl font-light">Identity, Role & KYC</h1>
        <p className="text-sm text-neutral-500 max-w-2xl">Manage profile, RBAC role, country, KYC, company verification, and security controls required for private deals.</p>
      </header>

      {message && (
        <div className="border border-green-900/60 bg-green-950/30 p-4 text-sm text-green-200">
          {message}
        </div>
      )}

      {error && (
        <div className="border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <aside className="space-y-8">
          <div className="relative group w-32 h-32">
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

          <div className="p-5 bg-neutral-950 border border-neutral-900 space-y-3">
            <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">KYC Status</p>
            <div className="flex items-center gap-2">
              {profile.kycStatus === 'verified' ? (
                <>
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span className="text-xs font-bold uppercase tracking-widest text-green-500">Verified</span>
                </>
              ) : profile.kycStatus === 'pending' ? (
                <>
                  <ShieldCheck size={16} className="text-orange-500" />
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-500">In Review</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={16} className="text-neutral-500" />
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Not Verified</span>
                </>
              )}
            </div>
            {profile.kycStatus === 'not_started' && !showKycForm && (
              <button onClick={() => setShowKycForm(true)} className="w-full py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all">
                Start Verification
              </button>
            )}

            {profile.kycStatus === 'rejected' && !showKycForm && (
              <button onClick={() => setShowKycForm(true)} className="w-full py-4 border border-red-900 bg-red-950/30 text-red-400 text-[10px] font-bold uppercase tracking-widest hover:bg-red-900/50 transition-all">
                Resubmit KYC
              </button>
            )}

            {showKycForm && (
              <div className="space-y-4 pt-4 border-t border-neutral-900 mt-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">KYC Type</label>
                  <select value={kycType} onChange={(e) => setKycType(e.target.value)} className="w-full bg-black border border-neutral-800 p-2 text-xs focus:border-neutral-500 outline-none">
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Upload Document(s)</label>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,.pdf"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="w-full bg-black border border-neutral-800 p-2 text-xs focus:border-neutral-500 outline-none text-neutral-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700"
                  />
                  {selectedFiles && selectedFiles.length > 0 && (
                    <p className="text-xs text-green-500 mt-2">{selectedFiles.length} file(s) selected</p>
                  )}
                </div>
                {uploadProgress && (
                  <p className="text-[10px] text-orange-400 uppercase tracking-widest font-bold animate-pulse">{uploadProgress}</p>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setShowKycForm(false)} className="flex-1 py-2 border border-neutral-800 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-900">Cancel</button>
                  <button onClick={submitKYC} disabled={updating || !selectedFiles || selectedFiles.length === 0} className="flex-1 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-neutral-200">Submit</button>
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="lg:col-span-2 space-y-10">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-900 border border-neutral-900">
            <div className="bg-black p-6 space-y-2">
              <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Name</p>
              <p className="text-lg font-medium">{profile.name}</p>
            </div>
            <div className="bg-black p-6 space-y-2">
              <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Email</p>
              <p className="text-lg font-medium break-all">{profile.email}</p>
            </div>
            <label className="bg-black p-6 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Primary Role</span>
              <select value={role} onChange={(event) => setRole(event.target.value)} className="w-full bg-neutral-950 border border-neutral-900 p-3 text-sm capitalize focus:outline-none focus:border-neutral-600">
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="advisor">Advisor</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="bg-black p-6 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Country</span>
              <input value={country} onChange={(event) => setCountry(event.target.value)} className="w-full bg-neutral-950 border border-neutral-900 p-3 text-sm focus:outline-none focus:border-neutral-600" />
            </label>
          </section>

          <button onClick={() => updateProfile({ role, country })} disabled={updating} className="px-7 py-3 bg-white text-black text-[10px] uppercase tracking-widest font-bold disabled:opacity-50">
            {updating ? 'Saving...' : 'Save Profile'}
          </button>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-7 bg-neutral-950 border border-neutral-900 space-y-5">
              <div className="flex items-center gap-3">
                <FileBadge size={18} className="text-neutral-500" />
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold">KYC Checklist</h3>
              </div>
              {kycChecklist.map((item, index) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <span className={`w-6 h-6 border flex items-center justify-center text-[9px] ${index < 1 ? 'border-green-700 text-green-500' : 'border-neutral-800 text-neutral-600'}`}>
                    {index + 1}
                  </span>
                  <span className="text-neutral-300">{item}</span>
                </div>
              ))}
            </div>

            <div className="p-7 bg-neutral-950 border border-neutral-900 space-y-6">
              <div className="flex items-center gap-3">
                <KeyRound size={18} className="text-neutral-500" />
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Security</h3>
              </div>
              <div className="flex items-center justify-between gap-6">
                <p className="text-xs text-neutral-500 leading-relaxed">Two-factor authentication is required before viewing private deals, signing NDA, or entering a data room.</p>
                <button className="px-5 py-2 border border-neutral-800 text-[10px] uppercase font-bold tracking-widest hover:bg-neutral-900">Enable 2FA</button>
              </div>
              <div className="h-px bg-neutral-900"></div>
              <div className="flex items-start gap-3">
                <Landmark size={17} className="text-neutral-500 mt-0.5" />
                <p className="text-xs text-neutral-500 leading-relaxed">Business verification includes license, shareholder declaration, and beneficial ownership review.</p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-4 gap-px bg-neutral-900 border border-neutral-900">
            {[
              ['Seller', 'Create and manage deals'],
              ['Buyer', 'View and invest'],
              ['Advisor', 'Support diligence'],
              ['Admin', 'Moderate and approve'],
            ].map(([name, text]) => (
              <div key={name} className="bg-black p-5">
                <Briefcase size={16} className="text-neutral-500" />
                <p className="text-xs uppercase tracking-widest font-bold mt-3">{name}</p>
                <p className="text-[11px] text-neutral-500 mt-2">{text}</p>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
