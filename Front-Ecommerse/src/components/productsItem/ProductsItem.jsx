import { Badge, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { PLACEHOLDER, formatPrice, onImgError } from '../../services/format'

// Solo se etiqueta lo que NO se puede comprar: lo normal (disponible) no necesita badge.
const blockedLabel = (item) => (!item.avaible ? 'No disponible' : item.stock < 1 ? 'Sin stock' : null)

// Toda la card es el link (stretched-link sobre el nombre): un solo tab stop y el nombre como texto del enlace.
const ProductsItem = ({ item }) => {
  const label = blockedLabel(item)
  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column p-2 p-sm-3">
        <div className="position-relative mb-2">
          <img src={item.image || PLACEHOLDER} alt={item.name} loading="lazy" onError={onImgError} className="eg-media bg-white d-block w-100" />
          {label && <Badge bg="secondary" className="position-absolute top-0 start-0 m-2">{label}</Badge>}
        </div>
        <span className="small text-uppercase text-body-secondary">{item.category}</span>
        <h2 className="h6 fw-semibold mb-0">
          <Link
            to={`/producto/${item.id}`}
            className="stretched-link text-reset eg-clamp-2 link-underline link-underline-opacity-0 link-underline-opacity-100-hover"
          >
            {item.name}
          </Link>
        </h2>
        <div className="mt-auto pt-2">
          <span className="d-block small text-body-secondary">{item.brand}</span>
          <span className="eg-price fs-5 text-break">{formatPrice(item.price)}</span>
        </div>
      </Card.Body>
    </Card>
  )
}

export default ProductsItem
