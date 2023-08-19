import React, {Key, memo, useEffect, useState} from "react";
import styles from './json.tool.module.scss'
import {Button, message, Tree} from "antd";
import TextArea from "antd/es/input/TextArea";
import convertTree, {DataNode} from './convert'
import {EventDataNode} from "antd/es/tree";
import Search from "antd/es/input/Search";
import NodeIcon from "@/views/JsonParserTool/NodeIcon";
import {AntdTreeNodeAttribute} from "antd/es/tree/Tree";

function index() {
  const [value, setValue] = useState('');
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  // 格式化
  const format = () => {
    try {
      setTreeData(convertTree(JSON.parse(value)));
    } catch (e) {
      message.error('格式错误');
      setValue('');
      return [];
    }
  }

  // 展开全部
  const expandAll = () => {
    let allKeys = new Array<string>();
    for (let e of treeData) {
      const keys = collectKeys(e);
      allKeys = [...allKeys, ...keys];
    }

    setExpandedKeys(allKeys);
  }

  const shrinkAll = () => {
    setExpandedKeys([]);
  }

  // 展开单个时
  const onExpand = (expandedKeys: Key[], info: {
    node: EventDataNode<DataNode>;
    expanded: boolean;
    nativeEvent: MouseEvent;
  }) => {

    if (info.expanded) {
      setExpandedKeys([...expandedKeys, info.node.key]);
    } else {
      setExpandedKeys(expandedKeys.filter(key => key !== info.node.key));
    }
  }

  // 遍历树，手机所有key
  function collectKeys(node: DataNode): Array<string> {
    const keys: Array<string> = new Array<string>();
    const dfs = (node: DataNode) => {
      keys.push(node.key);
      if (node.children) {
        for (const child of node.children) {
          dfs(child);
        }
      }
    };
    dfs(node);
    return keys;
  }

  // 选中单个时
  const onSelect = (selectedKeys: Key[], info: {
    event: 'select';
    selected: boolean;
    node: EventDataNode<DataNode>;
    selectedNodes: DataNode[];
    nativeEvent: MouseEvent;
  }) => {
    console.log('onSelect',selectedKeys, info)
    if (info.selected) {
      setSelectedKeys([...selectedKeys, info.node.key]);
    } else {
      setSelectedKeys(selectedKeys.filter(key => key !== info.node.key));
    }
  }

  // 搜索框点击搜索或回车
  const onSearch = (value: string, event: any) => {
    if (event.type === 'click' || event.type === 'keydown') {
      if (treeData.length > 0) {
        let allKeys: string[] = [];
        for (let e of treeData) {
          let keys = findKeysWithContent(e, value);
          allKeys = [...allKeys, ...keys];
        }

        message.info(`搜索到 ${allKeys.length} 个结果`);
        setSelectedKeys(allKeys);
        setExpandedKeys(allKeys);
        console.log('allkeys',allKeys);
        console.log('selected',selectedKeys);
      }
    }
  }

  // 递归函数用于遍历树并找出包含指定内容的节点的 key
  function findKeysWithContent(node: DataNode, content: string): string[] {
    let foundKeys: string[] = [];

    // 检查当前节点的 title 是否包含指定内容
    if (node.title.includes(content)) {
      foundKeys.push(node.key);
    }

    // 递归遍历子节点
    if (node.children) {
      for (const childNode of node.children) {
        foundKeys = foundKeys.concat(findKeysWithContent(childNode, content));
      }
    }

    return foundKeys;
  }

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
          <div className={styles.action}>
            <Button size={'small'} onClick={expandAll}>全部展开</Button>
            <Button size={'small'} style={{marginLeft: 5}} onClick={shrinkAll}>全部收缩</Button>
            <Search size={'small'} style={{ marginBottom: 8, marginLeft: 5 }} onSearch={onSearch} placeholder="查找"/>
          </div>
          <div className={styles.content}>
            {
              treeData.length > 0 &&
                <Tree treeData={treeData}
                      expandedKeys={expandedKeys}
                      onExpand={onExpand}
                      autoExpandParent={true}
                      selectedKeys={selectedKeys}
                      onSelect={onSelect}
                      multiple={true}
                      icon={(nodeProps: AntdTreeNodeAttribute) => <NodeIcon {...nodeProps}/>}
                      showIcon={true}
                      />
            }
          </div>
        </div>
      </div>
  );
}

export default memo(index);
