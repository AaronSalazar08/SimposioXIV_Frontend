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

- **Servidor**: DigitalOcean, provisionado y administrado por **Laravel Forge** (guía completa abajo) — esta es la vía documentada y soportada para este proyecto.
- Alternativas más simples si no se usa Forge: [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), Cloudflare Pages.
- HTTPS obligatorio (el backend en producción también debe estar en HTTPS; no mezclar HTTP/HTTPS por contenido mixto).
- El backend ([`SimposioXIV_Backend`](../SimposioXIV_Backend/README.md)) debe estar desplegado y accesible públicamente antes de apuntar `VITE_API_URL` a él.

### Build

```bash
npm ci
npm run build
```

Esto genera `dist/` con los assets listos para servir. Como es una SPA con rutas de cliente (React Router), el servidor debe redirigir cualquier ruta desconocida a `index.html` (rewrite/fallback):

- **Nginx**: `try_files $uri $uri/ /index.html;`
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

---

## Despliegue en DigitalOcean con Laravel Forge (paso a paso)

Forge no "ejecuta" esta app (es un SPA estático, no hay PHP en runtime) — lo que hace es: provisionar el droplet en DigitalOcean, clonar el repo, correr el build de Node en cada deploy, y servir la carpeta `dist/` resultante con Nginx. Esta sección asume que ya tenés (o vas a desplegar por separado) el backend accesible en HTTPS — necesitás su URL pública para `VITE_API_URL`.

### Requisitos previos

- Cuenta en [Laravel Forge](https://forge.laravel.com/) con un plan activo.
- Cuenta en [DigitalOcean](https://www.digitalocean.com/) con un método de pago configurado.
- Repositorio en GitHub (o GitLab/Bitbucket) con este proyecto, accesible desde tu cuenta.
- Un dominio o subdominio para el frontend (ej. `simposio.ucr.ac.cr` o `app.tudominio.com`) con acceso a su configuración DNS.
- El backend ya desplegado y con una URL pública HTTPS conocida (ver [README del backend](../SimposioXIV_Backend/README.md#poner-en-producción)).

### 1. Conectar DigitalOcean a Forge

1. En DigitalOcean: **API** → **Tokens** → **Generate New Token**, con permisos de lectura y escritura. Copiá el token (solo se muestra una vez).
2. En Forge: **Account** → **API Providers** → **DigitalOcean** → **Connect Account**, pegá el token.

### 2. Provisionar el servidor

1. Forge → **Servers** → **Create Server**.
2. **Provider**: DigitalOcean.
3. **Server Type**: "App Server" (no hace falta Load Balancer ni base de datos gestionada — el frontend no usa ninguna).
4. **Región**: la más cercana a tus usuarios (ej. la región de DigitalOcean más próxima a Costa Rica).
5. **Tamaño**: el droplet más pequeño alcanza de sobra (solo sirve archivos estáticos vía Nginx).
6. **PHP Version**: dejá la que venga por defecto — este sitio no la usa en runtime, pero Forge la pide para poder provisionar Nginx.
7. **Create Server** y esperá (~5 minutos) a que Forge termine de provisionar el droplet, instalar Nginx, configurar el firewall (UFW), etc.

### 3. Instalar Node.js en el servidor

1. Dentro del servidor recién creado, andá a la pestaña **Node**.
2. Instalá Node 20 (o superior, según lo que pida `package.json`) y marcalo como la versión activa.
3. Confirmá que `node -v` / `npm -v` respondan por SSH (Forge da acceso SSH directo desde la pestaña del servidor).

### 4. Crear el Site

1. Servidor → **Sites** → **Create Site**.
2. **Root Domain**: el dominio/subdominio del frontend (ej. `app.simposio.ucr.ac.cr`).
3. **Project Type**: **Static HTML** — le indica a Forge que no necesita PHP-FPM para este sitio.
4. Dejá **Create Database** desmarcado (no aplica).

### 5. Conectar el repositorio Git

1. En el site → pestaña **Apps** (Git Repository).
2. Conectá tu proveedor Git (autorización OAuth) si es la primera vez.
3. **Repository**: `<tu-usuario>/SimposioXIV_Frontend`.
4. **Branch**: `main`.
5. **Install Repository** — Forge clona el repo en `/home/forge/<dominio>`.

### 6. Variable de entorno `VITE_API_URL`

Como esta variable se incrusta **en tiempo de build** (no en runtime), tiene que existir en el archivo `.env` del checkout antes de correr `npm run build`:

1. Site → pestaña **Environment**.
2. Reemplazá el contenido por:
   ```env
   VITE_API_URL=https://api.tudominio.com/api
   ```
3. Forge guarda esto como `.env` en la raíz del checkout (`$FORGE_SITE_PATH/.env`) — Vite lo lee automáticamente al buildear.

### 7. Configurar el Deploy Script

Site → pestaña **Apps** → **Deploy Script**. Reemplazá el script por defecto (viene pensado para PHP/Laravel) por:

```bash
cd $FORGE_SITE_PATH
git pull origin $FORGE_SITE_BRANCH

# Cargar nvm para tener node/npm disponibles en el script de deploy
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

npm ci
npm run build
```

> Si el script falla con `nvm: command not found`, confirmá la ruta exacta de instalación de Node en la pestaña **Node** del servidor y ajustá `NVM_DIR` según lo que Forge indique ahí.

### 8. Apuntar Nginx a `dist/` + fallback de SPA

El build queda en `$FORGE_SITE_PATH/dist`, no en la raíz del checkout — hay que decirle a Nginx dónde está y agregar el fallback para que las rutas de React Router no den 404 al recargar:

1. Site → **Files** → **Edit Nginx Configuration**.
2. Cambiá la directiva `root` para que apunte a `dist`:
   ```nginx
   root /home/forge/app.tudominio.com/dist;
   ```
3. Dentro del bloque `location / { ... }`, agregá (o reemplazá) el `try_files`:
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
4. Guardá — Forge reinicia Nginx automáticamente.

### 9. DNS

En tu proveedor de DNS (o en DigitalOcean si administrás el dominio ahí), creá un registro **A** apuntando el dominio/subdominio a la IP pública del droplet (visible en la vista del servidor en Forge). Esperá la propagación.

### 10. SSL (HTTPS)

1. Site → pestaña **SSL**.
2. **Let's Encrypt** → ingresá el dominio → **Obtain Certificate**.
3. Forge configura HTTPS y su renovación automática.

### 11. Quick Deploy + primer despliegue

1. Site → **Apps** → activá **Quick Deploy** (cada push a la rama configurada dispara el deploy script automáticamente).
2. Click **Deploy Now** para forzar el primer despliegue.

### 12. Verificación final

- [ ] `https://app.tudominio.com` carga la SPA correctamente.
- [ ] Recargar una ruta interna (ej. `/inscripciones`, `/admin/usuarios`) no da 404 — confirma que el `try_files` del paso 8 quedó bien puesto.
- [ ] Login contra el backend real funciona (revisá la consola del navegador por errores de CORS — si aparecen, revisá `SANCTUM_STATEFUL_DOMAINS` y CORS en el backend, ver su README).
- [ ] Panel de administración (`/admin`) accesible y funcional con un usuario admin real.
- [ ] Certificado HTTPS válido (candado verde, sin advertencias de contenido mixto).

Si más adelante cambia la URL del backend, actualizá `VITE_API_URL` en la pestaña **Environment** y forzá **Deploy Now** — cambiar la variable sola no alcanza, necesita un rebuild.

## Equipo / contexto

Proyecto desarrollado en el marco del **TCU** — Sistema de gestión del Simposio UCR.
