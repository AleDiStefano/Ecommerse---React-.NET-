import { Card, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const NotFound = () => (
  <Container className="py-4 py-md-5">
    <Card className="eg-maxw-md mx-auto text-center">
      <Card.Body className="p-4 p-md-5">
        <p className="display-1 fw-bold mb-2" style={{ color: 'var(--eg-navy)' }} aria-hidden="true">404</p>
        <h1 className="h3">No encontramos la página</h1>
        <p className="text-body-secondary">
          Puede que el enlace esté desactualizado o que la dirección tenga un error.
        </p>
        <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
          <Link to="/" className="btn btn-primary">Volver al inicio</Link>
          <Link to="/productos" className="btn btn-outline-primary">Ver productos</Link>
        </div>
      </Card.Body>
    </Card>
  </Container>
)

export default NotFound
