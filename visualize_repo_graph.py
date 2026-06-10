# -*- coding: utf-8 -*-
"""Visualizacion interactiva del grafo de nodos del repositorio.

Navegacion
----------
  Zoom      : rueda del mouse, centrado bajo el cursor.
  Pan       : arrastrar dentro del grafo con boton izquierdo.
  Labels     : aparecen progresivamente al hacer zoom in segun grado del nodo.
               Al nivel inicial solo se muestran los ~5 mas conectados;
               al acercar 4x ya son visibles todos los que esten en pantalla.

Sliders
-------
  Tamaño nodos / Alpha aristas → respuesta inmediata.
  Separacion (k) / Iteraciones → recalculan el layout en tiempo real.

Formulas logaritmicas
---------------------
  Nodo  : size  = log1p(degree)^1.5 * 80 + 25
  Arista: width = 0.3 + log1p(mean_degree_extremos) * 0.35

Requiere: networkx matplotlib numpy
"""

import json
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.widgets as mwidgets
from matplotlib.collections import LineCollection
from networkx.algorithms.community import greedy_modularity_communities

GRAPH_DIR = ".graph"

EDGE_TYPE_COLORS = {
    "contains":          "#666677",
    "supports":          "#5DADE2",
    "traces_to":         "#F39C12",
    "governed_by":       "#C39BD3",
    "implements_future": "#E74C3C",
    "derives_from":      "#2ECC71",
    "references":        "#95A5A6",
}


# ---------------------------------------------------------------------------
# Carga y construccion
# ---------------------------------------------------------------------------

def load_graph():
    with open(f"{GRAPH_DIR}/nodes.json", encoding="utf-8") as f:
        nodes = json.load(f)
    with open(f"{GRAPH_DIR}/edges.json", encoding="utf-8") as f:
        edges = json.load(f)
    return nodes, edges


def build_nx_graph(raw_nodes, raw_edges):
    G = nx.DiGraph()
    for node in raw_nodes:
        G.add_node(node["id"], **{k: v for k, v in node.items() if k != "id"})
    for edge in raw_edges:
        G.add_edge(edge["from"], edge["to"], rel=edge["type"])
    return G


# ---------------------------------------------------------------------------
# Metricas visuales
# ---------------------------------------------------------------------------

def log_node_sizes(degrees, node_list):
    """
    size_i = log1p(degree_i)^1.5 * 80 + 25

    grado  0 → 25 px   (minimo visible)
    grado  5 → ~217 px
    grado 20 → ~449 px
    grado 50 → ~649 px  (hub, pero no domina como con escala lineal)
    """
    return np.array([
        np.log1p(degrees.get(nd, 0)) ** 1.5 * 80 + 25
        for nd in node_list
    ])


def log_edge_widths(edge_records, degrees):
    """
    width = 0.3 + log1p( (deg_u + deg_v) / 2 ) * 0.35

    Aristas entre hubs mas gruesas; aristas hacia hojas casi invisibles.
    """
    return np.array([
        0.3 + np.log1p((degrees.get(u, 0) + degrees.get(v, 0)) / 2.0) * 0.35
        for u, v, _ in edge_records
    ])


def community_colors(node_list, communities, cmap="gist_rainbow"):
    node_to_comm = {}
    for i, comm in enumerate(communities):
        for nd in comm:
            node_to_comm[nd] = i
    n = max(len(communities), 1)
    cm = plt.colormaps[cmap]
    return np.array([cm((node_to_comm.get(nd, 0) + 0.5) / n) for nd in node_list])


def make_segments(pos, edge_records):
    """(E, 2, 2) array de segmentos para LineCollection."""
    return np.array([[pos[u], pos[v]] for u, v, _ in edge_records])


# ---------------------------------------------------------------------------
# Render principal
# ---------------------------------------------------------------------------

def render(G):
    n = G.number_of_nodes()
    node_list = list(G.nodes())

    UG = G.to_undirected()
    communities = list(greedy_modularity_communities(UG))

    degrees    = dict(G.degree())
    base_sizes = log_node_sizes(degrees, node_list)
    colors     = community_colors(node_list, communities)

    edge_records = [(u, v, d.get("rel", "contains")) for u, v, d in G.edges(data=True)]
    base_widths  = log_edge_widths(edge_records, degrees)

    # Ranking para prioridad de labels: rank 0 = nodo mas conectado
    ranked = sorted(node_list, key=lambda nd: degrees.get(nd, 0), reverse=True)
    rank   = {nd: i for i, nd in enumerate(ranked)}

    K0  = 2.5
    pos = nx.spring_layout(G, k=K0 / (n ** 0.5), seed=42, iterations=80)

    # -----------------------------------------------------------------------
    # Figura
    # El eje principal empieza en x=0.19 para dejar las leyendas en la franja
    # izquierda sin que compitan con el grafo.
    # -----------------------------------------------------------------------
    fig = plt.figure(figsize=(20, 12), facecolor="#0d1117")

    ax = fig.add_axes([0.19, 0.22, 0.80, 0.76], facecolor="#0d1117")
    ax.set_aspect("equal")
    ax.axis("off")

    fig.suptitle(
        f"Mapa de Nodos — SoftwareDesignProject"
        f"  ({n} nodos · {G.number_of_edges()} aristas · {len(communities)} comunidades)"
        f"  |  Rueda: zoom · Arrastrar: pan",
        color="white", fontsize=10, y=0.997,
    )

    # -----------------------------------------------------------------------
    # Sliders
    # -----------------------------------------------------------------------
    SBG = "#1c2128"
    ax_k    = fig.add_axes([0.22, 0.145, 0.34, 0.024], facecolor=SBG)
    ax_iter = fig.add_axes([0.22, 0.095, 0.34, 0.024], facecolor=SBG)
    ax_sz   = fig.add_axes([0.62, 0.145, 0.34, 0.024], facecolor=SBG)
    ax_alp  = fig.add_axes([0.62, 0.095, 0.34, 0.024], facecolor=SBG)

    sl_k    = mwidgets.Slider(ax_k,    "Separacion (k)",
                              0.5, 8.0, valinit=K0, color="#4A90D9")
    sl_iter = mwidgets.Slider(ax_iter, "Iteraciones",
                              20, 300, valinit=80, valstep=10, color="#4A90D9")
    sl_sz   = mwidgets.Slider(ax_sz,   "Tamaño nodos",
                              0.2, 5.0, valinit=1.0, color="#2ECC71")
    sl_alp  = mwidgets.Slider(ax_alp,  "Alpha aristas",
                              0.05, 1.0, valinit=0.45, color="#F39C12")

    for sl in (sl_k, sl_iter, sl_sz, sl_alp):
        sl.label.set_color("white")
        sl.valtext.set_color("white")

    fig.text(0.22, 0.065,
             "Arrastra el grafo para moverte. Usa la rueda para acercar o alejar.",
             color="#777777", fontsize=7.5)

    # Impedir que la barra de herramientas haga zoom/pan sobre ejes de sliders
    for a in (ax_k, ax_iter, ax_sz, ax_alp):
        a.set_navigate(False)

    # -----------------------------------------------------------------------
    # Aristas por tipo → una LineCollection por tipo
    # -----------------------------------------------------------------------
    segs_all = make_segments(pos, edge_records)
    edge_lcs = {}   # tipo → (LineCollection, ndarray de indices)

    for et, color in EDGE_TYPE_COLORS.items():
        idxs = np.array([i for i, (_, _, t) in enumerate(edge_records) if t == et])
        if idxs.size == 0:
            continue
        lc = LineCollection(
            segs_all[idxs],
            colors=color,
            linewidths=base_widths[idxs],
            alpha=sl_alp.val,
            zorder=1,
        )
        ax.add_collection(lc)
        edge_lcs[et] = (lc, idxs)

    # -----------------------------------------------------------------------
    # Nodos (scatter)
    # -----------------------------------------------------------------------
    offsets = np.array([pos[nd] for nd in node_list])
    scatter = ax.scatter(
        offsets[:, 0], offsets[:, 1],
        s=base_sizes * sl_sz.val,
        c=colors,
        edgecolors="white", linewidths=0.4,
        zorder=2,
    )

    # -----------------------------------------------------------------------
    # Labels: un Text por nodo, todos ocultos inicialmente.
    # Se activan progresivamente en update_labels() segun el zoom actual.
    # -----------------------------------------------------------------------
    texts = {}
    for nd in node_list:
        ta = ax.text(
            pos[nd][0], pos[nd][1],
            G.nodes[nd].get("title", nd),
            fontsize=6, color="white",
            ha="center", va="bottom",
            clip_on=True, zorder=3,
            visible=False,
        )
        texts[nd] = ta

    # -----------------------------------------------------------------------
    # fit_ax: ajusta limites al contenido actual de pos
    # -----------------------------------------------------------------------
    def fit_ax():
        pts  = np.array([pos[nd] for nd in node_list])
        mn, mx = pts.min(0), pts.max(0)
        span = max((mx - mn).max(), 0.1)
        pad  = span * 0.07
        cx, cy = (mn + mx) / 2
        ax.set_xlim(cx - span / 2 - pad, cx + span / 2 + pad)
        ax.set_ylim(cy - span / 2 - pad, cy + span / 2 + pad)

    # Primera llamada: establece limites antes de conectar callbacks
    fit_ax()
    xl0 = ax.get_xlim()
    yl0 = ax.get_ylim()
    initial_span = max(xl0[1] - xl0[0], yl0[1] - yl0[0])
    pan_state = {"press": None}

    # -----------------------------------------------------------------------
    # Labels progresivos segun zoom
    #
    # zoom = initial_span / current_span
    #   zoom=1   → nivel inicial        → BASE_LABELS visibles
    #   zoom=2   → doble de acercamiento → 4x mas labels  (zoom^2)
    #   zoom=4   → cuadruple            → 16x mas, probablemente todos visibles
    #
    # Solo se muestra el label si ademas el nodo esta dentro del viewport.
    # -----------------------------------------------------------------------
    BASE_LABELS = 5

    def update_labels(*_):
        xlim = ax.get_xlim()
        ylim = ax.get_ylim()
        cur_span = max(xlim[1] - xlim[0], ylim[1] - ylim[0], 1e-9)
        zoom  = initial_span / cur_span

        # n_show crece cuadraticamente con el zoom
        n_show = min(n, max(0, int(BASE_LABELS * (zoom ** 2))))

        for nd, ta in texts.items():
            xy = pos[nd]
            in_view = (xlim[0] <= xy[0] <= xlim[1]) and (ylim[0] <= xy[1] <= ylim[1])
            ta.set_visible(rank[nd] < n_show and in_view)

    # Conectar despues de definir initial_span para que el callback funcione
    ax.callbacks.connect("xlim_changed", update_labels)
    ax.callbacks.connect("ylim_changed", update_labels)
    update_labels()   # aplicar al estado inicial

    # -----------------------------------------------------------------------
    # Navegacion directa: rueda para zoom y arrastre para pan
    # -----------------------------------------------------------------------
    def zoom_at_cursor(event, scale_factor=1.18):
        if event.inaxes != ax or event.xdata is None or event.ydata is None:
            return

        xlim = ax.get_xlim()
        ylim = ax.get_ylim()
        cur_width = xlim[1] - xlim[0]
        cur_height = ylim[1] - ylim[0]

        if event.button == "up":
            scale = 1 / scale_factor
        elif event.button == "down":
            scale = scale_factor
        else:
            return

        rel_x = (event.xdata - xlim[0]) / cur_width
        rel_y = (event.ydata - ylim[0]) / cur_height
        new_width = cur_width * scale
        new_height = cur_height * scale

        ax.set_xlim(event.xdata - new_width * rel_x,
                    event.xdata + new_width * (1 - rel_x))
        ax.set_ylim(event.ydata - new_height * rel_y,
                    event.ydata + new_height * (1 - rel_y))
        fig.canvas.draw_idle()

    def start_pan(event):
        if event.inaxes != ax or event.button != 1:
            return
        pan_state["press"] = {
            "x": event.xdata,
            "y": event.ydata,
            "xlim": ax.get_xlim(),
            "ylim": ax.get_ylim(),
        }

    def drag_pan(event):
        press = pan_state["press"]
        if press is None or event.inaxes != ax or event.xdata is None or event.ydata is None:
            return

        dx = event.xdata - press["x"]
        dy = event.ydata - press["y"]
        ax.set_xlim(press["xlim"][0] - dx, press["xlim"][1] - dx)
        ax.set_ylim(press["ylim"][0] - dy, press["ylim"][1] - dy)
        fig.canvas.draw_idle()

    def stop_pan(_):
        pan_state["press"] = None

    fig.canvas.mpl_connect("scroll_event", zoom_at_cursor)
    fig.canvas.mpl_connect("button_press_event", start_pan)
    fig.canvas.mpl_connect("motion_notify_event", drag_pan)
    fig.canvas.mpl_connect("button_release_event", stop_pan)

    # -----------------------------------------------------------------------
    # Callbacks de sliders
    # -----------------------------------------------------------------------
    def update_visuals(*_):
        sz  = sl_sz.val
        alp = sl_alp.val
        scatter.set_sizes(base_sizes * sz)
        for lc, idxs in edge_lcs.values():
            lc.set_alpha(alp)
            # Grosor escala con raiz del multiplicador: no explota con sz alto
            lc.set_linewidths(base_widths[idxs] * (sz ** 0.5))
        fig.canvas.draw_idle()

    def recompute(*_):
        nonlocal pos
        pos = nx.spring_layout(
            G,
            k=sl_k.val / (n ** 0.5),
            seed=42, pos=pos,
            iterations=int(sl_iter.val),
        )
        new_segs = make_segments(pos, edge_records)
        for lc, idxs in edge_lcs.values():
            lc.set_segments(new_segs[idxs])
        scatter.set_offsets(np.array([pos[nd] for nd in node_list]))
        for nd, ta in texts.items():
            ta.set_position(pos[nd])
        update_labels()
        fig.canvas.draw_idle()

    sl_sz.on_changed(update_visuals)
    sl_alp.on_changed(update_visuals)
    sl_k.on_changed(recompute)
    sl_iter.on_changed(recompute)

    # -----------------------------------------------------------------------
    # Leyendas pegadas al borde izquierdo de la figura (fig.legend)
    # bbox_to_anchor en coordenadas de figura (0-1); loc=upper left
    # alinea la esquina superior izquierda de la leyenda al punto indicado.
    # -----------------------------------------------------------------------
    edge_handles = [
        mpatches.Patch(color=c, label=et, alpha=0.85)
        for et, c in EDGE_TYPE_COLORS.items()
        if any(d.get("rel") == et for _, _, d in G.edges(data=True))
    ]
    type_counts = {}
    for nd in node_list:
        t = G.nodes[nd].get("type", "?")
        type_counts[t] = type_counts.get(t, 0) + 1
    type_handles = [
        mpatches.Patch(color="#aaaaaa", label=f"{t}  ({c})")
        for t, c in sorted(type_counts.items())
    ]

    leg1 = fig.legend(
        handles=edge_handles, title="Tipo de relacion",
        loc="upper left", bbox_to_anchor=(0.005, 0.97),
        fontsize=7, title_fontsize=8,
        facecolor="#161b22", edgecolor="#555", framealpha=0.95,
    )
    leg2 = fig.legend(
        handles=type_handles, title="Tipo de nodo",
        loc="upper left", bbox_to_anchor=(0.005, 0.52),
        fontsize=7, title_fontsize=8,
        facecolor="#161b22", edgecolor="#555", framealpha=0.95,
    )
    for leg in (leg1, leg2):
        plt.setp(leg.get_texts(), color="white")
        plt.setp(leg.get_title(), color="#aaaaaa")

    plt.show()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("Cargando .graph/nodes.json y .graph/edges.json ...")
    raw_nodes, raw_edges = load_graph()
    G = build_nx_graph(raw_nodes, raw_edges)
    print(f"Grafo DiGraph: {G.number_of_nodes()} nodos, {G.number_of_edges()} aristas")

    UG = G.to_undirected()
    comms = sorted(greedy_modularity_communities(UG), key=len, reverse=True)
    print(f"Comunidades detectadas: {len(comms)}")
    for i, c in enumerate(comms):
        sample = [G.nodes[nd].get("title", nd) for nd in list(c)[:3]]
        print(f"  {i + 1:2d}. {len(c):3d} nodos — {', '.join(sample)} ...")

    print("\nAbriendo ventana Matplotlib.")
    print("  Zoom     : rueda del mouse centrada en el cursor.")
    print("  Pan      : arrastra el grafo con el boton izquierdo.")
    print("  Labels   : aparecen conforme haces zoom in por orden de grado.")
    print("  Tamaño / Alpha → inmediato.")
    print("  Separacion / Iteraciones → recalculo en tiempo real.")
    render(G)


if __name__ == "__main__":
    main()
