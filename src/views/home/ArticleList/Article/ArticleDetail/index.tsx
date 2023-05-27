import React from "react";
import PropTypes from "prop-types";

import styles from "./article-detail.module.scss";
import { useParams } from "react-router-dom";
import { theme } from "antd";
import Content from "./Content";
import Action from "./Action";
import Info from "./Info";

function ArticleDetail() {
  const { id } = useParams();
  console.log(`ArticleDetail ${id}`);

  const {
    token: { colorBgContainer, borderRadius },
  } = theme.useToken();

  return (
    <div className={styles.main} style={{ borderRadius: borderRadius }}>
      <div className={styles.action} style={{ borderRadius: borderRadius }}>
        <Action/>
      </div>
      <div className={styles.content} style={{ borderRadius: borderRadius }}>
        <Content/>
      </div>
      <div className={styles.info} style={{ borderRadius: borderRadius }}>
        <Info/>
      </div>
    </div>
  );
}

ArticleDetail.propTypes = {};

export default ArticleDetail;
