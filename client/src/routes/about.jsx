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
        <p>노량진랩 전자제품 분해 부서 책임자</p>
        <p>재료공학과 재학</p>
        <p>만화 삼국지 6회독</p>

        <img src="/images/mascot.jpg"/>
        <h4>쭈꾸미볶음(진)</h4>
        <p>노량진랩 마케팅 부서 소속</p>
      </div>
    </Container>
  )
}

export default About