'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Card, Button, Chip, Separator } from '@heroui/react';
import { authApi } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

/* ── Icon helpers ── */
function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <polyline points="2,4 12,13 22,4" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconEyeOff() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function IconLoader() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

const leftStats = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    label: 'Revenue', value: '৳2.4M', color: '#a78bfa',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    label: 'Customers', value: '18,240', color: '#38bdf8',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    label: 'Orders', value: '4,891', color: '#34d399',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      if (res.success) {
        setAuth(res.data);
        toast.success(`Welcome back, ${res.data.fullName}!`);
        router.push('/dashboard');
      } else {
        toast.error(res.message || 'Login failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes floatA {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(36px, 28px) scale(1.08); }
        }
        @keyframes floatB {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-28px,-22px) scale(1.05); }
        }
        @keyframes floatC {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(18px,-16px); }
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(22px) scale(0.98); }
          to   { opacity:1; transform:translateY(0)   scale(1); }
        }
        @keyframes leftIn {
          from { opacity:0; transform:translateX(-20px); }
          to   { opacity:1; transform:translateX(0); }
        }

        .lp-root {
          min-height: 100dvh;
          background: #060a14;
          display: flex;
          align-items: stretch;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
        }

        /* ── Orb layer ── */
        .lp-orbs { position:fixed; inset:0; pointer-events:none; z-index:0; }
        .orb {
          position:absolute; border-radius:50%;
          filter:blur(90px); opacity:0.35;
        }
        .orb-a {
          width:560px; height:560px; top:-200px; left:-160px;
          background:radial-gradient(circle,#6366f1 0%,transparent 70%);
          animation:floatA 13s ease-in-out infinite;
        }
        .orb-b {
          width:440px; height:440px; bottom:-80px; right:-60px;
          background:radial-gradient(circle,#8b5cf6 0%,transparent 70%);
          animation:floatB 16s ease-in-out infinite;
        }
        .orb-c {
          width:260px; height:260px; top:55%; left:48%;
          background:radial-gradient(circle,#0ea5e9 0%,transparent 70%);
          opacity:0.2;
          animation:floatC 11s ease-in-out infinite;
        }
        .lp-grid {
          position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px);
          background-size:52px 52px;
        }

        /* ── Layout ── */
        .lp-wrap {
          position:relative; z-index:1;
          display:grid;
          grid-template-columns:1fr 1fr;
          width:100%; max-width:1120px;
          margin:0 auto;
          min-height:100dvh;
        }

        /* ══ Left ══ */
        .lp-left {
          display:flex; flex-direction:column; justify-content:center;
          padding:64px 52px 64px 48px; gap:44px;
          animation:leftIn 0.5s ease both;
        }

        .lp-brand { display:flex; align-items:center; gap:13px; }
        .lp-logo {
          width:50px; height:50px; border-radius:15px; flex-shrink:0;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 8px 28px rgba(99,102,241,.42);
        }
        .lp-brand-name {
          display:block; font-size:21px; font-weight:800;
          color:#fff; letter-spacing:-.03em; line-height:1.2;
        }
        .lp-brand-sub {
          display:block; font-size:11px; font-weight:600;
          color:#6366f1; letter-spacing:.08em; text-transform:uppercase;
        }

        .lp-headline { display:flex; flex-direction:column; gap:14px; }
        .lp-title {
          font-size:clamp(30px,3.2vw,46px); font-weight:800;
          color:#ffffff; line-height:1.16; letter-spacing:-.04em; margin:0;
          text-shadow:0 2px 20px rgba(0,0,0,.5);
        }
        .lp-grad {
          background:linear-gradient(125deg,#818cf8,#c084fc 55%,#38bdf8);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .lp-desc {
          font-size:15px; color:#94a3b8; line-height:1.75; max-width:370px; margin:0;
        }

        /* Stats row */
        .lp-stats { display:flex; gap:14px; }
        .lp-stat {
          flex:1; border-radius:16px; padding:18px 15px;
          background:rgba(255,255,255,.035);
          border:1px solid rgba(255,255,255,.07);
          backdrop-filter:blur(10px);
          display:flex; flex-direction:column; gap:7px;
          transition:border-color .2s, box-shadow .2s;
          cursor:default;
        }
        .lp-stat:hover {
          border-color:rgba(99,102,241,.35);
          box-shadow:0 8px 24px rgba(0,0,0,.3);
        }
        .lp-stat-icon { line-height:1; }
        .lp-stat-val {
          font-size:20px; font-weight:700; color:#f1f5f9; letter-spacing:-.02em;
        }
        .lp-stat-lbl {
          font-size:10px; font-weight:600; color:#475569;
          text-transform:uppercase; letter-spacing:.07em;
        }

        /* Trust */
        .lp-trust { display:flex; gap:9px; flex-wrap:wrap; }
        .lp-badge {
          display:inline-flex; align-items:center; gap:5px;
          font-size:11px; font-weight:500; color:#475569;
          background:rgba(99,102,241,.07);
          border:1px solid rgba(99,102,241,.14);
          border-radius:20px; padding:4px 11px;
        }

        /* ══ Right ══ */
        .lp-right {
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          padding:48px 48px 32px;
          gap:18px;
        }

        /* ── Card ── */
        .lp-card-wrap { width:100%; max-width:450px; }
        .lp-card {
          animation:cardIn .45s cubic-bezier(.16,1,.3,1) both;
        }
        /* Override HeroUI card surface */
        .lp-card > div,
        .lp-card-inner {
          background:rgba(13,18,32,.8) !important;
          border:1px solid rgba(255,255,255,.09) !important;
          backdrop-filter:blur(28px) !important;
          -webkit-backdrop-filter:blur(28px) !important;
          box-shadow:
            0 0 0 1px rgba(99,102,241,.12),
            0 28px 64px rgba(0,0,0,.55),
            inset 0 1px 0 rgba(255,255,255,.05) !important;
          border-radius:22px !important;
          padding:36px !important;
        }

        /* Card header */
        .lp-card-hdr {
          display:flex; align-items:center; gap:16px; margin-bottom:20px;
        }
        .lp-shield {
          width:50px; height:50px; flex-shrink:0;
          border-radius:14px;
          background:linear-gradient(135deg,rgba(99,102,241,.18),rgba(139,92,246,.18));
          border:1px solid rgba(99,102,241,.28);
          display:flex; align-items:center; justify-content:center;
          color:#818cf8;
        }
        .lp-card-title {
          font-size:22px; font-weight:700; color:#f1f5f9;
          letter-spacing:-.02em; margin:0 0 3px;
        }
        .lp-card-sub { font-size:13px; color:#475569; margin:0; }

        /* Separator */
        .lp-sep { margin:0 0 20px; }

        /* Form */
        .lp-form { display:flex; flex-direction:column; gap:16px; }
        .lp-field { display:flex; flex-direction:column; gap:0; }
        .lp-label {
          display:block; font-size:11px; font-weight:700;
          color:#475569; text-transform:uppercase; letter-spacing:.05em;
          margin-bottom:7px;
        }
        .lp-input-wrap { position:relative; }
        .lp-input-icon {
          position:absolute; left:13px; top:50%; transform:translateY(-50%);
          color:#334155; pointer-events:none; display:flex; align-items:center;
        }
        .lp-input {
          width:100%; height:48px;
          background:rgba(0,0,0,.35);
          border:1px solid rgba(255,255,255,.09);
          border-radius:12px;
          padding:0 44px 0 40px;
          font-size:14px; color:#e2e8f0;
          outline:none;
          font-family:inherit;
          transition:border-color .2s, box-shadow .2s, background .2s;
          caret-color:#6366f1;
        }
        .lp-input::placeholder { color:#1e293b; }
        .lp-input:hover { border-color:rgba(99,102,241,.35); }
        .lp-input:focus {
          border-color:#6366f1;
          box-shadow:0 0 0 3px rgba(99,102,241,.16);
          background:rgba(99,102,241,.04);
        }
        .lp-input.err { border-color:rgba(239,68,68,.5); }
        .lp-input.err:focus { border-color:#ef4444; box-shadow:0 0 0 3px rgba(239,68,68,.14); }
        .lp-err { font-size:11.5px; color:#f87171; margin-top:5px; }
        .lp-toggle {
          position:absolute; right:13px; top:50%; transform:translateY(-50%);
          color:#334155; background:none; border:none; cursor:pointer;
          display:flex; align-items:center; padding:2px;
          transition:color .15s;
        }
        .lp-toggle:hover { color:#818cf8; }

        /* Submit button */
        .lp-btn-wrap { margin-top:4px; }
        .lp-btn {
          width:100%; height:52px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6) !important;
          color:#fff !important; border:none !important;
          border-radius:13px !important;
          font-size:15px !important; font-weight:700 !important;
          letter-spacing:.01em !important;
          box-shadow:0 4px 20px rgba(99,102,241,.38) !important;
          transition:transform .2s, box-shadow .2s !important;
          cursor:pointer !important;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .lp-btn:hover:not(:disabled) {
          transform:translateY(-2px) !important;
          box-shadow:0 10px 30px rgba(99,102,241,.5) !important;
        }
        .lp-btn:active:not(:disabled) { transform:translateY(0) !important; }
        .lp-btn:disabled { opacity:.55 !important; cursor:not-allowed !important; }

        /* Demo box */
        .lp-demo {
          background:rgba(99,102,241,.05);
          border:1px solid rgba(99,102,241,.14);
          border-radius:13px; padding:14px 16px;
          display:flex; flex-direction:column; gap:11px;
        }
        .lp-demo-hdr { display:flex; align-items:center; }
        .lp-demo-creds { display:flex; flex-direction:column; gap:7px; }
        .lp-demo-row { display:flex; align-items:center; gap:10px; font-size:12px; }
        .lp-demo-key { color:#334155; font-weight:500; min-width:64px; }
        .lp-demo-val {
          color:#94a3b8; font-family:ui-monospace,monospace;
          background:rgba(0,0,0,.25); border:1px solid rgba(255,255,255,.06);
          padding:2px 9px; border-radius:6px; font-size:11.5px; letter-spacing:.02em;
        }

        /* Footer */
        .lp-footer {
          font-size:11px; color:#1e293b; text-align:center; letter-spacing:.02em;
        }

        /* Responsive */
        @media (max-width:840px) {
          .lp-wrap { grid-template-columns:1fr; }
          .lp-left { display:none; }
          .lp-right { padding:32px 20px; min-height:100dvh; }
        }
      `}</style>

      <div className="lp-root">
        {/* Animated background */}
        <div className="lp-orbs" aria-hidden="true">
          <div className="orb orb-a" />
          <div className="orb orb-b" />
          <div className="orb orb-c" />
          <div className="lp-grid" />
        </div>

        <div className="lp-wrap">
          {/* ══ LEFT PANEL ══ */}
          <aside className="lp-left">
            {/* Brand */}
            <div className="lp-brand">
              <div className="lp-logo">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M6 4H10L14 14V4H18V20H14L10 10V20H6V4Z" fill="white" />
                </svg>
              </div>
              <div>
                <span className="lp-brand-name">Nexora</span>
                <span className="lp-brand-sub">Admin Console</span>
              </div>
            </div>

            {/* Headline */}
            <div className="lp-headline">
              <h1 className="lp-title">
                Your store,<br />
                <span className="lp-grad">fully in control.</span>
              </h1>
              <p className="lp-desc">
                Real-time insights, order management, and product control — all from one powerful dashboard.
              </p>
            </div>

            {/* Stats */}
            <div className="lp-stats">
              {leftStats.map((s) => (
                <div key={s.label} className="lp-stat">
                  <span className="lp-stat-icon" style={{ color: s.color }}>{s.icon}</span>
                  <span className="lp-stat-val">{s.value}</span>
                  <span className="lp-stat-lbl">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Trust */}
            <div className="lp-trust">
              {['256-bit SSL', 'Role-based Access', 'Audit Logs'].map((b) => (
                <span key={b} className="lp-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {b}
                </span>
              ))}
            </div>
          </aside>

          {/* ══ RIGHT PANEL ══ */}
          <main className="lp-right">
            <div className="lp-card-wrap">
              {/* HeroUI Card */}
              <Card className="lp-card">
                <Card.Content className="lp-card-inner">
                  {/* Card Header */}
                  <div className="lp-card-hdr">
                    <div className="lp-shield">
                      <IconShield />
                    </div>
                    <div>
                      <p className="lp-card-title">Welcome back</p>
                      <p className="lp-card-sub">Sign in to your admin account</p>
                    </div>
                  </div>

                  {/* Separator */}
                  <Separator className="lp-sep" />

                  {/* Form */}
                  <form onSubmit={handleSubmit(onSubmit)} className="lp-form" noValidate>
                    {/* Email */}
                    <div className="lp-field">
                      <label htmlFor="login-email" className="lp-label">Email Address</label>
                      <div className="lp-input-wrap">
                        <span className="lp-input-icon"><IconMail /></span>
                        <input
                          {...register('email')}
                          id="login-email"
                          type="email"
                          placeholder="admin@nexora.com"
                          autoComplete="email"
                          className={`lp-input${errors.email ? ' err' : ''}`}
                        />
                      </div>
                      {errors.email && <p className="lp-err">{errors.email.message}</p>}
                    </div>

                    {/* Password */}
                    <div className="lp-field">
                      <label htmlFor="login-password" className="lp-label">Password</label>
                      <div className="lp-input-wrap">
                        <span className="lp-input-icon"><IconLock /></span>
                        <input
                          {...register('password')}
                          id="login-password"
                          type={showPass ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className={`lp-input${errors.password ? ' err' : ''}`}
                        />
                        <button
                          type="button"
                          className="lp-toggle"
                          onClick={() => setShowPass(!showPass)}
                          aria-label={showPass ? 'Hide password' : 'Show password'}
                          tabIndex={-1}
                        >
                          {showPass ? <IconEyeOff /> : <IconEye />}
                        </button>
                      </div>
                      {errors.password && <p className="lp-err">{errors.password.message}</p>}
                    </div>

                    {/* Submit — using HeroUI Button */}
                    <div className="lp-btn-wrap">
                      <Button
                        id="login-submit"
                        type="submit"
                        isDisabled={isSubmitting}
                        className="lp-btn"
                      >
                        {isSubmitting ? (
                          <><IconLoader /> Signing in…</>
                        ) : (
                          <>Sign In <IconArrow /></>
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Demo credentials */}
                  <div className="lp-demo" style={{ marginTop: '20px' }}>
                    <div className="lp-demo-hdr">
                      <Chip size="sm" variant="soft" color="accent" className="lp-demo-chip">
                        Demo Credentials
                      </Chip>
                    </div>
                    <div className="lp-demo-creds">
                      <div className="lp-demo-row">
                        <span className="lp-demo-key">Email</span>
                        <code className="lp-demo-val">admin@nexora.com</code>
                      </div>
                      <div className="lp-demo-row">
                        <span className="lp-demo-key">Password</span>
                        <code className="lp-demo-val">Admin@123</code>
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>

            <p className="lp-footer">© 2025 Nexora · Secured with end-to-end encryption</p>
          </main>
        </div>
      </div>
    </>
  );
}
