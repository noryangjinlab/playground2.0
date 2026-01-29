import { useState } from "react";
import { useNavigate } from "react-router";
import styled from "styled-components";



const SignupContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;

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

function Signup() {

  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', name: '', nickname: '' });

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('https://noryangjinlab.org/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        username: form.username,
        password: form.password,
        name: form.name,
        nickname: form.nickname
      })
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      navigate('/');
    } else {
      alert(data.message);
    }
  };

  return (
    <SignupContainer>
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
        <div className="form-child">
          <span>이름&nbsp;</span>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
          />
        </div>
        <div className="form-child">
          <span>닉네임&nbsp;</span>
          <input
            name="nickname"
            value={form.nickname}
            onChange={onChange}
          />
        </div>
        <button className="retro-btn" onClick={onSubmit}>회원가입 신청</button>
        <button className="retro-btn" onClick={()=>{
          navigate('/login');
        }}>이미 회원입니다</button>
      </div>
      <div style={{
        paddingTop: 10
      }}>
        <span style={{
          fontSize: 11,
          color: 'rgba(230, 0, 0, 1)',
          fontWeight: 1000
        }}>* 회원가입 승인은 주인장 재량이므로 모르는 사람은 가입이 거부될 수 있습니다. 실명을 기입해주세요.</span><br/>
        <span style={{
          fontSize: 10
        }}>가입 승인까지는 최소 1분에서 최대 10,000,000분이 소요될 수 있습니다.</span><br/>
        <span style={{
          fontSize: 10
        }}>입력하신 비밀번호는 bcrypt로 암호화되어 안?전하게 보관됩니다. 안심하십시오.</span>
      </div>
    </SignupContainer>
  )
};

export default Signup;