import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styled from "styled-components";


const LoginContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .form-child {
    display: flex;
    align-items: center;
    padding: 5px 0 5px 0;
  }

  input {
    font-family: 'galmuri9';
  }

  .retro-btn {
    font-family: 'galmuri9';
    font-weight: 800;
    font-size: 16px;
    color: rgba(240, 240, 240, 1);
    background: rgba(143, 143, 143, 1);
    border-bottom: 4px inset rgba(0,0,0,.5);
    border-left: 4px inset rgba(0,0,0,.5);
    border-right: 4px inset rgba(255,255,255,.5);
    border-top: 4px inset rgba(255,255,255,.5);
    padding: 5px 10px;
    margin: 9px 12px 0 0;
    cursor: pointer;
  }
  .retro-btn:focus, .retro-btn:hover {
    background: rgba(157, 157, 157, 1);
  }
`
function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [user, setUser] = useState(null);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('https://noryangjinlab.org/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        username: form.username,
        password: form.password
      })
    });
    const data = await res.json();
    if (res.ok) {
      alert(`${data.nickname}님 환영합니다`);
      navigate('/');
    } else {
      alert(data.message);
    }
  };

  const onLogout = async (e) => {
    e.preventDefault();
    const res = await fetch('https://noryangjinlab.org/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      navigate('/');
    } else {
      alert(data.message);
    }
  };

  const onBye = async (e) => {
    e.preventDefault();
    const ok = window.confirm("정말로 탈퇴하시겠습니까?");
    if (!ok) return;
    const ok2 = window.confirm("혼또니?");
    if (!ok2) return;
    const res = await fetch('https://noryangjinlab.org/auth/bye', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      navigate('/');
    } else {
      alert(data.message);
    }
  };

  async function getMySession() {
    const res = await fetch('https://noryangjinlab.org/auth/me', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data);
    } else {
      setUser(null);
    }
  }

  useEffect(()=>{getMySession();}, []);

  return (
    <>
    {
      !user ? 
      <LoginContainer>
      <div>
        <div className="form-child">
          <span>아이디&nbsp;</span>
          <input
            name="username"
            value={form.username}
            onChange={onChange}
          />
        </div>
        <div className="form-child">
          <span>비밀번호&nbsp;</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
          />
        </div>
        <button className="retro-btn login" onClick={onSubmit}>로그인</button>
        <button className="retro-btn signup" onClick={()=>{
          navigate("/signup");
        }}>회원가입 하러가기</button>
      </div>
    </LoginContainer> : 
    <LoginContainer>
      <h2>안녕하세요 {user?.nickname}님</h2>
      <div>
        <button className="retro-btn" onClick={onLogout}>로그아웃</button>
        <button className="retro-btn" onClick={onBye}>탈퇴하기</button>
      </div>
    </LoginContainer>
    }
    </>
  )
};

export default Login;