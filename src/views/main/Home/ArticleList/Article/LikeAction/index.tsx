import React from "react";
import PropTypes from "prop-types";

import { EyeOutlined, LikeOutlined } from "@ant-design/icons";

import styles from "./like-action.module.scss";

function LikeAction(props: { count: number }) {
  return (
    <div className={styles.main}>
      <div>
        <LikeOutlined />
      </div>
      <div style={{ marginLeft: 5 }}>{props.count}</div>
    </div>
  );
}

LikeAction.propTypes = {};

export default LikeAction;
