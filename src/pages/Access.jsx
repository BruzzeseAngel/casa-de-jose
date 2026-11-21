import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { AUTH_ENABLED, AUTH_SETUP_ERROR, DEMO, auth } from '../lib/firebase';
import { AUTH_COPY } from '../lib/authCopy';
import { codigoAcceso } from '../lib/authConfig.mjs';

export default function Access() {
  const { lang } = useLanguage();
  const c = AUTH_COPY[lang] ?? AUTH_COPY.es;
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  if (DEMO) return (
    <section className="auth-backdrop"><div className="auth-panel">
      <p className="overline">LA CASA DE JOSÉ · DEMO</p>
      <h1>{c.demoTitle}</h1><p className="muted">{c.demoText}</p>
      <Link className="btn primary block" to="/solicitudes-demo">{c.sampleLink}</Link>
      <p className="muted small">{c.privacy}</p>
    </div></section>
  );
  if (!AUTH_ENABLED) return (
    <div className="container section narrow"><div className="form-panel">
      <h1>{c.configTitle}</h1><p>{c.configHint}</p>
      <ul>{(AUTH_SETUP_ERROR ?? []).map(campo => <li key={campo}><code>{campo}</code></li>)}</ul>
      <p className="muted small">{c.privacy}</p>
    </div></div>
  );
  if (loading) return <div className="container section"><p role="status">{c.loading}</p></div>;
  if (user) return <Navigate to="/mis-solicitudes" replace />;

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setMessage(''); setSuccess(false);
    if (mode === 'register') {
      if (form.nombre.trim().length < 3) { setMessage(c.nameLength); return; }
      if (form.password.length < 8) { setMessage(c.minimumPassword); return; }
      if (form.password !== form.confirm) { setMessage(c.passwordMismatch); return; }
    }
    setBusy(true);
    try {
      if (mode === 'register') {
        const credential = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
        await updateProfile(credential.user, { displayName: form.nombre.trim() });
        navigate('/mis-solicitudes', { replace: true });
      } else {
        await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
        const from = location.state?.from;
        navigate(from?.startsWith('/') && !from.startsWith('//') ? from : '/mis-solicitudes', { replace: true });
      }
    } catch (error) { setMessage(c.errors[codigoAcceso(error)]); }
    finally { setBusy(false); }
  }

  async function resetPassword() {
    if (!form.email.trim() || !form.email.includes('@')) { setMessage(c.errors.email); setSuccess(false); return; }
    setMessage('');setBusy(true);
    try {
      await sendPasswordResetEmail(auth, form.email.trim());
      setMessage(c.resetDone); setSuccess(true);
    } catch (error) {
      const kind = codigoAcceso(error);
      setMessage(kind === 'credentials' ? c.resetDone : c.errors[kind]);
      setSuccess(kind === 'credentials');
    } finally { setBusy(false); }
  }

  return <section className="auth-backdrop"><div className="auth-panel">
    <p className="overline">LA CASA DE JOSÉ</p>
    <h1>{mode === 'login' ? c.signIn : c.create}</h1>
    <p className="muted">{mode === 'register' ? c.registerNote : c.subtitle}</p>
    <form className="stack auth-form" onSubmit={submit}>
      {mode === 'register' && <label className="field">{c.name}
        <input type="text" required minLength="3" maxLength="80" autoComplete="name"
          value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
      </label>}
      <label className="field">{c.email}
        <input type="email" required autoComplete="email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} />
      </label>
      <label className="field">{c.password}
        <input type="password" required minLength={mode === 'register' ? 8 : 1}
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
      </label>
      {mode === 'register' && <label className="field">{c.confirm}
        <input type="password" required minLength="8" autoComplete="new-password" value={form.confirm}
          onChange={e => setForm({ ...form, confirm: e.target.value })} />
      </label>}
      {message && <p className={`notice ${success ? 'success' : 'error'}`} role={success ? 'status' : 'alert'}>{message}</p>}
      <button className="btn primary block" disabled={busy} type="submit">
        {busy ? c.loading : mode === 'login' ? c.enter : c.createButton}
      </button>
    </form>
    {mode === 'login' && <button className="auth-text-button" type="button" disabled={busy} onClick={resetPassword}>{c.reset}</button>}
    <button className="auth-text-button" type="button" disabled={busy} onClick={() => {
      setMode(mode === 'login' ? 'register' : 'login'); setMessage(''); setSuccess(false);
    }}>{mode === 'login' ? c.toggleRegister : c.toggleLogin}</button>
    <p className="muted small">{c.privacy}</p>
  </div></section>;
}
