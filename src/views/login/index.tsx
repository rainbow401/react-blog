import React, {ChangeEvent, useEffect, useState} from "react";
import styles from "./login.module.scss"
import initLoginBg from "@/views/login/init.ts";
import "./login.less"
import {Button, Input, Space} from "antd";

const Login: React.FC = () => {

  useEffect(() => {
    initLoginBg();
    window.onresize = function () {initLoginBg()};
  }, [])

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');

  const usernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  }
  const passwordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }
  const captchaChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCaptcha(e.target.value);
  }

  const login = () => {
    console.log('登陆',username, password, captcha)
  }

  return (
    <div className={styles.loginPage}>
      {/*背景图片*/}
      <canvas id={'canvas'} style={{display: 'block'}}></canvas>
      {/*登录盒子*/}
      <div className={styles.loginBox + ' loginbox'}>
        {/* 标题部分 */}
        <div className={styles.title}>
          <h1>前端乐哥&nbsp;·&nbsp;通用后台系统</h1>
          <p>Strive Everyday</p>
        </div>
        {/*表单部分*/}
        <div className={'form'}>
          <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <Input placeholder={'用户名'} onChange={usernameChange}></Input>
            <Input.Password placeholder="密码" onChange={passwordChange}/>
            <div className={'captchaBox'}>
              <Input placeholder={'验证码'} onChange={captchaChange}></Input>
              <div className={'captchaImg'}>
                <img src={'https://img1.baidu.com/it/u=1070984255,945844267&fm=253&fmt=auto&app=138&f=PNG?w=491&h=236'} style={{height: '100%', width:80}} alt={''}></img>
              </div>
            </div>
            <Button type="primary" className={'loginBtn'} block onClick={login}>
              登陆
            </Button>
          </Space>
        </div>
      </div>
    </div>
  )
}

export default Login