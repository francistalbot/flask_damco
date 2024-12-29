import { createRoot} from 'react-dom/client'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import ProductList from './Components/ProductList';
import './i18n'; 

const routes = [
    { 
        path: '/',
        element : (
            <div>
                <ProductList/>
            </div>
        ),
    }
]

createRoot(document.getElementById('root')).render(
    <RouterProvider
        router={createBrowserRouter(routes)}
        />
);