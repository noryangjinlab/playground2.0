import { useEffect, useId, useRef, useState } from 'react';
import { AppWindow } from './app-window';
import { fetchApi } from '../api';
import './auth-window.css';

const emptyForm = { username: '', password: '', name: '', nickname: '', email: '' };

export default function AuthWindow(windowProps) {
  const id = useId();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(emptyForm);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const inFlight = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    fetchApi('/auth/me', { signal: controller.signal }).then(data => { if (!controller.signal.aborted) setUser(data); }).catch(() => {}).finally(() => {
      if (!controller.signal.aborted) setChecking(false);
    });
    return () => controller.abort();
  }, []);
  function switchMode(next) {
    if (inFlight.current) return;
    setMode(next); setNotice(null); setForm(previous => ({ ...previous, password: '' }));
  }
  async function submit(event) {
    event.preventDefault();
    if (inFlight.current || checking) return;
    inFlight.current = true; setBusy(true); setNotice(null);
    try {
      const payload = mode === 'signup' ? form : { username: form.username, password: form.password };
      const data = await fetchApi(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(payload) });
      if (mode === 'signup') {
        setForm({ ...emptyForm, username: form.username }); setMode('login');
        setNotice({ text: `${data.message || '회원가입 신청이 완료되었습니다.'} 관리자 승인 후 로그인할 수 있습니다.`, error: false });
      } else {
        setUser({ username: form.username, nickname: data.nickname }); setForm(emptyForm);
        setNotice({ text: `${data.nickname || '회원'}님, 환영합니다.`, error: false });
        window.dispatchEvent(new Event('auth-changed'));
      }
    } catch (error) { setNotice({ text: error.message, error: true }); }
    finally { inFlight.current = false; setBusy(false); }
  }
  async function logout() {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setNotice(null);
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
      setUser(null); setMode('login'); setForm(emptyForm);
      setNotice({ text: '로그아웃되었습니다.', error: false });
      window.dispatchEvent(new Event('auth-changed'));
    } catch (error) { setNotice({ text: error.message, error: true }); }
    finally { inFlight.current = false; setBusy(false); }
  }
  const fields = mode === 'signup' ? [
    ['username', '아이디', 'text', 'username'], ['password', '비밀번호', 'password', 'new-password'],
    ['name', '이름', 'text', 'name'], ['nickname', '닉네임', 'text', 'nickname'], ['email', '이메일', 'email', 'email'],
  ] : [['username', '아이디', 'text', 'username'], ['password', '비밀번호', 'password', 'current-password']];
  return <AppWindow {...windowProps} title="로그인 체계" icon="/images/icon/users_key.png" className="auth-window" width={460} height={550} closable={!busy}
    footer={<div className="auth-status">{checking ? '로그인 상태 확인 중…' : busy ? '요청 처리 중…' : user ? `${user.nickname || user.username} 로그인 중` : '로그인 / 회원가입'}</div>}>
    <div className="auth-banner"><img src="/images/icon/users_key.png" alt=""/><div><strong>로그인 체계</strong><span>noryangjinLAB 사용자 계정</span></div></div>
    <div className="auth-body" aria-busy={busy || checking}>
      {checking ? <p role="status">로그인 상태를 확인하고 있습니다…</p> : user ? <>
        <h2>{user.nickname || user.username}님, 안녕하세요.</h2>
        <p className="auth-description">현재 계정으로 로그인되어 있습니다.</p>
        <dl className="auth-account"><dt>아이디</dt><dd>{user.username}</dd><dt>닉네임</dt><dd>{user.nickname || user.username}</dd></dl>
        <div className="auth-actions"><button type="button" className="win98-button" disabled={busy} onClick={logout}>{busy ? '로그아웃 중…' : '로그아웃'}</button></div>
      </> : <>
        <div className="auth-tabs" aria-label="계정 화면">
          <button type="button" aria-pressed={mode === 'login'} disabled={busy} onClick={() => switchMode('login')}>로그인</button>
          <button type="button" aria-pressed={mode === 'signup'} disabled={busy} onClick={() => switchMode('signup')}>회원가입</button>
        </div>
        <form onSubmit={submit}>
          <fieldset disabled={busy}><legend>{mode === 'signup' ? '새 계정 신청' : '사용자 로그인'}</legend>
            {fields.map(([name, label, type, autocomplete]) => <div className="auth-field" key={name}>
              <label htmlFor={`${id}-${name}`}>{label}</label>
              <input id={`${id}-${name}`} name={name} type={type} autoComplete={autocomplete} required value={form[name]} onChange={event => setForm(previous => ({ ...previous, [name]: event.target.value }))}/>
            </div>)}
            {mode === 'signup' && <p className="auth-description">모든 항목을 입력해 주세요. 아이디와 닉네임은 중복할 수 없습니다. 이름은 실명으로 입력하며, 관리자 승인 시 이메일로 알려드립니다.</p>}
            <div className="auth-actions"><button className="win98-button" type="submit">{busy ? '처리 중…' : mode === 'signup' ? '회원가입 신청' : '로그인'}</button></div>
          </fieldset>
        </form>
      </>}
      {notice && <p className={`auth-notice${notice.error ? ' is-error' : ''}`} role={notice.error ? 'alert' : 'status'}>{notice.text}</p>}
    </div>
  </AppWindow>;
}
