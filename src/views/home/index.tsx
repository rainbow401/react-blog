import React, {Suspense, useState} from 'react';
import {Outlet} from "react-router-dom";

import {Button, Layout, theme} from 'antd';
const {Header, Content, Footer} = Layout;

import MainMenu from "@/components/MainMenu";
import MyAvatar from "@/views/home/header/my-avatar";
import styles from './home.module.scss'





const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: {colorBgContainer},
  } = theme.useToken();

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header} style={{background: "white"}}>
        <div className={styles.log}></div>
        <MainMenu/>
        <div className={styles.others}>
          <MyAvatar></MyAvatar>
        </div>
      </Header>
      <Content style={{padding: '0 20px'}}>
        <div className="site-layout-content" style={{
          background: colorBgContainer,
          minHeight: '87vh',
          marginTop: '15px',
          borderRadius: 10
        }}>
          <div style={{padding: "10px 10px 10px 10px"}}>
            <Suspense>
              <Outlet/>
            </Suspense>
          </div>

        </div>
      </Content>
    </Layout>
  );
};

export default App;