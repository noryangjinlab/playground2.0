import { Footer } from '../components/footer'
import '../styles/updates.css'

const Updates = () => {
  return (
    <div className="updates">
      <h1 className='title'>패치노트</h1>

      <ul>
        <li>2023.05.21<br/>
        배포 시작, node.js + ejs 동적 웹<br/>
        주요 기능) 로그인, 회원가입, mp3 플레이어, 점심 메뉴 룰렛</li>
        <li>2023.06.01<br/>
        웹소켓 실시간 통신 구현<br/>
        주요 기능) 채팅 기능 추가</li>
      </ul>

      <Footer/>
    </div>
  )
}

export default Updates