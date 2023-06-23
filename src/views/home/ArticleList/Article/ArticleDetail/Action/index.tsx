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

function Action(props : Article) {
  const [likeState, setLike] = useState(false);
  const [heartState, setHeart] = useState(false);

  const [likeCount, setLikeCount] = useState(props.like);
  const [messageCount, setMessageCount] = useState(props.comment);
  const [heartCount, setHeartCount] = useState(props.heart);

  const {
    token: { ...token },
  } = theme.useToken();

  return (
    <div className={styles.main}>
      <div
        className={`${styles.like} ${styles.item}`}
        onClick={() => setLike(!likeState)}
        data-content={likeCount}
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
        data-content={messageCount}
      >
        <MessageOutlined style={{ fontSize: 20 }} />
      </div>

      <div
        className={`${styles.heart} ${styles.item}`}
        data-content={heartCount}
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
