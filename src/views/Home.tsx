import React, {Suspense, useState} from 'react';
import {Breadcrumb, Layout, theme} from 'antd';
import {Outlet} from "react-router-dom";
import MainMenu from "@/components/MainMenu";

const {Header, Content, Footer, Sider} = Layout;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: {colorBgContainer},
  } = theme.useToken();

  return (
    <Layout style={{minHeight: '100vh'}}>
      {/*做侧边栏*/}
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)'}}/>
        <MainMenu></MainMenu>
      </Sider>
      {/*右边内容*/}
      <Layout className="site-layout">
        {/*右侧头部*/}
        <Header style={{padding: 0, background: colorBgContainer}}/>
        {/*右侧内容*/}
        <Content style={{margin: '0 16px', minHeight: '100%'}}>
          {/*面包屑*/}
          <Breadcrumb style={{margin: '16px 0'}}>
            <Breadcrumb.Item>User</Breadcrumb.Item>
            <Breadcrumb.Item>Bill</Breadcrumb.Item>
          </Breadcrumb>
          {/*右侧中心内容*/}
          <div style={{padding: 24, minHeight: 360, background: colorBgContainer}}>
            <Suspense>
              <Outlet/>
            </Suspense>
          </div>
        </Content>
        {/*右侧底部*/}
        <Footer style={{textAlign: 'center'}}>Ant Design ©2018 Created by Ant UED</Footer>
      </Layout>
    </Layout>
  );
};

export default App;