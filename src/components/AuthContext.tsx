import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import emailjs from '@emailjs/browser'; // Import thư viện EmailJS
import { useTranslation } from 'react-i18next';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signingIn: boolean;
  authError: string | null;
  signIn: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendOtpEmail: (email: string, name: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let profileUnsubscribe: Unsubscribe | null = null;

    getRedirectResult(auth).catch((error) => {
      setAuthError(getAuthErrorMessage(error, t));
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const userDoc = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDoc);
          if (!userSnap.exists()) {
            const newProfile = applyLocalProfilePatch(user.uid, buildDefaultProfile(user));
            await setDoc(userDoc, newProfile);
            setProfile(newProfile);
          } else {
            setProfile(applyLocalProfilePatch(user.uid, { ...buildDefaultProfile(user), ...userSnap.data() }));
          }
          if (profileUnsubscribe) profileUnsubscribe();
          profileUnsubscribe = onSnapshot(userDoc, (snapshot) => {
            if (snapshot.exists()) {
              setProfile(applyLocalProfilePatch(user.uid, { ...buildDefaultProfile(user), ...snapshot.data() }));
            }
          });
        } catch (error) {
          setAuthError(t('auth.errors.firestore_connection')); 
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
      setSigningIn(false);
    });

    return () => {
      unsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, [t]);

  const signInWithGoogle = async () => {
    setSigningIn(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (['auth/popup-blocked', 'auth/popup-closed-by-user'].includes(error?.code)) {
        await signInWithRedirect(auth, provider);
      } else {
        setAuthError(getAuthErrorMessage(error, t));
      }
      setSigningIn(false);
    }
  };

  // --- HÀM GỬI OTP THẬT QUA EMAILJS ---
  const sendOtpEmail = async (email: string, name: string) => {
    setSigningIn(true);
    setAuthError(null);
    
    // Tạo mã OTP ngẫu nhiên 6 số
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      const templateParams = {
        to_email: email,    // Đảm bảo trong EmailJS Dashboard bạn đã đổi To Email thành {{to_email}}
        name: name,         // Khớp với {{name}} trong template
        otp_code: generatedOtp, // Khớp với {{otp_code}} trong template
        message: t('auth.otp_email_message')
      };

      await emailjs.send(
        'service_phw9oj8',   // Thay bằng Service ID của bạn
        'template_oqlgg34',           // Template ID từ ảnh image_dae2b8.png
        templateParams,
        'w46v8wYfJuDQouqA7'    // Thay bằng Public Key từ EmailJS Account
      );

      // Lưu OTP vào localStorage để kiểm tra
      window.localStorage.setItem('temp_otp', generatedOtp);
      
      setSigningIn(false);
      return true; 
    } catch (error) {
      console.error("EmailJS Error:", error);
      setAuthError(t('auth.errors.otp_send_failed')); 
      setSigningIn(false);
      return false;
    }
  };

  // --- HÀM XÁC THỰC OTP ---
  const verifyOtp = async (email: string, otp: string) => {
    const savedOtp = window.localStorage.getItem('temp_otp');
    if (otp === savedOtp) {
      window.localStorage.removeItem('temp_otp');
      return true;
    } else {
      setAuthError(t('auth.errors.invalid_otp')); 
      return false;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setSigningIn(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      setAuthError(getAuthErrorMessage(error, t));
    } finally {
      setSigningIn(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, role: string) => {
    setSigningIn(true);
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;

      const userDoc = doc(db, 'users', newUser.uid);
      const newProfile = {
        uid: newUser.uid,
        name: name || 'User',
        email: email,
        role: role,
        country: 'Vietnam',
        kycStatus: 'not_started',
        createdAt: new Date().toISOString(),
      };

      await setDoc(userDoc, newProfile);
      setProfile(newProfile);
    } catch (error: any) {
      setAuthError(getAuthErrorMessage(error, t));
    } finally {
      setSigningIn(false);
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, signingIn, authError, 
      signIn: signInWithGoogle,
      signInWithGoogle, 
      sendOtpEmail, 
      verifyOtp, 
      signInWithEmail,
      signUpWithEmail,
      logout, 
      clearAuthError: () => setAuthError(null) 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

// ... (Các hàm helper bên dưới giữ nguyên)
function buildDefaultProfile(user: User) {
  return {
    uid: user.uid,
    name: user.displayName || 'User',
    email: user.email || '',
    role: 'buyer',
    country: 'Vietnam',
    kycStatus: 'not_started',
    createdAt: new Date().toISOString(),
  };
}

function applyLocalProfilePatch(uid: string, profile: any) {
  try {
    const stored = window.localStorage.getItem(`ma-nexus-profile-${uid}`);
    return stored ? { ...profile, ...JSON.parse(stored) } : profile;
  } catch {
    return profile;
  }
}

function getAuthErrorMessage(error: unknown, t: (key: string) => string) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
  if (code === 'auth/unauthorized-domain') return t('auth.errors.unauthorized_domain');
  if (code === 'auth/email-already-in-use') return t('auth.errors.email_already_in_use');
  if (code === 'auth/weak-password') return t('auth.errors.weak_password');
  if (code === 'auth/invalid-email') return t('auth.errors.invalid_email');
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') return t('auth.errors.invalid_credentials');
  return error instanceof Error ? error.message : t('auth.errors.system_error');
}