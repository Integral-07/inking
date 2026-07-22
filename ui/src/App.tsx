import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Library } from './pages/Library'
import { Reading } from './pages/Reading'
import { Vocab } from './pages/Vocab'
import { VocabDetail } from './pages/VocabDetail'
import { Write } from './pages/Write'
import { WritingList } from './pages/WritingList'
import { Help } from './pages/Help'
import { Settings } from './pages/Settings'
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
            <Route path="/writings" element={<WritingList />} />
            <Route path="/help" element={<Help />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
