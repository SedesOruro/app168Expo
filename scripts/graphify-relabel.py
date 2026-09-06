#!/usr/bin/env python
"""Re-etiqueta las comunidades del grafo a partir del directorio dominante de cada una.

`graphify update .` vuelve a agrupar las comunidades y renombra cada una con el nombre de
archivo de su nodo central ("EmergenciaRepositorySQL.ts"), lo que es poco legible al leer la
salida de `graphify query`. Este script deriva un nombre a partir de la ruta que más se repite
dentro de la comunidad, sin gastar tokens y de forma reproducible: se puede volver a correr
despues de cada update. Tambien regenera GRAPH_REPORT.md con esos nombres, porque el informe
que escribe el update trae los automaticos.

Alternativa que ofrece graphify: `graphify label .`, que nombra las comunidades con un LLM.
Funciona, pero cuesta tokens en cada corrida; este script hace el mismo trabajo gratis.

Uso:
    python scripts/graphify-relabel.py
    python scripts/graphify-relabel.py --dry-run
    python scripts/graphify-relabel.py --no-report
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GRAPH = ROOT / "graphify-out" / "graph.json"
LABELS = ROOT / "graphify-out" / ".graphify_labels.json"
REPORT = ROOT / "graphify-out" / "GRAPH_REPORT.md"
COST = ROOT / "graphify-out" / "cost.json"

# Prefijos de ruta que tienen un nombre de negocio mejor que el que se deduce del directorio.
PREFIJOS = [
    ("backend/src/core/emergencias/", "Agregado {seg} (backend)"),
    ("backend/src/core/system/autenticacion/", "Agregado {seg} (backend)"),
    ("backend/src/views/", "Vista {seg} backend"),
    ("backend/src/base/", "Base backend: {seg}"),
    ("backend/src/", "Backend: {seg}"),
    ("admin/src/components/core/", "Componente admin: {seg}"),
    ("admin/src/modules/", "Modulo admin: {seg}"),
    ("admin/src/", "Admin: {seg}"),
    ("src/features/", "Movil: feature {seg}"),
    ("src/shared/", "Movil compartido: {seg}"),
    ("src/app/", "Movil: arranque {seg}"),
    ("docs/", "Documentacion: {seg}"),
]


def normalizar(ruta: str) -> str:
    return (ruta or "").replace("\\", "/").lstrip("./")


def nombre_para(directorio: str, archivos: Counter) -> str:
    """Deriva un nombre legible del directorio dominante de la comunidad."""
    if not directorio:
        # Nodos en la raiz: el nombre de archivo mas comun describe mejor el grupo.
        comun = archivos.most_common(1)
        return f"Raiz: {comun[0][0]}" if comun else "Sin ubicacion"

    d = directorio + "/"
    for prefijo, plantilla in PREFIJOS:
        if d.startswith(prefijo):
            resto = d[len(prefijo):].strip("/")
            seg = resto.split("/")[0] if resto else prefijo.strip("/").split("/")[-1]
            return plantilla.format(seg=seg.replace("_", " "))
    return directorio


def construir_etiquetas(grafo: dict) -> dict[int, str]:
    por_comunidad: dict[int, list[str]] = defaultdict(list)
    for nodo in grafo["nodes"]:
        cid = nodo.get("community")
        if cid is None:
            continue
        por_comunidad[cid].append(normalizar(nodo.get("source_file", "")))

    etiquetas: dict[int, str] = {}
    usadas: Counter[str] = Counter()
    # Orden por tamano descendente: la comunidad mas grande se queda con el nombre sin sufijo.
    for cid, rutas in sorted(por_comunidad.items(), key=lambda kv: (-len(kv[1]), kv[0])):
        directorios = Counter("/".join(r.split("/")[:-1]) for r in rutas if r)
        archivos = Counter(r.split("/")[-1] for r in rutas if r)
        dominante = directorios.most_common(1)[0][0] if directorios else ""
        base = nombre_para(dominante, archivos)
        usadas[base] += 1
        etiquetas[cid] = base if usadas[base] == 1 else f"{base} ({usadas[base]})"
    return etiquetas


def regenerar_informe(grafo: dict, etiquetas: dict[int, str]) -> None:
    """Reescribe GRAPH_REPORT.md con las etiquetas derivadas, sin llamar a ningun LLM."""
    import networkx as nx
    from graphify.analyze import god_nodes, suggest_questions, surprising_connections
    from graphify.cluster import score_all
    from graphify.detect import detect
    from graphify.report import generate

    G = nx.node_link_graph(grafo, edges="links")
    comunidades: dict[int, list[str]] = defaultdict(list)
    for nodo in grafo["nodes"]:
        cid = nodo.get("community")
        if cid is not None:
            comunidades[cid].append(nodo["id"])
    comunidades = dict(comunidades)

    cohesion = score_all(G, comunidades)
    dioses = god_nodes(G)
    sorpresas = surprising_connections(G, comunidades)
    preguntas = suggest_questions(G, comunidades, etiquetas)

    # detect() es determinista y no cuesta tokens; el informe necesita el resumen del corpus.
    deteccion = detect(ROOT)
    costo = json.loads(COST.read_text(encoding="utf-8")) if COST.exists() else {}
    tokens = {
        "input": costo.get("total_input_tokens", 0),
        "output": costo.get("total_output_tokens", 0),
    }

    REPORT.write_text(
        generate(
            G, comunidades, cohesion, etiquetas, dioses, sorpresas,
            deteccion, tokens, str(ROOT), suggested_questions=preguntas,
            built_at_commit=grafo.get("built_at_commit"),
        ),
        encoding="utf-8",
    )
    print(f"GRAPH_REPORT.md regenerado ({len(comunidades)} comunidades)")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="muestra las etiquetas sin escribir")
    parser.add_argument("--no-report", action="store_true", help="no regenera GRAPH_REPORT.md")
    args = parser.parse_args()

    if not GRAPH.exists():
        print(f"No existe {GRAPH}. Construye el grafo primero con /graphify .", file=sys.stderr)
        return 1

    grafo = json.loads(GRAPH.read_text(encoding="utf-8"))
    etiquetas = construir_etiquetas(grafo)

    for cid in sorted(etiquetas):
        print(f"{cid:4}  {etiquetas[cid]}")

    if args.dry_run:
        print(f"\n(dry-run) {len(etiquetas)} comunidades, sin escribir nada.")
        return 0

    for nodo in grafo["nodes"]:
        cid = nodo.get("community")
        if cid in etiquetas:
            nodo["community_name"] = etiquetas[cid]

    GRAPH.write_text(json.dumps(grafo, ensure_ascii=False), encoding="utf-8")
    LABELS.write_text(
        json.dumps({str(k): v for k, v in etiquetas.items()}, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"\n{len(etiquetas)} comunidades re-etiquetadas en graph.json y .graphify_labels.json")

    if not args.no_report:
        regenerar_informe(grafo, etiquetas)

    print("Regenera el HTML si lo usas:  graphify export html")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
