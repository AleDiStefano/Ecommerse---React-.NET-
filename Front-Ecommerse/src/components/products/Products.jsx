import { useContext, useRef, useState } from 'react'
import { Alert, Button, Col, Container, Form, Pagination, Row, Spinner } from 'react-bootstrap'
import { useApi } from '../../hook/useApi'
import { AuthenticationContext } from '../../services/authentication/AuthenticationContext'
import { STAFF } from '../../services/authentication/roles'
import ProductsItem from '../productsItem/ProductsItem'

const PAGE_SIZE = 12 // múltiplo de 2, 3 y 4: la grilla (xs / md / xl) nunca deja una fila a medias
const fold = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase() // "estatica" encuentra "Estática"

const Products = () => {
  const { user } = useContext(AuthenticationContext)
  const { data, error, loading, reload } = useApi('/api/Product')
  // shortcut: búsqueda y página viven en estado local (al volver de un detalle se reinician); para compartirlas o volver al mismo punto, pasarlas a useSearchParams.
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const topRef = useRef(null)
  const titleRef = useRef(null)
  const searchRef = useRef(null)
  const term = query.trim()

  // Orden: filtrar (el público solo ve disponibles; el staff ve todo) -> buscar -> paginar.
  const isStaff = STAFF.includes(user?.userType)
  const needle = fold(term)
  const matches = (data ?? []).filter((p) => (isStaff || p.avaible) && fold(p.name ?? '').includes(needle))
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE))
  const current = Math.min(page, pages) // si la lista se achica (otra cuenta, otra búsqueda) nunca queda una página inexistente
  const shown = matches.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const updateQuery = (value) => {
    setQuery(value)
    setPage(1)
  }
  // Al cambiar de página se vuelve al inicio del catálogo (el paginador está al pie: sin esto se queda mirando el final)
  // y el foco pasa al título: el link del paginador se reemplaza por un <span> al quedar activo y el foco se perdería.
  const goTo = (n) => {
    setPage(n)
    topRef.current?.scrollIntoView()
    titleRef.current?.focus({ preventScroll: true })
  }

  let body
  if (loading) {
    body = (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" className="text-primary">
          <span className="visually-hidden">Cargando…</span>
        </Spinner>
      </div>
    )
  } else if (error) {
    body = (
      <Alert variant="danger" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span>{error.message}</span>
        <Button size="sm" variant="outline-primary" onClick={reload}>Reintentar</Button>
      </Alert>
    )
  } else if (matches.length === 0) {
    body = term ? (
      <div className="text-center py-5">
        <p className="text-body-secondary text-break">No encontramos productos para «{term}».</p>
        <Button
          variant="outline-primary"
          onClick={() => {
            updateQuery('')
            searchRef.current?.focus()
          }}
        >
          Limpiar búsqueda
        </Button>
      </div>
    ) : (
      <p className="text-center text-body-secondary py-5">No hay productos para mostrar.</p>
    )
  } else {
    body = (
      <>
        <Row xs={2} md={3} xl={4} className="g-3">
          {shown.map((item) => (
            <Col key={item.id}>
              <ProductsItem item={item} />
            </Col>
          ))}
        </Row>
        {pages > 1 && (
          // shortcut: muestra todas las páginas (flex-wrap evita el desborde); con más de ~10 conviene una ventana con elipsis.
          <nav aria-label="Paginación de productos" className="mt-4">
            <Pagination className="justify-content-center flex-wrap mb-0">
              <Pagination.Item disabled={current === 1} onClick={() => goTo(current - 1)}>Anterior</Pagination.Item>
              {Array.from({ length: pages }, (_, i) => (
                <Pagination.Item key={i + 1} active={i + 1 === current} activeLabel="(página actual)" onClick={() => goTo(i + 1)}>
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Item disabled={current === pages} onClick={() => goTo(current + 1)}>Siguiente</Pagination.Item>
            </Pagination>
          </nav>
        )}
      </>
    )
  }

  return (
    // scrollMarginTop: el navbar es sticky; sin esto goTo() dejaría el título debajo de él (igual que el skip link de MainLayout).
    <Container ref={topRef} className="py-4 py-md-5" style={{ scrollMarginTop: '4.5rem' }}>
      <Row className="align-items-center g-3 mb-4">
        <Col md>
          <h1 ref={titleRef} tabIndex={-1} className="mb-0">Productos</h1>
          {/* role=status: quien usa lector de pantalla se entera de cuántos resultados dejó la búsqueda en vivo. */}
          <p className="small text-body-secondary mb-0" role="status">
            {!loading && !error && `${matches.length} ${matches.length === 1 ? 'producto' : 'productos'}`}
          </p>
        </Col>
        <Col md={6} lg={5} xl={4}>
          <Form.Group controlId="catalog-search" role="search">
            <Form.Label visuallyHidden>Buscar productos por nombre</Form.Label>
            <Form.Control
              ref={searchRef}
              type="search"
              placeholder="Buscar por nombre"
              autoComplete="off"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
      {body}
    </Container>
  )
}

export default Products
