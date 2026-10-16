import { useState } from 'react'
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../../hook/useApi'
import { useForm } from '../../hook/useForm'
import { api } from '../../services/api'
import { PLACEHOLDER, onImgError } from '../../services/format'

// `required` deja pasar "   "; con este pattern un texto de solo espacios también es inválido.
const NOT_BLANK = '.*\\S.*'

// autoComplete="off": no son datos de quien carga el formulario y el navegador sugeriría los suyos en "Nombre".
const Field = ({ form, name, label, error, md = 6, ...control }) => (
  <Col md={md}>
    <Form.Group controlId={`product-${name}`}>
      <Form.Label>{label}</Form.Label>
      <Form.Control name={name} value={form[name]} onChange={form.onInputChange} autoComplete="off" {...control} />
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </Form.Group>
  </Col>
)

// `product` es null al crear.
const ProductFields = ({ product }) => {
  const navigate = useNavigate()
  const [validated, setValidated] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const form = useForm({
    name: product?.name ?? '',
    category: product?.category ?? '',
    brand: product?.brand ?? '',
    price: product?.price ?? '',
    stock: product?.stock ?? '', // `??` y no `||`: un stock 0 es válido y tiene que verse como 0
    image: product?.image ?? '',
    description: product?.description ?? '',
  })
  // La vista previa se actualiza al salir del campo y solo con una URL válida: tipeando se le pedirían al servidor
  // de imágenes URLs a medio escribir (o con otro esquema).
  const [preview, setPreview] = useState({ src: form.image, failed: false })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const el = e.currentTarget
    if (!el.checkValidity()) {
      el.querySelector(':invalid')?.focus() // noValidate desactiva el salto nativo al primer campo inválido
      return setValidated(true)
    }
    setValidated(false) // el cliente ya no tiene nada que marcar: sin esto quedan tildes verdes junto a un error del back
    setSubmitting(true)
    try {
      // Number() es seguro: type="number" + step + min ya garantizaron un precio finito y un stock entero.
      const body = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        image: form.image.trim(),
        category: form.category.trim(),
        brand: form.brand.trim(),
      }
      if (product) {
        // `avaible` es parte del DTO: sin mandarlo llegaría false.
        await api(`/api/Product/${product.id}`, { method: 'PUT', body: { ...body, avaible: product.avaible } })
        navigate(`/producto/${product.id}`)
      } else {
        const created = await api('/api/Product', { method: 'POST', body })
        navigate(`/producto/${created.id}`)
      }
    } catch (err) {
      setError(err.message) // sin tocar los campos: el que carga no pierde lo escrito
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form noValidate validated={validated} onSubmit={onSubmit}>
      <Row className="g-3 mb-4">
        <Field form={form} name="name" label="Nombre" md={12} required pattern={NOT_BLANK} maxLength={200} error="Ingresá el nombre del producto." />
        <Field form={form} name="category" label="Categoría" required pattern={NOT_BLANK} maxLength={100} error="Ingresá la categoría." />
        <Field form={form} name="brand" label="Marca" required pattern={NOT_BLANK} maxLength={100} error="Ingresá la marca." />
        <Field
          form={form}
          name="price"
          label="Precio"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          max="100000000"
          required
          error="Ingresá un precio entre 0,01 y 100.000.000."
        />
        <Field
          form={form}
          name="stock"
          label="Stock"
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          max="2147483647"
          required
          error="Ingresá un stock entero, de 0 en adelante."
        />
        <Col xs={12}>
          <div className="d-flex flex-column flex-sm-row gap-3">
            <Form.Group controlId="product-image" className="flex-grow-1">
              <Form.Label>URL de la imagen</Form.Label>
              <Form.Control
                type="url"
                name="image"
                value={form.image}
                onChange={form.onInputChange}
                onBlur={(e) => setPreview({ src: e.currentTarget.validity.valid ? form.image.trim() : '', failed: false })}
                required
                pattern="https?://.+"
                maxLength={2000}
                placeholder="https://"
                autoComplete="off"
              />
              <Form.Control.Feedback type="invalid">Ingresá una URL que empiece con http:// o https://.</Form.Control.Feedback>
              {preview.failed && <Form.Text className="text-danger">No se pudo cargar la imagen. Revisá la URL.</Form.Text>}
            </Form.Group>
            <img
              src={preview.src || PLACEHOLDER}
              alt=""
              width="96"
              height="96"
              className="eg-media flex-shrink-0"
              onError={(e) => {
                setPreview((p) => ({ ...p, failed: true }))
                onImgError(e)
              }}
            />
          </div>
        </Col>
        <Field form={form} name="description" label="Descripción" md={12} as="textarea" rows={4} required maxLength={2000} error="Ingresá la descripción." />
      </Row>

      {/* El error va pegado a los botones: en móvil se ve sin tener que scrollear hasta el título. */}
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="d-flex flex-column-reverse flex-sm-row justify-content-sm-end gap-2">
        <Link to={product ? `/producto/${product.id}` : '/productos'} className="btn btn-outline-primary">Cancelar</Link>
        <Button type="submit" disabled={submitting}>
          {submitting && <Spinner size="sm" className="me-2" aria-hidden="true" />}
          {product ? 'Guardar cambios' : 'Agregar producto'}
        </Button>
      </div>
    </Form>
  )
}

const ProductForm = ({ mode }) => {
  const { id } = useParams()
  const edit = mode === 'edit'
  // Un id que no es un entero corto no existe; sin este filtro el framework contesta 400 en inglés.
  const productId = /^\d{1,9}$/.test(id) ? id : null
  const { data: product, error, loading, reload } = useApi(edit && productId && `/api/Product/id/${productId}`)

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
  } else if (edit && !product) {
    body = (
      <>
        <p className="text-body-secondary">Producto no encontrado.</p>
        <Link to="/productos" className="btn btn-outline-primary">Ver productos</Link>
      </>
    )
  } else {
    // key: si la ruta se reusa con otro producto, el formulario arranca limpio.
    body = <ProductFields key={product?.id ?? 'new'} product={product} />
  }

  return (
    <Container className="py-4 py-md-5">
      <Card className="eg-maxw-md mx-auto">
        <Card.Body className="p-4">
          <h1 className="h3 mb-4">{edit ? 'Editar producto' : 'Agregar producto'}</h1>
          {body}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default ProductForm
