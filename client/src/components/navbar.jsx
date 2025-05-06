import '../styles/navbar.css'

export const Navbar = () => {
  return (
    <div className='nav'>
      <ul>
        <li><a href='/'>홈</a></li>
        <li>About</li>
        <li>연구활동</li>
        <li>패치노트</li>
        <li>@ 채널</li>
        <li><a href='/cloud'>저장소(베타)</a></li>
      </ul>
    </div>
  )
}