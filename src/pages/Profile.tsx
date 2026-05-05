import React, { useEffect, useMemo, useRef, useState } from 'react';
import { updateDoc, doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
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
  UploadCloud,
  Loader2,
  Save,
  Globe2,
  Mail,
  BadgeCheck,
  X,
  FileText,
  Building2,
  RefreshCcw,
  ScanFace,
  IdCard,
  Image as ImageIcon
} from 'lucide-react';

import { useAuth } from '../components/AuthContext';
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

        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Image compression failed.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };

      img.onerror = () => reject(new Error('Invalid image file.'));
    };

    reader.onerror = () => reject(new Error('Unable to read file.'));
  });
};

const compressBase64Image = (base64: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;

    img.onload = () => {
      const canvas = document.createElement('canvas');

      const MAX_WIDTH = 900;
      const MAX_HEIGHT = 900;

      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Face image compression failed.'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };

    img.onerror = () => reject(new Error('Invalid face image.'));
  });
};

export default function Profile() {
  const { user, profile } = useAuth();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [role, setRole] = useState(profile?.role || 'buyer');
  const [country, setCountry] = useState(profile?.country || 'Vietnam');

  const [showKycForm, setShowKycForm] = useState(false);
  const [kycType, setKycType] = useState('individual');

  const [cccdFront, setCccdFront] = useState<File | null>(null);
  const [cccdBack, setCccdBack] = useState<File | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  useEffect(() => {
    setRole(profile?.role || 'buyer');
    setCountry(profile?.country || 'Vietnam');
  }, [profile]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const kycStatus = profile?.kycStatus || 'not_started';

  const statusConfig = useMemo(() => {
    if (kycStatus === 'verified') {
      return {
        label: 'Verified',
        description: 'Your identity has been verified. You can access eligible private deal workflows.',
        icon: <CheckCircle2 size={18} />,
        badgeClass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
        panelClass: 'border-emerald-500/20 bg-emerald-500/10'
      };
    }

    if (kycStatus === 'pending') {
      return {
        label: 'In Review',
        description: 'Your submitted CCCD and face image are waiting for compliance review.',
        icon: <ShieldCheck size={18} />,
        badgeClass: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
        panelClass: 'border-orange-500/20 bg-orange-500/10'
      };
    }

    if (kycStatus === 'rejected') {
      return {
        label: 'Rejected',
        description: 'Your previous verification was rejected. Please resubmit clear and valid images.',
        icon: <ShieldAlert size={18} />,
        badgeClass: 'border-red-500/20 bg-red-500/10 text-red-400',
        panelClass: 'border-red-500/20 bg-red-500/10'
      };
    }

    return {
      label: 'Not Verified',
      description: 'Upload both sides of your CCCD and capture your face to start verification.',
      icon: <ShieldAlert size={18} />,
      badgeClass: 'border-slate-700 bg-slate-900 text-slate-400',
      panelClass: 'border-slate-800 bg-slate-900/70'
    };
  }, [kycStatus]);

  const canSubmitKyc =
    kycStatus === 'not_started' ||
    kycStatus === 'rejected' ||
    !kycStatus;

  const kycReady = !!cccdFront && !!cccdBack && !!faceImage;

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
        window.localStorage.setItem(
          `ma-nexus-profile-${user.uid}`,
          JSON.stringify(data)
        );

        setMessage(
          'Firestore rules are blocking this update, so the profile was saved locally for this browser.'
        );

        setError(
          'For production, publish the updated firestore.rules file to the same Firestore database used by this app.'
        );
      } else {
        setError(
          updateError instanceof Error
            ? updateError.message
            : 'Profile update failed.'
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  const openCamera = async () => {
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 900 },
          height: { ideal: 900 }
        },
        audio: false
      });

      streamRef.current = stream;
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (cameraError) {
      console.error('Camera open failed:', cameraError);
      setError('Cannot access camera. Please allow camera permission and try again.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraOpen(false);
  };

  const captureFace = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');

    canvas.width = video.videoWidth || 900;
    canvas.height = video.videoHeight || 900;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setError('Cannot capture face image.');
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const rawImage = canvas.toDataURL('image/jpeg', 0.9);
    const compressed = await compressBase64Image(rawImage);

    setFaceImage(compressed);
    stopCamera();
  };

  const resetKycForm = () => {
    setShowKycForm(false);
    setCccdFront(null);
    setCccdBack(null);
    setFaceImage(null);
    setUploadProgress(null);
    stopCamera();
  };

  const submitKYC = async () => {
    if (!user) return;

    if (!cccdFront || !cccdBack || !faceImage) {
      setError('Please upload CCCD front, CCCD back, and capture your face.');
      return;
    }

    setUpdating(true);
    setMessage(null);
    setError(null);
    setUploadProgress('Preparing CCCD images...');

    try {
      const cccdFrontUrl = await compressImage(cccdFront);

      setUploadProgress('Preparing CCCD back image...');
      const cccdBackUrl = await compressImage(cccdBack);

      setUploadProgress('Preparing face verification image...');
      const faceImageUrl = faceImage;

      setUploadProgress('Saving verification profile...');

      await updateDoc(doc(db, 'users', user.uid), {
        kycStatus: 'pending'
      });

      await setDoc(
        doc(db, 'kyc_profiles', user.uid),
        {
          userId: user.uid,
          kycType,
          status: 'pending',
          verificationMethod: 'cccd_two_sides_face_capture',
          documentMap: {
            cccdFront: cccdFrontUrl,
            cccdBack: cccdBackUrl,
            faceImage: faceImageUrl
          },
          documents: [cccdFrontUrl, cccdBackUrl, faceImageUrl],
          faceVerification: {
            status: 'pending_manual_review',
            capturedAt: new Date().toISOString(),
            method: 'camera_capture'
          },
          submittedAt: new Date().toISOString()
        },
        { merge: true }
      );

      setMessage('KYC submitted successfully. Your CCCD and face image are now in review.');
      resetKycForm();
    } catch (err: any) {
      console.error('KYC submission failed:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'KYC submission failed.'
      );
    } finally {
      setUpdating(false);
      setUploadProgress(null);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={30} className="text-emerald-400 animate-spin" />
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
              <User size={14} className="text-emerald-400" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-black">
                Identity Workspace
              </span>
            </div>

            <div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white">
                Profile & KYC
              </h1>

              <p className="mt-5 max-w-2xl text-sm md:text-base text-slate-400 leading-8">
                Upload your CCCD front, CCCD back, and capture your face to complete identity
                verification for restricted deal access.
              </p>
            </div>
          </div>

          <div className={`rounded-[28px] border p-5 min-w-[280px] ${statusConfig.panelClass}`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${statusConfig.badgeClass}`}>
                {statusConfig.icon}
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
                  KYC Status
                </p>
                <p className="text-lg font-black text-white mt-1">
                  {statusConfig.label}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-6 mt-4">
              {statusConfig.description}
            </p>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {message && (
          <Notice
            type="success"
            message={message}
            onClose={() => setMessage(null)}
          />
        )}

        {error && (
          <Notice
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-4 space-y-6">
          <section className="rounded-[32px] border border-slate-800 bg-[#0f172a]/70 p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-col items-center text-center">
              <div className="relative group w-32 h-32">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name || 'User avatar'}
                    className="w-full h-full rounded-[32px] object-cover border border-slate-700 shadow-xl shadow-black/30"
                  />
                ) : (
                  <div className="w-full h-full rounded-[32px] bg-slate-900 border border-slate-700 flex items-center justify-center shadow-xl shadow-black/30">
                    <User size={48} className="text-slate-600" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px] flex items-center justify-center cursor-pointer">
                  <Camera size={24} className="text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-black text-white mt-6">
                {profile.name || 'Unnamed User'}
              </h2>

              <p className="text-xs text-slate-500 break-all mt-2">
                {profile.email}
              </p>

              <div className="flex flex-wrap justify-center gap-2 mt-5">
                <Badge icon={<Briefcase size={12} />} text={profile.role || 'buyer'} />
                <Badge icon={<Globe2 size={12} />} text={profile.country || 'Vietnam'} />
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-800 bg-[#0f172a]/70 p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
                  Verification
                </p>

                <h3 className="text-xl font-black text-white mt-2">
                  CCCD & Face Check
                </h3>
              </div>

              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${statusConfig.badgeClass}`}>
                {statusConfig.icon}
              </div>
            </div>

            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border ${statusConfig.badgeClass}`}>
              <span className="text-[10px] uppercase tracking-widest font-black">
                {statusConfig.label}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-6 mt-4">
              Required: CCCD front image, CCCD back image, and live face capture from camera.
            </p>

            {canSubmitKyc && !showKycForm && (
              <button
                onClick={() => setShowKycForm(true)}
                className={`w-full mt-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  kycStatus === 'rejected'
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                    : 'bg-emerald-500 text-[#020617] hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                }`}
              >
                {kycStatus === 'rejected' ? 'Resubmit KYC' : 'Start Verification'}
              </button>
            )}

            {showKycForm && (
              <KycForm
                kycType={kycType}
                setKycType={setKycType}
                cccdFront={cccdFront}
                cccdBack={cccdBack}
                faceImage={faceImage}
                cameraOpen={cameraOpen}
                videoRef={videoRef}
                updating={updating}
                uploadProgress={uploadProgress}
                kycReady={kycReady}
                setCccdFront={setCccdFront}
                setCccdBack={setCccdBack}
                openCamera={openCamera}
                stopCamera={stopCamera}
                captureFace={captureFace}
                onCancel={resetKycForm}
                onSubmit={submitKYC}
              />
            )}
          </section>
        </aside>

        <main className="lg:col-span-8 space-y-6">
          <section className="rounded-[32px] border border-slate-800 bg-[#0f172a]/70 shadow-2xl shadow-black/20 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <BadgeCheck size={20} className="text-emerald-400" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white">
                    Account Information
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Update your platform role and operating country.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-800">
              <InfoBlock
                icon={<User size={18} />}
                label="Full Name"
                value={profile.name || 'No name'}
              />

              <InfoBlock
                icon={<Mail size={18} />}
                label="Email"
                value={profile.email || 'No email'}
                breakText
              />

              <label className="bg-[#0b1120] p-6 space-y-3">
                <span className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.25em] text-slate-500">
                  <Briefcase size={15} />
                  Primary Role
                </span>

                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl text-sm text-white capitalize focus:outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="advisor">Advisor</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <label className="bg-[#0b1120] p-6 space-y-3">
                <span className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.25em] text-slate-500">
                  <Globe2 size={15} />
                  Country
                </span>

                <input
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl text-sm text-white focus:outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                />
              </label>
            </div>

            <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-xs text-slate-500 leading-6 max-w-lg">
                Role changes may affect marketplace permissions, data room access, and admin
                moderation capabilities.
              </p>

              <button
                onClick={() => updateProfile({ role, country })}
                disabled={updating}
                className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-emerald-500 text-[#020617] text-[10px] uppercase tracking-widest font-black hover:bg-emerald-400 disabled:opacity-60 transition-all shadow-lg shadow-emerald-500/20"
              >
                {updating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {updating ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <section className="rounded-[32px] border border-slate-800 bg-[#0f172a]/70 p-6 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <FileBadge size={20} className="text-cyan-400" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">
                    KYC Checklist
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Minimum verification requirements.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  'Upload CCCD front image',
                  'Upload CCCD back image',
                  'Capture live face image',
                  ...kycChecklist
                ].slice(0, 6).map((item, index) => {
                  const complete =
                    kycStatus === 'verified' ||
                    (index === 0 && !!cccdFront) ||
                    (index === 1 && !!cccdBack) ||
                    (index === 2 && !!faceImage);

                  return (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-[#020617] border border-slate-800"
                    >
                      <span
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center text-[10px] font-black shrink-0 ${
                          complete
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-slate-700 bg-slate-900 text-slate-500'
                        }`}
                      >
                        {index + 1}
                      </span>

                      <p className="text-sm text-slate-300 leading-6">
                        {item}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-800 bg-[#0f172a]/70 p-6 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <KeyRound size={20} className="text-emerald-400" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">
                    Verification Notes
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Practical rules for this KYC flow.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <SecurityItem
                  icon={<IdCard size={18} />}
                  title="CCCD two-side review"
                  text="The front and back images should be clear, uncropped, readable, and belong to the same person."
                />

                <SecurityItem
                  icon={<ScanFace size={18} />}
                  title="Face capture"
                  text="The selfie is captured directly from camera and saved for compliance review."
                />

                <SecurityItem
                  icon={<ShieldCheck size={18} />}
                  title="Manual review"
                  text="This MVP stores images for review. Automatic face matching and liveness detection need a real eKYC provider."
                />
              </div>
            </section>
          </section>

          <section className="rounded-[32px] border border-slate-800 bg-[#0f172a]/70 p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                <Building2 size={20} className="text-slate-400" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white">
                  Platform Roles
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Permission groups used across the deal platform.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                ['Seller', 'Create and manage deals'],
                ['Buyer', 'View and invest'],
                ['Advisor', 'Support diligence'],
                ['Admin', 'Moderate and approve']
              ].map(([name, text]) => (
                <div
                  key={name}
                  className="rounded-2xl bg-[#020617] border border-slate-800 p-5 hover:border-emerald-500/30 transition-all"
                >
                  <Briefcase size={18} className="text-emerald-400" />

                  <p className="text-xs uppercase tracking-widest font-black text-white mt-4">
                    {name}
                  </p>

                  <p className="text-[11px] text-slate-500 mt-2 leading-5">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function KycForm({
  kycType,
  setKycType,
  cccdFront,
  cccdBack,
  faceImage,
  cameraOpen,
  videoRef,
  updating,
  uploadProgress,
  kycReady,
  setCccdFront,
  setCccdBack,
  openCamera,
  stopCamera,
  captureFace,
  onCancel,
  onSubmit
}: {
  kycType: string;
  setKycType: (value: string) => void;
  cccdFront: File | null;
  cccdBack: File | null;
  faceImage: string | null;
  cameraOpen: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  updating: boolean;
  uploadProgress: string | null;
  kycReady: boolean;
  setCccdFront: (file: File | null) => void;
  setCccdBack: (file: File | null) => void;
  openCamera: () => void;
  stopCamera: () => void;
  captureFace: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 pt-6 mt-6 border-t border-slate-800"
    >
      <label className="block space-y-2">
        <span className="text-[10px] uppercase font-black tracking-[0.25em] text-slate-500">
          KYC Type
        </span>

        <select
          value={kycType}
          onChange={(event) => setKycType(event.target.value)}
          className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl text-sm text-white focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
        >
          <option value="individual">Individual</option>
          <option value="business">Business</option>
        </select>
      </label>

      <KycUploadBox
        label="CCCD Front"
        description="Upload the front side of your citizen ID card."
        file={cccdFront}
        icon={<IdCard size={22} />}
        onChange={setCccdFront}
      />

      <KycUploadBox
        label="CCCD Back"
        description="Upload the back side of your citizen ID card."
        file={cccdBack}
        icon={<FileText size={22} />}
        onChange={setCccdBack}
      />

      <div className="rounded-[24px] border border-slate-800 bg-[#020617] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ScanFace size={22} />
            </div>

            <div>
              <p className="text-sm font-black text-white">
                Face Verification
              </p>

              <p className="text-xs text-slate-500 leading-6 mt-1">
                Open camera and capture a clear front-facing image.
              </p>
            </div>
          </div>

          {faceImage && (
            <span className="text-[9px] uppercase tracking-widest font-black text-emerald-400">
              Captured
            </span>
          )}
        </div>

        {cameraOpen && (
          <div className="mt-5 space-y-4">
            <div className="rounded-[22px] overflow-hidden border border-slate-700 bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-square object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={stopCamera}
                disabled={updating}
                className="py-3 rounded-2xl border border-slate-700 text-slate-300 text-[10px] uppercase tracking-widest font-black hover:bg-slate-900 disabled:opacity-60 transition-all"
              >
                Cancel Camera
              </button>

              <button
                onClick={captureFace}
                disabled={updating}
                className="py-3 rounded-2xl bg-emerald-500 text-[#020617] text-[10px] uppercase tracking-widest font-black hover:bg-emerald-400 disabled:opacity-60 transition-all"
              >
                Capture Face
              </button>
            </div>
          </div>
        )}

        {!cameraOpen && faceImage && (
          <div className="mt-5 space-y-4">
            <img
              src={faceImage}
              alt="Face capture"
              className="w-full aspect-square object-cover rounded-[22px] border border-slate-700"
            />

            <button
              onClick={openCamera}
              disabled={updating}
              className="w-full py-3 rounded-2xl border border-slate-700 text-slate-300 text-[10px] uppercase tracking-widest font-black hover:border-emerald-500/60 hover:text-white disabled:opacity-60 transition-all"
            >
              Retake Face Image
            </button>
          </div>
        )}

        {!cameraOpen && !faceImage && (
          <button
            onClick={openCamera}
            disabled={updating}
            className="w-full mt-5 py-4 rounded-2xl bg-emerald-500 text-[#020617] text-[10px] uppercase tracking-widest font-black hover:bg-emerald-400 disabled:opacity-60 transition-all shadow-lg shadow-emerald-500/20"
          >
            Open Camera
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StepStatus label="Front" done={!!cccdFront} />
        <StepStatus label="Back" done={!!cccdBack} />
        <StepStatus label="Face" done={!!faceImage} />
      </div>

      {uploadProgress && (
        <div className="flex items-center gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3">
          <Loader2 size={15} className="text-orange-400 animate-spin" />

          <p className="text-[10px] text-orange-300 uppercase tracking-widest font-black">
            {uploadProgress}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={updating}
          className="flex-1 py-3 rounded-2xl border border-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 disabled:opacity-60 transition-all"
        >
          Cancel
        </button>

        <button
          onClick={onSubmit}
          disabled={updating || !kycReady}
          className="flex-1 py-3 rounded-2xl bg-emerald-500 text-[#020617] text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
        >
          {updating ? 'Submitting...' : 'Submit KYC'}
        </button>
      </div>
    </motion.div>
  );
}

function KycUploadBox({
  label,
  description,
  file,
  icon,
  onChange
}: {
  label: string;
  description: string;
  file: File | null;
  icon: React.ReactNode;
  onChange: (file: File | null) => void;
}) {
  return (
    <div className="rounded-[24px] border border-slate-800 bg-[#020617] p-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-white">
            {label}
          </p>

          <p className="text-xs text-slate-500 leading-6 mt-1">
            {description}
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(event) => onChange(event.target.files?.[0] || null)}
            className="mt-4 w-full text-xs text-slate-400 file:mr-4 file:py-3 file:px-5 file:rounded-2xl file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-black file:bg-emerald-500 file:text-[#020617] hover:file:bg-emerald-400"
          />

          {file && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <ImageIcon size={16} className="text-emerald-400 shrink-0" />

                <div className="min-w-0">
                  <p className="text-xs text-white truncate">
                    {file.name}
                  </p>

                  <p className="text-[10px] text-slate-500 mt-1">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onChange(null)}
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepStatus({ label, done }: { label: string; done: boolean }) {
  return (
    <div
      className={`rounded-2xl border px-3 py-3 text-center ${
        done
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
          : 'border-slate-800 bg-[#020617] text-slate-500'
      }`}
    >
      <p className="text-[9px] uppercase tracking-widest font-black">
        {label}
      </p>

      <p className="text-[10px] mt-1">
        {done ? 'Done' : 'Required'}
      </p>
    </div>
  );
}

function InfoBlock({
  icon,
  label,
  value,
  breakText = false
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  breakText?: boolean;
}) {
  return (
    <div className="bg-[#0b1120] p-6 space-y-3">
      <p className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.25em] text-slate-500">
        {icon}
        {label}
      </p>

      <p className={`text-lg font-bold text-white ${breakText ? 'break-all' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function SecurityItem({
  icon,
  title,
  text
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-[#020617] border border-slate-800 p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-white">
            {title}
          </p>

          <p className="text-xs text-slate-500 leading-6 mt-2">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function Badge({
  icon,
  text
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900 border border-slate-800 text-[10px] uppercase tracking-widest font-black text-slate-300">
      {icon}
      {text}
    </span>
  );
}

function Notice({
  type,
  message,
  onClose
}: {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}) {
  const isSuccess = type === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`rounded-[24px] border px-5 py-4 flex items-start justify-between gap-4 ${
        isSuccess
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
          : 'border-red-500/20 bg-red-500/10 text-red-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <CheckCircle2 size={18} className="text-emerald-400 mt-0.5" />
        ) : (
          <ShieldAlert size={18} className="text-red-400 mt-0.5" />
        )}

        <p className="text-sm leading-6">
          {message}
        </p>
      </div>

      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white transition-colors"
      >
        <X size={18} />
      </button>
    </motion.div>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}