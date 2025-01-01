import { createRoot} from 'react-dom/client'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import "./i18n";
import HomePage from './pages/HomePage';
const routes = [
    { 
        path: '/',
        element : (
            <HomePage/>
        ),
    }
]

createRoot(document.getElementById('root')).render(
    <RouterProvider
        router={createBrowserRouter(routes)}
        />
);