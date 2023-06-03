import React from "react";

import styles from "./article.module.scss";

import { Card, theme } from "antd";
import ViewAction from "./ViewAction";
import LikeAction from "./LikeAction";
import CommonAction from "./CommonAction";
import Title from "./Title";
import { useNavigate } from "react-router-dom";

function Article(props: Article) {

  const navigateTo = useNavigate()


  const articleDetail = () => {
    console.log("articleDetail")
    navigateTo(`/articles/detail/${props.id}`);
  }

  return (
    <div className={styles.article}>
      <Card
        key={props.id + 'card'}
        className={styles.card}
        title={<Title {...props}></Title>}
        hoverable={true}
        bordered={false}
        actions={[
          <ViewAction count={props.view}></ViewAction>,
          <LikeAction count={props.like}></LikeAction>,
          <CommonAction count={props.comment}></CommonAction>,
        ]}
        onClick={articleDetail}
      >
        <div className={styles.content}>{props.content}</div>
      </Card>
    </div>
  );
}

Article.propTypes = {};

export default Article;
