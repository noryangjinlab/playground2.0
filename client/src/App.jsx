import './App.css'
import { Navbar } from './components/navbar'
import { Routes, Route } from 'react-router-dom'
import { Home } from './routes/home'
import { Cloud } from './routes/cloud'
import Updates from './routes/updates'

function App() {

  return (
    <>
      <div className='container'>
        <Navbar/>
        <div className='content'>
          <Routes>
            <Route path='/' element={<Home/>}/>
          </Routes>
          <Routes>
            <Route path='/cloud' element={<Cloud/>}/>
          </Routes>
          <Routes>
            <Route path='/updates' element={<Updates/>}/>
          </Routes>
          <div className='cover'/>
        </div>
      </div>
    </>
  )
}

export default App