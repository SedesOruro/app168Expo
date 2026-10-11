@AGENTS.md

# Emergencias 168 — monorepo

Tres aplicaciones en un solo repositorio, contra una sola base MySQL:

| Ruta       | Qué es                          | Stack                                   | Puerto dev |
|------------|---------------------------------|-----------------------------------------|-----------|
| `src/`     | App móvil del ciudadano         | Expo SDK 57 + React Native 0.86 + Paper | Metro 8081 |
| `backend/` | API REST + WebSocket            | Node + Express + TypeScript + Sequelize | 8090 (ver nota) |
| `admin/`   | Panel web para operadores       | React + Vite + MUI                      | 3000 |

Levantar todo en local: **`docs/LEVANTAR-LOCAL.md`** (comandos verificados, orden de arranque,
problemas frecuentes). No reinventes los comandos, lee ese archivo.

Nota del puerto: los `.env` apuntan al 8080, pero en este equipo lo ocupa AgentService
(la app de Claude Code) mientras está abierta, así que el backend se levanta en 8090 y
admin y móvil apuntan ahí con variables en línea.

## Antes de explorar: usa el grafo

Hay un grafo de conocimiento en `graphify-out/` (2307 nodos, 4634 aristas, 152 comunidades)
construido con AST sobre los archivos de código. Consultarlo devuelve un subgrafo
acotado; hacer `grep`/`glob` a ciegas sobre el repo devuelve mucho más ruido y gasta
bastantes más tokens.

Qué queda fuera del grafo y por qué está en `.graphifyignore` (assets binarios, `node_modules/`,
`android/`, la documentación del propio graphify). Ese archivo es lo que hace que las
exclusiones sobrevivan a cada rebuild; si el grafo vuelve a crecer con ruido, mira ahí primero.

`graphify` **no está en el PATH**. Invócalo siempre por ruta absoluta:

```bash
"C:/Users/SUSAN/AppData/Local/Python/pythoncore-3.14-64/Scripts/graphify.exe" query "cómo se crea una emergencia"
```

- `graphify query "<pregunta>"` — recorrido BFS, contexto amplio.
- `graphify path "<A>" "<B>"` — camino más corto entre dos conceptos.
- `graphify explain "<concepto>"` — explicación enfocada de un nodo.
- `graphify update .` — refresca el grafo tras cambiar código (solo AST, sin costo de tokens).

**Normalmente no hay que hacer nada**: un hook `post-commit` reconstruye el grafo en segundo
plano tras cada commit y encadena el re-etiquetado. El log queda en `~/.cache/graphify-rebuild.log`.

Si necesitas refrescarlo a mano sin commitear:

```bash
graphify update .                      # re-extrae el código cambiado (AST, sin costo)
python scripts/graphify-relabel.py     # re-etiqueta comunidades + regenera GRAPH_REPORT.md
```

Los dos pasos van juntos. El update reagrupa las comunidades y las renombra con el archivo
central de cada una ("EmergenciaRepositorySQL.ts"), que se lee mal en la salida de `query`; el
script deriva el nombre del directorio dominante. Existe también `graphify label .`, que hace lo
mismo con un LLM y cuesta tokens en cada corrida — no lo uses.

Si algún día vuelves a correr `graphify hook install`, el hook se regenera y pierde la llamada
al re-etiquetado; hay que volver a añadirla.

Lee `graphify-out/GRAPH_REPORT.md` únicamente para revisión de arquitectura amplia, cuando
query/path/explain no basten. **Nunca leas `graphify-out/graph.json` ni `graph.html`**: pesan
2.8 MB y 2.2 MB, son artefactos de máquina.

## Estructura

**Backend** — arquitectura hexagonal, un directorio por agregado bajo
`backend/src/core/emergencias/` (`emergencia`, `ciudadano`, `centro_salud`, `tipo_emergencia`,
`estado_emergencia`, `evidencia_emergencia`, `historial_emergencia`, `contacto_emergencia`,
`perfil`, `respuesta_triage`, `sesion_refresh`) y `backend/src/core/system/autenticacion/`
(`usuario`, `rol`). Cada agregado repite la misma forma:

```
<agregado>/
  domain/        entidad + interfaz de repositorio (I<X>Repository.ts)
  infra/         implementación SQL (<X>RepositorySQL.ts)
  infra/_sql/    modelo Sequelize (<X>SQLModel.ts)   <- uno por agregado, nunca centralizado
  <X>Service.ts  caso de uso
```

Las piezas compartidas viven en `backend/src/base/` (`BaseService`, `IRepository`,
`BaseSQLRepository`, `BaseHttpController`, `HttpErrors`, `Result`). Los endpoints están en
`backend/src/views/` con su `*ViewController.ts` y `*ControllerRoutes.ts`.

**Móvil** — feature-first: `src/features/{auth,dashboard,emergency}/` con
`data/ · domain/ · presentation/`. Lo transversal en `src/shared/` (componentes, tema,
layouts, utils) y el arranque en `src/app/` (navegación, providers, bootstrap).

**Admin** — `admin/src/components/core/` son los componentes genéricos reutilizables
(`DataTable`, `FormDialog`, `ReportTable`, `SimpleTable`); `admin/src/modules/` son las
pantallas de negocio; `admin/src/services/` el acceso HTTP sobre `BaseService`.

## Convenciones

- Cada agregado define su propio modelo Sequelize en su `infra/_sql/`. No centralices modelos
  en un archivo compartido.
- El backend devuelve `Result` (`backend/src/base/types/Result.ts`) — es el nodo más conectado
  del grafo, con 259 aristas. Respeta ese patrón en código nuevo.
- Expo cambió: consulta https://docs.expo.dev/versions/v57.0.0/ antes de escribir código móvil.
- El código y los identificadores están en español; mantén ese idioma al agregar código.

## Comandos

```bash
# typecheck de los tres proyectos
npm --prefix backend run typecheck && npm --prefix admin run typecheck && npm run typecheck

npm test                      # jest (móvil)
npm --prefix backend run lint # oxlint
npm --prefix admin run test   # vitest
```

Ojo: en `admin` usa `npm run dev` (vite), **nunca** `npm start` — ese es `vite preview` y sirve
el build de producción compilado contra el 8080; el login se queda colgado en "Ingresando...".

## No leas

`node_modules/`, `android/`, `.expo/`, `assets/`, `src/shared/assets/`, `graphify-out/graph.json`,
`graphify-out/graph.html`. Nada de eso aporta contexto y sí consume mucho.
