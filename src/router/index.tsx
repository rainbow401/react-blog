import Home from "@/views/Home";
// import About from "@/views/About";
import {Navigate} from "react-router-dom"
import React, {lazy} from "react"
import Page301 from "@/views/Page301";
// import User from "@/views/User";
import Login from "@/views/login"

const About = lazy(() => import("../views/About"))
const User = lazy(() => import("../views/User"))
const Page1 = lazy(() => import("../views/Page1"))
const Page2 = lazy(() => import("../views/Page2"))


const routes = [
  {
    path: "/",
    element: <Navigate to={"/page1"}></Navigate>
  },
  {
    path: "/",
    element: <Home/>,
    children: [
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
    ]
  },
  {
    path: '/login',
    element: <Login/>
  },
  {
    path: "*",
    element: <Navigate to={"/page1"}></Navigate>
  },

  // {
  //   path: "/about",
  //   element: <About/>
  // }, {
  //   path: "/home",
  //   element: <Home/>
  // }, {
  //   path: "/user",
  //   element: <User/>
  // },
]

export default routes