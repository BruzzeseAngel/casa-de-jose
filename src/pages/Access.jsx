import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { DEMO, auth, db } from '../lib/firebase';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
// Formulario de acceso y registro; la creación de cuentas públicas no concede permisos de administrador.
export default function Access() {
  const { t, lang } = useLanguage(), { user, admin } = useAuth(), navigate = useNavigate();
  const [mode, setMode] = useState('login'), [form, setForm] = useState({ nombre: '', email: '', password: '', confirm: '' }), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    if (DEMO) {
      setMessage(t('demoAccess'));
      return;
    }
    if (mode === 'register' && form.password !== form.confirm) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'register') {
        const { user: registered } = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(registered, { displayName: form.nombre.trim() });
        // La regla obliga a rol=cliente. Ninguna interfaz permite crear administradores.
        try {
          await setDoc(doc(db, 'usuarios', registered.uid), {
            nombre: form.nombre.trim(),
            email: registered.email,
            rol: 'cliente',
            telefono: null,
            idiomaPreferido: lang
          });
        }
        catch (error) {
          await signOut(auth);
          throw error;
        }
      }
      else {
        const session = await signInWithEmailAndPassword(auth, form.email, form.password);
        const claims = await session.user.getIdTokenResult(true);
        navigate(claims.claims.admin === true ? '/admin' : '/mis-solicitudes');
        return;
      }
      navigate('/mis-solicitudes');
    }
    catch (err) {
      setMessage(`${t('accessError')} (${err.code || err.message})`);
    }
    finally {
      setBusy(false);
    }
  }
  if (user)
    return <div className="container section narrow">
      <div className="form-panel">
        <h1>Sesión iniciada</h1>
        <Link className="btn primary" to={admin ? '/admin' : '/mis-solicitudes'}>{admin ? t('admin') : t('myRequests')}</Link>
      </div>
    </div>;
  return <section className="auth-backdrop">
    <div className="auth-panel">
      <p className="overline">LA CASA DE JOSÉ</p>
      <h1>{mode === 'login' ? t('account') : t('register')}</h1>
      <p className="muted">{t('accessSub')}</p>
      <form className="stack" onSubmit={handleSubmit}>
        {mode === 'register' && <label className="field">
          {t('name')}
          <input
            required
            minLength="3"
            maxLength="80"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
          />
        </label>}
        <label className="field">
          {t('email')}
          <input
            required
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label className="field">
          {t('password')}
          <input
            required
            type="password"
            minLength={mode === 'register' ? 8 : 1}
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
        </label>
        {mode === 'register' && <label className="field">
          {t('passwordConfirm')}
          <input
            required
            type="password"
            minLength="8"
            value={form.confirm}
            onChange={e => setForm({ ...form, confirm: e.target.value })}
          />
        </label>}
        {message && <p role="alert" className="notice warning">{message}</p>}
        <button className="btn primary block" disabled={busy}>
          {busy ? t('loading') : mode === 'login' ? t('login') : t('createAccount')}
        </button>
      </form>
      <p className="auth-switch">{mode === 'login' ? t('register') : t('login')} <button
        className="link-button"
        type="button"
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login');
          setMessage('');
        }}
      >→</button></p>
    </div>
  </section>;
}
