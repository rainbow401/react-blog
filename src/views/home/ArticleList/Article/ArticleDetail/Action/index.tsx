import { CommentOutlined, LikeFilled, LikeOutlined } from "@ant-design/icons";
import { Affix, Button } from "antd";
import React, { useState } from "react";

import styles from "./action.module.scss";

function Action() {
  const [likeTop, setLikeTop] = useState(10);
  const [commentTop, setCommentTop] = useState(10);
  return (
    <div>
      <Affix offsetTop={likeTop}>
        <div className={styles.like} onClick={() => setLikeTop(likeTop + 10)}>
          <LikeFilled style={{ fontSize: 20 }} />
        </div>
      </Affix>
      <br />
      <Affix offsetTop={commentTop + 28}>
        <div
          className={styles.comment}
          onClick={() => setCommentTop(commentTop + 10)}
        >
          <CommentOutlined style={{ fontSize: 20 }}/>
        </div>
      </Affix>
    </div>
  );
}

export default Action;
