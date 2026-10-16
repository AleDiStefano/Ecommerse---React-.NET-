import { Outlet, RouterProvider, ScrollRestoration, createBrowserRouter } from 'react-router-dom';
import LandingPage from './components/landingPage/LandingPage';
import Register from './components/register/Register';
import Login from './components/login/Login';
import NotFound from './components/notFound/NotFound';
import MainLayout from './components/mainLayout/MainLayout';
import Products from './components/products/Products';
import ProductDetail from './components/productDetail/ProductDetail';
import { CarritoPage } from './components/carrito/Carrito';
import AddProducts from './components/addProducts/AddProducts';
import PayMethod from './components/payMethod/PayMethod';
import UpdateProducts from './components/updateProducts/UpdateProducts';
import UserList from './components/users/UserList';
import UserForm from './components/users/UserForm';
import { Order } from './components/order/Order';
import ProtectedRoute from './components/protectedRoute/ProtectedRoute';
import { ADMIN, STAFF } from './services/authentication/roles';

// Un solo layout para todas las rutas: el navbar no se remonta al navegar y 403/404 salen con navbar y footer.
// Sin `roles` = cualquier usuario logueado; STAFF = vendedor y admin; ADMIN = solo admin.
const router = createBrowserRouter([
  {
    element: (
      <>
        <MainLayout>
          <Outlet />
        </MainLayout>
        <ScrollRestoration />
      </>
    ),
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <Login /> },
      { path: '/registrarse', element: <Register /> },
      { path: '/productos', element: <Products /> },
      { path: '/producto/:id', element: <ProductDetail /> },
      {
        path: '/carrito',
        element: (
          <ProtectedRoute>
            <CarritoPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/nuevoProducto',
        element: (
          <ProtectedRoute roles={STAFF}>
            <AddProducts />
          </ProtectedRoute>
        ),
      },
      {
        path: '/updateproduct/:id',
        element: (
          <ProtectedRoute roles={STAFF}>
            <UpdateProducts />
          </ProtectedRoute>
        ),
      },
      {
        path: '/paymethod',
        element: (
          <ProtectedRoute>
            <PayMethod />
          </ProtectedRoute>
        ),
      },
      {
        path: '/order',
        element: (
          <ProtectedRoute>
            <Order />
          </ProtectedRoute>
        ),
      },
      {
        path: '/seller',
        element: (
          <ProtectedRoute roles={ADMIN}>
            <UserList role="seller" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/createseller',
        element: (
          <ProtectedRoute roles={ADMIN}>
            <UserForm role="seller" mode="create" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/displayseller/:id',
        element: (
          <ProtectedRoute roles={ADMIN}>
            <UserForm role="seller" mode="view" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/updateseller/:id',
        element: (
          <ProtectedRoute roles={ADMIN}>
            <UserForm role="seller" mode="edit" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/deleteseller/:id',
        element: (
          <ProtectedRoute roles={ADMIN}>
            <UserForm role="seller" mode="delete" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/customer',
        element: (
          <ProtectedRoute roles={ADMIN}>
            <UserList role="customer" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/createcustomer',
        element: (
          <ProtectedRoute roles={ADMIN}>
            <UserForm role="customer" mode="create" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/displaycustomer/:id',
        element: (
          <ProtectedRoute roles={ADMIN}>
            <UserForm role="customer" mode="view" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/updatecustomer/:id',
        element: (
          <ProtectedRoute roles={ADMIN}>
            <UserForm role="customer" mode="edit" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/deletecustomer/:id',
        element: (
          <ProtectedRoute roles={ADMIN}>
            <UserForm role="customer" mode="delete" />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

// react-router 6.30 avisa por consola de cada flag v7 sin definir; startTransition es el único que aplica a este router.
const App = () => <RouterProvider router={router} future={{ v7_startTransition: true }} />;

export default App;
