import './App.css'
import { Analytics } from '@vercel/analytics/react';
import Destination from './pages/destinations/DestinationRandomizer.tsx'

function App() {
  return (
    <>
      <div>
        <Destination />
        <Analytics />
      </div>
    </>
  )
}

export default App