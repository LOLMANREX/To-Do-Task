import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicRoute } from './routes/PublicRoute'
import { PrivateRoute } from './routes/PrivateRoute'
import Login from './Page/Login'
import Register from './Page/Register'
import App from './Page/App'
import Home from './Page/Home'
import Settings from './Page/Settings'
import Agenda from './Page/Agenda'
import NotFound from './Page/NotFound'
import DashboardLayout from './layouts/DashboardLayout'

export const router = createBrowserRouter([
    {
        element: <PublicRoute />,
        children: [
            { path: '/login', element: <Login /> },
            { path: '/register', element: <Register /> }
        ]
    },
    {
        element: <PrivateRoute />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    { path: '/dashboard', element: <Home /> },
                    { path: '/tasks', element: <App /> },
                    { path: '/agenda', element: <Agenda /> },
                    { path: '/settings', element: <Settings /> }
                ]
            }
        ]
    },
    { path: '/', element: <Navigate to="/dashboard" replace /> },
    { path: '*', element: <NotFound /> }
])