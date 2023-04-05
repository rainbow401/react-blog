import React, {Suspense} from 'react';
import {Outlet} from "react-router-dom";

import {Layout} from 'antd';
import MainMenu from "@/components/MainMenu";
import MyAvatar from "@/views/main/header/avatar";
import styles from './main.module.scss';

const {Header, Content} = Layout;

const App: React.FC = () => {

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header} style={{background: "white"}}>
        <div className={styles.logo}></div>
        <MainMenu/>
        <div className={styles.others}>
          <MyAvatar></MyAvatar>
        </div>
      </Header>
      <Content className={styles.content}>
        <div className={styles.div}>
          <Suspense>
            <Outlet/>
          </Suspense>
        </div>
      </Content>
    </Layout>
  );
};

export default App;