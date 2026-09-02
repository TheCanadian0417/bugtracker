import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FollowUpTracker from "./FollowUpTracker.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FollowUpTracker />
  </StrictMode>,
)
