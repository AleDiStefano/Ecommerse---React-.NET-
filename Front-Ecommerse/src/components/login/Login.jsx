import { useContext, useState } from 'react'
import { Alert, Button, Card, Container, Form, Spinner } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from '../../hook/useForm'
import { AuthenticationContext } from '../../services/authentication/AuthenticationContext'

// `from` lo arma ProtectedRoute; solo se vuelve a una ruta interna ('/x'), nunca a '//host'.
const internalPath = (from) => (typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/')

const Login = () => {
  const { login } = useContext(AuthenticationContext)
  const navigate = useNavigate()
  const location = useLocation()
  const { email, password, onInputChange } = useForm({ email: '', password: '' })
  const [validated, setValidated] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.querySelector(':invalid')?.focus()
      return setValidated(true)
    }
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(internalPath(location.state?.from), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container className="py-4 py-md-5">
      <Card className="eg-maxw-sm mx-auto">
        <Card.Body className="p-4">
          <h1 className="h3 mb-4">Iniciar sesión</h1>
          <Form noValidate validated={validated} onSubmit={onSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3" controlId="login-email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={email} onChange={onInputChange} required autoComplete="username" />
              <Form.Control.Feedback type="invalid">Ingresá un email válido.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-4" controlId="login-password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" name="password" value={password} onChange={onInputChange} required autoComplete="current-password" />
              <Form.Control.Feedback type="invalid">Ingresá tu contraseña.</Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" className="w-100" disabled={submitting}>
              {submitting && <Spinner size="sm" className="me-2" aria-hidden="true" />}Ingresar
            </Button>
          </Form>
          <p className="text-center mt-4 mb-0">
            ¿No tenés cuenta? <Link to="/registrarse">Registrate</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Login
