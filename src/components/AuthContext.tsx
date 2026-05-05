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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let profileUnsubscribe: Unsubscribe | null = null;

    getRedirectResult(auth).catch((error) => {
      setAuthError(getAuthErrorMessage(error));
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
          setAuthError('Lỗi kết nối Firestore.');
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
  }, []);

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
        setAuthError(getAuthErrorMessage(error));
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
        message: "Mã này sẽ hết hạn sau vài phút. Vui lòng không chia sẻ mã cho bất kỳ ai."
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
      setAuthError("Không thể gửi mã xác nhận về email.");
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
      setAuthError("Mã xác nhận không chính xác.");
      return false;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setSigningIn(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      setAuthError(getAuthErrorMessage(error));
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
      setAuthError(getAuthErrorMessage(error));
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

function getAuthErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
  if (code === 'auth/unauthorized-domain') return 'Domain chưa được cấp phép trong Firebase.';
  if (code === 'auth/email-already-in-use') return 'Email đã tồn tại.';
  if (code === 'auth/weak-password') return 'Mật khẩu tối thiểu 6 ký tự.';
  if (code === 'auth/invalid-email') return 'Email không hợp lệ.';
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') return 'Thông tin đăng nhập sai.';
  return error instanceof Error ? error.message : 'Lỗi hệ thống.';
}