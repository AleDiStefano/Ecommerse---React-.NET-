import { useContext, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useApi } from '../../hook/useApi'
import { api } from '../../services/api'
import { AuthenticationContext } from '../../services/authentication/AuthenticationContext'
import { STAFF } from '../../services/authentication/roles'
import { CartContext } from '../../services/cart/CartContext'
import { PLACEHOLDER, formatPrice, onImgError } from '../../services/format'

// Un id que no es un entero corto ni se le pide al back: responde 400 con un mensaje del framework en inglés.
const ID_PATTERN = /^\d{1,9}$/

const Detail = ({ id }) => {
  const { user } = useContext(AuthenticationContext)
  const { items, addItem } = useContext(CartContext)
  const { pathname } = useLocation()
  const { data: product, error, loading, setData, reload } = useApi(ID_PATTERN.test(id) ? `/api/Product/id/${id}` : null)
  const [qty, setQty] = useState(1)
  const [notice, setNotice] = useState(null) // { variant, text, link: 'login' | 'cart' }
  const [adminError, setAdminError] = useState('')
  const [busy, setBusy] = useState(false)

  if (loading) {
    return (
      <Container className="py-4 py-md-5 text-center">
        <Spinner animation="border" role="status" className="text-primary my-5">
          <span className="visually-hidden">Cargando…</span>
        </Spinner>
      </Container>
    )
  }
  if (error) {
    return (
      <Container className="py-4 py-md-5">
        <Alert variant="danger" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span>{error.message}</span>
          <Button size="sm" variant="outline-primary" onClick={reload}>Reintentar</Button>
        </Alert>
        <Link to="/productos">Volver a productos</Link>
      </Container>
    )
  }
  if (!product) {
    return (
      <Container className="py-4 py-md-5">
        <Card className="eg-maxw-md mx-auto text-center">
          <Card.Body className="p-4 p-md-5">
            <h1 className="h3">Producto no encontrado</h1>
            <p className="text-body-secondary">Puede que el enlace tenga un error o que el producto ya no exista.</p>
            <Link to="/productos" className="btn btn-primary">Ver productos</Link>
          </Card.Body>
        </Card>
      </Container>
    )
  }

  const canBuy = product.avaible && product.stock > 0
  const status = !product.avaible ? 'No disponible' : product.stock < 1 ? 'Sin stock' : 'Disponible'

  const onAdd = () => {
    if (!user) {
      return setNotice({ variant: 'info', text: 'Iniciá sesión para agregar productos al carrito.', link: 'login' })
    }
    const before = items.find((i) => i.id === product.id)?.quantity ?? 0
    const after = addItem(product, qty)
    if (after === 0) setNotice({ variant: 'danger', text: 'Este producto no está disponible.' })
    else if (after < before + qty) {
      setNotice({ variant: 'info', text: `Solo quedan ${product.stock} unidades y ya las tenés en el carrito.`, link: 'cart' })
    } else setNotice({ variant: 'success', text: 'Agregado al carrito.', link: 'cart' })
    setQty(1)
  }

  // Baja/alta: se espera al back y recién ahí se actualiza la vista; si falla, el error queda a la vista y nada cambia.
  const toggleAvailability = async () => {
    const next = !product.avaible
    setBusy(true)
    setAdminError('')
    try {
      await api(`/api/Product/${next ? 'alta' : 'baja'}/${encodeURIComponent(product.id)}`, { method: 'PUT' })
      setData((prev) => ({ ...prev, avaible: next }))
    } catch (e) {
      setAdminError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Container className="py-4 py-md-5">
      <Link to="/productos" className="btn btn-link px-0 mb-3">
        <span aria-hidden="true">← </span>Volver a productos
      </Link>
      <Row className="g-4 g-lg-5">
        <Col lg={5}>
          <Card className="eg-maxw-sm mx-auto">
            <Card.Body className="p-2 p-sm-3">
              <img src={product.image || PLACEHOLDER} alt={product.name} onError={onImgError} className="eg-media bg-white d-block w-100" />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <p className="small text-uppercase text-body-secondary text-break mb-1">{product.category}</p>
          <h1 className="text-break mb-1">{product.name}</h1>
          <p className="text-body-secondary text-break mb-3">Marca: {product.brand}</p>
          <p className="eg-price fs-2 text-break mb-2">{formatPrice(product.price)}</p>
          <p className="d-flex flex-wrap align-items-center gap-2 mb-4">
            <Badge bg={canBuy ? 'success' : 'secondary'}>{status}</Badge>
            {canBuy && (
              <span className="text-body-secondary">
                {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'} en stock
              </span>
            )}
          </p>
          <p className="text-break mb-4">{product.description}</p>

          <div className="d-flex flex-wrap align-items-center gap-3">
            {canBuy && (
              <div className="d-flex align-items-center gap-1" role="group" aria-label="Cantidad">
                <Button variant="outline-primary" size="lg" aria-label="Quitar una unidad" disabled={qty <= 1} onClick={() => setQty(qty - 1)}>
                  −
                </Button>
                <output className="px-3 fs-5 fw-semibold">{qty}</output>
                <Button variant="outline-primary" size="lg" aria-label="Agregar una unidad" disabled={qty >= product.stock} onClick={() => setQty(qty + 1)}>
                  +
                </Button>
              </div>
            )}
            <Button size="lg" className="flex-grow-1 flex-sm-grow-0" disabled={!canBuy} onClick={onAdd}>
              {canBuy ? 'Agregar al carrito' : status}
            </Button>
          </div>
          {notice && (
            <Alert variant={notice.variant} className="mt-3 mb-0">
              {notice.text}{' '}
              {notice.link === 'login' && <Alert.Link as={Link} to="/login" state={{ from: pathname }}>Ingresar</Alert.Link>}
              {notice.link === 'cart' && <Alert.Link as={Link} to="/carrito">Ver carrito</Alert.Link>}
            </Alert>
          )}

          {/* Card blanca: sobre el fondo de la página (#f4f6fb) el texto de outline-danger/success no llega a 4.5:1; sobre blanco sí. */}
          {STAFF.includes(user?.userType) && (
            <Card as="section" className="mt-4" aria-labelledby="product-admin">
              <Card.Body>
                <h2 id="product-admin" className="h6 text-uppercase text-body-secondary">Administración</h2>
                <div className="d-flex flex-wrap gap-2">
                  <Link to={`/updateproduct/${product.id}`} className="btn btn-outline-primary">Editar</Link>
                  <Button variant={product.avaible ? 'outline-danger' : 'outline-success'} disabled={busy} onClick={toggleAvailability}>
                    {busy && <Spinner size="sm" className="me-2" aria-hidden="true" />}
                    {product.avaible ? 'Dar de baja' : 'Dar de alta'}
                  </Button>
                </div>
                {adminError && <Alert variant="danger" className="mt-3 mb-0">{adminError}</Alert>}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  )
}

// key={id}: al cambiar de producto (:id) se reinician cantidad, avisos y errores en vez de arrastrarlos del anterior.
const ProductDetail = () => {
  const { id } = useParams()
  return <Detail key={id} id={id} />
}

export default ProductDetail
