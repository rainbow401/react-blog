import React from 'react'
import ReactDOM from 'react-dom/client'
// 样式初始化
import "reset-css"

//UI框架
import {ConfigProvider} from 'antd';

// 全局样式
import "@/assets/style/global.scss"
// 组件样式
import App from './App'
import {BrowserRouter} from "react-router-dom"
// import Router from "./router"
// 状态管理
import {Provider} from 'react-redux'
import store from '@/store'

const data = {
  "token": {
    "colorPrimary": "#52C41A"
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
  <Provider store={store}>
    <React.Suspense>
      <BrowserRouter>
        <ConfigProvider
          theme={{token: {colorPrimary: data.token.colorPrimary}}}
        >
          <App/>
        </ConfigProvider>
      </BrowserRouter>
    </React.Suspense>
  </Provider>
  // </React.StrictMode>,
)
