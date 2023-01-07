import React, {useState} from 'react';
import {Menu, MenuProps} from "antd";
import {DesktopOutlined, FileOutlined, PieChartOutlined, TeamOutlined, UserOutlined} from "@ant-design/icons";
import {useNavigate, useLocation} from "react-router-dom";

type MenuItem = Required<MenuProps>['items'][number];
//
// function getItem(
//   label: React.ReactNode,
//   key: React.Key,
//   icon?: React.ReactNode,
//   children?: MenuItem[],
// ): MenuItem {
//   return {
//     key,
//     icon,
//     children,
//     label,
//   } as MenuItem;
// }
//
// const items: MenuItem[] = [
//   getItem('栏目 1', '/page1', <PieChartOutlined/>),
//   getItem('栏目 2', '/page2', <DesktopOutlined/>),
//   getItem('User', 'sub1', <UserOutlined/>, [
//     getItem('Tom', '3'),
//     getItem('Bill', '4'),
//     getItem('Alex', '5'),
//   ]),
//   getItem('Team', 'sub2', <TeamOutlined/>, [getItem('Team 1', '6'), getItem('Team 2', '8')]),
//   getItem('Files', '9', <FileOutlined/>),
// ];

const items: MenuItem[] = [
  {
    label: '栏目1',
    key: '/page1',
    icon: <PieChartOutlined/>
  },
  {
    label: '栏目2',
    key: '/page2',
    icon: <PieChartOutlined/>
  },
  {
    label: '栏目3',
    key: '/page3',
    icon: <PieChartOutlined/>,
    children: [
      {
        label: '栏目301',
        key: '/page3/page301'
      },
      {
        label: '栏目32',
        key: '/page3/page302'
      },
    ]
  },
  {
    label: '栏目4',
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

  const [openKeys, setOpenKeys] = useState([firstOpenKey]);


  const onOpenChange: MenuProps['onOpenChange'] = (keys: string[]) => {
    console.log(keys);
    setOpenKeys([keys[keys.length - 1]]);
  };

  return (
    <Menu theme="dark"
          defaultSelectedKeys={[currentRoute.pathname]}
          mode="inline" items={items}
          onClick={menuClick}
          openKeys={openKeys} onOpenChange={onOpenChange}>
    </Menu>
  );
}

export default MainMenu;