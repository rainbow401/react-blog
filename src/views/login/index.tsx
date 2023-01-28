import React, {ChangeEvent, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom'
import styles from "./login.module.scss"
import initLoginBg from "@/views/login/init.ts";
import "./login.less"
import {Button, Input, Space, message} from "antd";

import {CaptchaAPI, LoginAPI} from '@/request/api'
import {HTML_BASE64_PNG} from '@/constant/Common'

const Login: React.FC = () => {

  useEffect(() => {
    initLoginBg();
    window.onresize = function () {
      initLoginBg()
    };
    getCaptchaImg();
  }, [])

  const [messageApi, contextHolder] = message.useMessage();

  const navigateTo = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaImg, setCaptchaImg] = useState('');

  const usernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  }
  const passwordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }
  const captchaChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCaptcha(e.target.value);
  }

  const login = async () => {
    console.log('登陆', username, password, captcha)
    if (!username.trim() || !password.trim() || !captcha.trim()) {
      messageApi.error('请完整输入信息');
      return;
    }
    const loginAPIRes = await LoginAPI({
      username: username,
      password: password,
      code: captcha,
      uuid: localStorage.getItem('uuid') as string
    });

    console.log(loginAPIRes)
    if (loginAPIRes.code === 200) {
      message.success('登陆成功');
      localStorage.setItem('react-admin-token', loginAPIRes.token);
      navigateTo('/page1');
      localStorage.removeItem('uuid');
    }
  }

  const getCaptchaImg = async () => {
    const captchaAPIRes: CaptchaAPIRes = await CaptchaAPI();
    console.log(captchaAPIRes);
    if (captchaAPIRes.code === 200) {
      setCaptchaImg(HTML_BASE64_PNG + captchaAPIRes.img)
      localStorage.setItem('uuid', captchaAPIRes.uuid);
    } else {
      alert('请求验证码失败')
    }
  }

  return (
    <div className={styles.loginPage}>
      {/*背景图片*/}
      <canvas id={'canvas'} style={{display: 'block'}}></canvas>
      {/*登录盒子*/}
      <div className={styles.loginBox + ' loginbox'}>
        {contextHolder}
        {/* 标题部分 */}
        <div className={styles.title}>
          <h1>前端乐哥&nbsp;·&nbsp;通用后台系统</h1>
          <p>Strive Everyday</p>
        </div>
        {/*表单部分*/}
        <div className={'form'}>
          <Space direction="vertical" size="middle" style={{display: 'flex'}}>
            <Input placeholder={'用户名'} onChange={usernameChange}></Input>
            <form>
              <Input.Password placeholder="密码" autoComplete={'off'} onChange={passwordChange}/>
            </form>
            <div className={'captchaBox'}>
              <Input placeholder={'验证码'} onChange={captchaChange}></Input>
              <div className={'captchaImg'} onClick={getCaptchaImg}>
                <img src={captchaImg} style={{height: '100%', width: 80}} alt={''}></img>
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