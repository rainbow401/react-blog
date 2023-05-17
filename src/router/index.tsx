// import About from "@/views/About";
import {Navigate} from "react-router-dom"
import React, {lazy} from "react"
import Page301 from "@/views/Page301";
// import User from "@/views/User";
import Login from "@/views/login"
import Main from "@/views/main";
import Home from "@/views/home/";
import ArticleList from "@/views/home/ArticleList";

const About = lazy(() => import("../views/About"))
const User = lazy(() => import("../views/User"))
const Page1 = lazy(() => import("../views/page1"))
const Page2 = lazy(() => import("../views/Page2"))


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
        path: "/page1",
        element: <Page1/>
      },
      {
        path: "/page2",
        element: <Page2/>
      },
      {
        path: "/page3/page301",
        element: <Page301/>
      },
      {
        path: "/articles",
        element: <ArticleList/>
      },
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