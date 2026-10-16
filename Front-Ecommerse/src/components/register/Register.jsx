import { useContext, useState } from 'react'
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from '../../hook/useForm'
import { api } from '../../services/api'
import { AuthenticationContext } from '../../services/authentication/AuthenticationContext'

const NOT_BLANK = '.*\\S.*' // al menos un carácter que no sea espacio

// Estos endpoints devuelven true cuando el valor está LIBRE (el nombre "EmailRegistered" engaña).
const CHECKS = {
  email: { path: '/api/User/EmailRegistered', taken: 'Ese email ya está registrado.' },
  userName: { path: '/api/User/nickNameAvaible', taken: 'Ese nombre de usuario ya está en uso.' },
}

const Register = () => {
  const { login } = useContext(AuthenticationContext)
  const navigate = useNavigate()
  const { name, lastName, email, userName, password, adress, onInputChange } = useForm({
    name: '',
    lastName: '',
    email: '',
    userName: '',
    password: '',
    adress: '',
  })
  const [validated, setValidated] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(false)
  // email / userName -> true (libre) | false (tomado) | undefined (sin verificar, o editado después de verificar).
  const [free, setFree] = useState({})

  const onCheckedChange = (e) => {
    setFree((prev) => ({ ...prev, [e.target.name]: undefined }))
    onInputChange(e)
  }

  // Al salir del campo. El resultado "tomado" entra como customValidity (ref de cada input): así :invalid,
  // checkValidity() y el estilo de Bootstrap coinciden y el envío queda bloqueado.
  const checkFree = async ({ target }) => {
    const value = target.value.trim()
    if (!value || !target.checkValidity()) return
    try {
      const available = await api(`${CHECKS[target.name].path}/${encodeURIComponent(value)}`, { method: 'POST' })
      if (target.value.trim() === value) setFree((prev) => ({ ...prev, [target.name]: available === true }))
    } catch {
      // shortcut: si el chequeo falla (red, 5xx) no se muestra nada; el alta igual responde 409 si el dato ya existe.
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.querySelector(':invalid')?.focus()
      return setValidated(true)
    }
    setSubmitting(true)
    try {
      await api('/api/User/customer', {
        method: 'POST',
        body: { name: name.trim(), lastName: lastName.trim(), email, userName: userName.trim(), password, adress: adress.trim() },
      })
    } catch (err) {
      setError(err.message) // 409: el mensaje del back ya viene en español
      return setSubmitting(false)
    }
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch {
      // La cuenta ya existe: no se vuelve a mostrar el formulario (reenviarlo daría 409).
      setCreated(true)
    }
  }

  return (
    <Container className="py-4 py-md-5">
      <Card className="eg-maxw-md mx-auto">
        <Card.Body className="p-4">
          <h1 className="h3 mb-4">Creá tu cuenta</h1>
          {created ? (
            <Alert variant="info" className="mb-0">
              Tu cuenta se creó, pero no pudimos iniciar sesión. Probá{' '}
              <Link to="/login" className="alert-link">
                ingresando
              </Link>
              .
            </Alert>
          ) : (
            <>
              <Form noValidate validated={validated} onSubmit={onSubmit}>
                <Row>
                  <Col sm={6}>
                    <Form.Group className="mb-3" controlId="register-name">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control name="name" value={name} onChange={onInputChange} required pattern={NOT_BLANK} maxLength={100} autoComplete="given-name" />
                      <Form.Control.Feedback type="invalid">Ingresá tu nombre.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3" controlId="register-lastName">
                      <Form.Label>Apellido</Form.Label>
                      <Form.Control name="lastName" value={lastName} onChange={onInputChange} required pattern={NOT_BLANK} maxLength={100} autoComplete="family-name" />
                      <Form.Control.Feedback type="invalid">Ingresá tu apellido.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3" controlId="register-email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={onCheckedChange}
                    onBlur={checkFree}
                    required
                    maxLength={254}
                    autoComplete="email"
                    isValid={free.email === true}
                    isInvalid={free.email === false}
                    ref={(el) => el?.setCustomValidity(free.email === false ? CHECKS.email.taken : '')}
                  />
                  <Form.Control.Feedback type="invalid">{free.email === false ? CHECKS.email.taken : 'Ingresá un email válido.'}</Form.Control.Feedback>
                  {free.email === true && <Form.Control.Feedback>Email disponible.</Form.Control.Feedback>}
                </Form.Group>
                <Form.Group className="mb-3" controlId="register-userName">
                  <Form.Label>Nombre de usuario</Form.Label>
                  <Form.Control
                    name="userName"
                    value={userName}
                    onChange={onCheckedChange}
                    onBlur={checkFree}
                    required
                    pattern={NOT_BLANK}
                    maxLength={50}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    isValid={free.userName === true}
                    isInvalid={free.userName === false}
                    ref={(el) => el?.setCustomValidity(free.userName === false ? CHECKS.userName.taken : '')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {free.userName === false ? CHECKS.userName.taken : 'Ingresá un nombre de usuario.'}
                  </Form.Control.Feedback>
                  {free.userName === true && <Form.Control.Feedback>Nombre de usuario disponible.</Form.Control.Feedback>}
                </Form.Group>
                <Form.Group className="mb-3" controlId="register-password">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={onInputChange}
                    required
                    minLength={6}
                    maxLength={100}
                    autoComplete="new-password"
                    aria-describedby="register-password-hint"
                  />
                  <Form.Text id="register-password-hint" muted>
                    Mínimo 6 caracteres.
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">Ingresá una contraseña válida.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-4" controlId="register-adress">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control name="adress" value={adress} onChange={onInputChange} required pattern={NOT_BLANK} maxLength={200} autoComplete="street-address" />
                  <Form.Control.Feedback type="invalid">Ingresá tu dirección.</Form.Control.Feedback>
                </Form.Group>
                {error && <Alert variant="danger">{error}</Alert>}
                <Button type="submit" className="w-100" disabled={submitting}>
                  {submitting && <Spinner size="sm" className="me-2" aria-hidden="true" />}Crear cuenta
                </Button>
              </Form>
              <p className="text-center mt-4 mb-0">
                ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
              </p>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Register
