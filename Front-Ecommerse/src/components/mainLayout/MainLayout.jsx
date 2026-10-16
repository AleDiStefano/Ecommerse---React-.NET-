import { Container } from 'react-bootstrap'
import NavBar from '../navBar/NavBar'

// Cada página pone su propio <Container>: el hero del landing va de borde a borde.
const MainLayout = ({ children }) => (
  <div className="d-flex flex-column min-vh-100">
    <a
      href="#contenido"
      className="visually-hidden-focusable position-absolute top-0 start-0 m-2 btn btn-light"
      style={{ zIndex: 1100 }}
    >
      Saltar al contenido
    </a>
    <NavBar />
    {/* scrollMarginTop: el navbar es sticky; sin esto el skip link deja los primeros 66px del contenido debajo de él. */}
    <main id="contenido" className="flex-grow-1" style={{ scrollMarginTop: '4.5rem' }}>
      {children}
    </main>
    <footer className="py-3 text-center small text-white" style={{ backgroundColor: 'var(--eg-navy-deep)' }}>
      <Container>© {new Date().getFullYear()} EasyGrip</Container>
    </footer>
  </div>
)

export default MainLayout
