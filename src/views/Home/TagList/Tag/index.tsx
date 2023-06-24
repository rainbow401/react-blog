import React, { useRef, memo } from "react";

import { theme } from "antd";

import styles from "./tag.module.scss";
import classNames from "classnames";

function Index(props: {tag: TagInfo, selected: boolean}) {
  console.log(`tag: ${props.tag.id}`)
  return (
    <div className={styles.main}>
      <div className={classNames(styles.tag, {[styles.active]: props.selected})}>{props.tag.name}</div>
    </div>
  );
}

export default memo(Index);
