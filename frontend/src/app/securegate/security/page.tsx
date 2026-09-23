'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Copy,
  RefreshCw,
  PowerOff,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import SecureGateLayout from '@/components/securegate/SecureGateLayout';
import { api } from '@/lib/api';

export default function SecureGateSecurityPage() {
  const [loading, setLoading] = useState(true);
  const [savingKeys, setSavingKeys] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Captcha & Keys Configuration
  const [captchaProvider, setCaptchaProvider] = useState<'none' | 'cloudflare_turnstile' | 'google_recaptcha'>('none');
  const [cloudflareSiteKey, setCloudflareSiteKey] = useState('');
  const [cloudflareSecretKey, setCloudflareSecretKey] = useState('');
  const [googleSiteKey, setGoogleSiteKey] = useState('');
  const [googleSecretKey, setGoogleSecretKey] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorConfirmedAt, setTwoFactorConfirmedAt] = useState<string | null>(null);

  // 2FA Setup Modal State
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [otpauthUri, setOtpauthUri] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Disable 2FA Modal State
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminSecuritySettings();
      if (res && res.settings) {
        setCaptchaProvider(res.settings.captcha_provider || 'none');
        setCloudflareSiteKey(res.settings.cloudflare_site_key || '');
        setCloudflareSecretKey(res.settings.cloudflare_secret_key || '');
        setGoogleSiteKey(res.settings.google_recaptcha_site_key || '');
        setGoogleSecretKey(res.settings.google_recaptcha_secret_key || '');
      }
      if (res && res.current_admin_2fa) {
        setTwoFactorEnabled(Boolean(res.current_admin_2fa.enabled));
        setTwoFactorConfirmedAt(res.current_admin_2fa.confirmed_at || null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch security settings';
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKeys(true);
    setMessage(null);

    try {
      await api.updateAdminSecuritySettings({
        captcha_provider: captchaProvider,
        cloudflare_site_key: cloudflareSiteKey,
        cloudflare_secret_key: cloudflareSecretKey,
        google_recaptcha_site_key: googleSiteKey,
        google_recaptcha_secret_key: googleSecretKey,
      });

      setMessage({
        type: 'success',
        text: 'Security settings and API keys updated successfully.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save security settings.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSavingKeys(false);
    }
  };

  const handleStart2faSetup = async () => {
    setSetupLoading(true);
    setSetupError(null);
    setVerifyCode('');
    try {
      const res = await api.setupAdmin2fa();
      setTotpSecret(res.secret);
      setQrCodeUrl(res.qr_code_url);
      setOtpauthUri(res.otpauth_uri);
      setSetupModalOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not generate 2FA key.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSetupLoading(false);
    }
  };

  const handleConfirm2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupLoading(true);
    setSetupError(null);

    try {
      await api.confirmAdmin2fa(totpSecret, verifyCode);
      setTwoFactorEnabled(true);
      setTwoFactorConfirmedAt(new Date().toISOString());
      setSetupModalOpen(false);
      setMessage({
        type: 'success',
        text: 'Google Authenticator 2FA has been successfully activated for your account!',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed. Please check the 6-digit code.';
      setSetupError(msg);
    } finally {
      setSetupLoading(false);
    }
  };

  const handleDisable2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisableLoading(true);
    setDisableError(null);

    try {
      await api.disableAdmin2fa(disablePassword);
      setTwoFactorEnabled(false);
      setTwoFactorConfirmedAt(null);
      setDisableModalOpen(false);
      setDisablePassword('');
      setMessage({
        type: 'success',
        text: 'Google Authenticator 2FA has been disabled. Admin login will now proceed with password only.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to disable 2FA. Incorrect password.';
      setDisableError(msg);
    } finally {
      setDisableLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(totpSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SecureGateLayout
      title="Security & Key Management"
      subtitle="Configure real Cloudflare Turnstile, Google reCAPTCHA, and RFC 6238 Google Authenticator 2FA."
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Status Alert */}
        {message && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs font-mono">{message.text}</div>
          </div>
        )}

        {/* 1. Google Authenticator 2FA Status Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-[#101014] border border-white/10 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  twoFactorEnabled
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-white/40'
                }`}
              >
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-medium text-white tracking-wide">
                    Google Authenticator (RFC 6238 TOTP)
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                      twoFactorEnabled
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-white/10 text-white/50 border-white/20'
                    }`}
                  >
                    {twoFactorEnabled ? 'Active & Enforced' : 'Off by Default'}
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-1">
                  {twoFactorEnabled
                    ? `Cryptographic 2FA is active on your administrator account. Confirmed on ${
                        twoFactorConfirmedAt ? new Date(twoFactorConfirmedAt).toLocaleDateString() : 'Active'
                      }.`
                    : '2FA is currently disabled. Admin can log in directly with identifier and clearance keyphrase.'}
                </p>
              </div>
            </div>

            <div>
              {twoFactorEnabled ? (
                <button
                  type="button"
                  onClick={() => setDisableModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-mono uppercase tracking-wider transition flex items-center gap-2"
                >
                  <PowerOff className="w-4 h-4" />
                  <span>Disable 2FA</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStart2faSetup}
                  disabled={setupLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center gap-2 shadow-lg shadow-[#B8976C]/10"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{setupLoading ? 'Generating Secret...' : 'Setup Google Authenticator'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/40 block mb-1">Standard</span>
              <span className="text-white/90">RFC 6238 TOTP (SHA1, 30s)</span>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/40 block mb-1">Supported Apps</span>
              <span className="text-white/90">Google Auth, 1Password, Authy</span>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/40 block mb-1">Bypass Code</span>
              <span className="text-emerald-400">Eliminated (Zero-Bypass)</span>
            </div>
          </div>
        </div>

        {/* 2. Bot Protection / CAPTCHA Configuration Form */}
        <form onSubmit={handleSaveKeys} className="p-6 md:p-8 rounded-2xl bg-[#101014] border border-white/10 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#C5A880]" />
                <h2 className="text-lg font-medium text-white tracking-wide">
                  Bot Protection & Challenge Provider
                </h2>
              </div>
              <p className="text-xs text-white/50 mt-1">
                Choose between Cloudflare Turnstile, Google reCAPTCHA, or leave Off by default.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-white/70 text-xs font-mono flex items-center gap-1.5 transition"
              >
                {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSecrets ? 'Hide Secrets' : 'Reveal Secrets'}</span>
              </button>
              <button
                type="submit"
                disabled={savingKeys}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center gap-2 shadow-lg shadow-[#B8976C]/10 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingKeys ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>

          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">
              Active Challenge Engine
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  captchaProvider === 'none'
                    ? 'bg-[#B8976C]/10 border-[#C5A880] text-white ring-1 ring-[#C5A880]'
                    : 'bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Disabled (Off)</span>
                  <input
                    type="radio"
                    name="provider"
                    value="none"
                    checked={captchaProvider === 'none'}
                    onChange={() => setCaptchaProvider('none')}
                    className="accent-[#C5A880]"
                  />
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  Default mode. Login proceeds immediately without CAPTCHA challenge widgets.
                </p>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  captchaProvider === 'cloudflare_turnstile'
                    ? 'bg-[#B8976C]/10 border-[#C5A880] text-white ring-1 ring-[#C5A880]'
                    : 'bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Cloudflare Turnstile</span>
                  <input
                    type="radio"
                    name="provider"
                    value="cloudflare_turnstile"
                    checked={captchaProvider === 'cloudflare_turnstile'}
                    onChange={() => setCaptchaProvider('cloudflare_turnstile')}
                    className="accent-[#C5A880]"
                  />
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  Privacy-first smart CAPTCHA alternative with seamless frictionless validation.
                </p>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  captchaProvider === 'google_recaptcha'
                    ? 'bg-[#B8976C]/10 border-[#C5A880] text-white ring-1 ring-[#C5A880]'
                    : 'bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Google reCAPTCHA</span>
                  <input
                    type="radio"
                    name="provider"
                    value="google_recaptcha"
                    checked={captchaProvider === 'google_recaptcha'}
                    onChange={() => setCaptchaProvider('google_recaptcha')}
                    className="accent-[#C5A880]"
                  />
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  Standard Google reCAPTCHA v2 / v3 verification framework.
                </p>
              </label>
            </div>
          </div>

          {/* Cloudflare Turnstile Keys */}
          {captchaProvider === 'cloudflare_turnstile' && (
            <div className="p-5 rounded-xl bg-white/[0.02] border border-[#B8976C]/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#C5A880]">
                  Cloudflare Turnstile API Keys
                </span>
                <a
                  href="https://dash.cloudflare.com/?to=/:account/turnstile"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-white/40 hover:text-white flex items-center gap-1 font-mono transition"
                >
                  <span>Cloudflare Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                    Site Key (Public)
                  </label>
                  <input
                    type="text"
                    value={cloudflareSiteKey}
                    onChange={(e) => setCloudflareSiteKey(e.target.value)}
                    placeholder="0x4AAAAAA..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A880] transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                    Secret Key (Private)
                  </label>
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    value={cloudflareSecretKey}
                    onChange={(e) => setCloudflareSecretKey(e.target.value)}
                    placeholder="0x4AAAAAA..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A880] transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Google reCAPTCHA Keys */}
          {captchaProvider === 'google_recaptcha' && (
            <div className="p-5 rounded-xl bg-white/[0.02] border border-[#B8976C]/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#C5A880]">
                  Google reCAPTCHA API Keys
                </span>
                <a
                  href="https://www.google.com/recaptcha/admin"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-white/40 hover:text-white flex items-center gap-1 font-mono transition"
                >
                  <span>Google Admin Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                    Site Key (Public)
                  </label>
                  <input
                    type="text"
                    value={googleSiteKey}
                    onChange={(e) => setGoogleSiteKey(e.target.value)}
                    placeholder="6LeIxacTAAAAA..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A880] transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                    Secret Key (Private)
                  </label>
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    value={googleSecretKey}
                    onChange={(e) => setGoogleSecretKey(e.target.value)}
                    placeholder="6LeIxacTAAAA..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A880] transition"
                  />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* 3. Setup 2FA Modal */}
        {setupModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#101014] border border-white/15 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-[#B8976C]/15 border border-[#B8976C]/30 text-[#C5A880] flex items-center justify-center mx-auto mb-3">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-serif-luxury text-xl text-white tracking-wide uppercase">
                  Setup Google Authenticator
                </h3>
                <p className="text-xs text-white/50">
                  Scan this QR code in Google Authenticator or your password manager.
                </p>
              </div>

              {setupError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{setupError}</span>
                </div>
              )}

              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-xl w-48 h-48 mx-auto flex items-center justify-center shadow-lg">
                <img
                  src={qrCodeUrl}
                  alt="2FA QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Manual Secret Key */}
              <div className="space-y-1.5 text-center">
                <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                  Manual Entry Key (Base32)
                </label>
                <div className="flex items-center justify-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2">
                  <span className="font-mono text-xs text-[#C5A880] tracking-wider select-all">
                    {totpSecret}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition"
                    title="Copy Secret"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                {copied && <p className="text-[10px] text-emerald-400 font-mono">Secret copied to clipboard!</p>}
              </div>

              {/* Confirmation Form */}
              <form onSubmit={handleConfirm2fa} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-2 text-center">
                    Enter Current 6-Digit Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-center text-xl tracking-[0.4em] font-mono text-white focus:outline-none focus:border-[#C5A880] transition"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSetupModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-xs font-mono tracking-wider transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={setupLoading || verifyCode.length !== 6}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50"
                  >
                    {setupLoading ? 'Validating...' : 'Activate 2FA'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. Disable 2FA Modal */}
        {disableModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#101014] border border-white/15 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-3">
                  <PowerOff className="w-6 h-6" />
                </div>
                <h3 className="font-serif-luxury text-xl text-white tracking-wide uppercase">
                  Disable 2-Factor Authentication
                </h3>
                <p className="text-xs text-white/50">
                  Confirm your clearance password to disable Google Authenticator.
                </p>
              </div>

              {disableError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{disableError}</span>
                </div>
              )}

              <form onSubmit={handleDisable2fa} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-2">
                    Administrator Password
                  </label>
                  <input
                    type="password"
                    required
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C5A880] transition"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDisableModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-xs font-mono tracking-wider transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={disableLoading || !disablePassword}
                    className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-xs uppercase tracking-wider transition disabled:opacity-50"
                  >
                    {disableLoading ? 'Verifying...' : 'Confirm Disable'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SecureGateLayout>
  );
}
