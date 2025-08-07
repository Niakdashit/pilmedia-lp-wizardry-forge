import React, { useEffect, useRef } from 'react';

// Fonctions utilitaires déclarées AVANT le composant pour garantir la portée
// (Elles utiliseront un paramètre state passé dans chaque appel)

function getNode(state: any, id: string) {
  return state.nodes[id] || null;
}
function setParent(state: any, childId: string, newParentId: string | null, index: number | null = null) {
  const node = getNode(state, childId);
  const oldParentId = node.parentId;
  if (oldParentId) {
    const oldP = getNode(state, oldParentId);
    if (oldP) oldP.children = oldP.children.filter((x: string) => x !== childId);
  } else {
    state.rootChildren = state.rootChildren.filter((x: string) => x !== childId);
  }
  node.parentId = newParentId || null;
  if (newParentId) {
    const p = getNode(state, newParentId);
    if (!p.children) p.children = [];
    if (index === null || index > p.children.length) p.children.push(childId);
    else p.children.splice(index, 0, childId);
  } else {
    if (index === null || index > state.rootChildren.length) state.rootChildren.push(childId);
    else state.rootChildren.splice(index, 0, childId);
  }
}
function createGroup(state: any, name = null, childIds: string[] = []) {
  const id = 'g' + (state.nextId++);
  const group = { id, type: 'group', name: name || `Groupe ${id.replace('g','')}`, children: [], parentId: null, collapsed: false };
  state.nodes[id] = group;
  state.rootChildren.push(id);
  childIds.forEach(childId => setParent(state, childId, id));
  return id;
}
function selectedItemsIds(state: any) {
  return Array.from(state.selection).map((id: string) => getNode(state, id)).filter((n) => n && n.type === 'item').map((n) => n.id);
}
function selectedGroupsIds(state: any) {
  return Array.from(state.selection).map((id: string) => getNode(state, id)).filter((n) => n && n.type === 'group').map((n) => n.id);
}
function createTextNode(state: any, txt = 'Double‑clic pour éditer', x = 80, y = 80) {
  const id = 't' + (state.nextId++);
  const item = {
    id, type: 'item', text: txt, x, y,
    width: 220, height: 48,
    fontSize: 22, rotation: 0,
    parentId: null
  };
  state.nodes[id] = item;
  state.rootChildren.push(id);
  return id;
}

const TestPage2: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const overlaysRef = useRef<HTMLDivElement>(null);
  // const layersListEl = useRef<HTMLDivElement>(null); // Refs inutilisées pour l’instant (désactivées pour éviter les lints)
  // const canvasWrapperEl = useRef<HTMLDivElement>(null);
  // const groupBtn = useRef<HTMLButtonElement>(null);
  // const ungroupBtn = useRef<HTMLButtonElement>(null);
  // const exitIsolateBtn = useRef<HTMLButtonElement>(null);
  // const clearBtn = useRef<HTMLButtonElement>(null);
  const addTextBtnRef = useRef<HTMLButtonElement>(null);
const groupBtnRef = useRef<HTMLButtonElement>(null);
const ungroupBtnRef = useRef<HTMLButtonElement>(null);
const exitIsolateBtnRef = useRef<HTMLButtonElement>(null);
const clearBtnRef = useRef<HTMLButtonElement>(null);
const layersListRef = useRef<HTMLUListElement>(null);
const canvasWrapperRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    // --- État principal ---
    const state = {
      nodes: {} as Record<string, any>,
      rootChildren: [] as string[],
      selection: new Set<string>(),
      isolateGroupId: null as string | null,
      dragging: null as any,
      resizing: null as any,
      editingId: null as string | null,
      nextId: 1,
      dndLayers: { draggingId: null as string | null, overId: null as string | null, overPos: null as string | null }
    };

    // Récup refs DOM
    const canvasEl = canvasRef.current;
    const overlaysEl = overlaysRef.current;
    const addTextBtn = addTextBtnRef.current;

    // ... (toute la logique JS du prototype adaptée ici, voir code source initial fourni)
    // Pour chaque fonction, utiliser les refs React (ex: canvasEl) à la place de getElementById
    // Les handlers globaux sont définis ici :

    function onGlobalKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      if ((isMac ? e.metaKey : e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        doGroup();
      }
      if ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        doUngroup();
      }
      if (e.key === 'Escape') {
        state.isolateGroupId = null;
        state.editingId = null;
        render();
      }
    }
    function onGlobalMouseMove(e: MouseEvent) {
      if (!state.dragging) return;
      const dx = e.clientX - state.dragging.start.x;
      const dy = e.clientY - state.dragging.start.y;
      state.dragging.ids.forEach((id: string, i: number) => {
        const n = getNode(id);
        const base = state.dragging.basePositions[i];
        n.x = Math.round(base.x + dx);
        n.y = Math.round(base.y + dy);
      });
      render();
    }
    function onGlobalMouseUp() {
      state.dragging = null;
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
    }
    function onGlobalMouseResize(e: MouseEvent) {
      if (!state.resizing) return;
      const { startRect, startMouse, corner, ids } = state.resizing;
      const mx = e.clientX, my = e.clientY;
      const dx = mx - startMouse.x;
      const dy = my - startMouse.y;
      let scaleX = 1, scaleY = 1, originX = startRect.x, originY = startRect.y;
      if (corner === 'se') {
        scaleX = (startRect.width + dx) / startRect.width;
        scaleY = (startRect.height + dy) / startRect.height;
      } else if (corner === 'sw') {
        scaleX = (startRect.width - dx) / startRect.width;
        scaleY = (startRect.height + dy) / startRect.height;
        originX = startRect.x + startRect.width;
      } else if (corner === 'ne') {
        scaleX = (startRect.width + dx) / startRect.width;
        scaleY = (startRect.height - dy) / startRect.height;
        originY = startRect.y + startRect.height;
      } else if (corner === 'nw') {
        scaleX = (startRect.width - dx) / startRect.width;
        scaleY = (startRect.height - dy) / startRect.height;
        originX = startRect.x + startRect.width;
        originY = startRect.y + startRect.height;
      }
      scaleX = Math.max(0.2, scaleX);
      scaleY = Math.max(0.2, scaleY);
      const avgScale = (scaleX + scaleY) / 2;
      ids.forEach((id: string) => {
        const n = getNode(id);
        if (!n || n.type !== 'item') return;
        const relX = n.x - originX;
        const relY = n.y - originY;
        n.x = Math.round(originX + relX * scaleX);
        n.y = Math.round(originY + relY * scaleY);
        n.width = Math.round(n.width * scaleX);
        n.height = Math.round(n.height * scaleY);
        n.fontSize = Math.max(10, Math.round(n.fontSize * avgScale));
      });
      render();
    }
    function onGlobalMouseResizeEnd() {
      state.resizing = null;
      window.removeEventListener('mousemove', onGlobalMouseResize);
      window.removeEventListener('mouseup', onGlobalMouseResizeEnd);
    }

    // ... (toutes les autres fonctions utilitaires et de rendu du prototype, adaptées refs)
    // ...
    // Ajout des listeners globaux :
    window.addEventListener('keydown', onGlobalKeyDown);

    // Fonction render principale (affichage du canvas et overlays)
    function render() {
      renderCanvas();
      renderOverlays();
      // Vous pouvez ajouter renderLayers() et updateToolbarState() si besoin
    }
    function renderCanvas() {
      if (!canvasEl) return;
      canvasEl.innerHTML = '';
      function renderTree(ids: string[]) {
        ids.forEach((id: string) => {
          const node = getNode(state, id);
          if (!node) return;
          if (node.type === 'item') {
            const el = document.createElement('div');
            el.className = 'absolute draggable no-select text-slate-900';
            el.style.left = node.x + 'px';
            el.style.top  = node.y + 'px';
            el.style.width  = node.width + 'px';
            el.style.height = node.height + 'px';
            el.style.lineHeight = '1.2';
            el.style.fontSize = node.fontSize + 'px';
            el.dataset.id = node.id;
            el.textContent = node.text;
            // Handlers Canva-style : sélection et édition
            el.addEventListener('mousedown', (e) => {
              e.stopPropagation();
              state.selection.clear();
              state.selection.add(node.id);
              render();
            });
            el.addEventListener('dblclick', (e) => {
              e.stopPropagation();
              // Pour l’édition, à compléter si besoin
            });
            canvasEl.appendChild(el);
          } else if (node.type === 'group') {
            renderTree(node.children);
          }
        });
      }
      renderTree(state.rootChildren);
    }
    function renderOverlays() {
      if (!overlaysEl) return;
      overlaysEl.innerHTML = '';
      // Overlay de sélection Canva-style
      const sel = Array.from(state.selection);
      if (sel.length === 1) {
        const node = getNode(state, sel[0]);
        if (node && node.type === 'item') {
          const box = document.createElement('div');
          box.className = 'absolute border-2 border-blue-400 pointer-events-none';
          box.style.left = node.x + 'px';
          box.style.top = node.y + 'px';
          box.style.width = node.width + 'px';
          box.style.height = node.height + 'px';
          overlaysEl.appendChild(box);
        }
      }
      // (À compléter pour groupes/multi-sélection)
    }

    // Fonctions de groupement Canva-style
    function doGroup() {
      const items: string[] = selectedItemsIds(state);
      if (items.length < 2) return;
      createGroup(state, null, items);
      state.selection.clear();
      render();
    }
    function doUngroup() {
      const groups: string[] = selectedGroupsIds(state);
      groups.forEach((gid: string) => {
        const group = getNode(state, gid);
        if (group && group.type === 'group') {
          group.children.forEach((cid: string) => setParent(state, cid, null));
          delete state.nodes[gid];
          state.rootChildren = state.rootChildren.filter(x => x !== gid);
        }
      });
      state.selection.clear();
      render();
    }

    // Nettoyage des refs non utilisées (commentaires pour lints)
    // layersListEl, canvasWrapperEl, groupBtn, ungroupBtn, exitIsolateBtn, clearBtn : utilisés dans d’autres handlers/rendu à compléter


    // Handler pour ajouter un texte
    function handleAddText() {
      createTextNode(state);
      render();
    }
    if (addTextBtn) {
      addTextBtn.addEventListener('click', handleAddText);
    }

    render();

    return () => {
      window.removeEventListener('keydown', onGlobalKeyDown);
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
      window.removeEventListener('mousemove', onGlobalMouseResize);
      window.removeEventListener('mouseup', onGlobalMouseResizeEnd);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white font-sans">
      <div className="max-w-[1200px] mx-auto py-6 px-4">
        {/* Barre d’actions */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Éditeur — Groupes & Calques</h1>
            <p className="text-sm text-slate-300">Plan de travail blanc. Cmd+clic (ou Ctrl+clic) pour multi‑sélection, Cmd+G pour grouper, Cmd+Shift+G pour dissocier, double‑clic pour éditer.</p>
          </div>
          <div className="flex items-center gap-2">
            <button ref={addTextBtnRef} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg shadow transition">Ajouter un texte</button>
            <button ref={groupBtnRef} className="bg-violet-500/60 hover:bg-violet-500 text-white px-4 py-2 rounded-lg shadow transition disabled:opacity-40 disabled:cursor-not-allowed" disabled>Grouper ⌘G</button>
            <button ref={ungroupBtnRef} className="bg-rose-500/60 hover:bg-rose-500 text-white px-4 py-2 rounded-lg shadow transition disabled:opacity-40 disabled:cursor-not-allowed" disabled>Dissocier ⇧⌘G</button>
            <button ref={exitIsolateBtnRef} className="bg-sky-500/60 hover:bg-sky-500 text-white px-4 py-2 rounded-lg shadow transition hidden">Quitter l’édition (Esc)</button>
            <button ref={clearBtnRef} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg shadow transition">Tout effacer</button>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar Calques */}
          <aside className="col-span-4 lg:col-span-3 bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-4 max-h-[78vh] overflow-auto smooth-scroll">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Calques</h2>
              <div className="text-xs text-slate-300">Glisser pour réordonner</div>
            </div>
            <ul ref={layersListRef} className="space-y-1 text-sm"></ul>
          </aside>
          {/* Plan de travail */}
          <main className="col-span-8 lg:col-span-9">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-200 text-sm">Plan de travail</div>
                <div className="text-xs text-slate-400">Double‑clic sur un élément pour l’éditer</div>
              </div>
              <div ref={canvasWrapperRef} className="relative w-full h-[70vh] bg-white rounded-xl shadow-inner overflow-hidden">
                {/* Aides visuelles */}
                <div className="absolute left-3 top-3 z-[5] text-[12px] bg-slate-900/70 text-white px-3 py-2 rounded-lg shadow">
                  <div className="font-medium">Raccourcis</div>
                  <ul className="list-disc ml-4 space-y-0.5">
                    <li>Cmd/Ctrl + clic: multi‑sélection</li>
                    <li>Cmd + G: grouper</li>
                    <li>Cmd + Shift + G: dissocier</li>
                    <li>Double‑clic: éditer le texte</li>
                    <li>Esc: sortir de l’édition</li>
                  </ul>
                </div>
                {/* Contenu dessiné ici */}
                <div ref={canvasRef} id="canvas" className="absolute inset-0"></div>
                {/* Sélections et poignées */}
                <div ref={overlaysRef} id="overlays" className="absolute inset-0 pointer-events-none"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
      {/* Styles additionnels */}
      <style>{`
        .selection-box { position: absolute; pointer-events: auto; box-sizing: border-box; }
        .handle { width: 12px; height: 12px; border: 2px solid white; background: #7c3aed; border-radius: 9999px; position: absolute; transform: translate(-50%, -50%); cursor: nwse-resize; }
        .no-select { user-select: none; -webkit-user-select: none; -ms-user-select: none; }
        .editing { outline: 2px solid #38bdf8; outline-offset: 2px; background: rgba(56,189,248,0.05); }
        .drop-target { background: rgba(124,58,237,0.12); border-radius: 8px; }
        .drop-between::before { content: ""; position: absolute; left: 8px; right: 8px; height: 2px; background: #7c3aed; border-radius: 2px; }
        .draggable { cursor: move; }
        *[draggable="true"] { -webkit-user-drag: element; }
        .smooth-scroll { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default TestPage2;
