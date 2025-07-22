import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/Login";
import Register from "../pages/Register";
import HomePage from "../pages/Home";
import ErrorPage from "../pages/Error";
import Invoice from "../pages/Invoice";
import UserPage from "../pages/Users";
import OrdersPage from "../pages/Orders";
import MLAnalyzer from "../pages/MLAnalyzer";

export const Routes = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        path: "/",
        Component: HomePage,
      },
      {
        path: "/invoice",
        Component: Invoice,
      },
      {
        path: "/user",
        Component: UserPage,
      },
      {
        path: "/orders",
        Component: OrdersPage,
      },

      {
        path: "ml-analyzer",
        Component: MLAnalyzer,
      },

      {
        path: "*",
        Component: ErrorPage,
      },
    ],
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
]);
