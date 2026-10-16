import { useContext, useState } from 'react'
import { Button, Card, Col, Container, Form, ListGroup, Row } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from '../../hook/useForm'
import { AuthenticationContext } from '../../services/authentication/AuthenticationContext'
import { CartContext } from '../../services/cart/CartContext'
import { PayMethodContext } from '../../services/cart/PayMethodContext'
import { PLACEHOLDER, formatPrice, onImgError } from '../../services/format'

const NOT_BLANK = '.*\\S.*' // al menos un carácter que no sea espacio
// shortcut: el número de tarjeta solo se valida por formato (13-19 dígitos), sin Luhn ni marca; no hay pasarela. Agregarlo al integrar una.
// Datos de prueba fijos (demo): no hay pasarela de pago ni cuenta real.
const CBU = '285059094009041813520'
const PAYMENT_CODE = '45465451321657489785'

const PayMethod = () => {
  const { user } = useContext(AuthenticationContext)
  const { items, total } = useContext(CartContext)
  const { payMethod, handlePayMethod } = useContext(PayMethodContext)
  const navigate = useNavigate()
  const [validated, setValidated] = useState(false)
  // Si se vuelve desde la confirmación ("Modificar"), el formulario retoma lo que ya se había cargado.
  // Número, CVV y vencimiento viven solo en este estado: handlePayMethod los descarta y no salen del formulario.
  const { nameAndLastName, email, home, postalCode, selectedMethod, cardNumber, securityCode, expirationMonth, expirationYear, onInputChange } = useForm({
    nameAndLastName: payMethod?.nameAndLastName ?? `${user.name} ${user.lastName}`,
    email: payMethod?.email ?? user.email,
    home: payMethod?.home ?? user.adress ?? '',
    postalCode: payMethod?.postalCode ?? '',
    selectedMethod: payMethod?.selectedMethod ?? '',
    cardNumber: '',
    securityCode: '',
    expirationMonth: '',
    expirationYear: '',
  })

  if (items.length === 0) return <Navigate to="/productos" replace />

  // La tarjeta vence a fin del mes indicado. Se marca en el campo año (customValidity, ver su ref)
  // para que bloquee el envío igual que un pattern.
  const now = new Date()
  const year = Number(expirationYear)
  const month = Number(expirationMonth)
  const expired = year >= 2000 && month >= 1 && month <= 12 && (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1))

  const onSubmit = (e) => {
    e.preventDefault()
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.querySelector(':invalid')?.focus()
      return setValidated(true)
    }
    handlePayMethod({ nameAndLastName: nameAndLastName.trim(), email: email.trim(), home: home.trim(), postalCode: postalCode.trim(), selectedMethod })
    navigate('/order')
  }

  return (
    <Container className="py-4 py-md-5">
      <h1 className="mb-4">Pago y envío</h1>
      <Row className="g-4">
        <Col lg={5} className="order-lg-last">
          <Card>
            <Card.Body className="p-4">
              <h2 className="h5 mb-3">Resumen del pedido</h2>
              <ListGroup as="ul" variant="flush">
                {items.map((item) => (
                  <ListGroup.Item as="li" key={item.id} className="d-flex gap-3 px-0">
                    <img src={item.image || PLACEHOLDER} alt="" width="48" height="48" loading="lazy" className="eg-media flex-shrink-0" onError={onImgError} />
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="eg-clamp-2">{item.name}</div>
                      <div className="small text-body-secondary">
                        {item.quantity} × {formatPrice(item.price)}
                      </div>
                    </div>
                    <span className="eg-price align-self-center">{formatPrice(item.price * item.quantity)}</span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <div className="d-flex justify-content-between align-items-baseline border-top pt-3">
                <span className="fw-semibold">Total</span>
                <span className="eg-price fs-4">{formatPrice(total)}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card>
            <Card.Body className="p-4">
              <Form noValidate validated={validated} onSubmit={onSubmit}>
                <h2 className="h5 mb-3">Datos de envío</h2>
                <Form.Group className="mb-3" controlId="pay-name">
                  <Form.Label>Nombre y apellido</Form.Label>
                  <Form.Control name="nameAndLastName" value={nameAndLastName} onChange={onInputChange} required pattern={NOT_BLANK} maxLength={200} autoComplete="name" />
                  <Form.Control.Feedback type="invalid">Ingresá tu nombre y apellido.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="pay-email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={email} onChange={onInputChange} required maxLength={254} autoComplete="email" />
                  <Form.Control.Feedback type="invalid">Ingresá un email válido.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="pay-home">
                  <Form.Label>Domicilio</Form.Label>
                  <Form.Control name="home" value={home} onChange={onInputChange} required pattern={NOT_BLANK} maxLength={200} autoComplete="street-address" />
                  <Form.Control.Feedback type="invalid">Ingresá tu domicilio.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-4" controlId="pay-postalCode">
                  <Form.Label>Código postal</Form.Label>
                  <Form.Control name="postalCode" value={postalCode} onChange={onInputChange} required pattern="[A-Za-z0-9]{4,8}" maxLength={8} autoComplete="postal-code" />
                  <Form.Control.Feedback type="invalid">Ingresá un código postal de 4 a 8 letras o números.</Form.Control.Feedback>
                </Form.Group>

                <h2 className="h5 mb-3">Pago</h2>
                <Form.Group className="mb-3" controlId="pay-method">
                  <Form.Label>Método de pago</Form.Label>
                  <Form.Select name="selectedMethod" value={selectedMethod} onChange={onInputChange} required>
                    <option value="">Elegí un método…</option>
                    <option value="Tarjeta">Tarjeta de débito o crédito</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Efectivo">Efectivo</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">Elegí un método de pago.</Form.Control.Feedback>
                </Form.Group>

                {selectedMethod === 'Tarjeta' && (
                  <>
                    <Form.Group className="mb-3" controlId="pay-cardNumber">
                      <Form.Label>Número de tarjeta</Form.Label>
                      <Form.Control
                        name="cardNumber"
                        value={cardNumber}
                        onChange={onInputChange}
                        required
                        inputMode="numeric"
                        pattern="\d(?:[ \-]?\d){12,18}"
                        maxLength={23}
                        autoComplete="cc-number"
                      />
                      <Form.Control.Feedback type="invalid">Ingresá entre 13 y 19 dígitos.</Form.Control.Feedback>
                    </Form.Group>
                    <Row>
                      <Col xs={6} sm={4}>
                        <Form.Group className="mb-3" controlId="pay-expirationMonth">
                          <Form.Label>Mes (MM)</Form.Label>
                          <Form.Control
                            name="expirationMonth"
                            value={expirationMonth}
                            onChange={onInputChange}
                            required
                            inputMode="numeric"
                            pattern="0?[1-9]|1[0-2]"
                            maxLength={2}
                            autoComplete="cc-exp-month"
                          />
                          <Form.Control.Feedback type="invalid">Ingresá un mes del 1 al 12.</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col xs={6} sm={4}>
                        <Form.Group className="mb-3" controlId="pay-expirationYear">
                          <Form.Label>Año (AAAA)</Form.Label>
                          <Form.Control
                            name="expirationYear"
                            value={expirationYear}
                            onChange={onInputChange}
                            required
                            inputMode="numeric"
                            pattern="20\d{2}"
                            maxLength={4}
                            autoComplete="cc-exp-year"
                            ref={(el) => el?.setCustomValidity(expired ? 'La tarjeta está vencida.' : '')}
                          />
                          <Form.Control.Feedback type="invalid">{expired ? 'La tarjeta está vencida.' : 'Ingresá el año con 4 dígitos.'}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col xs={6} sm={4}>
                        <Form.Group className="mb-3" controlId="pay-securityCode">
                          <Form.Label>Código (CVV)</Form.Label>
                          <Form.Control
                            name="securityCode"
                            value={securityCode}
                            onChange={onInputChange}
                            required
                            inputMode="numeric"
                            pattern="\d{3,4}"
                            maxLength={4}
                            autoComplete="cc-csc"
                          />
                          <Form.Control.Feedback type="invalid">Ingresá 3 o 4 dígitos.</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

                {selectedMethod === 'Transferencia' && (
                  <Form.Group className="mb-3" controlId="pay-cbu">
                    <Form.Label>CBU para transferir</Form.Label>
                    <Form.Control readOnly value={CBU} />
                    <Form.Text muted>Después de confirmar, enviá el comprobante a comprobantes@easygrip.com.</Form.Text>
                  </Form.Group>
                )}

                {selectedMethod === 'Efectivo' && (
                  <Form.Group className="mb-3" controlId="pay-paymentCode">
                    <Form.Label>Código de pago</Form.Label>
                    <Form.Control readOnly value={PAYMENT_CODE} />
                    <Form.Text muted>Con este código pagá en RappiPago o PagoFácil.</Form.Text>
                  </Form.Group>
                )}

                <Button type="submit" className="w-100 mt-3">
                  Revisar pedido
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default PayMethod
