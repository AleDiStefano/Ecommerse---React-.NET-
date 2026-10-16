import { useContext, useEffect, useState } from 'react'
import { Badge, Button, Container, Dropdown, Nav, Navbar } from 'react-bootstrap'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AuthenticationContext } from '../../services/authentication/AuthenticationContext'
import { ADMIN, STAFF } from '../../services/authentication/roles'
import { CartContext } from '../../services/cart/CartContext'
import Carrito from '../carrito/Carrito'
import './NavBar.css'

const CartIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

const NavBar = () => {
  const { user, logout } = useContext(AuthenticationContext)
  const { count } = useContext(CartContext)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // Al navegar se cierran el menú móvil y el carrito (los botones del navbar no pasan por collapseOnSelect).
  useEffect(() => {
    setMenuOpen(false)
    setCartOpen(false)
  }, [pathname])

  // Primero se navega a "/" y recién ahí se cierra la sesión: con el user ya en null, estando en una ruta protegida,
  // ProtectedRoute redirigiría a /login y pisaría este navigate('/').
  const onLogout = () => {
    navigate('/')
    setLoggingOut(true)
  }
  useEffect(() => {
    if (loggingOut && pathname === '/') {
      logout()
      setLoggingOut(false)
    }
  }, [loggingOut, pathname, logout])

  const role = user?.userType
  const cartLabel = count > 0 ? `Carrito, ${count} ${count === 1 ? 'producto' : 'productos'}` : 'Carrito, vacío'

  return (
    <Navbar bg="primary" data-bs-theme="dark" sticky="top" expand="xl" className="eg-navbar" collapseOnSelect expanded={menuOpen} onToggle={setMenuOpen}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold">
          <img src="/logo.ico" alt="" width="40" height="40" className="rounded-circle bg-white p-1" />
          EasyGrip
        </Navbar.Brand>

        {/* Carrito y hamburguesa fuera del Collapse: siempre visibles al colapsar. En xl+ el carrito queda a la derecha del todo. */}
        <div className="d-flex align-items-center gap-2 order-xl-last ms-xl-2">
          <Dropdown className="eg-cart" align="end" show={cartOpen} onToggle={setCartOpen}>
            <Dropdown.Toggle variant="outline-light" className="eg-cart-toggle d-flex align-items-center gap-2" aria-label={cartLabel}>
              <CartIcon />
              {count > 0 && (
                <Badge pill bg="light" text="dark" aria-hidden="true">
                  {count}
                </Badge>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu data-bs-theme="light" className="eg-cart-menu p-0 overflow-hidden">
              <Carrito />
            </Dropdown.Menu>
          </Dropdown>
          <Navbar.Toggle aria-controls="navbar-collapse" aria-expanded={menuOpen} label="Mostrar menú" />
        </div>

        <Navbar.Collapse id="navbar-collapse">
          <Nav className="me-auto text-nowrap">
            <Nav.Link as={NavLink} to="/productos" className="eg-nav-link">Productos</Nav.Link>
            {STAFF.includes(role) && (
              <Nav.Link as={NavLink} to="/nuevoProducto" className="eg-nav-link">Agregar producto</Nav.Link>
            )}
            {ADMIN.includes(role) && (
              <>
                <Nav.Link as={NavLink} to="/customer" className="eg-nav-link">Clientes</Nav.Link>
                <Nav.Link as={NavLink} to="/seller" className="eg-nav-link">Vendedores</Nav.Link>
              </>
            )}
          </Nav>

          <div className="d-flex flex-column flex-xl-row align-items-xl-center gap-2 py-2 py-xl-0 text-nowrap">
            {user ? (
              <>
                <Navbar.Text className="eg-greeting py-0" title={`Hola, ${user.name}`}>Hola, {user.name}</Navbar.Text>
                <Button variant="outline-light" onClick={onLogout}>Cerrar sesión</Button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light">Iniciar sesión</Link>
                <Link to="/registrarse" className="btn btn-light">Registrarse</Link>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBar
