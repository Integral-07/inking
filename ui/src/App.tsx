import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/auth'
import { Sidebar } from './components/Sidebar'
import { RequireAuth } from './components/RequireAuth'
import { Library } from './pages/Library'
import { Reading } from './pages/Reading'
import { Vocab } from './pages/Vocab'
import { VocabDetail } from './pages/VocabDetail'
import { Write } from './pages/Write'
import { WritingList } from './pages/WritingList'
import { Help } from './pages/Help'
import { Settings } from './pages/Settings'
import { Welcome } from './pages/Welcome'
import { Login } from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="shell">
          <Sidebar />
          <main className="stage">
            <Routes>
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Library />
                  </RequireAuth>
                }
              />
              <Route
                path="/article/:id"
                element={
                  <RequireAuth>
                    <Reading />
                  </RequireAuth>
                }
              />
              <Route
                path="/article/:id/write"
                element={
                  <RequireAuth>
                    <Write />
                  </RequireAuth>
                }
              />
              <Route
                path="/vocab"
                element={
                  <RequireAuth>
                    <Vocab />
                  </RequireAuth>
                }
              />
              <Route
                path="/vocab/:id"
                element={
                  <RequireAuth>
                    <VocabDetail />
                  </RequireAuth>
                }
              />
              <Route
                path="/writings"
                element={
                  <RequireAuth>
                    <WritingList />
                  </RequireAuth>
                }
              />
              <Route
                path="/settings"
                element={
                  <RequireAuth>
                    <Settings />
                  </RequireAuth>
                }
              />
              <Route path="/help" element={<Help />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
