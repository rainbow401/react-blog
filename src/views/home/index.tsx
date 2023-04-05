import React from 'react';

import {theme} from "antd";

import styles from './home.module.scss';
import Info from "@/views/home/Info";

function Index() {
  const {
    token: {colorBgContainer, borderRadius},
  } = theme.useToken();

  return (
    <div className={styles.main}>
      <div className={styles.left} style={{background: colorBgContainer, borderRadius: borderRadius}}>
        11
      </div>
      <div style={{width: 15}}></div>
      <div className={styles.info}>
        <Info></Info>
      </div>
    </div>
  );
}

export default Index;