import { useState } from "react";
import { useNavigate } from "react-router";
import styled from "styled-components";
import { fetchApi } from "../api";



const SignupContainer = styled.div`

  @media (min-width: 1000px) {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 600px;
    align-items: center;
    justify-content: center;

    .form-child {
      display: flex;
      align-items: center;
      padding: 6px 0;
      font-size: 17px;
    }
    .form-child > span {
      width: 80px;
    }
    .email-notice {
      font-size: 12px;
      color: rgb(230, 0, 0);
    }

    .notice {
      padding: 20px;
      margin-top: 20px;
      background-color: rgba(0, 0, 0, 0.6);
    }
    .signup-notice {
      font-size: 12px;
      color: rgb(230, 0, 0);
      font-weight: 1000;
    }

    input {
      font-family: 'galmuri9';
      flex: 1;
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
  }


  @media (max-width: 1000px) {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 600px;
    align-items: center;
    justify-content: center;

    .form-child {
      display: flex;
      align-items: center;
      padding: 6px 0;
      font-size: 16px;
    }
    .form-child > span {
      width: 80px;
    }
    .email-notice {
      font-size: 12px;
      color: rgb(230, 0, 0);
      padding-bottom: 5px;
    }

    .notice {
      padding: 20px;
      margin-top: 20px;
      background-color: rgba(0, 0, 0, 0.6);
    }
    .signup-notice {
      font-size: 12px;
      color: rgb(230, 0, 0);
      font-weight: 1000;
    }

    input {
      font-family: 'galmuri9';
      flex: 1;
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
  }
  
`

function Signup() {

  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', name: '', nickname: '', email: '' });

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault()
    fetchApi('/auth/signup', {
      method: "POST",
      body: JSON.stringify({
        username: form.username,
        password: form.password,
        name: form.name,
        nickname: form.nickname,
        email: form.email
      })
    }).then((data)=>{
      alert(data.message)
      console.log(data.message)
      navigate('/')
    }).catch((error)=>{
      alert(error.message)
      console.log(error.message)
    })
  }

  return (
    <SignupContainer>
      <h2>회원가입</h2>
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
        <div className="form-child">
          <span>이메일&nbsp;</span>
          <input
            name="email"
            value={form.email}
            onChange={onChange}
          />
        </div>
        <div className="email-notice">&#8251;&nbsp;회원가입 승인시 이메일을 전송해드립니다</div>
        <button className="retro-btn" onClick={onSubmit}>회원가입 신청</button>
        <button className="retro-btn" onClick={()=>{
          navigate('/login');
        }}>이미 회원입니다</button>
      </div>
      <div className="notice">
        <span className="signup-notice">회원가입 승인은 주인장 재량이므로 모르는 사람은 가입이 거부될 수 있습니다. 실명을 기입해주세요.</span><br/>
        <span style={{
          fontSize: 11
        }}>아이디와 닉네임은 중복이 불가하며 모든 항목을 입력하셔야 합니다.</span><br/>
        <span style={{
          fontSize: 11
        }}>가입 승인까지는 최소 1분에서 최대 10,000,000분이 소요될 수 있습니다.</span><br/>
        <span style={{
          fontSize: 11
        }}>입력하신 비밀번호는 bcrypt로 암호화되어 안?전하게 보관됩니다.</span>
      </div>
    </SignupContainer>
  )
};

export default Signup;