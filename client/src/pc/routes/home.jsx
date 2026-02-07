import styled from 'styled-components';
import Now from '../components/now';


const HomeContainer = styled.div`
  .notice > h3 {
    font-size: 20px;
  }
  .notice > p {
    font-size: 16px;
    font-weight: 100;
    line-height: 27px;
  }
`

function Home() {
  return (
    <HomeContainer>
      <Now/>
      <br/>
      <div>
        <div className='notice'>
          <h3>NOTICE ( ¯⌓¯ )</h3>
          <p>[noryangjinlab 2.0 패치] 웹사이트 UI 및 기능이 전면 업데이트 되었습니다.</p>
          <p>[연구실 이전 안내] 2026.02.20일 부로 연구실이 기존 위치인 노량진에서 이전합니다.
            이에 따라 본 연구실에서 호스팅 중인 서비스들이 일시적으로 중단될 예정입니다.
            서비스는 12시간 이내로 복구됩니다.
          </p>
          <p>[서비스 준비중] 신청자들을 대상으로 아카이브 탭에서 사용 가능한 클라우드 50GB를 무상으로 제공할 예정입니다.</p>
          <p>반응형 웹 제작 문의 --&gt; hlawliet113@gmail.com</p>
        </div>
        <div>
          <h3></h3>
        </div>
      </div>
    </HomeContainer>
  )
};

export default Home;