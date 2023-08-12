import React, {useState} from 'react';
import {Menu, MenuProps} from "antd";
import {BookOutlined, CommentOutlined, HomeOutlined, PieChartOutlined, ToolOutlined} from "@ant-design/icons";
import {useLocation, useNavigate} from "react-router-dom";
import styles from './main-menu.module.scss'

import log from '@/assets/img/logo/logo (1)11.png'

type MenuItem = {
  label: string,
  key: string,
  icon: any,
  children?: SubMenuItem[],
  disabled?: boolean
}

type SubMenuItem = {
  label: string,
  key: string,
}

const items: MenuItem[] = [
  // {
  //   label: '',
  //   key: '/home1',
  //   icon: <img src={log} className={styles.log}/>,
  //   disabled: true
  // },
  {
    label: '首页',
    key: '/home',
    icon: <HomeOutlined/>
  },
  {
    label: '文章',
    key: '/articles',
    icon: <BookOutlined/>
  },
  {
    label: '留言',
    key: '/page2',
    icon: <CommentOutlined/>
  },
  {
    label: '工具',
    key: '/page3',
    icon: <ToolOutlined/>,
    children: [
      {
        label: '正则表达式',
        key: '/page3/page301'
      },
      {
        label: 'Json格式化',
        key: '/json/parser'
      },
    ]
  },
  {
    label: '其他',
    key: '/page4',
    icon: <PieChartOutlined/>,
    children: [
      {
        label: '栏目41',
        key: '/page4/page401'
      },
      {
        label: '栏目42',
        key: '/page4/page402'
      },
    ]
  },
];

const MainMenu: React.FC = () => {
  const navigateTo = useNavigate();
  const currentRoute = useLocation();
  // console.log(currentRoute)
  const menuClick = (e: { key: string }) => {
    console.log("点击了菜单" + e.key, e)
    // 点击跳转到对应的路由 编程式导航跳转
    navigateTo(e.key);
  }


  let firstOpenKey: string = '';
  const strings = currentRoute.pathname.split('/');
  if (strings.length > 2) {
    firstOpenKey = '/' + strings[1];
  }
  const [openKeys, setOpenKeys] = useState([firstOpenKey]);

  const onOpenChange: MenuProps['onOpenChange'] = (keys: string[]) => {
    setOpenKeys([keys[keys.length - 1]]);
  };

  return (
    <Menu className={styles.menu}
          defaultSelectedKeys={[currentRoute.pathname]}
          mode="horizontal" items={items}
          onClick={menuClick}
          openKeys={openKeys} onOpenChange={onOpenChange}>
    </Menu>
  );
}

export default MainMenu;