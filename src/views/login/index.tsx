import React, { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Form, Input, message } from "antd";

import styles from "./login.module.scss";

import { CaptchaAPI, LoginAPI } from "@/request/api";
import { HTML_BASE64_PNG, TOKEN_KEY } from "@/constant/Common";

const Login: React.FC = () => {
  useEffect(() => {
    getCaptchaImg();
  }, []);

  const [messageApi, contextHolder] = message.useMessage();

  const navigateTo = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaImg, setCaptchaImg] = useState("");

  const usernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };
  const passwordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  const captchaChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCaptcha(e.target.value);
  };

  const login = async () => {
    console.log("登陆", username, password, captcha);
    if (!username.trim() || !password.trim() || !captcha.trim()) {
      messageApi.error("请完整输入信息");
      return;
    }
    const loginAPIRes = await LoginAPI({
      username: username,
      password: password,
      code: captcha,
      uuid: localStorage.getItem("uuid") as string,
    });

    console.log(loginAPIRes);
    if (loginAPIRes.code === 200) {
      message.success("登陆成功");
      localStorage.setItem(TOKEN_KEY, loginAPIRes.token);
      navigateTo("/page1");
      localStorage.removeItem("uuid");
    }
  };

  const getCaptchaImg = async () => {
    const captchaAPIRes: CaptchaAPIRes = await CaptchaAPI();
    console.log(captchaAPIRes);
    if (captchaAPIRes.code === 200) {
      setCaptchaImg(HTML_BASE64_PNG + captchaAPIRes.img);
      localStorage.setItem("uuid", captchaAPIRes.uuid);
    } else {
      alert("请求验证码失败");
    }
  };

  const onFinish = (values: any) => {
    message.success("登陆成功");
    localStorage.setItem(TOKEN_KEY, "test");
    navigateTo("/home");
    localStorage.removeItem("uuid");
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginBox}>
        <div className={styles.form}>
          <div className={styles.img}>你好</div>
          <div className={styles.items}>
            <div className={styles.item}>
              <Form
                name="basic"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 8 }}
                style={{ maxWidth: 600 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
              >
                <Form.Item
                  label="用户名"
                  name="username"
                  rules={[{ required: true, message: "请输入用户名" }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="密码"
                  name="password"
                  rules={[{ required: true, message: "请输入密码" }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 10, span: 16 }}>
                  <Button type="primary" htmlType="submit">
                    登陆
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
