import { useContext, useEffect, useRef, useState } from 'react'
import { Alert, Button, Card, Col, Container, Row, Spinner, Table } from 'react-bootstrap'
import { Link, Navigate } from 'react-router-dom'
import { api } from '../../services/api'
import { AuthenticationContext } from '../../services/authentication/AuthenticationContext'
import { CartContext } from '../../services/cart/CartContext'
import { PayMethodContext } from '../../services/cart/PayMethodContext'
import { PLACEHOLDER, formatPrice, onImgError } from '../../services/format'

export const Order = () => {
  const { user } = useContext(AuthenticationContext)
  const { items, total, clear } = useContext(CartContext)
  const { payMethod, handlePayMethod } = useContext(PayMethodContext)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const confirmedRef = useRef(null)
  const sending = useRef(false)

  // La vista de éxito reemplaza al botón que tenía el foco: se lo pasa al título (teclado, lector de pantalla y scroll).
  useEffect(() => {
    if (order) confirmedRef.current?.focus()
  }, [order])

  // shortcut: sin clave de idempotencia; si el pedido se crea pero la respuesta se pierde, reintentar crea otro. Resolver en el back.
  const confirm = async () => {
    // El ref y no solo `submitting`: el state recién se ve en el próximo render y varios clics de la misma tarea lo atraviesan.
    if (sending.current) return
    sending.current = true
    setError(null)
    setSubmitting(true)
    try {
      const created = await api('/api/Order', {
        method: 'POST',
        body: { userId: user.id, productsId: items.flatMap((item) => Array(item.quantity).fill(item.id)) },
      })
      // setOrder primero: ningún render intermedio ve el carrito vacío sin la vista de éxito (los guards redirigirían).
      setOrder(created)
      clear()
      handlePayMethod(null)
    } catch (err) {
      setError(err) // el carrito y los datos de pago quedan como estaban
    } finally {
      sending.current = false
      setSubmitting(false)
    }
  }

  if (order) {
    const orderTotal = (order.products ?? []).reduce((sum, product) => sum + product.price, 0)
    return (
      <Container className="py-4 py-md-5">
        <Card className="eg-maxw-md mx-auto text-center">
          <Card.Body className="p-4 p-md-5">
            <svg
              viewBox="0 0 24 24"
              width="56"
              height="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-success mb-3"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m8 12.5 3 3 5-6" />
            </svg>
            {/* Solo recibe foco por código (tabIndex -1, fuera del orden de Tab): sin el anillo por defecto del navegador. */}
            <h1 className="h3" ref={confirmedRef} tabIndex={-1} style={{ outline: 'none' }}>
              ¡Compra confirmada!
            </h1>
            <p className="fs-5 mb-1">Pedido #{order.id}</p>
            <p className="mb-4">
              Total <span className="eg-price fs-5">{formatPrice(orderTotal)}</span>
            </p>
            <Link to="/productos" className="btn btn-primary">
              Seguir comprando
            </Link>
          </Card.Body>
        </Card>
      </Container>
    )
  }

  if (items.length === 0) return <Navigate to="/productos" replace />
  if (!payMethod) return <Navigate to="/paymethod" replace />

  const details = [
    ['Nombre', payMethod.nameAndLastName],
    ['Email', payMethod.email],
    ['Domicilio', payMethod.home],
    ['Código postal', payMethod.postalCode],
    ['Método de pago', payMethod.selectedMethod],
  ]

  return (
    <Container className="py-4 py-md-5">
      <h1 className="mb-4">Confirmá tu pedido</h1>
      <Row className="g-4">
        <Col lg={8}>
          <Card>
            <Card.Body className="p-3 p-md-4">
              <h2 className="h5 mb-3">Productos</h2>
              <Table className="align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">Producto</th>
                    <th scope="col" className="d-none d-md-table-cell text-end">
                      Precio
                    </th>
                    <th scope="col" className="d-none d-md-table-cell text-end">
                      Cantidad
                    </th>
                    <th scope="col" className="text-end">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img src={item.image || PLACEHOLDER} alt="" width="56" height="56" loading="lazy" className="eg-media flex-shrink-0" onError={onImgError} />
                          <div className="text-break">
                            <div className="fw-semibold eg-clamp-2">{item.name}</div>
                            <div className="small text-body-secondary d-md-none">
                              {item.quantity} × {formatPrice(item.price)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="d-none d-md-table-cell text-end">{formatPrice(item.price)}</td>
                      <td className="d-none d-md-table-cell text-end">{item.quantity}</td>
                      <td className="text-end">
                        <span className="eg-price">{formatPrice(item.price * item.quantity)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-baseline mb-3">
                <h2 className="h5 mb-0">Envío y pago</h2>
                <Link to="/paymethod" aria-label="Modificar envío y pago">
                  Modificar
                </Link>
              </div>
              <dl className="row mb-0">
                {details.map(([label, value]) => (
                  <div key={label} className="col-md-6 col-lg-12">
                    <dt className="small fw-normal text-body-secondary">{label}</dt>
                    <dd className="text-break">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="d-flex justify-content-between align-items-baseline border-top pt-3 mt-3 mb-4">
                <span className="fw-semibold">Total</span>
                <span className="eg-price fs-4">{formatPrice(total)}</span>
              </div>
              {error && (
                <Alert variant="danger">
                  {error.message}
                  {error.status === 400 && (
                    <div className="mt-2">
                      <Link to="/carrito" className="alert-link">
                        Volver al carrito
                      </Link>
                    </div>
                  )}
                </Alert>
              )}
              <Button className="w-100" onClick={confirm} disabled={submitting}>
                {submitting && <Spinner size="sm" className="me-2" aria-hidden="true" />}Confirmar compra
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
