import styled from "styled-components"

const Container = styled.div`

  @media (min-width: 1000px) {

    .about {
      padding-bottom: 50px;
    }
    .about > p {
      font-size: 15px;
      margin: 3px 0;
      font-weight: 100;
      word-break: break-all;
    }
    .about > img {
      width: 30px;
      padding-right: 5px;
    }

    .members {
      display: grid;
      padding-bottom: 50px;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 15px;
    }
    .item {
      position: relative;
      padding: 10px;
      border: 5px inset rgb(195, 195, 195);
      background: rgb(155, 155, 155);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .item > h4 {
      font-size: 17px;
      margin: 10px 0;
    }
    .item > p {
      font-size: 13px;
      margin: 3px 0;
      font-weight: 100;
    }
    h3 {
      color: rgba(197, 172, 9, 1);
      font-size: 25px;
      font-weight: 800;
      margin-bottom: 20px;
    }
    .item > img {
      width: 170px;
    }
    .licence > div {
      padding-bottom: 10px;
    }
    .licence h4 {
      font-size: 17px;
      margin: 10px 0;
    }
    .licence p {
      font-size: 13px;
      margin: 3px 0;
      font-family: 'Galmuri14';
      font-weight: 100;
    }
    .licence img {
      width: 350px;
    }
  }


  @media (max-width: 1000px) {
    .about {
      padding-bottom: 50px;
    }
    .about > p {
      font-size: 13px;
      margin: 3px 0;
      font-weight: 100;
      word-break: break-all;
    }
    .about > img {
      width: 24px;
      padding-right: 5px;
    }

    .members {
      display: flex;
      width: 100%;
      flex-direction: column;
      padding-bottom: 50px;
    }
    .item {
      position: relative;
      max-width: 300px;
      padding: 10px;
      border: 5px inset rgb(195, 195, 195);
      background: rgb(155, 155, 155);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .item > h4 {
      font-size: 17px;
      margin: 10px 0;
    }
    .item > p {
      font-size: 13px;
      margin: 3px 0;
      font-weight: 100;
      word-break: break-all;
    }
    h3 {
      color: rgba(197, 172, 9, 1);
      font-size: 25px;
      font-weight: 800;
      margin-bottom: 20px;
    }
    .item > img {
      width: 170px;
    }
    .licence {
      padding-bottom: 50px;
    }
    .licence > div {
      padding-bottom: 10px;
    }
    .licence h4 {
      font-size: 17px;
      margin: 10px 0;
    }
    .licence p {
      font-size: 13px;
      margin: 3px 0;
      font-family: 'Galmuri14';
      font-weight: 100;
      word-break: break-all;
    }
    .licence img {
      width: 200px;
    }
  }
`


const About = () => {
  return (
    <Container>
      <div className="about">
        <h3>ABOUT</h3>
        <img src="/images/mascot_white.png"/>
        <img src="/images/mascot_white.png"/>
        <img src="/images/mascot_white.png"/>
        <img src="/images/mascot_white.png"/>
        <img src="/images/mascot_white.png"/>
        <img src="/images/mascot_white.png"/>
        <img src="/images/mascot_white.png"/>
        <p>noryangjinLAB™ ver 2.0.3 released on 2023.05.21</p>
        <p>contact : hlawliet113@gmail.com</p>
        <p>address : 서울특별시 동작구 노들로2길 7</p>
      </div>

      <h3>MEMBERS</h3>
      <div className="members">
        <div className="item">
          <img src="/images/na.jpg"/>
          <h4>주인장</h4>
          <p>노량진랩 전자제품 분해 부서 담당</p>
          <p>재료공학과 재학</p>
          <p>만화 삼국지 6회독</p>
        </div>
      </div>

      <div className="licence">
        <h3>LICENCES</h3>
        <div>
          <h4>Font: 갈무리9</h4>
          <p>© 2019-2023 Minseo Lee (itoupluk427@gmail.com)</p>
          <p>Galmuri는 SIL 오픈 폰트 라이선스 1.1에 따라 사용할 수 있으며, 폰트가 자체적으로 판매되지 않는 한 자유롭게 사용·연구·수정·재배포할 수 있습니다.</p>
          <p>@import url('https://cdn.jsdelivr.net/npm/galmuri@latest/dist/galmuri.css');</p>
        </div>
        <div>
          <h4>Font: 갈무리14</h4>
          <p>© 2019-2023 Minseo Lee (itoupluk427@gmail.com)</p>
          <p>Galmuri는 SIL 오픈 폰트 라이선스 1.1에 따라 사용할 수 있으며, 폰트가 자체적으로 판매되지 않는 한 자유롭게 사용·연구·수정·재배포할 수 있습니다.</p>
          <p>{`
            @font-face {font-family: 'Galmuri14'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2506-1@1.0/Galmuri14.woff2') format('woff2'); font-display: swap;`}
          </p>
        </div>
        <div>
          <h4>Logo</h4>
          <img src="/logo/noryangjinlab2.png"/>
          <p>© 2026 H_Lawliet (hlawliet113@gmail.com)</p>
          <p>noryangjinLAB™은 CC BY-NC-SA 4.0 라이선스 하에 제공됩니다. 상업적 목적의 판매 및 이용은 금지되며, 수정 및 재배포 시 동일한 라이선스를 적용해야 합니다.</p>
        </div>
      </div>
    </Container>
  )
}

export default About