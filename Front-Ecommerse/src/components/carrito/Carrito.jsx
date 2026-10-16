import { useContext } from 'react'
import { Button, Card, Container, ListGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { CartContext } from '../../services/cart/CartContext'
import { PLACEHOLDER, formatPrice, onImgError } from '../../services/format'

// Contenido del carrito: lo usa el menú del navbar y la página /carrito. Sin props: el estado vive en CartContext.
const Carrito = () => {
  const { items, total, setQuantity, removeItem } = useContext(CartContext)

  if (items.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="mb-2">Tu carrito está vacío.</p>
        <Link to="/productos">Ver productos</Link>
      </div>
    )
  }

  return (
    <>
      <ListGroup as="ul" variant="flush" className="eg-cart-list">
        {items.map((item) => (
          <ListGroup.Item as="li" key={item.id} className="d-flex gap-3">
            <img
              src={item.image || PLACEHOLDER}
              alt=""
              width="56"
              height="56"
              loading="lazy"
              className="eg-media flex-shrink-0"
              onError={onImgError}
            />
            <div className="flex-grow-1 overflow-hidden">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <span className="fw-semibold eg-clamp-2">{item.name}</span>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-danger text-nowrap"
                  aria-label={`Quitar ${item.name} del carrito`}
                  onClick={() => removeItem(item.id)}
                >
                  Quitar
                </Button>
              </div>
              <div className="small text-body-secondary">{formatPrice(item.price)} c/u</div>
              <div className="d-flex align-items-center justify-content-between gap-2 mt-2">
                <div className="d-flex align-items-center gap-1" role="group" aria-label={`Cantidad de ${item.name}`}>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    aria-label={`Quitar una unidad de ${item.name}`}
                    disabled={item.quantity <= 1}
                    onClick={() => setQuantity(item.id, item.quantity - 1)}
                  >
                    −
                  </Button>
                  <output className="px-2 fw-semibold text-center">{item.quantity}</output>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    aria-label={`Agregar una unidad de ${item.name}`}
                    disabled={item.quantity >= item.stock}
                    onClick={() => setQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                  {item.quantity >= item.stock && <span className="small text-body-secondary ms-1">Máx.</span>}
                </div>
                <span className="eg-price">{formatPrice(item.price * item.quantity)}</span>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <div className="border-top p-3">
        <div className="d-flex justify-content-between align-items-baseline mb-3">
          <span className="fw-semibold">Total</span>
          <span className="eg-price fs-5">{formatPrice(total)}</span>
        </div>
        <Link to="/paymethod" className="btn btn-primary w-100">Ir a pagar</Link>
      </div>
    </>
  )
}

// Ruta /carrito: la misma vista a pantalla completa (útil en móvil).
export const CarritoPage = () => (
  <Container className="py-4 py-md-5">
    <h1 className="mb-4">Tu carrito</h1>
    <Card className="eg-maxw-md">
      <Carrito />
    </Card>
  </Container>
)

export default Carrito
