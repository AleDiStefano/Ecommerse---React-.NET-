import { ROLE } from '../../services/authentication/roles'

// Config de las pantallas de usuarios según su `role`, el mismo que usan los paths (/customer, /createseller, ...).
// `type` es el userType que devuelve el back.
export const USER_ROLES = {
  customer: { type: ROLE.CLIENT, noun: 'cliente', plural: 'Clientes' },
  seller: { type: ROLE.SELLER, noun: 'vendedor', plural: 'Vendedores' },
}
