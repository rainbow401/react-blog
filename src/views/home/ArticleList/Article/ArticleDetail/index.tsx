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

  const article: Article = {
    id: 1,
    title: "文章1手机打开老师叫啊打开链接阿斯利康的",
    author: "2",
    time: new Date(),
    content: "内容啥的流口水了叩丁狼撒开了都快撒开的喀什宽度a3",
    view: 1,
    like: 2,
    comment: 3,
    username: "闫志浩",
    tags: ["后端", "Java", "Spring"],
    heart: 1
  };

  const {
    token: { colorBgContainer, borderRadius },
  } = theme.useToken();

  return (
    <div className={styles.main} style={{ borderRadius: borderRadius }}>
      <div className={styles.action} style={{ borderRadius: borderRadius }}>
        <Action {...article}/>
      </div>
      <div className={styles.content} style={{ borderRadius: borderRadius }}>
        <Content />
      </div>
      {/* <div className={styles.info} style={{ borderRadius: borderRadius }}>
        <Info />
      </div> */}
    </div>
  );
}

ArticleDetail.propTypes = {};

export default ArticleDetail;
