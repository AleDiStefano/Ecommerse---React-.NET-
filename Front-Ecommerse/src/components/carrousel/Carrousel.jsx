import { Carousel, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import './Carrousel.css'

// JPG (0,25-0,6 MB; los PNG pesaban 5,8 MB). Sin texto en la imagen: el copy vive en el caption y se puede editar acá.
const SLIDES = [
  {
    src: '/carrousel6.jpg',
    alt: 'Kettlebell de hierro con forma de cabeza de gorila sobre el piso de un gimnasio',
    title: 'Todo para entrenar mejor',
    text: 'Pesas, cardio y accesorios',
  },
  {
    src: '/carrousel7.jpg',
    alt: 'Fila de mancuernas en un rack de gimnasio, en blanco y negro',
    title: 'Entrená sin excusas',
    text: 'Equipá tu casa o tu gimnasio',
  },
  {
    src: '/carrousel8.jpg',
    alt: 'Persona levantando una barra cargada en un banco de press',
    title: 'Rendí al máximo',
    text: 'Equipamiento para cada rutina',
  },
]

// interval={null}: sin autoplay (WCAG 2.2.2 sin necesidad de botón de pausa); se navega con flechas, puntos o swipe.
// Los títulos son h2: el h1 de la página es el del catálogo (Products).
const Carrousel = () => (
  <Carousel
    className="eg-hero"
    role="region"
    aria-label="Destacados"
    interval={null}
    prevLabel="Imagen anterior"
    nextLabel="Imagen siguiente"
    indicatorLabels={SLIDES.map((_, i) => `Ir a la imagen ${i + 1}`)}
  >
    {SLIDES.map((slide, i) => (
      <Carousel.Item key={slide.src}>
        <img
          src={slide.src}
          alt={slide.alt}
          loading={i === 0 ? 'eager' : 'lazy'}
          className="eg-hero-img d-block w-100 object-fit-cover"
        />
        <Carousel.Caption className="eg-hero-caption top-0 bottom-0 start-0 end-0 d-flex align-items-center px-5 pt-0 pb-4 text-start">
          <Container>
            <div className="eg-maxw-md">
              <h2 className="display-6 fw-bold text-white">{slide.title}</h2>
              <p className="mb-3">{slide.text}</p>
              <Link to="/productos" className="btn btn-light">Ver productos</Link>
            </div>
          </Container>
        </Carousel.Caption>
      </Carousel.Item>
    ))}
  </Carousel>
)

export default Carrousel
