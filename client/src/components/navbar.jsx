import '../styles/navbar.css'

export const Navbar = () => {
  return (
    <div className='nav'>
      <ul>
        <li><a href='/'>홈</a></li>
        <li><a href='/about'>About</a></li>
        <li><a href='/lab'>연구활동</a></li>
        <li><a href='/updates'>패치노트</a></li>
        <li><a href='/channel'>@ 채널</a></li>
        <li><a href='/cloud'>저장소(베타)</a></li>
      </ul>
    </div>
  )
}