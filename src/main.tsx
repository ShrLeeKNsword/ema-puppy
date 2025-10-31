import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// 引入SemiUI的全局样式
import '@douyinfe/semi-ui/dist/css/semi.min.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
