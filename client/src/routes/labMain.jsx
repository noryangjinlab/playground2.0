import { useNavigate } from "react-router"
import styled from "styled-components"

const Container = styled.div`
  display: flex;
  gap: 20px;
  padding-top: 30px;
  padding-bottom: 200px;
  flex-wrap: wrap;
  align-items: flex-end;

  .item {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    padding: 10px;
    align-items: center;
    min-width: 180px;
  }

  .item:hover {
    color: rgba(197, 172, 9, 1);
  }

  .item > img {
    width: 140px;
  }
  .item > p {
    font-size: calc(15px + 0.2vw);
    font-weight: 1000;
    margin: 0;
    padding: 10px 20px;
  }

  @media (max-width: 1000px) {
    padding-top: 0;

    .item > img {
      width: 120px;
    }
  }
`

const LabMain = () => {

  const navigate = useNavigate()

  return (
    <Container>
      <div className="item" onClick={()=>navigate('/lab/6f9b4f4e-9f2a-4eb0-9b0b-2f0fadc12345')}>
        <img src="/images/icon/fan_pixel.png"/>
        <p>주인장의 연구실</p>
      </div>

      <div className="item" onClick={()=>navigate('/lab-wish')}>
        <img src="/images/icon/com_pixel.png"/>
        <p>WISH의 연구실</p>
      </div>
    </Container>
  )
}

export default LabMain