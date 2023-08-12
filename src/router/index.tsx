// import About from "@/views/About";
import {Navigate} from "react-router-dom"
import React, {lazy} from "react"
import Login from "@/views/Login"
import Main from "@/views/Main";
import Home from "@/views/Main/Home";
import ArticleList from "@/views/Main/Home/ArticleList";
import ArticleDetail from "@/views/Main/Home/ArticleList/Article/ArticleDetail";
import UploadArticle from "@/views/Main/Avatar/UploadArticle";
import JsonParserTool from "@/views/JsonParserTool";

// const About = lazy(() => import("../views/About"))
// const User = lazy(() => import("../views/User"))
// const Page1 = lazy(() => import("../views/page1"))
// const Page2 = lazy(() => import("../views/Page2"))


const routes = [
  {
    path: "/",
    element: <Navigate to={"/login"}></Navigate>
  },
  {
    path: "/",
    element: <Main/>,
    children: [
      {
        path: "/home",
        element: <Home/>,
        children: []
      },
      {
        path: "/articles",
        element: <ArticleList/>,
      },
      {path: "/articles/detail/:id", element: <ArticleDetail/>},
      {
        path: "/upload",
        element: <UploadArticle/>
      },
      {
        path: 'json/parser',
        element: <JsonParserTool/>
      }
    ]
  },
  {
    path: '/login',
    element: <Login/>
  },
  {
    path: "*",
    element: <Navigate to={"/home"}></Navigate>
  },
]

export default routes