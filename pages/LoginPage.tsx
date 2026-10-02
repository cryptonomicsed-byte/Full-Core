
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { authService } from '../services/authService';
import { 
  Dna, 
  Mail, 
  Lock, 
  Github, 
  Chrome, 
  Linkedin, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Globe,
  Zap,
  CheckCircle2
} from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'standard' | 'sso'>('standard');
  const navigate = useNavigate();
  const { login } = useStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authService.signIn(email, password);
      login();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6 relative overflow-hidden selection:bg-brand-500/30">
      {/* Background Ambient Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-brand-900/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-dark-surface border border-dark-border rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden min-h-[700px]">
        
        {/* Left Side: Branding & Info */}
        <div className="hidden lg:flex flex-col p-12 bg-black/40 border-r border-dark-border relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/5 to-transparent opacity-50" />
          
          <div className="relative z-10">
            <Link to="/landing" className="flex items-center gap-3 mb-16 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase">CoreDNA<span className="text-brand-500">2</span></span>
            </Link>

            <h2 className="text-4xl font-black text-white leading-tight uppercase tracking-tighter mb-6">
              The Enterprise <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Operating System</span> <br />
              For Brands.
            </h2>

            <p className="text-zinc-500 text-lg font-medium leading-relaxed mb-12 max-w-sm">
              Securely access your neural assets, campaign forge, and autonomous agent network.
            </p>

            <div className="space-y-6">
              {[
                { icon: ShieldCheck, title: "Zero-Trust Protocol", desc: "Enterprise-grade encryption for brand data." },
                { icon: Cpu, title: "Neural Context", desc: "Seamless sync across all brand extraction nodes." },
                { icon: Globe, title: "Global CDN", desc: "Instantly deploy sites and assets to the edge." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-brand-500 shrink-0 border border-zinc-800">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">{item.title}</h4>
                    <p className="text-[11px] text-zinc-500 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto relative z-10 pt-8 border-t border-zinc-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Neural Link v2.5.0 Stable</span>
            </div>
            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">© 2025 COREDNA AI</span>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Initialize Session</h1>
              <p className="text-zinc-500 text-sm font-medium">Verify your identity to unlock the brand matrix.</p>
            </div>

            {/* Auth Mode Toggle */}
            <div className="bg-black/40 border border-zinc-800 rounded-2xl p-1 flex mb-8">
              <button 
                onClick={() => setAuthMethod('standard')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMethod === 'standard' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                Standard Auth
              </button>
              <button 
                onClick={() => setAuthMethod('sso')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMethod === 'sso' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                Enterprise SSO
              </button>
            </div>

            {authMethod === 'standard' ? (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-sm font-medium">
                    {error}
                  </div>
                )}
                <form onSubmit={handleLogin} className="space-y-4 mb-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">Identity (Email)</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-brand-500 transition-colors" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="agent@company.com"
                        className="w-full bg-black/40 border border-zinc-800 rounded-xl py-4 pl-12 pr-6 text-white font-bold focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder-zinc-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Neural Override (Password)</label>
                      <button type="button" className="text-[9px] font-black text-brand-500 uppercase hover:text-brand-400">Recover Key</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-brand-500 transition-colors" />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-black/40 border border-zinc-800 rounded-xl py-4 pl-12 pr-6 text-white font-bold focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder-zinc-800"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:bg-zinc-800 text-white font-black rounded-2xl shadow-xl shadow-brand-900/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs h-[56px]"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" />
                        Authorize Link
                      </>
                    )}
                  </button>
                </form>

                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
                  <div className="relative flex justify-center text-[9px] uppercase font-black tracking-widest"><span className="bg-dark-surface px-4 text-zinc-600">Secondary OAuth Matrix</span></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button className="py-3 bg-black/40 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-white/5 hover:text-white transition-all group">
                    <Chrome className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                  <button className="py-3 bg-black/40 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-white/5 hover:text-white transition-all group">
                    <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                  <button className="py-3 bg-black/40 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-white/5 hover:text-white transition-all group">
                    <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="p-6 bg-brand-900/10 border border-brand-500/20 rounded-2xl flex items-center gap-4">
                  <Globe className="w-8 h-8 text-brand-500" />
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">SAML / OKTA Ready</h4>
                    <p className="text-[10px] text-zinc-500 font-medium">Enterprise single sign-on detected.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">Workspace Domain</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-brand-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="acme-corp"
                      className="w-full bg-black/40 border border-zinc-800 rounded-xl py-4 pl-12 pr-6 text-white font-bold focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder-zinc-800"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-700">.coredna.ai</div>
                  </div>
                </div>

                <button 
                  onClick={handleLogin}
                  className="w-full py-4 bg-zinc-100 hover:bg-white text-black font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs h-[56px]"
                >
                  Initiate SSO Handshake
                </button>

                <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
                  Need an enterprise license for custom domain SSO? <br />
                  <Link to="/landing" className="text-brand-500 font-bold hover:underline">Contact Neural Support</Link>
                </p>
              </div>
            )}

            <div className="mt-12 text-center">
              <p className="text-xs text-zinc-600 font-medium uppercase tracking-widest">
                New Operative? <Link to="/landing" className="text-brand-500 font-black hover:text-brand-400 transition-colors">Apply for Access</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
