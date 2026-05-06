import { createBrowserRouter } from "react-router-dom";
import Landing from "./pages/Landing";
import InvoiceCreation from "./pages/InvoiceCreation";
import InvoicePreview from "./pages/InvoicePreview";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import { Toaster } from "sonner";
import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster position="bottom-right" theme="system" />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Landing />,
      },
      {
        path: "/invoice",
        element: <InvoiceCreation />,
      },
      {
        path: "/preview",
        element: <InvoicePreview />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
    ],
  },
]);
