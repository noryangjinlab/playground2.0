import styled from 'styled-components';
import Now from '../components/now';


const HomeContainer = styled.div`

`

function Home() {
  return (
    <HomeContainer>
      <h1 style={{margin: 0, padding: '8px 0 25px 0'}}>noryangjinLAB v2.0.1</h1>
      <Now/>
      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
      <div>
        <div>
          <h3>NOTICE</h3>
          <p></p>
        </div>
        <div>
          <h3></h3>
        </div>
      </div>
    </HomeContainer>
  )
};

export default Home;