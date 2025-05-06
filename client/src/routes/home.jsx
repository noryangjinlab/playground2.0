import { Footer } from '../components/footer'
import '../styles/home.css'

export const Home = () => {
  return (
    <div className='home'>

      <h1 className='title'>noryanjinlab 2.0</h1>
      <p className='greeting'>
        시간 빌게이츠가 만든 웹서비스 noryangjinlab에 오신것을 환영합니다.<br/>
        저희 연구실은 2023년 설립되어 각종 연구 <del>뻘짓</del> 를 이어나가고 있으며 이를 통해 사회의 
        발전에 기여하고 있습니다.<br/>
        기타 문의사항은 하단에 기재된 이메일 주소로 연락바랍니다.
      </p>
      <h2 className='sub-title'>공지사항</h2>
      <p>
        - 연구실 상도 --&gt; 노량진 이전<br/>
        - 연구실 메이드 공개채용 : 메이드복 무상 지원 및 숙박 지원<br/>
        - 상남자는 반응형으로 개발하지 않기때문에 모바일 환경에서는 확대라거나 안경을 쓰거나 하셔야합니다 (해상도 1000 x 800 이상의 환경에서 보시는것을 추천드립니다.)
      </p>
      <Footer/>
    </div>
  )
}