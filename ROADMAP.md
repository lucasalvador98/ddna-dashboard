# DDNA Dashboard - Roadmap de Desarrollo

## Estado Actual: ✅ Frontend rediseñado con identidad visual DDNA

### Lo Que Ya Está Hecho

#### 1. Datos en Supabase
| Tabla | Filas | Descripción |
|-------|-------|-------------|
| `indicadores` | ~1800+ | Datos de todas las categorías |
| `paicor` | 105 | Beneficiarios PAICOR 2018 por departamento |
| `indicadores_api` | 16 | Metadata de fuentes API |
| `indicadores_geografia` | 10 | Capas geoespaciales |

#### 2. Frontend
- ✅ Dashboard principal muestra datos reales de Supabase (no más placeholders)
- ✅ Todos los charts muestran fuente y fecha de actualización
- ✅ hook `use-paicor.ts` para datos de PAICOR
- ✅ Página inversión muestra gráfico de PAICOR por departamento

#### 3. APIs Conectadas
- ✅ Gestión Abierta Córdoba (CKAN provincial) - 145 paquetes
- ✅ Gobierno Abierto Córdoba (DRF municipal) - 774 datasets
- ⚠️ Datos de CKAN para PAICOR 2017, 2019-2022 ya no disponibles (404)

---

### Lo Que Falta (Para Próximas Sesiones)

#### Prioridad Alta
1. **Cargar más datos de encuestas** desde `Desktop/Monitoreo/.../Encuestas 2024/`
2. **Crear gráficos de educación** con datos por departamento (ya en DB)
3. **Conectar datos de mortalidad infantil** desde archivo local DEIS
4. **Agregar datos de pobreza** desde archivo `cuadros_informe_pobreza_09_24`

#### Prioridad Media
5. **Optimizar carga de página** - lazy loading para category pages
6. **Crear página de demografía** - población por edad/grupo
7. **Agregar más fuentes API** - indicadores laborales, IPS desde Gobierno Abierto
8. **Mapas interactivos** - usar capas de IDECOR

#### Pendientes de Datos
9. **Resultados Aprender** - evaluasi ones educativas
10. **Datos de consumo** - encuestas de sustancias
11. **Datos de protección digital**

---

## Estructura del Proyecto

```
ddna-dashboard/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── salud/page.tsx        # Gráficos salud
│   │   ├── educacion/page.tsx     # Gráficos educación
│   │   ├── pobreza/page.tsx      # Gráficos pobreza
│   │   ├── seguridad/page.tsx    # Gráficos seguridad
│   │   └── inversion/page.tsx    # Gráficos inversión + PAICOR
│   ├── lib/
│   │   ├── hooks.ts              # useIndicadores hook
│   │   ├── use-chart-data.ts     # useChartData hook
│   │   ├── use-paicor.ts         # usePaicor hook (NUEVO)
│   │   ├── data.ts               # Tipos y placeholders
│   │   └── chart-data.ts         # Datos placeholder para charts
│   └── components/
│       ├── charts/
│       │   ├── chart-card.tsx    # ChartCard con fuente/fecha
│       │   └── paicor-by-department.tsx  # (NUEVO)
│       └── kpi-card.tsx
├── etl/
│   ├── load_paicor.py            # Carga PAICOR desde CKAN
│   ├── load_inversion.py         # Carga inversión desde Excel
│   ├── paicor_2018.csv           # Datos PAICOR 2018
│   ├── sources.yaml              # Configuración de fuentes
│   └── README.md                 # Documentación ETL
└── Supabase/
    └── (tablas criadas via MCP)
```

---

## Comandos Útiles

### Desarrollo
```bash
cd ddna-dashboard
npm run dev
```

### Cargar Datos (futuro)
```bash
# Cargar más PAICOR si aparecen datos
python etl/load_paicor.py

# Cargar inversión
python etl/load_inversion.py
```

### Ver Datos en Supabase
```sql
-- Ver todos los datos de inversión
SELECT * FROM indicadores WHERE categoria = 'inversion';

-- Ver PAICOR por departamento
SELECT departamento, SUM(cant_beneficios) as total 
FROM paicor 
GROUP BY departamento 
ORDER BY total DESC;

-- Ver categorías disponibles
SELECT categoria, COUNT(*) FROM indicadores GROUP BY categoria;
```

---

## Fuentes de Datos Identificadas

### APIs (funcionando)
- **Gestión Abierta**: https://datosgestionabierta.cba.gov.ar
- **Gobierno Abierto**: https://gobiernoabierto.cordoba.gob.ar

### Archivos Locales (en Desktop/Monitoreo/)
- `TABLEROS Y BASES/Inversion/BASE DE DATOS.xlsx` ✅ ya cargado
- `TABLEROS Y BASES/Encuestas 2024/encuestas 2024.xlsx` ⏳ pendiente
- `Datos y Bases/bbdd/Mortalidad infantil Nacion-Provincia.xlsx` ⏳ pendiente
- `Datos y Bases/bbdd/cuadros_informe_pobreza_09_24 (1).xlsx` ⏳ pendiente

---

## Notas Técnicas

- **Stack**: Next.js 16, React 19, TypeScript, Tailwind v4, Supabase
- **DB**: `ppyyqrvirjqmfpqaqnxy.supabase.co`
- **Auth**: Usar MCP de Supabase para operaciones directa a DB
- **Fuente metadata**: Todos los datos nuevos tienen `fuente` y `ultima_actualizacion`

---

## 🔴 PRIORIDAD: Rediseño Frontend (Nueva Sesión)

### Análisis Realizado

#### 1. Sitio Oficial DDNA: https://ddna.cba.gov.ar/
El sitio oficial tiene:
- **Colores**: Naranja (#FF7F11), Azul (#3777FF), Blanco
- **Fuentes**: Epilogue (títulos), Caprasimo (display)
- **Estructura**: Grid de accesos rápidos con íconos circulares
- **Banner principal**: Gif animado con logo
- **Navegación**: Menú horizontal con dropdowns

#### 2. Recursos de Identidad (en Monitoreo/Recursos Identidad)
- **Logos**: DDNA_HORIZONTAL_COLOR.png, DDNA_VERTICAL_COLOR.png, SIGLAS.png
- **Fuentes**: Epilogue-VariableFont_wght.ttf, Caprasimo-Regular.ttf
- **Paleta de colores**: Definida en Tema.json
- **Elementos gráficos**: 7 recursos visuales

---

### Tareas para Rediseño

#### A) Aplicar Identidad Visual DDNA
- [x] **A.1** Importar fuentes oficiales (Epilogue, Caprasimo) en el proyecto ✅
- [x] **A.2** Actualizar tailwind.config.js con colores institucionales DDNA ✅
- [x] **A.3** Agregar logos oficiales al header (horizontal y vertical) ✅
- [ ] **A.4** Crear componente de header/navbar estilo sitio oficial

#### B) Rediseñar Página Principal
- [x] **B.1** Cambiar fondo azul sólido por diseño más dinámico (gradiente o imagen) ✅
- [x] **B.2** Crear grid de acceso rápido con gradientes coloridos por categoría ✅
- [x] **B.3** Agregar banner principal con gradiente naranja-ámbar ✅
- [x] **B.4** reorganizar KPIs en grid más visual ✅

#### C) Mejoras de Diseño
- [x] **C.1** Usar border-radius más suave en cards (similar al sitio) ✅
- [x] **C.2** Agregar efectos hover en elementos interactivos ✅
- [x] **C.3** Mejorar tipografía (tamaños, spacing) ✅
- [x] **C.4** Añadir iconos más representativos por categoría (cat-*.png) ✅

#### D) Optimización (ya planned)
- [ ] **D.1** Agregar lazy loading para páginas de categorías
- [ ] **D.2** Añadir loading skeletons

---

### Completado en Sesión Actual
- ✅ Header banner con gradiente naranja→ámbar (commit 46f3fe5)
- ✅ Quick Access buttons con gradientes por categoría
- ✅ Contenedor redondeado blanco para título
- ✅ Eliminación de código duplicado residual
- ✅ Build pasa exitosamente
- ✅ Rediseño completo del homepage: hero con gradiente diagonal, textura de rayas, círculos decorativos flotantes, wave divider
- ✅ Botones circulares Quick Access con rotación alternada para más energía visual
- ✅ Stats section con fondo navy oscuro como ancla visual
- ✅ Todas las Image components con width y height explícitos (fix aspect ratio warnings)
- ✅ Commit: 46f3fe5 + commit de rediseño visual

---

## Notas de Diseño del Sitio Oficial

```css
/* Colores principales */
--naranja: #FF7F11
--azul: #3777FF
--blanco: #FFFFFF

/* Fuentes */
font-family: 'Epilogue', sans-serif;  /* Texto */
font-family: 'Caprasimo', display;    /* Títulos */

/* Estilo de botones/links */
border-radius: 50%  /* Círculos para acceso rápido */
```

### Archivos de Identidad a Usar
- `Recursos Identidad/Fonts/Fonts/Epilogue-VariableFont_wght.ttf`
- `Recursos Identidad/Fonts/Fonts/Caprasimo-Regular.ttf`
- `Recursos Identidad/Elementos/LOGO DDNA_HORIZONTAL_COLOR.png`
- `Recursos Identidad/Elementos/LOGO DDNA_VERTICAL_COLOR.png`
- `Recursos Identidad/Elementos/SIGLAS.png`

---

*Última actualización: 2026-04-16*
*Estado: Listo para sesión de rediseño*
