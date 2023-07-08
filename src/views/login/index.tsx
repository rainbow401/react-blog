import React, { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Form, Input, message } from "antd";

import styles from "./login.module.scss";

import { CaptchaAPI, LoginAPI } from "@/request/api";
import { HTML_BASE64_PNG, TOKEN_KEY } from "@/constant/Common";
import { error } from "console";

const Login: React.FC = () => {
  useEffect(() => {}, []);

  const [messageApi, contextHolder] = message.useMessage();

  const navigateTo = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");

  const usernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };
  const passwordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  const captchaChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCaptcha(e.target.value);
  };

  const login = async (username: string, password: string) => {
    console.log("登陆", username, password);
    if (!username.trim() || !password.trim()) {
      message.error("请完整输入信息");
      return;
    }

    LoginAPI({
      username: username,
      password: password,
    })
      .then((res: any) => {
        console.log(res);
        if (res.code === 200 && res.success) {
          message.success("登陆成功");
          localStorage.setItem(TOKEN_KEY, res.data);
          navigateTo("/home");
        } else {
          message.error(res.data.message);
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  const onFinish = (values: any) => {
    console.log(values);
    login(values.username, values.password);
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
