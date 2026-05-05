import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/AuthContext';
import { canAdminModerate } from '../lib/compliance';
import { ShieldAlert, CheckCircle, XCircle, Search, Clock } from 'lucide-react';

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
  const { user, profile } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingKycUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const isAdmin = profile && canAdminModerate(profile);

  useEffect(() => {
    if (!isAdmin) return;
    fetchPendingKyc();
  }, [isAdmin]);

  const fetchPendingKyc = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('kycStatus', '==', 'pending'));
      const snapshot = await getDocs(q);
      const users: PendingKycUser[] = [];
      
      for (const userDoc of snapshot.docs) {
        const userData = userDoc.data() as PendingKycUser;
        const kycProfileDoc = await getDoc(doc(db, 'kyc_profiles', userDoc.id));
        let documents: string[] = [];
        if (kycProfileDoc.exists()) {
          documents = kycProfileDoc.data().documents || [];
        }
        users.push({ id: userDoc.id, ...userData, documents });
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
      
      // Update User profile
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, { kycStatus: action });
      
      // Update KYC Profile if exists
      const kycRef = doc(db, 'kyc_profiles', userId);
      batch.update(kycRef, { 
        status: action === 'verified' ? 'approved' : 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: user.uid
      });

      // Optionally write to kyc_reviews audit log
      const reviewLogRef = doc(collection(db, 'kyc_reviews'));
      batch.set(reviewLogRef, {
        kyc_profile_id: userId,
        admin_id: user.uid,
        action: action,
        reviewed_at: new Date().toISOString()
      });

      await batch.commit();
      
      // Remove from UI list
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error reviewing KYC:', error);
      alert('Failed to review KYC. Make sure Firestore rules allow this action.');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-6">
        <ShieldAlert size={48} className="mx-auto text-red-500" />
        <h1 className="text-4xl font-light">Access Denied</h1>
        <p className="text-neutral-500">Only compliance administrators can access this workspace.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="space-y-2">
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold">Admin System</p>
        <h1 className="text-4xl md:text-5xl font-light">Compliance & KYC</h1>
        <p className="text-sm text-neutral-500 max-w-2xl">Review identity verification requests, approve business licenses, and manage platform access.</p>
      </header>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium flex items-center gap-3">
            <Clock size={20} className="text-orange-500" />
            Pending KYC Reviews ({pendingUsers.length})
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" size={14} />
            <input 
              placeholder="Search by name or email" 
              className="w-full bg-black border border-neutral-900 py-2 pl-9 pr-4 text-xs focus:border-neutral-600 outline-none"
            />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-900 p-px">
          <div className="grid grid-cols-12 gap-4 p-4 bg-black text-[10px] uppercase tracking-widest font-bold text-neutral-600">
            <div className="col-span-3">User</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Role & Country</div>
            <div className="col-span-2">Documents</div>
            <div className="col-span-2 text-right">Action</div>
          </div>
          
          <div className="bg-black space-y-px">
            {loading ? (
              <div className="p-8 text-center text-sm text-neutral-500">Loading pending requests...</div>
            ) : pendingUsers.length === 0 ? (
              <div className="p-8 text-center text-sm text-neutral-500">No pending KYC requests at this time.</div>
            ) : (
              pendingUsers.map(u => (
                <div key={u.id} className="grid grid-cols-12 gap-4 p-4 bg-neutral-950 items-center">
                  <div className="col-span-3 font-medium text-sm">{u.name}</div>
                  <div className="col-span-3 text-xs text-neutral-400 break-all">{u.email}</div>
                  <div className="col-span-2 text-xs text-neutral-400 capitalize">{u.role} · {u.country || 'N/A'}</div>
                  <div className="col-span-2 text-xs text-neutral-500">
                    {u.documents && u.documents.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {u.documents.map((url, i) => (
                          url === 'mock_document_url' ? (
                            <span key={i} className="text-green-500 border border-green-800 bg-green-950/30 px-2 py-1 rounded inline-block w-max">
                              Document Verified (Mock)
                            </span>
                          ) : url.startsWith('data:image/') ? (
                            <button key={i} onClick={() => setViewingImage(url)} className="block hover:opacity-80 transition-opacity cursor-zoom-in">
                              <img src={url} alt="KYC Document" className="w-16 h-10 object-cover border border-neutral-700 rounded" title="Click to view full size" />
                            </button>
                          ) : (
                            <a key={i} href={url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                              View File {i + 1}
                            </a>
                          )
                        ))}
                      </div>
                    ) : (
                      'No Documents'
                    )}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button 
                      onClick={() => reviewKyc(u.id, 'verified')}
                      disabled={processingId === u.id}
                      className="p-2 text-green-500 hover:bg-green-950/30 rounded border border-transparent hover:border-green-900 transition-all"
                      title="Approve"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button 
                      onClick={() => reviewKyc(u.id, 'rejected')}
                      disabled={processingId === u.id}
                      className="p-2 text-red-500 hover:bg-red-950/30 rounded border border-transparent hover:border-red-900 transition-all"
                      title="Reject"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-5xl max-h-screen animate-in fade-in zoom-in duration-200">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setViewingImage(null);
              }}
              className="absolute -top-12 right-0 text-neutral-400 hover:text-white transition-colors"
            >
              <XCircle size={32} />
            </button>
            <img 
              src={viewingImage} 
              alt="Full size KYC Document" 
              className="max-w-full max-h-[85vh] object-contain rounded border border-neutral-800 shadow-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
