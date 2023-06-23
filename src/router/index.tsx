// import About from "@/views/About";
import {Navigate} from "react-router-dom"
import React, {lazy} from "react"
import Login from "@/views/Login"
import Main from "@/views/Main";
import Home from "@/views/Home";
import ArticleList from "@/views/Home/ArticleList";
import ArticleDetail from "@/views/Home/ArticleList/Article/ArticleDetail";

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
        element: <Home/>
      },
      {
        path: "/articles",
        element: <ArticleList/>,
      },
      {path: "/articles/detail/:id", element: <ArticleDetail/>}
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