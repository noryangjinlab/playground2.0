import { Routes, Route, Link } from 'react-router';
import styled from 'styled-components';
import { useState, useEffect } from 'react';

import AudioPlayer from './audioPlayer';

import Signup from './routes/signUp';
import Home from './routes/home';
import About from './routes/about';
import Login from './routes/login';
import Lab from './routes/lab';
import Standby from './admin/standBy';


const Container = styled.div`

  overflow-x: hidden;
  min-height: 120vh;
  display: flex;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
  }

  @media (min-width: 1000px) {
    flex-direction: row;
    width: 100%;
    color: white;
    position: relative;

    background-image: url('/images/sample1.jpg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }


  @media (max-width: 1000px) {
    color: white;
    position: relative;

    background-image: url('/images/temp1.png');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }

`
const Navbar = styled.div`

  @media (min-width: 1000px) {
    width: 250px;
    flex-shrink: 0;
    margin: 12px;
    margin-left: 15px;
    border-right: 3px solid rgba(255, 255, 255, 0.4);
    font-weight: 800;
    font-size: 18px;
    z-index: 1;
    position: relative;

    a {
      color: inherit;
      text-decoration: none;
      line-height: 50px;
    }
  }


  @media (max-width: 1000px) {
    display: block;
    position: fixed;
    top: 0;
    right: ${(props) => (props.isOpen ? '0' : '-320px')};
    width: 280px;
    height: 100%;
    backdrop-filter: blur(10px);
    z-index: 100;
    padding: 12px;
    transition: right 0.3s ease-in-out;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.5);

    background-image: url('/images/temp4.jpg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
    }

    a {
      position: relative;
      color: inherit;
      text-decoration: none;
      line-height: 50px;
      z-index: 5;
    }

    #close-btn {
      padding-top: 20px;
      display: inline-block;
      transform: scaleX(1.5);
      padding-left: 2px;
      cursor: pointer;
    }
  }
`
const Overlay = styled.div`
  display: ${(props) => (props.isOpen ? 'block' : 'none')};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
`;


const Contents = styled.div`

  position: relative;
  flex: 1;

  @media (min-width: 1000px) {
    display: flex;
    flex-direction: column;
    z-index: 1;
    margin: 12px;

    #title {
      font-size: 35px;
      font-weight: 800;
    }
    #title-sub {
      font-size: 21px;
      font-weight: 800;
      padding-top: 10px;
      padding-bottom: 15px;
    }
    hr {
      margin: 0;
      margin-top: 25px;
      margin-bottm: 35px;
    }

    .main-content {
      flex: 1;
    }

    .footer {
      margin-top: 80px;
      opacity: 0.8;
    }
    .footer > p {
      font-size: 11px;
    }
  }


  @media (max-width: 1000px) {
    display: flex;
    flex-direction: column;
    z-index: 1;
    padding: 20px;


    .main-top {
      display: flex;
      align-items: center;
    }
    #title {
      flex-grow: 1;
      font-size: calc(16px + 3vw);
      font-weight: 800;
    }
    #title-sub {
      font-size: 17px;
      font-weight: 800;
      padding-top: 10px;
      padding-bottom: 15px;
    }
    hr {
      margin: 0;
      margin-top: 20px;
      margin-bottom: 30px;
    }
    #menu-btn {
      padding: 5px 5px 5px 7px;
      background-color: rgba(255, 255, 255, 0.2);
      cursor: pointer;
    }

    .main-content {
      flex: 1;
    }

    .footer {
      margin-top: 70px;
      opacity: 0.8;
    }
    .footer > p {
      font-size: 11px;
    }
  }
`

function App() {

  const [audioState, setAudioState] = useState(2);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const sendFronAudio = (data) => {
    setAudioState(data);
  };


  useEffect(()=>{
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1000);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [])


  return (
    <Container>
      
      <Navbar isOpen={isMenuOpen}>
        { isMobile && <div id='close-btn' onClick={closeMenu}>X</div> }
        { isMobile && <AudioPlayer/>}
        <Link to="/" onClick={closeMenu}>홈</Link><br/>
        <Link to="/about" onClick={closeMenu}>About LAB</Link><br/>
        <Link to="/login" onClick={closeMenu}>로그인 / 회원가입</Link><br/>
        <Link to="/lab/6f9b4f4e-9f2a-4eb0-9b0b-2f0fadc12345" onClick={closeMenu}>연구실</Link><br/>
        <Link to="/cloud" onClick={closeMenu}>아카이브</Link><br/>
        <Link to="/channel" onClick={closeMenu}>@ channel</Link><br/>
        {/* <Link to="/playground">Playground</Link><br/> */}
        {
          !isMobile && (audioState === 0 ? 
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
          ))
        }
      </Navbar>

      <Overlay isOpen={isMenuOpen} onClick={closeMenu} />

      <Contents>

        <div className='main-top'>
          <span id='title'>noryangjinLAB</span>
          {isMobile && <span id='menu-btn' onClick={toggleMenu}>MENU</span>}
        </div>
        <div id='title-sub'>v2.0.3<hr/></div>

        <div className='main-content'>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/about" element={<About/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/signup" element={<Signup/>} />
            <Route path="/lab/:id" element={<Lab/>} />
            <Route path="/admin/standby" element={<Standby/>} />
          </Routes>
          {!isMobile && <AudioPlayer onSend={sendFronAudio} props={audioState}/>}
        </div>
        
        <div className='footer'>
          <p>released on 2023.05.21</p>
          <p>Contact : hlawliet113@gmail.com</p>
          <p>서울특별시 동작구 노들로2길 7</p>
          <p>No copyright ⓒ 2023 noryangjinlab. All rights not reserved.</p>
          <p>Designed by noryangjinLAB</p>
        </div>

      </Contents>
      
    </Container>
  );
}

export default App;
