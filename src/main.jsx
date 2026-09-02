import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import BugTracker from "./BugTracker.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BugTracker />
  </StrictMode>,
)
