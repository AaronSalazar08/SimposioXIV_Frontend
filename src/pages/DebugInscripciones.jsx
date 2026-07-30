import { useState } from 'react'
import EventoCard from '../components/EventoCard'
import EventoSlotCarousel from '../components/EventoSlotCarousel'
import ConfirmacionInscripcionModal from '../components/inscripciones/ConfirmacionInscripcionModal'
import InscripcionesDiaTabs from '../components/inscripciones/InscripcionesDiaTabs'

const HORARIO = { numero_dia: 1, hora_inicio: '2026-08-05T14:00:00.000Z', hora_fin: '2026-08-05T14:30:00.000Z', aula: { numero: '201', edificio: 'ECCI' } }

const EVENTOS = {
  normal: {
    id: 1, titulo: 'Arquitecturas modernas para software empresarial', tipo: 'charla',
    descripcion: 'Un recorrido por los patrones de arquitectura que sostienen los sistemas de software empresarial actuales, con ejemplos reales de la industria costarricense.',
    horario: HORARIO, areas: [{ id: 1, nombre: 'Desarrollo', color: '#3B82F6' }],
    ponentes: [{ nombre: 'María', apellidos: 'Vargas Solís' }],
    cupos_disponibles: 18, capacidad: 30, tiene_capacidad_disponible: true, usuario_inscrito: false,
  },
  reservado: {
    id: 2, titulo: 'Taller de IA aplicada a procesos de negocio', tipo: 'taller',
    descripcion: 'Manos a la obra con modelos de lenguaje aplicados a la automatización de procesos empresariales.',
    horario: HORARIO, areas: [{ id: 2, nombre: 'Datos', color: '#F59E0B' }],
    ponentes: [{ nombre: 'Carlos', apellidos: 'Jiménez Rojas' }],
    cupos_disponibles: 4, capacidad: 25, tiene_capacidad_disponible: true, usuario_inscrito: true,
  },
  agotado: {
    id: 3, titulo: 'Ciberseguridad y firma digital', tipo: 'apertura',
    descripcion: 'Sesión de apertura sobre los retos de ciberseguridad en la administración pública costarricense.',
    horario: HORARIO, areas: [],
    ponentes: [{ nombre: 'Ana', apellidos: 'Rodríguez Mora' }],
    cupos_disponibles: 0, capacidad: 40, tiene_capacidad_disponible: false, usuario_inscrito: false,
  },
}

export default function DebugInscripciones() {
  const [dia, setDia] = useState('1')
  const [confirmando, setConfirmando] = useState(null)

  return (
    <div style={{ background: '#F8FAFD', minHeight: '100vh', paddingBottom: 80 }}>
      <ConfirmacionInscripcionModal
        evento={confirmando}
        inscribiendo={false}
        onConfirmar={() => setConfirmando(null)}
        onCancelar={() => setConfirmando(null)}
      />

      <section style={{ background: 'linear-gradient(145deg, #010810, #001020 40%, #001a38 70%, #002650)', padding: '60px 24px 40px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 24px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '3rem', color: '#fff' }}>
            Reservá tu <span className="ed" style={{ color: '#21BBEF' }}>lugar.</span>
          </h1>
          <div className="grid grid-cols-3 gap-3 max-w-xl">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <div className="font-display text-[2rem] font-bold text-brand-cyan">1</div>
              <div className="mt-1.5 font-pixel text-[11px] uppercase tracking-[0.14em] text-white/45">Reservadas hoy</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <div className="font-display text-[2rem] font-bold text-white">2/3</div>
              <div className="mt-1.5 font-pixel text-[11px] uppercase tracking-[0.14em] text-white/45">Con cupo</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <div className="font-display text-[2rem] font-bold text-white">4</div>
              <div className="mt-1.5 font-pixel text-[11px] uppercase tracking-[0.14em] text-white/45">Total reservado</div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 24px' }}>
        <InscripcionesDiaTabs
          diaActivo={dia}
          onSelectDia={setDia}
          conteosPorDia={{ 1: 12, 2: 8, 3: 5 }}
        />

        <div className="mt-8 space-y-4 max-w-xl">
          <h2 className="font-display font-bold text-lg text-slate-900">Tarjetas individuales</h2>
          <EventoCard evento={EVENTOS.normal} onInscribirse={setConfirmando} onCancelar={() => {}} />
          <EventoCard evento={EVENTOS.reservado} onInscribirse={setConfirmando} onCancelar={() => {}} inscripcionId={99} />
          <EventoCard evento={EVENTOS.agotado} onInscribirse={setConfirmando} onCancelar={() => {}} />
          <EventoCard
            evento={EVENTOS.normal}
            onInscribirse={setConfirmando}
            onCancelar={() => {}}
            mensajeAccion={{ type: 'success', message: '¡Listo! Quedaste inscrito en este evento.' }}
          />
        </div>

        <div className="mt-10">
          <h2 className="font-display font-bold text-lg text-slate-900 mb-3">Carrusel — 3 eventos en paralelo</h2>
          <EventoSlotCarousel>
            <EventoCard evento={{ ...EVENTOS.normal, id: 10, titulo: 'Charla A' }} onInscribirse={setConfirmando} onCancelar={() => {}} />
            <EventoCard evento={{ ...EVENTOS.reservado, id: 11, titulo: 'Taller B' }} onInscribirse={setConfirmando} onCancelar={() => {}} inscripcionId={98} />
            <EventoCard evento={{ ...EVENTOS.agotado, id: 12, titulo: 'Charla C' }} onInscribirse={setConfirmando} onCancelar={() => {}} />
          </EventoSlotCarousel>
        </div>
      </div>
    </div>
  )
}
