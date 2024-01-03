import { Outlet, ScrollRestoration } from "react-router-dom"
import MainNavbar from "../components/navbars/MainNavbar"

export default function RootLayout() {
  return (
    <div className="root-layout">
      <ScrollRestoration />
      <MainNavbar/>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
