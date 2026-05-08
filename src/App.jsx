import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import FindHelp from './pages/FindHelp'
import Matching from './pages/Matching'
import GroupChat from './pages/GroupChat'
import Guide from './pages/Guide'
import Publish from './pages/Publish'

export default function App() {
  return (
    <div className="phone-frame">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find-help" element={<FindHelp />} />
        <Route path="/matching" element={<Matching />} />
        <Route path="/chat" element={<GroupChat />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/publish" element={<Publish />} />
      </Routes>
    </div>
  )
}
