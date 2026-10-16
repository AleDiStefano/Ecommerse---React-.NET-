# EasyGrip — Front

Tienda online de artículos deportivos: React 18, Vite 5 y react-bootstrap. El back (.NET 8) está en `../Back-Ecommerse`.

## Cómo correrlo

Back y front tienen que estar corriendo a la vez.

**1. Back** (desde la raíz del repo):

```bash
dotnet run --project "Back-Ecommerse/API TPI Laboratorio3" --launch-profile http
```

Queda en http://localhost:5077 (Swagger en `/swagger`), sin certificado. El perfil `https` (el que usa Visual Studio en este proyecto) publica además https://localhost:7197 y necesita el certificado de desarrollo vigente (`dotnet dev-certs https --trust`).

> Los datos viven **en memoria**: al reiniciar el back vuelven el seed de productos, usuarios y pedidos, y el stock original.

**2. Front** (desde `Front-Ecommerse/`):

```bash
npm install
cp .env.example .env.local   # solo si el back corre con el perfil http (con el perfil https no hace falta: el default es https://localhost:7197)
npm run dev                  # http://localhost:5173
```

El puerto 5173 es fijo (`strictPort`): el CORS del back solo admite ese origen.

## Variables de entorno

| Variable | Default | Para qué |
|---|---|---|
| `VITE_API_URL` | `https://localhost:7197` (perfil `https` del back) | URL del back. `.env.example` trae la del perfil `http` (`http://localhost:5077`); va en `.env.local` (git lo ignora). |

## Cuentas de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Cliente | `ale@gmail.com` | `ale` |
| Vendedor | `gaston@gmail.com` | `gaston` |
| Admin | `admin@easygrip.com` | `admin` |

## Scripts

`npm run dev` · `npm run build` · `npm run preview` · `npm run lint` (0 errores y 0 warnings).

## Cómo está armado

- **Back**: todo pasa por `api()` en `src/services/api.js` (único lugar con la URL); `useApi(path)` en `src/hook/` para GET con estado de carga y error.
- **Sesión, carrito y datos de pago**: contextos en `src/services/` (`AuthenticationContext`, `CartContext`, `PayMethodContext`). La sesión y el carrito se guardan en `localStorage`.
- **Rutas y roles**: `src/App.jsx`. `ProtectedRoute` aplica los roles de `src/services/authentication/roles.js`.
- **Estilos**: Bootstrap + los tokens de `src/index.css` (`--eg-*` y clases `eg-*`), que es el único CSS global.

## Limitaciones conocidas

- El API no autentica: el rol de cada usuario solo se aplica en el front.
- Precios en pesos argentinos (`$`).
