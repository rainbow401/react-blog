import React from 'react';

import styles from './info.module.scss';
import {theme} from "antd";

function Index() {
  const {
    token: {colorBgContainer, borderRadius},
  } = theme.useToken();

  return (
    <div className={styles.info} style={{background: colorBgContainer, borderRadius: borderRadius}}>
      其他信息
    </div>
  );
}

export default Index;