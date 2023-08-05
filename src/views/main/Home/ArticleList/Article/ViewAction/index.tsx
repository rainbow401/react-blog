import React from "react";
import PropTypes from "prop-types";

import { EyeOutlined } from "@ant-design/icons";

import styles from "./view-action.module.scss";

function ViewAction(props: { count: number }) {
  return (
    <div className={styles.main}>
      <div>
        <EyeOutlined />
      </div>
      <div style={{ marginLeft: 5 }}>{props.count}</div>
    </div>
  );
}

ViewAction.propTypes = {};

export default ViewAction;
