import styled from 'styled-components';
import Now from '../components/now';
import { useNavigate } from 'react-router';


const HomeContainer = styled.div`
  .notice > h3 {
    font-size: 18px;
  }
  .notice > p {
    font-size: 14px;
    font-weight: 100;
    line-height: 23px;
  }
`

function Home() {

  const navigate = useNavigate()

  return (
    <HomeContainer>
      <Now/>
      <br/>
      <div>
        <div className='notice'>
          <h3>NOTICE ∠( ᐛ 」∠)＿</h3>
          <p>[noryangjinlab 2.0 패치] 웹사이트 UI 및 기능이 전면 업데이트 되었습니다.</p>
          <p>[연구실 이전 안내] 2026.02.20일 부로 연구실이 기존 위치인 노량진에서 이전합니다.
            이에 따라 본 연구실에서 호스팅 중인 서비스들이 일시적으로 중단될 예정입니다.
          </p>
          <p>[라이브 공연 안내] 2026.3.21. 18시 홍대 스윙홀에서 라이브 공연이 진행될 예정입니다.<br/>
          입장료 : 현장 12000원 | 예매 10000원<br/>
          &#8251; Electric Fan Harp on LIVE &#8251;</p>
          <br/>
          <p>반응형 웹 제작 문의 --&gt; hlawliet113@gmail.com</p>
        </div>
        <div className='grid'>
          <div>

          </div>
          <div>

          </div>
        </div>
      </div>
    </HomeContainer>
  )
};

export default Home;