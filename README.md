# Simposio XIV — Frontend (UCR)

Aplicación web (SPA) para participantes y administradores del **XIV Simposio de Informática Empresarial** de la Universidad de Costa Rica: consulta de eventos, inscripción a actividades, cronograma personal, gestión de sesión y panel de administración.

Este repositorio es **la mitad de un sistema de dos proyectos**: no tiene lógica de negocio ni base de datos propia, todo lo consume vía API REST del backend.

```
SimposioXIV_Backend                 Laravel 13 / PHP 8.5 / PostgreSQL
        ↑  API REST  /api/*  (Bearer token, Sanctum)
SimposioXIV_Frontend (este repo)    React 19 / Vite / TanStack Query
```

> Repo hermano: [`SimposioXIV_Backend`](../SimposioXIV_Backend/README.md) — necesario para que esta app funcione. Ahí está la guía para levantar la API, los endpoints disponibles y las reglas de negocio.

---

## Stack técnico

| Tecnología | Uso |
|---|---|
| React 19 + Vite 8 | Framework UI y bundler |
| React Router 7 | Routing (rutas protegidas de participante y de admin) |
| TanStack Query v5 | Caché de servidor, mutaciones optimistas |
| Axios | HTTP client con interceptor de token y manejo global de 401 |
| Tailwind CSS 4 | Estilos con tokens custom UCR |
| tsparticles | Animación de partículas en Home |
| Vitest + ESLint | Tests unitarios y análisis estático |

## Qué necesita del backend

- La API corriendo y accesible en la URL de `VITE_API_URL` (ver [variables de entorno](#variables-de-entorno)).
- Login por `identifier` (email `@ucr.ac.cr` o carnet) + `password`, devuelve un **token Bearer** (Sanctum) que esta app guarda en `localStorage` y adjunta en cada request.
- CORS habilitado en el backend para el origen donde corra este frontend (viene habilitado por defecto en Laravel para rutas `/api/*`; en producción revisar si hace falta restringirlo — ver README del backend).
- Endpoints de administración bajo `/api/admin/*`, solo accesibles si el usuario autenticado tiene `tipo_usuario: "admin"`.

## Funcionalidades principales

**Participante:**
- Login con carnet o correo UCR, cambio de contraseña vía OTP por correo
- Inscripciones: listado de eventos, filtros por día/tipo/área, inscribir/cancelar con actualización optimista de cupos
- Cronograma personal: inscripciones confirmadas agrupadas por día
- Rutas protegidas con token en `localStorage` (`ProtectedRoute`)

**Administrador** (`/admin`, requiere `tipo_usuario: admin`, ruta protegida con `AdminRoute`):
- Dashboard, gestión CRUD de usuarios, eventos, horarios, aulas, ponentes y áreas
- Ver inscritos por evento
- Envío de correos (individual o masivo) a usuarios desde el panel

## Arquitectura en capas

```
src/
├── api/                    Cliente Axios + interceptor de token + manejo 401
│   ├── client.js
│   ├── auth.js              login | logout | getMe
│   ├── authNormalize.js      Normaliza el user del backend a { name, email, tipo_usuario, ... }
│   ├── eventos.js, inscripciones.js
│   └── admin.js               Llamadas a /api/admin/*
│
├── context/AuthContext.jsx  Estado global de sesión (user, loading, login/logout)
├── hooks/
│   ├── queries/              useEventos, useMisInscripciones
│   └── mutations/            useInscripcionMutations, useCancelarInscripcion
│
├── pages/
│   ├── Home.jsx, Login.jsx, Perfil.jsx
│   ├── Inscripciones.jsx, Agenda.jsx, Cronograma.jsx
│   └── admin/                AdminDashboard, AdminUsuarios, AdminEventos, AdminHorarios,
│                              AdminAulas, AdminPonentes, AdminAreas, AdminEventoInscritos
│
├── components/
│   ├── Layout.jsx, Navbar.jsx, ProtectedRoute.jsx, AdminRoute.jsx
│   ├── admin/                 AdminLayout, AdminModal, HorarioGrid, SearchInput
│   ├── perfil/CambiarPasswordModal.jsx   Flujo de cambio de contraseña con OTP
│   └── ui/, inscripciones/
│
├── constants/                queryKeys, tipos/estados de evento, estilos de formularios
└── utils/                    fechas, filtros, agrupación, parches de caché, mensajes de error de API
    (cada util tiene su archivo .test.js co-ubicado)
```

## Flujo de autenticación

```
1. App carga → AuthContext verifica token en localStorage
2. Si hay token → GET /api/me → setUser(normalizeAuthUser(data))
3. Login → POST /api/login → guarda token → setUser → navigate('/')
4. Logout → POST /api/logout → limpia token → setUser(null) → navigate('/login')
5. 401 global → interceptor Axios → notifyUnauthorized() → AuthContext limpia todo → navigate('/login')
```

---

## Levantar en local

### Requisitos

- [Node.js](https://nodejs.org/) 20 o superior
- API backend corriendo (ver [README del backend](../SimposioXIV_Backend/README.md) — por defecto en `http://localhost:8000`)

### Pasos

```bash
git clone <url-del-repo> SimposioXIV_Frontend
cd SimposioXIV_Frontend

npm install

cp .env.example .env
# Ajusta VITE_API_URL si tu backend no corre en localhost:8000

npm run dev
```

La app queda disponible en `http://localhost:5173`. Inicia sesión con cualquiera de los usuarios de prueba sembrados en el backend (ver su README), por ejemplo carnet `C37190` / password `password`, o `admin@ucr.ac.cr` / `Admin1234!` para entrar al panel de administración.

### Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base del API REST del backend (sin barra final) | `http://localhost:8000/api` |

### Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Desarrollo con recarga en caliente |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Previsualizar el build localmente |
| `npm run lint` | Análisis estático con ESLint |
| `npm test` | Tests en modo watch (Vitest) |
| `npm run test:run` | Tests una sola vez (usado en CI) |

---

## Testing y calidad

```bash
npm run lint
npm run test:run
```

CI (`.github/workflows/ci.yml`) corre en cada push/PR a `main`, `master` o `develop`: `lint` → `test:run` → `build`.

---

## Poner en producción

Esta app compila a archivos estáticos (`dist/`) — no necesita un servidor Node en producción, solo un host de estáticos o un Nginx sirviendo el `dist/`.

### Stack recomendado

- Hosting estático: [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), Cloudflare Pages, o Nginx propio sirviendo `dist/`
- HTTPS obligatorio (el backend en producción también debe estar en HTTPS; no mezclar HTTP/HTTPS por contenido mixto)
- El backend ([`SimposioXIV_Backend`](../SimposioXIV_Backend/README.md)) debe estar desplegado y accesible públicamente antes de apuntar `VITE_API_URL` a él

### Build

```bash
npm ci
npm run build
```

Esto genera `dist/` con los assets listos para servir. Como es una SPA con rutas de cliente (React Router), el servidor debe redirigir cualquier ruta desconocida a `index.html` (rewrite/fallback):

- **Nginx**: `try_files $uri /index.html;`
- **Vercel/Netlify**: configuración de rewrite `/* → /index.html` (`vercel.json` / `netlify.toml` o detección automática del framework)

### Variables de entorno en producción

| Variable | Producción |
|---|---|
| `VITE_API_URL` | URL pública del backend, ej. `https://api.simposio.ucr.ac.cr/api` |

Las variables `VITE_*` se incrustan en el build en tiempo de compilación — si cambias `VITE_API_URL` hay que volver a correr `npm run build`, no basta con cambiar el `.env` en el servidor.

### Checklist antes de exponerlo públicamente

- [ ] `VITE_API_URL` apunta al backend de producción (HTTPS)
- [ ] Backend configurado con `SANCTUM_STATEFUL_DOMAINS` y CORS aceptando el dominio de este frontend (ver README del backend)
- [ ] Rewrite/fallback a `index.html` configurado en el host (evita 404 al refrescar rutas como `/inscripciones` o `/admin/usuarios`)
- [ ] `npm run build` corrido con las variables de entorno de producción correctas
- [ ] Verificar login, inscripción/cancelación y panel de admin contra el backend real antes de publicar

## Equipo / contexto

Proyecto desarrollado en el marco del **TCU** — Sistema de gestión del Simposio UCR.
