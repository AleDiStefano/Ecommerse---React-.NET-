import React from 'react'
import ReactDOM from 'react-dom/client'
// El orden de estos imports define la cascada: Bootstrap, después nuestros tokens, después los componentes.
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'
import AuthenticationContextProvider from './services/authentication/AuthenticationContext.jsx'
import CartContextProvider from './services/cart/CartContext.jsx'
import PayMethodContextProvider from './services/cart/PayMethodContext.jsx'

// Carrito y datos de pago leen la sesión: AuthenticationContext tiene que ser el padre de ambos.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthenticationContextProvider>
      <CartContextProvider>
        <PayMethodContextProvider>
          <App />
        </PayMethodContextProvider>
      </CartContextProvider>
    </AuthenticationContextProvider>
  </React.StrictMode>
)
