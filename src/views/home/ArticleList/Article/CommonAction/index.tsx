import React from "react";
import PropTypes from "prop-types";

import { CommentOutlined } from "@ant-design/icons";

import styles from "./common-action.module.scss"

function CommonAction(props: { count: number }) {
  return (
    <div className={styles.main}>
      <div >
      <CommentOutlined />
      </div>
      <div style={{ marginLeft: 5 }}>{props.count}</div>
    </div>
  );
}

CommonAction.propTypes = {};

export default CommonAction;
