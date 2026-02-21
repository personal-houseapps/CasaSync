import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError(t.passwordsMismatch);
      return;
    }

    setLoading(true);

    if (isLogin) {
      const { error: err } = await signIn(email, password);
      if (err) setError(t.authError);
    } else {
      const { error: err } = await signUp(email, password);
      if (err) {
        setError(t.authError);
      } else {
        setSignUpSuccess(true);
      }
    }

    setLoading(false);
  };

  if (signUpSuccess) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h1>CasaSync</h1>
          <p className="auth-success">{t.checkEmail}</p>
          <button className="auth-submit" onClick={() => { setSignUpSuccess(false); setIsLogin(true); }} style={{ marginTop: 16 }}>
            {t.logIn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>CasaSync</h1>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'auth-tab-active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            {t.logIn}
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'auth-tab-active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            {t.signUp}
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="auth-input"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <input
            type="password"
            className="auth-input"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {!isLogin && (
            <input
              type="password"
              className="auth-input"
              placeholder={t.confirmPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? (isLogin ? t.loggingIn : t.signingUp)
              : (isLogin ? t.logIn : t.signUp)
            }
          </button>
        </form>

        <div className="auth-lang-row">
          <button className="lang-btn-login" onClick={toggleLanguage}>
            {lang === 'en' ? '🌐 Portugues' : '🌐 English'}
          </button>
        </div>
      </div>
    </div>
  );
}
