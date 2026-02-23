import { Route, Routes, Link } from "react-router"
import PlaygroundFood from "./playgroundFood"
import styled from "styled-components"

const Container = styled.div`

  .item {
    margin-top: 40px;
    padding: 15px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 7px;
  }
  a {
    // text-decoration: none;
    color: rgba(197, 172, 9, 1);
    line-height: 30px;
  }
  p {
    font-size: 14px;
    margin: 0;
    padding-top: 10px;
  }
`
const Playground = () => {
  return (
    <Routes>
      <Route path="" element={
        <Container>
          <h2>Playground Main</h2>
          <div className="item">
            <Link to="/playground/0">랜덤 메뉴 선택기</Link>
            <p>- 음식 카테고리 주기적 업데이트</p>
            <p>- 음식 종류 100가지 이상</p>
          </div>
        </Container>
      }/>
      <Route path="0" element={<PlaygroundFood/>}/>
    </Routes>
  )
}

export default Playground