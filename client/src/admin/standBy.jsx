import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchApi } from "../api";

export default function Standby() {

  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [standByList, setStandByList] = useState([]);
  const [usersList, setUsersList] = useState([]);


  async function getStandBy() {

    fetchApi('/auth/standby', {
      method: "GET",
    }).then((data)=>{
      setStandByList(data.list)
    }).catch((error)=>{
      alert(error)
      navigate("/")
    })
  }

  async function getAllUsers() {

    fetchApi('/auth/allusers', {
      method: "GET",
    }).then((data)=>{
      setUsersList(data.users)
    }).catch((error)=>{
      alert(error)
      navigate("/")
    })
  }

  async function getMySession() {

    fetchApi('/auth/me', {
      method: "GET",
    }).then((data)=>{
      setAdmin(data.username)
      getStandBy()
      getAllUsers()
    }).catch((error)=>{
      alert("접근 권한이 없습니다")
      navigate("/")
    })
  }


  useEffect(()=>{
    getMySession();
  }, []);

  return (
    <>
    {
      admin ? (
        <>
        <div>
        <h3>대기 목록</h3>
        {
          standByList.map((e, i)=>{
            return (
              <p key={i}>
                아이디:{e.username}&nbsp;&nbsp;이름:{e.name}&nbsp;&nbsp;
                <button onClick={(event)=>{
                  event.preventDefault()

                  fetchApi('/auth/confirmstandby', {
                    method: "POST",
                    body: JSON.stringify({
                      username: e.username,
                      password: e.password,
                      name: e.name,
                      nickname: e.nickname,
                      email: e.email
                    })
                  }).then((data)=>{
                    alert(data.message)
                    window.location.reload()
                  }).catch((error)=>{
                    alert(error.message)
                  })

                }}>확인</button>

                <button onClick={(event)=>{
                  event.preventDefault()

                  fetchApi('/auth/deletestandby', {
                    method: "DELETE",
                    body: JSON.stringify({
                      username: e.username
                    })
                  }).then((data)=>{
                    alert(data.message)
                    window.location.reload()
                  }).catch((error)=>{
                    alert(error.message)
                  })

                }}>삭제</button>
              </p>
            )
          })
        }
        </div>
        <hr/>
        <h3>유저 목록</h3>
        <div>
        {
          usersList.map((e, i)=>{
            return (
              <p key={i}>
                아이디:{e.username}&nbsp;&nbsp;
                이름:{e.name}&nbsp;&nbsp;
                닉네임:{e.nickname}&nbsp;&nbsp;
                이메일:{e.email}&nbsp;&nbsp;

                <button onClick={(event)=>{
                  event.preventDefault()

                  fetchApi('/auth/bye', {
                    method: "POST",
                    body: JSON.stringify({
                      username: e.username
                    })
                  }).then((data)=>{
                    alert(data.message)
                    window.location.reload()
                  }).catch((error)=>{
                    alert(error.message)
                  })

                }}>삭제</button>
              </p>
            )
          })
        }
        </div>
        </>
      ) : (
        null
      )
    }
    </>
  )
}