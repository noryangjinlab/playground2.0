import { Routes, Route, Link } from 'react-router';
import Signup from './routes/signUp';
import styled from 'styled-components';
import Home from './routes/home';
import Login from './routes/login';
import AudioPlayer from './components/audioPlayer';
import Lab from './routes/lab';
import Standby from './admin/standBy';
import { useState } from 'react';
import axios from 'axios';


const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  min-height: 1000px;
  min-width: 1300px;
  color: white;
  position: relative;

  background-image: url('/images/sample1.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
`
const Navbar = styled.div`
  width: 250px;
  flex-shrink: 0;
  margin: 12px;
  margin-left: 15px;
  border-right: 3px solid rgba(255, 255, 255, 0.4);
  font-weight: 800;
  font-size: 18px;
  z-index: 1;

  a {
    color: inherit;
    text-decoration: none;
    line-height: 50px;
  }
`
const Contents = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  z-index: 1;
  margin: 12px;

  .main-content {
    flex: 1;
  }

  .footer {
    margin-top: auto;
    opacity: 0.8;
  }
  .footer > p {
    font-size: 11px;
  }
`

function App() {

  const [audioState, setAudioState] = useState(2);

  const sendFronAudio = (data) => {
    setAudioState(data);
  };

  return (
    <Container>

      <div style={{
        opacity: 0.7,
        height: '100vh',
        width: '100vw',
        backgroundColor: 'rgb(0, 0, 0)',
        position: 'fixed',
        zIndex: 0
      }}/>
      
      <Navbar>
        <Link to="/">홈</Link><br/>
        <Link to="/login">로그인 / 회원가입</Link><br/>
        <Link to="/lab/6f9b4f4e-9f2a-4eb0-9b0b-2f0fadc12345">연구실</Link><br/>
        <Link to="/cloud">아카이브</Link><br/>
        <Link to="/channel">@ channel</Link><br/>
        {/* <Link to="/playground">Playground</Link><br/> */}
        {
          audioState === 0 ? 
          <Link onClick={()=>{
            setAudioState(2);
          }}>
            주크박스 (최소화됨)
            <div style={{fontSize: 11, lineHeight: 0, color: 'rgba(197, 172, 9, 1)'}}>
            클릭하여 Jukebox.exe 활성화하기</div>
          </Link>
           : (
            audioState === 1 ? 
            <Link onClick={()=>{
              setAudioState(2);
            }}>
              주크박스 (닫힘)
              <div style={{fontSize: 11, lineHeight: 0, color: 'rgba(197, 172, 9, 1)'}}>
              클릭하여 Jukebox.exe 활성화하기</div>
            </Link>
            :
            <Link onClick={()=>{
              setAudioState(0);
            }}>
              주크박스 (활성화됨)
              <div style={{fontSize: 11, lineHeight: 0, color: 'rgba(197, 172, 9, 1)'}}>
              클릭하여 Jukebox.exe 최소화하기</div>
            </Link> 
          )
        }
      </Navbar>

      <Contents>

        <div className='main-content'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/lab/:id" element={<Lab />} />
            <Route path="/admin/standby" element={<Standby />} />
          </Routes>
          <AudioPlayer onSend={sendFronAudio} props={audioState}/>
        </div>
        
        <div className='footer'>
          <p>released on 2023.05.21</p>
          <p>Contact : hlawliet113@gmail.com</p>
          <p>서울특별시 동작구 노들로2길 7</p>
          <p>No copyright ⓒ 2023 noryangjinlab. All rights not reserved.</p>
          <p>Designed by h_lawliet</p>
        </div>

      </Contents>
      
    </Container>
  );
}

export default App;
