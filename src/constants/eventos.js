export const TIPO_LABELS = {
  apertura: 'Apertura',
  clausura: 'Clausura',
  taller: 'Taller',
  charla: 'Charla',
}

export const TIPO_COLORS = {
  apertura: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  clausura: 'bg-rose-100 text-rose-700 border-rose-200',
  taller: 'bg-amber-100 text-amber-800 border-amber-200',
  charla: 'bg-sky-100 text-sky-800 border-sky-200',
}

export const TIPO_COLOR_DEFAULT = 'bg-gray-100 text-gray-700 border-gray-200'

export const FILTRO_TIPOS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'apertura', label: 'Apertura' },
  { value: 'clausura', label: 'Clausura' },
  { value: 'taller', label: 'Talleres' },
  { value: 'charla', label: 'Charlas' },
]

export const FILTRO_DIAS = [
  { value: '', label: 'Todos los días' },
  { value: '1', label: 'Día 1' },
  { value: '2', label: 'Día 2' },
  { value: '3', label: 'Día 3' },
]
