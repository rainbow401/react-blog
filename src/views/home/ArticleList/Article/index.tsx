import React from "react";

import styles from "./article.module.scss";

import { Card } from "antd";
import ViewAction from "./ViewAction";
import LikeAction from "./LikeAction";
import CommonAction from "./CommonAction";
import Title from "./Title";

function Article(props: Article) {
  return (
    <div className={styles.article}>
      <Card
        className={styles.card}
        title={<Title {...props}></Title>}
        hoverable={true}
        bordered={false}
        actions={[
          <ViewAction count={props.view}></ViewAction>,
          <LikeAction count={props.like}></LikeAction>,
          <CommonAction count={props.comment}></CommonAction>,
        ]}
      >
        {props.content}
      </Card>
    </div>
  );
}

Article.propTypes = {};

export default Article;
