import { Outlet } from "react-router-dom";

export const Layout = () => {
    // Outlet represents all files nested in this element
    return (
        <main className="App">
            <Outlet />
        </main>
    )
}

