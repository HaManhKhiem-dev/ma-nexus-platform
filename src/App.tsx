import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Search, 
  PlusCircle, 
  LayoutDashboard, 
  UserCircle, 
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Building2,
  TrendingUp,
  FileText
} from 'lucide-react';

import Marketplace from './pages/Marketplace';
import Dashboard from './pages/Dashboard';
import DealDetail from './pages/DealDetail';
import CreateDeal from './pages/CreateDeal';
import Profile from './pages/Profile';
import DataRoom from './pages/DataRoom';

// Home Component
const Home = () => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
    <motion.h1 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-6xl md:text-8xl font-light tracking-tighter mb-8"
    >
      M&A <span className="font-serif italic text-neutral-400">Nexus</span>
    </motion.h1>
    <motion.p 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="max-w-xl text-lg text-neutral-500 mb-12"
    >
      Connecting high-growth enterprises with strategic capital. End-to-end M&A orchestration with institutional security.
    </motion.p>
    <div className="flex gap-4">
      <Link to="/marketplace" className="px-8 py-4 bg-white text-black font-medium hover:bg-neutral-200 transition-colors uppercase text-xs tracking-widest">
        Explore Deals
      </Link>
      <Link to="/create-deal" className="px-8 py-4 border border-neutral-800 text-white font-medium hover:bg-neutral-900 transition-colors uppercase text-xs tracking-widest">
        List Business
      </Link>
    </div>
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
  const { user, profile, signIn, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Marketplace', path: '/marketplace', icon: Search },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Data Room', path: '/data-room', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-neutral-800">
      {/* Navigation */}
      <nav className="border-b border-neutral-900 bg-black/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-serif italic tracking-tightest">Nexus</Link>
          
          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${location.pathname === item.path ? 'text-white' : 'text-neutral-500 hover:text-white'}`}
              >
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
                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest">{profile?.role}</p>
                    </div>
                    {profile?.avatarUrl ? (
                         <img src={profile.avatarUrl} className="w-8 h-8 rounded-full border border-neutral-800" />
                    ) : (
                        <div className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
                             <UserCircle size={16} className="text-neutral-400" />
                        </div>
                    )}
                 </Link>
                 <button onClick={logout} className="text-neutral-500 hover:text-white transition-colors">
                    <LogOut size={16} />
                 </button>
              </div>
            ) : (
              <button 
                onClick={signIn}
                className="px-6 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">
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

      {/* Vertical Rail Decoration */}
      <div className="fixed left-6 bottom-10 hidden xl:block">
        <p className="[writing-mode:vertical-lr] rotate-180 text-[8px] uppercase tracking-[0.5em] text-neutral-800 font-bold">
          Institutional Grade Quality & Security
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
            </Routes>
        </AppLayout>
    );
}

