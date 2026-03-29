import styled from "styled-components"

const Container = styled.div`
  a {
    color: rgb(197, 172, 9);
  }
`

export default function Services() {
  return (
    <Container>
      <h2>Hosting Services</h2>
      
      <p><a href="/host/pairmaker" target="_blank">그룹교재 조 편성 사이트 (pairmaker)</a></p>
    
      <p><a href="/host/iot" target="_blank">불끄러가기 귀찮다</a></p>
    </Container>
  )
}