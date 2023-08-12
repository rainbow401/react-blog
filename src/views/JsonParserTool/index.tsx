import React, {memo, useEffect, useState} from "react";
import styles from './json.tool.module.scss'
import {Button, Tree} from "antd";
import TextArea from "antd/es/input/TextArea";
import convertTree, {DataNode} from './convert'
import {data} from "@/views/JsonParserTool/data";

function index() {
  const [value, setValue] = useState('');
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [defaultExpandAll, setDefaultExpandAll] = useState<boolean>(true);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);


  const format = () => {
    console.log('format')
    try {
      setTreeData([]);
      setTreeData(convertTree(JSON.parse(value)));
    } catch (e) {
      alert('格式错误');
      return [];
    }
  }


  useEffect(() => {
    console.log('useEffect');
  }, []);


  return (
      <div className={styles.main}>
        <div className={styles.jsonContent}>
          <div className={styles.title}>Json数据</div>
          <div className={styles.action}>
            <Button size={'small'} onClick={format}>格式化</Button>
          </div>
          <div className={styles.content}>
            <TextArea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoSize={{minRows: 19, maxRows: 19}}
                bordered={false}
            />
          </div>
        </div>
        <div className={styles.viewContent}>
          <div className={styles.title}>视图</div>
          <div className={styles.content}>
            {treeData.length > 0 && <Tree treeData={treeData} defaultExpandAll={defaultExpandAll} virtual={false}/>}
          </div>
        </div>
      </div>
  );
}

export default memo(index);
