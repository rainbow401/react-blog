import React from 'react'
import ReactDOM from 'react-dom/client'
// 样式初始化
import "reset-css"

//UI框架
// 全局样式
import "@/assets/style/global.scss"
// 组件样式
import App from './App'
import {BrowserRouter} from "react-router-dom"
// import Router from "./router"
// 状态管理
import {Provider} from 'react-redux'
import store from '@/store'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
  <Provider store={store}>
    <React.Suspense>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.Suspense>
  </Provider>
  // </React.StrictMode>,
)
