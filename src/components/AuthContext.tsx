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

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signingIn: boolean;
  authError: string | null;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
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
      console.error('Firebase redirect sign-in failed:', error);
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
          console.error('Profile bootstrap failed:', error);
          setProfile(applyLocalProfilePatch(user.uid, buildDefaultProfile(user)));
          setAuthError('Đăng nhập Google thành công, nhưng chưa ghi/đọc được hồ sơ Firestore. Kiểm tra Firestore rules hoặc database ID.');
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

  const signIn = async () => {
    setSigningIn(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Firebase popup sign-in failed:', error);

      if (['auth/popup-blocked', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(error?.code)) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError) {
          console.error('Firebase redirect sign-in failed:', redirectError);
          setAuthError(getAuthErrorMessage(redirectError));
        }
      } else {
        setAuthError(getAuthErrorMessage(error));
      }

      setSigningIn(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setSigningIn(true);
    setAuthError(null);
    try {
      try {
        await signInWithEmailAndPassword(auth, email, pass);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          // If user doesn't exist, create it automatically for testing
          await createUserWithEmailAndPassword(auth, email, pass);
        } else {
          throw err;
        }
      }
    } catch (error: any) {
      console.error('Email sign-in failed:', error);
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setSigningIn(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signingIn, authError, signIn, signInWithEmail, logout, clearAuthError: () => setAuthError(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

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

  if (code === 'auth/unauthorized-domain') {
    return 'Domain hiện tại chưa được thêm vào Firebase Authentication > Settings > Authorized domains. Hãy thêm localhost hoặc domain đang chạy app.';
  }

  if (code === 'auth/popup-blocked') {
    return 'Trình duyệt đã chặn popup đăng nhập. Hệ thống sẽ thử chuyển sang redirect sign-in.';
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'Cửa sổ đăng nhập đã bị đóng trước khi hoàn tất.';
  }

  if (code === 'auth/operation-not-allowed') {
    return 'Phương thức đăng nhập Email/Password chưa được bật trong Firebase Authentication > Sign-in method. Vui lòng vào Firebase Console bật nó lên.';
  }

  if (code === 'auth/email-already-in-use') {
    return 'Email này đã được đăng ký trước đó (có thể qua Google). Hãy thử nhập đúng mật khẩu, hoặc dùng một email ảo khác (vd: test1@test.com) để đăng ký mới.';
  }

  return error instanceof Error ? error.message : 'Không đăng nhập được. Kiểm tra Firebase Authentication configuration.';
}
