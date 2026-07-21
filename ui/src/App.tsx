import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Library } from './pages/Library'
import { Reading } from './pages/Reading'
import { Vocab } from './pages/Vocab'
import { VocabDetail } from './pages/VocabDetail'
import { Write } from './pages/Write'
import { Login } from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <div className="shell">
        <Sidebar />
        <main className="stage">
          <Routes>
            <Route path="/" element={<Library />} />
            <Route path="/article/:id" element={<Reading />} />
            <Route path="/article/:id/write" element={<Write />} />
            <Route path="/vocab" element={<Vocab />} />
            <Route path="/vocab/:id" element={<VocabDetail />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
