const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

// Supuesto: "$" = ARS (tienda argentina). Tolera undefined/null/NaN -> "$ 0,00" para no romper la UI con un producto incompleto.
export const formatPrice = (n) => money.format(Number(n) || 0)

export const PLACEHOLDER = '/placeholder.svg'

// <img onError={onImgError}>: si la imagen del back falla muestra el placeholder (sin loop si el placeholder también falla).
export const onImgError = ({ currentTarget: img }) => {
  if (!img.src.endsWith(PLACEHOLDER)) img.src = PLACEHOLDER
}
