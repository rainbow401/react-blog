import {
  HeartOutlined,
  HeartTwoTone,
  LikeOutlined,
  LikeTwoTone,
  MessageOutlined,
} from "@ant-design/icons";

import styles from "./action.module.scss";
import { theme } from "antd";
import { useState } from "react";

function Action() {
  const [likeState, setLike] = useState(false);
  const [heartState, setHeart] = useState(false);

  const [content, setContent] = useState(777);

  const {
    token: { ...token },
  } = theme.useToken();

  const likeCount = 1;
  return (
    <div className={styles.main}>
      <div
        className={`${styles.like} ${styles.item}`}
        onClick={() => setLike(!likeState)}
        data-content={content}
        data-color={token.colorPrimary}
      >
        {likeState ? (
          <LikeOutlined style={{ fontSize: 20 }} />
        ) : (
          <LikeTwoTone
            style={{ fontSize: 20 }}
            twoToneColor={token.colorPrimary}
          />
        )}
      </div>
      <div
        className={`${styles.message} ${styles.item}`}
        data-content={content}
      >
        <MessageOutlined style={{ fontSize: 20 }} />
      </div>

      <div
        className={`${styles.heart} ${styles.item}`}
        data-content={content}
        onClick={() => setHeart(!heartState)}
      >
        {heartState ? (
          <HeartOutlined style={{ fontSize: 20 }} />
        ) : (
          <HeartTwoTone
            style={{ fontSize: 20 }}
            twoToneColor={token.colorPrimary}
          />
        )}
      </div>
    </div>
  );
}

export default Action;
