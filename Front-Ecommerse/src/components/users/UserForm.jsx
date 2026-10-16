import { useState } from 'react'
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../../hook/useApi'
import { useForm } from '../../hook/useForm'
import { api } from '../../services/api'
import { USER_ROLES } from './userRoles'

const VERB = { create: 'Nuevo', view: 'Ver', edit: 'Editar', delete: 'Eliminar' }

// `required` deja pasar "   "; con este pattern un texto de solo espacios también es inválido.
const NOT_BLANK = '.*\\S.*'

// Son datos de OTRA persona: autoComplete="off" evita que el navegador pegue ahí los del admin (y "new-password" su clave guardada).
const Field = ({ form, name, label, error, md = 6, ...control }) => (
  <Col md={md}>
    <Form.Group controlId={`user-${name}`}>
      <Form.Label>{label}</Form.Label>
      <Form.Control name={name} value={form[name]} onChange={form.onInputChange} autoComplete="off" {...control} />
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </Form.Group>
  </Col>
)

const UserFormBody = ({ role, mode, user }) => {
  const { noun } = USER_ROLES[role]
  const navigate = useNavigate()
  const [validated, setValidated] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  // `password` solo se usa al crear: al editar no se lee ni se reenvía (el back conserva la clave si no llega).
  const form = useForm({
    name: user?.name ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    userName: user?.userName ?? '',
    adress: user?.adress ?? '',
    password: '',
  })
  const listPath = `/${role}`
  const isCustomer = role === 'customer'

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const el = e.currentTarget
    if (!el.checkValidity()) {
      el.querySelector(':invalid')?.focus() // noValidate desactiva el salto nativo al primer campo inválido
      return setValidated(true)
    }
    setValidated(false) // el cliente ya no tiene nada que marcar: sin esto quedan tildes verdes junto a un 409
    setSubmitting(true)
    try {
      const { name, lastName, email, userName, adress, password } = form
      const person = { name: name.trim(), lastName: lastName.trim(), email: email.trim(), userName: userName.trim(), adress: adress.trim() }
      if (mode === 'create') await api(`/api/User/${role}`, { method: 'POST', body: { ...person, password } })
      else if (mode === 'edit') await api(`/api/User/${user.id}`, { method: 'PUT', body: person })
      else await api(`/api/User/${user.id}`, { method: 'DELETE' })
      navigate(listPath)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const readOnly = mode === 'view' || mode === 'delete'
  const submitLabel = { create: `Crear ${noun}`, edit: 'Guardar cambios', delete: `Eliminar ${noun}` }[mode]

  return (
    <Form noValidate validated={validated} onSubmit={onSubmit}>
      {readOnly ? (
        <>
          <dl className="mb-4">
            {[
              ['Nombre', user.name],
              ['Apellido', user.lastName],
              ['Email', user.email],
              ['Usuario', user.userName],
              ['Dirección', user.adress || 'Sin dirección'],
            ].map(([label, value]) => (
              <div key={label} className="row gx-0 py-2 border-bottom">
                <dt className="col-sm-4 fw-normal text-body-secondary">{label}</dt>
                <dd className="col-sm-8 mb-0 text-break">{value}</dd>
              </div>
            ))}
          </dl>
          {mode === 'delete' && <p className="mb-4">¿Seguro que querés eliminar este {noun}? Esta acción no se puede deshacer.</p>}
        </>
      ) : (
        <Row className="g-3 mb-4">
          <Field form={form} name="name" label="Nombre" required pattern={NOT_BLANK} maxLength={100} error="Ingresá el nombre." />
          <Field form={form} name="lastName" label="Apellido" required pattern={NOT_BLANK} maxLength={100} error="Ingresá el apellido." />
          <Field form={form} name="email" label="Email" type="email" required maxLength={254} error="Ingresá un email válido." />
          <Field form={form} name="userName" label="Usuario" required pattern={NOT_BLANK} maxLength={50} error="Ingresá el nombre de usuario." />
          {mode === 'create' && (
            <Field
              form={form}
              name="password"
              label="Contraseña"
              type="password"
              required
              minLength={6}
              maxLength={100}
              autoComplete="new-password"
              error="La contraseña debe tener al menos 6 caracteres."
            />
          )}
          {/* La dirección solo es obligatoria para clientes: los vendedores del seed no tienen. */}
          <Field
            form={form}
            name="adress"
            label={isCustomer ? 'Dirección' : 'Dirección (opcional)'}
            required={isCustomer}
            pattern={isCustomer ? NOT_BLANK : undefined}
            maxLength={200}
            md={mode === 'create' ? 6 : 12}
            error="Ingresá la dirección."
          />
          {mode === 'edit' && (
            <Col xs={12}>
              <p className="small text-body-secondary mb-0">La contraseña no se modifica desde acá: el {noun} conserva la actual.</p>
            </Col>
          )}
        </Row>
      )}

      {/* El error va pegado a los botones: en móvil se ve sin tener que scrollear hasta el título. */}
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="d-flex flex-column-reverse flex-sm-row justify-content-sm-end gap-2">
        <Link to={listPath} className="btn btn-outline-primary">{mode === 'view' ? 'Volver' : 'Cancelar'}</Link>
        {mode !== 'view' && (
          <Button type="submit" variant={mode === 'delete' ? 'danger' : 'primary'} disabled={submitting}>
            {submitting && <Spinner size="sm" className="me-2" aria-hidden="true" />}
            {submitLabel}
          </Button>
        )}
      </div>
    </Form>
  )
}

const UserForm = ({ role, mode }) => {
  const { id } = useParams()
  const { type, noun, plural } = USER_ROLES[role]
  // Un id que no es un entero corto no existe; sin este filtro el framework contesta 400 en inglés.
  const userId = /^\d{1,9}$/.test(id) ? id : null
  const { data, error, loading, reload } = useApi(mode !== 'create' && userId && `/api/User/${userId}`)
  const user = data?.userType === type ? data : null // /displaycustomer/4 es el admin: en esta pantalla no existe

  let body
  if (loading) {
    body = (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" className="text-primary"><span className="visually-hidden">Cargando…</span></Spinner>
      </div>
    )
  } else if (error) {
    body = (
      <Alert variant="danger" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span>{error.message}</span>
        {/* primary y no outline-danger (receta): rojo sobre el rosa del Alert da 3.4:1 */}
        <Button size="sm" variant="primary" onClick={reload}>Reintentar</Button>
      </Alert>
    )
  } else if (mode !== 'create' && !user) {
    body = (
      <>
        <p className="text-body-secondary">Usuario no encontrado.</p>
        <Link to={`/${role}`} className="btn btn-outline-primary">Volver a {plural.toLowerCase()}</Link>
      </>
    )
  } else {
    // key: si la ruta se reusa con otro modo o usuario, el formulario arranca limpio.
    body = <UserFormBody key={`${mode}-${user?.id}`} role={role} mode={mode} user={user} />
  }

  return (
    <Container className="py-4 py-md-5">
      <Card className="eg-maxw-md mx-auto">
        <Card.Body className="p-4">
          <h1 className="h3 mb-4">{VERB[mode]} {noun}</h1>
          {body}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default UserForm
