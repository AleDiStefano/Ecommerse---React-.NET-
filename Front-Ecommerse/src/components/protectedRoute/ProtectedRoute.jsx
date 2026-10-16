import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthenticationContext } from '../../services/authentication/AuthenticationContext'
import Unauthorize from '../unauthorize/Unauthorize'

// Sin `roles`: cualquier usuario logueado. Con `roles` (ver services/authentication/roles.js): solo esos userType.
// El MainLayout lo pone la ruta padre (App.jsx), así que 403 también se ve con navbar.
const ProtectedRoute = ({ roles, children }) => {
  const { user } = useContext(AuthenticationContext)
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.userType)) return <Unauthorize />
  return children
}

export default ProtectedRoute
