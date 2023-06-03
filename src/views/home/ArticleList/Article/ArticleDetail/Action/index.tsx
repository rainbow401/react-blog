import {
  HeartOutlined,
  LikeOutlined,
  LikeTwoTone,
  MessageOutlined,
} from "@ant-design/icons";

import styles from "./action.module.scss";
import { theme } from "antd";
import { useState } from "react";

function Action() {

  const [like, setLike] = useState(false);

  const [content, setContent] = useState(200);

  const {
    token: { ...token },
  } = theme.useToken();

  const likeCount = 1;
  return (
    <div className={styles.main}>
      <div className={[styles.like, styles.item].join(" ")} onClick={() => setLike(!like)}
      data-content={content}>
        {!like && <LikeOutlined style={{ fontSize: 20 }} />}
        {like && (
          <LikeTwoTone
            style={{ fontSize: 20 }}
            twoToneColor={token.colorPrimary}
          />
        )}
      </div>
      <br />
      <div className={[styles.comment, styles.item].join(" ")}>
        <MessageOutlined style={{ fontSize: 20 }} />
      </div>

      <div className={[styles.heart, styles.item].join(" ")}>
        <HeartOutlined style={{ fontSize: 20 }} />
      </div>
    </div>
  );
}

export default Action;
