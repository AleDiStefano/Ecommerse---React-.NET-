import Carrousel from '../carrousel/Carrousel'
import Products from '../products/Products'

// El hero va de borde a borde (fuera de Container); el catálogo trae su propio Container y el h1 de la página.
const LandingPage = () => (
  <>
    <Carrousel />
    <Products />
  </>
)

export default LandingPage
