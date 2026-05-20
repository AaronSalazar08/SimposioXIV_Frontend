# Simposio XIV — Frontend (UCR)

Aplicación web para participantes del **Simposio XIV** de la Universidad de Costa Rica: consulta de eventos, inscripción a actividades, cronograma personal y gestión de sesión.

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior
- API backend del simposio en ejecución (por defecto `http://localhost:8000/api`)

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Variables de entorno (copiar y ajustar)
cp .env.example .env

# Servidor de desarrollo
npm run dev
```

La app queda disponible en `http://localhost:5173` (puerto por defecto de Vite).

## Variables de entorno

| Variable        | Descripción                          | Ejemplo                        |
|-----------------|--------------------------------------|--------------------------------|
| `VITE_API_URL`  | URL base del API REST                | `http://localhost:8000/api`    |

## Scripts

| Comando           | Descripción                                      |
|-------------------|--------------------------------------------------|
| `npm run dev`     | Desarrollo con recarga en caliente               |
| `npm run build`   | Build de producción en `dist/`                   |
| `npm run preview` | Previsualizar el build localmente                |
| `npm run lint`    | Análisis estático con ESLint                     |
| `npm test`        | Tests en modo watch (Vitest)                     |
| `npm run test:run`| Tests una sola vez (usado en CI)                 |

## Estructura del proyecto

```
src/
  api/              # Cliente Axios y llamadas al backend
  components/       # UI reutilizable (tarjetas, layout, alertas)
  constants/        # Tipos de evento, estados, claves React Query
  context/          # Autenticación (AuthProvider)
  hooks/            # Hooks compartidos (feedback, etc.)
  pages/            # Pantallas por ruta
  utils/            # Lógica pura (fechas, agrupación, errores API)
```

## Funcionalidades principales

- **Login** con carnet o correo UCR
- **Inscripciones**: listado de eventos, filtros, vista por horario o rejilla, inscribir/cancelar
- **Cronograma**: inscripciones confirmadas agrupadas por día
- Rutas protegidas con token JWT en `localStorage`

## Stack técnico

- React 19 + Vite 8
- React Router 7
- TanStack React Query (caché y mutaciones)
- Axios + Tailwind CSS 4
- Vitest (tests unitarios)

## CI

En cada push o pull request a `main`, `master` o `develop`, GitHub Actions ejecuta:

1. `npm run lint`
2. `npm run test:run`
3. `npm run build`

Ver [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Equipo / contexto

Proyecto desarrollado en el marco del **TCU** — Sistema de gestión del Simposio UCR.
