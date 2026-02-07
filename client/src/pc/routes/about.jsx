import styled from "styled-components"

const Container = styled.div`

  h3 {
    color: rgba(197, 172, 9, 1);
    font-size: 25px;
    font-weight: 800;
    margin-bottom: 20px;
  }
  h4 {
    font-size: 17px;
    margin: 7px 0;
  }
  img {
    width: 200px;
  }
  p {
    font-size: 14px;
    margin: 5px 0;
  }
`


const About = () => {
  return (
    <Container>
      <div className="members">
        <h3>MEMBERS</h3>
        <h4>h_lawliet</h4>
        <img src="/images/na.jpg"/>
        <p>- 주식회사<del style={{fontSize: '12px'}}>아니다</del> 노량진랩 운영</p>
        <p>- 재료공학과 재학</p>
        <p>- </p>
      </div>

      <br/><br/><br/>
      <div className="character">
        <h3>MASCOT</h3>
        <img src="/images/mascot.jpg"/>
        <h4>이름 : 쭈꾸미볶음(진)</h4>
        <p>언제든 매콤한 요리로 변모할 가능성이 있다.<br/>시니컬한 성격.</p>
      </div>
    </Container>
  )
}

export default About