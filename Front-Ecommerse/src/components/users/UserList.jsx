import { useRef, useState } from 'react'
import { Alert, Button, Card, Container, Form, Spinner, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useApi } from '../../hook/useApi'
import { USER_ROLES } from './userRoles'

// Sin mayúsculas ni tildes: buscar "jose" encuentra a "José".
const fold = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

// text-danger (#dc3545) queda en 4.0:1 sobre la fila en hover; este tono (el hover de link-danger) llega a 5.8:1.
const DANGER_AA = { '--bs-danger-rgb': '176, 42, 55' }

const UserListContent = ({ role }) => {
  const { type, noun, plural } = USER_ROLES[role]
  const plain = plural.toLowerCase()
  const { data, error, loading, reload } = useApi(`/api/User/type/${type}`)
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)

  // shortcut: filtra en cada render y dibuja todas las filas; con cientos de usuarios hay que paginar (mejor en el back).
  const terms = fold(query).split(/\s+/).filter(Boolean)
  const rows = (data ?? []).filter((u) => {
    const text = fold(`${u.name} ${u.lastName} ${u.email} ${u.userName}`)
    return terms.every((t) => text.includes(t))
  })
  const total = data?.length ?? 0

  let content
  if (loading) {
    content = (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" className="text-primary"><span className="visually-hidden">Cargando…</span></Spinner>
      </div>
    )
  } else if (error) {
    content = (
      <Alert variant="danger" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span>{error.message}</span>
        {/* primary y no outline-danger (receta): rojo sobre el rosa del Alert da 3.4:1 */}
        <Button size="sm" variant="primary" onClick={reload}>Reintentar</Button>
      </Alert>
    )
  } else if (total === 0) {
    content = <p className="text-center text-body-secondary py-5">Todavía no hay {plain}.</p>
  } else {
    content = (
      <>
        <Form.Group controlId={`${role}-search`} className="eg-maxw-sm mb-3">
          <Form.Label visuallyHidden>Buscar {plain}</Form.Label>
          <Form.Control
            ref={searchRef}
            type="search"
            placeholder="Buscar por nombre, email o usuario"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Form.Group>
        <p role="status" className="small text-body-secondary mb-2">
          {rows.length < total && `${rows.length} de `}{total} {total === 1 ? noun : plain}
        </p>
        {rows.length === 0 ? (
          <p className="text-center text-body-secondary text-break py-5">
            Ningún {noun} coincide con “{query.trim()}”.{' '}
            <Button
              variant="link"
              className="p-0 align-baseline"
              onClick={() => {
                setQuery('')
                searchRef.current.focus() // el botón desaparece al volver la lista: sin esto el foco se pierde
              }}
            >
              Limpiar búsqueda
            </Button>
          </p>
        ) : (
          <Card className="overflow-hidden">
            <Table responsive hover size="sm" className="mb-0 align-middle">
              <thead className="d-none d-md-table-header-group">
                <tr>
                  <th scope="col" className="d-none d-lg-table-cell ps-3">ID</th>
                  <th scope="col" className="ps-3">Nombre</th>
                  <th scope="col">Email</th>
                  <th scope="col" className="d-none d-lg-table-cell">Usuario</th>
                  <th scope="col" className="text-end pe-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => {
                  const fullName = `${u.name} ${u.lastName}`
                  const actions = (
                    <>
                      <Link to={`/display${role}/${u.id}`} className="btn btn-link btn-sm px-0 pe-3 px-md-2" aria-label={`Ver ${noun} ${fullName}`}>Ver</Link>
                      <Link to={`/update${role}/${u.id}`} className="btn btn-link btn-sm px-0 pe-3 px-md-2" aria-label={`Editar ${noun} ${fullName}`}>Editar</Link>
                      <Link
                        to={`/delete${role}/${u.id}`}
                        className="btn btn-link btn-sm px-0 pe-3 px-md-2 text-danger"
                        style={DANGER_AA}
                        aria-label={`Eliminar ${noun} ${fullName}`}
                      >
                        Eliminar
                      </Link>
                    </>
                  )
                  return (
                    <tr key={u.id}>
                      <td className="d-none d-lg-table-cell ps-3 text-body-secondary">{u.id}</td>
                      <th scope="row" className="ps-3 fw-medium text-break">
                        {fullName}
                        {/* En xs el email y las acciones bajan bajo el nombre (cada columna se ve mal en 375px); desde md van en sus columnas. */}
                        <div className="d-md-none small fw-normal text-body-secondary text-break">{u.email}</div>
                        <div className="d-md-none fw-normal mt-1">{actions}</div>
                      </th>
                      <td className="d-none d-md-table-cell text-break">{u.email}</td>
                      <td className="d-none d-lg-table-cell">{u.userName}</td>
                      <td className="d-none d-md-table-cell text-end text-nowrap">{actions}</td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </Card>
        )}
      </>
    )
  }

  return (
    <Container className="py-4 py-md-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h1 className="mb-0">{plural}</h1>
        <Link to={`/create${role}`} className="btn btn-primary">Nuevo {noun}</Link>
      </div>
      {content}
    </Container>
  )
}

// key={role}: /customer y /seller montan este mismo componente; sin key React conservaría el buscador y la lista del otro rol.
const UserList = ({ role }) => <UserListContent key={role} role={role} />

export default UserList
