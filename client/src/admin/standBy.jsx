import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function Standby() {

  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [standByList, setStandByList] = useState([]);

  async function getMySession() {
    const res = await fetch('https://noryangjinlab.org/auth/me', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      setAdmin(data.username);
      getStandBy();
    } else {
      alert("접근 권한이 없습니다");
      navigate("/");
    }
  }

  async function getStandBy() {
    const res = await fetch('https://noryangjinlab.org/auth/standby', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      setStandByList(data.list);
    } else {
      alert("접근 권한이 없습니다");
      navigate("/");
    }
  }


  useEffect(()=>{
    getMySession();
  }, []);

  return (
    <>
    {
      admin ? (
        <div>
        {
          standByList.map((e, i)=>{
            return (
              <p key={i}>
                아이디:{e.username}&nbsp;&nbsp;이름:{e.name}&nbsp;&nbsp;
                <button onClick={async (event)=>{
                  event.preventDefault();
                  const res = await fetch('https://noryangjinlab.org/auth/confirmstandby', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                      username: e.username,
                      password: e.password,
                      name: e.name,
                      nickname: e.nickname
                    })
                  });
                  const data = await res.json();
                  if (res.ok) {
                    alert(data.message);
                    window.location.reload();
                  } else {
                    alert(data.message);
                  }
                }}>확인</button>
              </p>
            )
          })
        }
        </div>
      ) : (
        null
      )
    }
    </>
  )
}