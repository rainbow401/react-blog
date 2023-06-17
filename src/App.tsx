import {useEffect, useState, memo} from 'react'
import {useLocation, useNavigate, useRoutes} from "react-router-dom";
import {message, theme} from 'antd'
import router from "./router"

function BeforeRouterEnter() {
  const location = useLocation();
  const outlet = useRoutes(router);
  // 后台管理系统两种经典的跳转情况：
  // 1、如果访问的是登陆页面，并且有token，跳转到首页
  // 2、如果不是登陆也，没有token，跳转到登陆页
  console.log(outlet)

  if (location.pathname === '/login' && localStorage.getItem('react-admin-token')) {
    return <ToIndex/>
  }

  if (location.pathname !== '/login' && !localStorage.getItem('react-admin-token')) {
    return <ToLogin/>
  }

  console.log("outlet")

  return outlet;
}

function ToLogin() {
  const navigateTo = useNavigate()

  useEffect(() => {
    // 加载完组件之后执行这里的代码
    navigateTo('/login')
    message.warning('您还没有登录，请登录后再访问！')
  },[])
  return <></>
}

function ToIndex() {
  const navigateTo = useNavigate()

  useEffect(() => {
    // 加载完组件之后执行这里的代码
    navigateTo('/home')
    // message.warning('您已经登录过了！')
  },[])
  return <></>
}

function App() {

  const {
    token: {...token},
  } = theme.useToken();

  console.log(token, '===')
  const [count, setCount] = useState(0)

  return (
    <div className="App" style={{minHeight: '100vh', margin: 0}}>
      <BeforeRouterEnter></BeforeRouterEnter>
    </div>
  )
}

export default memo(App)
