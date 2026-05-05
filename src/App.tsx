import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  LayoutDashboard,
  UserCircle,
  ShieldCheck,
  LogOut,
  Building2,
  Scale,
  FileSignature,
} from 'lucide-react';

import Marketplace from './pages/Marketplace';
import Dashboard from './pages/Dashboard';
import DealDetail from './pages/DealDetail';
import CreateDeal from './pages/CreateDeal';
import Profile from './pages/Profile';
import DataRoom from './pages/DataRoom';
import AdminDashboard from './pages/AdminDashboard';
import { X } from 'lucide-react';

const LoginModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { signInWithEmail, signingIn, authError } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await signInWithEmail(email, password);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-950 border border-neutral-800 w-full max-w-sm p-6 relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
          <X size={18} />
        </button>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-light">Test Login</h2>
            <p className="text-xs text-neutral-500 mt-1">Enter any valid email and password format. An account will be created automatically if it doesn't exist.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black border border-neutral-900 p-3 text-sm focus:border-neutral-600 outline-none"
                placeholder="test@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-black border border-neutral-900 p-3 text-sm focus:border-neutral-600 outline-none"
                placeholder="••••••••"
              />
            </div>
            {authError && <p className="text-xs text-red-500">{authError}</p>}
            <button 
              type="submit"
              disabled={signingIn}
              className="w-full py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 disabled:opacity-50"
            >
              {signingIn ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const lifecycle = [
  { label: 'Listing', value: 'Company profile and deal submission' },
  { label: 'Matching', value: 'Buyer discovery and AI fit scoring' },
  { label: 'Due Diligence', value: 'NDA-gated encrypted data room' },
  { label: 'Negotiation', value: 'Offers, counter-offers, meetings' },
  { label: 'Legal', value: 'NDA, LOI, SPA and eSignature' },
  { label: 'Closing', value: 'Final audit trail and archive' },
];

const Home = () => (
  <div className="space-y-16">
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-[74vh] items-center">
      <div className="lg:col-span-7 space-y-10">
        <div className="space-y-5">
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.35em] font-bold">Full-cycle M&A Platform</p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-light tracking-tightest leading-[0.95]"
          >
            M&A Nexus
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl text-lg text-neutral-400 leading-relaxed"
          >
            A secure workspace for sellers, buyers, advisors, and admins to manage listings, matching, due diligence, negotiation, legal workflows, and closing.
          </motion.p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/marketplace" className="px-7 py-4 bg-white text-black font-bold hover:bg-neutral-200 transition-colors uppercase text-[10px] tracking-widest">
            Explore Deals
          </Link>
          <Link to="/create-deal" className="px-7 py-4 border border-neutral-800 text-white font-bold hover:bg-neutral-900 transition-colors uppercase text-[10px] tracking-widest">
            Submit Deal
          </Link>
          <Link to="/profile" className="px-7 py-4 border border-neutral-800 text-white font-bold hover:bg-neutral-900 transition-colors uppercase text-[10px] tracking-widest">
            Start KYC
          </Link>
        </div>
      </div>

      <div className="lg:col-span-5 border border-neutral-900 bg-neutral-950">
        <div className="grid grid-cols-2 gap-px bg-neutral-900">
          {[
            ['Deal Value', '$240M+'],
            ['Buyer Pool', '1.2K'],
            ['NDA Flow', '84%'],
            ['Avg Growth', '24.5%'],
          ].map(([label, value]) => (
            <div key={label} className="bg-black p-6">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{label}</p>
              <p className="text-3xl font-light mt-2">{value}</p>
            </div>
          ))}
        </div>
        <div className="p-6 space-y-4">
          {lifecycle.map((item, index) => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="w-8 h-8 border border-neutral-800 flex items-center justify-center text-[10px] font-mono text-neutral-500">{index + 1}</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest">{item.label}</p>
                <p className="text-xs text-neutral-500 mt-1">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-4 gap-px bg-neutral-900 border border-neutral-900">
      {[
        { icon: Building2, title: 'Seller Workspace', text: 'Company profile, deal submission, publication controls, investor interest.' },
        { icon: Search, title: 'Buyer Discovery', text: 'Advanced filters, private deal access, saved deals, offer pipeline.' },
        { icon: ShieldCheck, title: 'Data Room', text: 'Folder permissions, watermark policy, access tracking, encryption posture.' },
        { icon: Scale, title: 'Legal Closing', text: 'NDA, LOI, SPA generation, review, eSignature, final archive.' },
      ].map((item) => (
        <div key={item.title} className="bg-black p-7 space-y-4">
          <item.icon size={20} className="text-neutral-400" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">{item.title}</h3>
            <p className="text-xs text-neutral-500 leading-relaxed mt-3">{item.text}</p>
          </div>
        </div>
      ))}
    </section>
  </div>
);

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="text-white font-serif italic text-2xl"
    >
      Nexus
    </motion.div>
  </div>
);

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, logout, signingIn, authError, clearAuthError } = useAuth();
  const location = useLocation();
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

  const navItems = [
    { name: 'Marketplace', path: '/marketplace', icon: Search },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Data Room', path: '/data-room', icon: ShieldCheck },
    { name: 'Submit Deal', path: '/create-deal', icon: FileSignature },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ name: 'Admin', path: '/admin', icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-neutral-800">
      <nav className="border-b border-neutral-900 bg-black/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Building2 size={18} />
            <span className="text-sm font-bold uppercase tracking-[0.25em]">M&A Nexus</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${location.pathname === item.path ? 'text-white' : 'text-neutral-500 hover:text-white'}`}
              >
                <item.icon size={12} />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-6">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-none">{profile?.name || 'User'}</p>
                    <p className="text-[9px] text-neutral-500 uppercase tracking-widest">{profile?.role || 'buyer'} · {profile?.kycStatus || 'not_started'}</p>
                  </div>
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} className="w-8 h-8 rounded-full border border-neutral-800" />
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
                      <UserCircle size={16} className="text-neutral-400" />
                    </div>
                  )}
                </Link>
                <button onClick={logout} className="text-neutral-500 hover:text-white transition-colors" aria-label="Sign out">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                disabled={signingIn}
                className="px-6 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all"
              >
                {signingIn ? 'Signing In...' : 'Sign In'}
              </button>
            )}
          </div>
        </div>
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">
        {authError && (
          <div className="mb-6 border border-red-900/60 bg-red-950/30 p-4 flex items-start justify-between gap-4">
            <p className="text-sm text-red-200 leading-relaxed">{authError}</p>
            <button onClick={clearAuthError} className="text-[10px] uppercase tracking-widest font-bold text-red-300 hover:text-white">
              Close
            </button>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="fixed left-6 bottom-10 hidden xl:block">
        <p className="[writing-mode:vertical-lr] rotate-180 text-[8px] uppercase tracking-[0.5em] text-neutral-800 font-bold">
          Listing &gt; Matching &gt; Diligence &gt; Negotiation &gt; Legal &gt; Closing
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthContent />
      </AuthProvider>
    </Router>
  );
}

function AuthContent() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/deals/:id" element={<DealDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/data-room" element={<DataRoom />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-deal" element={<CreateDeal />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </AppLayout>
  );
}
