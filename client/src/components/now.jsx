import { useEffect, useState } from "react";
import styled from "styled-components";


const Clock = styled.div`
  color: rgba(197, 172, 9, 1);
  padding-bottom: 10px;
  font-size: 15px;
  font-weight: 700;

  p {
    margin: 0;
  }
`;

export default function Now() {

  const [now, setNow] = useState(()=>new Date());

  useEffect(()=>{
    const interval = setInterval(()=>{
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Clock>
      <p>(KST) {now.toLocaleDateString()} {now.toLocaleTimeString()}</p>
    </Clock>
  )
}