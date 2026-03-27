import { store, subscribe } from './services/store.js';
import { themeManager } from './services/ThemeManager.js';
import { ThemeToggle, initThemeToggleEvents } from './components/ThemeToggle.js';
import { Logger } from './services/Logger.js';
import { eventBus } from './services/EventBus.js';
import { narrative } from './data/narrative.js';
import { NarrativeCard } from './components/NarrativeCard.js';
import { SetupPanel } from './components/SetupPanel.js';
import { IterationModal } from './components/IterationModal.js';
import { BlueprintModal } from './components/BlueprintModal.js';
import { SlideDetailModal } from './components/SlideDetailModal.js';
import { NarrativeEngine } from './services/narrative-engine.js';
import { UIController } from './services/ui-controller.js';
import { disposalService } from './services/disposal-service.js';

// EventBus konfiguráció
eventBus.setLockProvider(() => store.isGenerating);

/**
 * Globális eseményfigyelők regisztrálása a navigációhoz és visszajelzéshez.
 */
eventBus.on('NAVIGATE_TO', (targetId) => {
  if (!targetId || typeof targetId !== 'string') return;

  const target = document.querySelector(targetId);
  if (target) {
    Logger.info(`Navigálás a szekcióhoz: ${targetId}`);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    Logger.warn(`Cél nem található: ${targetId}`);
  }
});

eventBus.on('SCROLL_TOP', () => {
  Logger.info('Vissza az oldal tetejére.');
  const preview = document.querySelector('.dkv-preview-container');
  if (preview) preview.scrollTop = 0;
});

eventBus.on('UI_REJECTED_ACTION', ({ reason }) => {
  if (reason === 'LOCK_ACTIVE') {
    const existingToast = document.querySelector('.dkv-toast');
    if (existingToast) return;

    const toast = document.createElement('div');
    toast.className = 'dkv-toast';
    toast.innerText = 'GENERÁLÁS FOLYAMATBAN... KÉRJÜK, VÁRJON!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
});

/**
 * A fő alkalmazás konténer eleme.
 * @type {HTMLElement}
 */
const app = document.querySelector('#app');

// Kezdeti narratíva betöltése a store-ba
store.narrative = narrative;

async function initLayout() {
  // HMR védelem: korábbi eseménykezelők és időzítők felszabadítása
  disposalService.purge();

  // Beolvassuk a mentett állapotot a fájlból indításkor
  await loadInitialState();

  app.innerHTML = `
    <div class="dkv-main-layout ${store.sidebarCollapsed ? 'dkv-main-layout--collapsed' : ''} ${store.isGenerating ? 'dkv-main-layout--locked' : ''}">
      <!-- BAL OLDAL: GENERATOR -->
      <aside id="sidebar" class="dkv-sidebar ${!store.sidebarContentVisible ? 'dkv-sidebar--content-hidden' : ''} ${!store.sidebarIconsVisible ? 'dkv-sidebar--icons-hidden' : ''}">
        <div class="dkv-sidebar__content-wrapper">
          <div id="setup-panel-root">
            ${SetupPanel()}
          </div>
          <nav id="quick-jump-root" class="dkv-sidebar__nav">
            <!-- Ide kerül a mini-térkép a NarrativeEngine által -->
          </nav>
        </div>
      </aside>

      <!-- JOBB OLDAL: PREVIEW -->
      <main class="dkv-preview-container">
        <div class="dkv-lock-overlay"></div>
        <header class="dkv-preview-header">
          <h1 id="preview-title-header">TÖRTÉNET ELŐNÉZETE: ${store.projectTitle.toUpperCase()}</h1>
          <div style="display: flex; gap: 10px; align-items: center;">
             <div id="theme-toggle-container">${ThemeToggle()}</div>
             <button class="dkv-nav-btn" data-action="scroll-top">↑</button>
          </div>
        </header>

        <section id="slides-container" class="dkv-slides-viewer">
          <!-- Ide kerülnek a kártyák -->
        </section>
        <div id="preview-status-root"></div>
      </main>
    </div>
    
    <div id="modal-root"></div>
    <div id="global-status-root" class="dkv-global-status-container"></div>
  `;

  UIController.setupGlobalListeners();
  setupEventListeners();
  setupGlobalStatusListeners();

  // Reaktivitás bekapcsolása: minden store változás frissíti a UI-t
  subscribe(updateDynamicContent);

  // Kezdeti renderelés
  updateDynamicContent();

  // HMR szinkronizáció utáni visszajelzés
  if (localStorage.getItem('dkv_sync_pending')) {
    const title = localStorage.getItem('dkv_last_sync_title');
    store.toastMessage = `Sikeres szinkronizáció: ${title}`;
    localStorage.removeItem('dkv_sync_pending');
  }

  // Bridge státusz polling indítása
  startBridgePolling();
}

/**
 * Periodikusan ellenőrzi az AI Sync Bridge állapotát.
 */
function startBridgePolling() {
  const check = async () => {
    try {
      // Csak akkor nehezítjük a hálózatot, ha az oldal aktív, vagy ha manuálisan hívják
      if (document.hidden && !arguments[0]) return;

      const resp = await fetch('http://127.0.0.1:3001/health', {
        method: 'GET',
        cache: 'no-cache'
      });
      store.isBridgeOnline = resp.ok;
    } catch (err) {
      store.isBridgeOnline = false;
    }
  };

  // HMR védelem: Ne indítsunk el több intervallumot, ha már fut egy
  if (window.dkv_bridge_interval) {
    clearInterval(window.dkv_bridge_interval);
  }

  check();
  window.dkv_bridge_interval = setInterval(check, 3000);

  // Fókusz visszatérésekor azonnali ellenőrzés
  window.addEventListener('focus', () => check(true));

  // Globálisan elérhetővé tesszük a manuális frissítéshez
  window.refreshBridgeStatus = () => check(true);
}

/**
 * Beolvassa a korábban mentett projekt adatokat a szerverről.
 */
async function loadInitialState() {
  try {
    const response = await fetch('/src/data/blueprint.json');
    if (response.ok) {
      const data = await response.json();
      if (data.title) store.projectTitle = data.title;
      if (data.prompt) store.prompt = data.prompt;
      if (data.narrativeConfig) store.narrativeConfig = { ...store.narrativeConfig, ...data.narrativeConfig };
      Logger.info('Kiinduló állapot betöltve a blueprint.json-ból.');
    }

    // 2. Narratíva betöltése (dinamikus importtal a frissességért)
    const modulePath = `/src/data/narrative.js?t=${Date.now()}`;
    const { narrative: newNarrative } = await import(/* @vite-ignore */ modulePath);
    if (newNarrative) {
      store.narrative = newNarrative;
      Logger.info('Narratíva frissítve a fájlból.');
    }
  } catch (err) {
    Logger.debug('Hiba a betöltés során (lehet még nincs fájl):', err);
  }
}

/**
 * Frissíti az alkalmazás dinamikus tartalmait a Store változásai alapján.
 * @param {string} property - A megváltozott tulajdonság neve a store-ban.
 * @param {any} value - Az új érték.
 */
function updateDynamicContent(property, value) {
  const header = document.querySelector('.dkv-preview-header');
  const statusRoot = document.querySelector('#preview-status-root');
  const modalRoot = document.querySelector('#modal-root');
  const slidesContainer = document.querySelector('#slides-container');
  const previewContainer = document.querySelector('.dkv-preview-container');

  // Cím és Prompt szinkronizálása a sidebarban
  if (property === 'projectTitle' || property === 'prompt') {
    if (header && property === 'projectTitle') {
      header.innerText = `TÖRTÉNET ELŐNÉZETE: ${store.projectTitle.toUpperCase()}`;
    }
    const titleIn = document.querySelector('#input-title');
    const promptIn = document.querySelector('#prompt-input');
    if (titleIn) titleIn.value = store.projectTitle;
    if (promptIn) promptIn.value = store.prompt || '';
  }

  if (property === 'projectShortDesc') return;

  // Toast értesítések kezelése
  if (property === 'toastMessage' && value) {
    const existingToast = document.querySelector('.dkv-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'dkv-toast';
    toast.innerText = value;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
        if (store.toastMessage === value) store.toastMessage = '';
      }, 500);
    }, 3000);
    return;
  }

  // Generálási állapot kezelése (Szinkronizáció)
  if (property === 'isGenerating') {
    const layout = document.querySelector('.dkv-main-layout');
    if (layout) layout.classList.toggle('dkv-main-layout--locked', value);

    const setupRoot = document.querySelector('#setup-panel-root');
    if (setupRoot) setupRoot.innerHTML = SetupPanel();

    if (value && statusRoot) {
      statusRoot.innerHTML = `
        <div class="dkv-preview-status">
          <div class="dkv-status-card">
            <h2 class="dkv-neon-text">SZINKRONIZÁCIÓ FOLYAMATBAN</h2>
            <div class="dkv-digital-pulse" style="margin-bottom: 30px;"></div>
            <p style="font-size: 1.2rem; color: var(--text-white);">Adatok küldése az AI-motornak...</p>
            <p style="color: var(--text-dim); margin-top: 15px;">A folyamat automatikus.</p>
          </div>
        </div>
      `;
      if (slidesContainer) slidesContainer.style.display = 'none';
      if (header) header.style.display = 'none';
      statusRoot.style.display = 'flex';
      if (previewContainer) previewContainer.style.justifyContent = 'center';
    }
    return;
  }

  // Várakozás az AI-válaszra
  if (property === 'isWaitingForNarrative') {
    if (value && statusRoot) {
      statusRoot.innerHTML = `
        <div class="dkv-preview-status">
          <div class="dkv-status-card">
            <h2 class="dkv-neon-text">A BLUEPRINT SIKERESEN RÖGZÍTÉSRE KERÜLT</h2>
            <p style="font-size: 1.2rem; color: var(--text-white); line-height: 1.6;">
              Kérlek, most kérd meg az AI-t a chatben a történet legenerálására!
            </p>
            <p style="color: var(--neon-cyan); margin-top: 20px; font-weight: bold;">
              Várakozás az AI-válaszra...
            </p>
          </div>
        </div>
      `;
      if (slidesContainer) slidesContainer.style.display = 'none';
      if (header) header.style.display = 'none';
      statusRoot.style.display = 'flex';
      if (previewContainer) previewContainer.style.justifyContent = 'center';
    } else if (!value && statusRoot) {
      statusRoot.innerHTML = '';
      statusRoot.style.display = 'none';
      if (slidesContainer) slidesContainer.style.display = 'block';
      if (header) header.style.display = 'flex';
      if (previewContainer) previewContainer.style.justifyContent = 'flex-start';
    }
    return;
  }

  // Téma és Bridge állapot változása (Globális, minden felett látszódó megjelenítés)
  if (property === 'isBridgeOnline' || property === 'theme' || !property) {
    const globalStatusRoot = document.querySelector('#global-status-root');
    if (!globalStatusRoot) return;

    const isOnline = store.isBridgeOnline;
    const statusClass = isOnline === null ? 'dkv-bridge-status--unknown' :
      (isOnline ? 'dkv-bridge-status--online' : 'dkv-bridge-status--offline');
    const iconChar = isOnline === null ? '?' : (isOnline ? '✓' : '!');
    const tooltipText = isOnline === null
      ? 'Bridge állapota ismeretlen – ellenőrzés folyamatban...'
      : (isOnline
        ? 'Bridge Online – Készen áll az iterációra és a mentésre.'
        : 'Bridge Offline – Indítsd el a bridge-et a terminálban az "npm run bridge" paranccsal!');

    globalStatusRoot.innerHTML = `
      ${ThemeToggle()}
      <div class="dkv-bridge-status ${statusClass}" data-action="refresh-bridge" style="cursor: pointer;">
        <span class="dkv-bridge-status__icon">${iconChar}</span>
        <span class="dkv-bridge-status__tooltip">${tooltipText}</span>
      </div>
    `;

    // Ha bejön a bridge, és kell a szinkron, akkor frissítjük a panelt a gomb miatt
    if (property === 'isBridgeOnline' && isOnline && store.needsSync) {
      const setupRoot = document.querySelector('#setup-panel-root');
      const syncBtn = document.querySelector('#sync-project-btn');
      if (setupRoot && !syncBtn) setupRoot.innerHTML = SetupPanel();
    }
    if (property === 'isBridgeOnline') return;
  }

  // Szinkronizációs igény változása esetén továbbra is kell a teljes panel
  if (property === 'needsSync') {
    const setupRoot = document.querySelector('#setup-panel-root');
    if (setupRoot) setupRoot.innerHTML = SetupPanel();
    return;
  }

  // Sidebar és elrendezés
  if (property === 'sidebarCollapsed') {
    const layout = document.querySelector('.dkv-main-layout');
    if (layout) layout.classList.toggle('dkv-main-layout--collapsed', value);
    const toggle = document.querySelector('#sidebar-toggle');
    if (toggle) toggle.innerText = value ? '»' : '«';
    return;
  }

  if (property === 'sidebarContentVisible') {
    const sidebar = document.querySelector('.dkv-sidebar');
    if (sidebar) sidebar.classList.toggle('dkv-sidebar--content-hidden', !value);
    return;
  }

  if (property === 'sidebarIconsVisible') {
    const sidebar = document.querySelector('.dkv-sidebar');
    if (sidebar) sidebar.classList.toggle('dkv-sidebar--icons-hidden', !value);
    return;
  }

  // Narratíva renderelése (NarrativeEngine használatával)
  if (property === 'narrative' || property === 'projectTitle' || property === 'isGenerating' || !property) {
    if (slidesContainer) {
      const n = store.narrative;
      const qjRoot = document.querySelector('#quick-jump-root');

      if (n.length === 0) {
        slidesContainer.innerHTML = `<h2 class="dkv-neon-text">${store.projectTitle || 'NÉVTELEN PROJEKT'}</h2><p style="color:var(--text-dim);">Üres a váz...</p>`;
        if (qjRoot) qjRoot.innerHTML = '';
        return;
      }

      const sections = NarrativeEngine.getSections(n);

      // Mini-térkép generálása
      if (qjRoot) {
        qjRoot.innerHTML = NarrativeEngine.generateMiniMapHTML(sections);
        qjRoot.querySelectorAll('.dkv-jump-link').forEach(link => {
          link.onclick = (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            eventBus.emit('NAVIGATE_TO', targetId);
          };
        });
      }

      // Kártyák renderelése
      let html = `<h2 id="slides-title" class="dkv-neon-text">
                     ${store.projectTitle || 'NÉVTELEN PROJEKT'}
                   </h2>`;

      sections.forEach((sec, idx) => {
        const items = n.slice(sec.start, sec.end);
        if (items.length > 0) {
          const sectionColor = sec.color || 'var(--neon-cyan)';
          html += `
             <div id="${sec.id}" class="dkv-section-block" style="margin-bottom: 80px;">
               <div class="dkv-zone-card dkv-card--animated" style="--section-accent: ${sectionColor}; animation-delay: ${sec.start * 0.08}s;">
                 <div class="dkv-zone-icon">${sec.icon}</div>
                 <div class="dkv-zone-info">
                   <span class="dkv-zone-tag">${sec.title.split(' // ')[0]}</span>
                   <h3 class="dkv-zone-title">${sec.title.split(' // ')[1]}</h3>
                 </div>
               </div>

               <div class="dkv-cards-grid">
                 ${items.map((item, i) => {
            const globalIndex = sec.start + i;
            const itemsCount = items.length;
            const isOdd = itemsCount % 2 !== 0;

            let gridStyle = '';
            if (isOdd) {
              // Onboarding esetén az első, Finálé esetén az utolsó legyen széles
              if ((sec.id === 'sec-on' && i === 0) || (sec.id === 'sec-fi' && i === itemsCount - 1)) {
                gridStyle = 'grid-column: span 2;';
              }
            }

            const isFullWidth = gridStyle.includes('span 2');
            const delay = globalIndex * 0.08;
            return `
                      <div class="dkv-card--animated" style="${gridStyle} animation-delay: ${delay}s;">
                        ${NarrativeCard(item, isFullWidth, globalIndex)}
                      </div>
                    `;
          }).join('')}
               </div>
             </div>
           `;
        }
      });

      slidesContainer.innerHTML = html;

      // Szekvenciális fókusz (AC 2.2 támogatása)
      if (property === 'isGenerating' && value === false) {
        const cards = slidesContainer.querySelectorAll('.dkv-card--animated');
        // A kártyák a CSS animation-delay miatt maguktól úsznak be,
        // mi csak az első kártyára fókuszálunk.
        if (cards.length > 0) {
          setTimeout(() => {
            cards[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      }

      // Edit ikon események
      document.querySelectorAll('.dkv-edit-icon-btn').forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          store.editingSlideId = btn.getAttribute('data-id');
        };
      });
    }
  }

  // Modális ablakok kezelése
  if (property === 'editingSlideId' && modalRoot) {
    modalRoot.innerHTML = value ? IterationModal(value) : '';
    setupModalListeners();
  }

  if (property === 'isEditingBlueprint' && modalRoot) {
    modalRoot.innerHTML = value ? BlueprintModal() : '';
    setupBlueprintListeners();
  }

  if (property === 'viewingSlideId' && modalRoot) {
    modalRoot.innerHTML = value ? SlideDetailModal() : '';
  }
}

/**
 * Beállítja a fő alkalmazás eseménykezelőit.
 */
/**
 * Beállítja a fő alkalmazás eseménykezelőit delegációs mintával.
 * Ez biztosítja, hogy az újrarenderelt (például generálás utáni) elemek is működjenek.
 */
/**
 * Beállítja a fő alkalmazás eseménykezelőit delegációs mintával.
 */
function setupEventListeners() {
  // --- ESEMÉNY DELEGÁCIÓ (Pattogó események kezelése) ---
  document.body.onclick = async (e) => {
    const target = e.target.closest('[data-action], #generate-btn, #save-config-btn, #blueprint-btn, #export-btn, #sidebar-toggle, .dkv-hero-card, .dkv-small-card');
    if (!target || store.isGenerating) return;

    const action = target.getAttribute('data-action');
    const id = target.id;

    // 0. KÁRTYA MEGTEKINTÉSE VAGY SZERKESZTÉSE
    if (target.classList.contains('dkv-hero-card') || target.classList.contains('dkv-small-card')) {
      const editBtn = e.target.closest('.dkv-edit-icon-btn');
      if (editBtn) {
        // SZERKESZTÉS MÓD
        store.editingSlideId = editBtn.getAttribute('data-id');
      } else {
        // OLVASÓ MÓD
        const slideId = target.querySelector('.dkv-edit-icon-btn')?.getAttribute('data-id');
        if (slideId) store.viewingSlideId = slideId;
      }
      return;
    }

    // 0.1 MODAL BEZÁRÁSA
    if (action && action.startsWith('close-')) {
      const isOverlayClick = e.target.classList.contains('dkv-modal-overlay');
      const isCloseBtnClick = e.target.closest('.dkv-close-btn');

      if (isOverlayClick || isCloseBtnClick) {
        if (action === 'close-view-modal') store.viewingSlideId = null;
        if (action === 'close-blueprint') store.isEditingBlueprint = false;
        if (action === 'close-iteration') store.editingSlideId = null;
      }
      return;
    }

    // 0.2 BRIDGE FRISSÍTÉSE
    if (action === 'refresh-bridge') {
      if (window.refreshBridgeStatus) window.refreshBridgeStatus();
      store.toastMessage = 'Bridge állapotának ellenőrzése...';
      return;
    }

    // 1. GENERÁLÁS ÉS MENTÉS
    if (action === 'generate' || id === 'generate-btn' || id === 'save-config-btn') {
      e.preventDefault();
      store.isGenerating = true;
      Logger.info('Blueprint mentése és generálási folyamat indítása...');

      try {
        const response = await fetch('http://127.0.0.1:3001/save-blueprint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: store.projectTitle,
            prompt: store.prompt,
            blueprint: store.blueprint,
            narrativeConfig: store.narrativeConfig
          })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);

        Logger.info('Blueprint sikeresen mentve.');

        // Várakozás a fájl frissülésére (szimulált generálási idő)
        setTimeout(async () => {
          try {
            const modulePath = `/src/data/narrative.js?t=${Date.now()}`;
            const { narrative: newNarrative } = await import(/* @vite-ignore */ modulePath);
            if (newNarrative && Array.isArray(newNarrative)) {
              store.narrative = [...newNarrative];
              Logger.info(`Adatok frissítve: ${newNarrative.length} dia.`);
            }
          } catch (err) {
            Logger.error('Hiba a betöltéskor:', err);
          } finally {
            store.isGenerating = false;
            store.isWaitingForNarrative = true;
          }
        }, 5000);
      } catch (err) {
        Logger.error('Hiba a mentés során:', err);
        store.toastMessage = 'HIBA: A Bridge szerver nem érhető el!';
        store.isGenerating = false;
      }
      return;
    }

    // 2. BLUEPRINT SZERKESZTÉS
    if (action === 'edit-blueprint' || id === 'blueprint-btn') {
      store.isEditingBlueprint = true;
      return;
    }

    // 3. EXPORTÁLÁS
    if (action === 'export-md') {
      exportNarrative('markdown');
      return;
    }
    if (action === 'export-txt') {
      exportNarrative('text');
      return;
    }

    // 4. SIDEBAR TOGGLE (SZEKVENCIÁLIS 3 FÁZISÚ ANIMÁCIÓ)
    if (id === 'sidebar-toggle' || action === 'toggle-sidebar') {
      const isCollapsed = store.sidebarCollapsed;
      if (!isCollapsed) {
        // ZÁRÁS
        // 1. A Setup Panel tartalma elhalványul 0.3s alatt a széles sidebarban
        store.sidebarContentVisible = false;

        // 2. Miután eltűnt a tartalom (300ms), a sidebar üresen összecsukódik
        setTimeout(() => {
          store.sidebarCollapsed = true;
        }, 300);

        // 3. Miután a sidebar bezárult (további ~400ms a CSS transition-nek), megjelennek az ikonok a végleges helyükön
        setTimeout(() => {
          store.sidebarIconsVisible = true;
        }, 300 + 400);

      } else {
        // NYITÁS
        // 1. Az ikonok elhalványulnak (0.3s alatt) az eredeti helyükön, még az összecsukott sidebarban
        store.sidebarIconsVisible = false;

        // 2. Miután elhalványultak az ikonok (300ms), a sidebar üresen kinyílik
        setTimeout(() => {
          store.sidebarCollapsed = false;
        }, 300);

        // 3. Miután a sidebar kinyílt (további ~400ms CSS width változás), a teljes tartalom (Setup Panel + Nav) fade-in-nel megjelenik
        setTimeout(() => {
          store.sidebarContentVisible = true;
          // store.sidebarIconsVisible = true; 
        }, 300 + 400);
      }
      return;
    }

    // 4.5 TÖRTÉNET BETÖLTÉSE VAGY SZINKRONIZÁLÁSA
    if (action === 'load-story') {
      handleLoadStory();
      return;
    }
    if (action === 'sync-project' || id === 'sync-project-btn') {
      syncProjectData();
      return;
    }

    // 5. TOVÁBBI AKCIÓK (SCROLL STB)
    if (action === 'scroll-top') {
      eventBus.emit('SCROLL_TOP');
      return;
    }
  };

  // Input mezők figyelése
  const bindInputs = () => {
    const titleIn = document.querySelector('#input-title');
    const promptIn = document.querySelector('#prompt-input');
    if (titleIn) titleIn.oninput = (e) => { store.projectTitle = e.target.value; };
    if (promptIn) promptIn.oninput = (e) => { store.prompt = e.target.value; };
  };

  bindInputs();
  subscribe((prop) => {
    if (prop === 'isGenerating' || prop === 'sidebarCollapsed') {
      setTimeout(bindInputs, 0);
    }
  });
}

/**
 * Beállítja a diákszerkesztő modal eseménykezelőit.
 */
function setupModalListeners() {
  const closeBtn = document.querySelector('#close-iteration');
  const saveBtn = document.querySelector('#save-iteration');
  if (closeBtn) closeBtn.onclick = () => store.editingSlideId = null;
  if (saveBtn) {
    saveBtn.onclick = async () => {
      const note = document.querySelector('#iteration-note').value;
      const index = store.narrative.findIndex(s => s.id === store.editingSlideId);
      if (index !== -1) {
        store.narrative[index].notes = note;
        store.narrative = [...store.narrative];

        // MENTÉS A SZERVERRE
        try {
          await fetch('http://127.0.0.1:3001/save-iteration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slideId: store.editingSlideId,
              note: note
            })
          });
          Logger.info('Iterációs megjegyzés mentve a szerverre.');
          store.toastMessage = 'Változtatások rögzítve!';
        } catch (err) {
          Logger.error('Hiba az iteráció mentésekor:', err);
          store.toastMessage = 'Hiba a háttérmentéskor.';
        }
      }
      store.editingSlideId = null;
    };
  }
}

/**
 * Beállítja a Blueprint szerkesztő modal eseménykezelőit.
 */
function setupBlueprintListeners() {
  const saveBtn = document.querySelector('#save-blueprint');
  const modalicCard = document.querySelector('.dkv-modal-card');
  const textarea = document.querySelector('#blueprint-textarea');

  if (saveBtn) {
    saveBtn.onclick = async () => {
      const originalText = saveBtn.innerText;
      const blueprintContent = textarea.value;

      // Vizuális visszajelzés indítása
      saveBtn.innerText = 'MENTÉS ÉS BEÉPÍTÉS...';
      saveBtn.classList.add('dkv-btn--loading');
      modalicCard.classList.remove('dkv-modal-card--error');

      // Timeout beállítása (10 másodperc)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        Logger.info('Blueprint mentése indítva...');
        const response = await fetch('http://127.0.0.1:3001/save-blueprint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: store.projectTitle,
            blueprint: blueprintContent
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Szerver hiba (${response.status})`);
        }

        const result = await response.json();

        if (!result.success) throw new Error(result.error || 'Ismeretlen hiba a szerveren.');

        // SIKER ÁLLAPOT
        store.blueprint = blueprintContent;
        store.toastMessage = 'Blueprint sikeresen frissítve!';
        Logger.info('Blueprint sikeresen mentve.');

        // Rövid várakozás a vizuális megerősítéshez, mielőtt bezárjuk
        setTimeout(() => {
          store.isEditingBlueprint = false;
        }, 300);

      } catch (err) {
        // HIBA ÁLLAPOT (CorruptionUI)
        let errorMsg = err.message;
        if (err.name === 'AbortError') {
          errorMsg = 'Időtúllépés (timeout)';
        }

        Logger.error('Hiba a Blueprint mentésekor:', err);
        store.toastMessage = 'MENTÉSI HIBA: ' + errorMsg;

        modalicCard.classList.add('dkv-modal-card--error');
        saveBtn.innerText = 'HIBA! PRÓBÁLD ÚJRA';
        saveBtn.classList.remove('dkv-btn--loading');

        // Visszaállítjuk a gombot rövid idő múlva, de a hiba jelzése marad
        setTimeout(() => {
          if (store.isEditingBlueprint) {
            saveBtn.innerText = originalText;
          }
        }, 2000);
      }
    };
  }
}

/**
 * Felszabadítja az alkalmazás által lefoglalt erőforrásokat.
 */
export function destroy() {
  Logger.info('Alkalmazás erőforrásainak felszabadítása...');

  // Központi takarítás indítása
  disposalService.purge();

  NarrativeEngine.destroy();
  UIController.destroy();
  Logger.info('Pusztítás befejezve.');
}

// Alkalmazás indítása
initLayout();

// Feliratkozás a Store változásaira
const unsubscribeStore = subscribe((prop, val) => updateDynamicContent(prop, val));

// Feliratkozás regisztrálása takarításhoz
disposalService.add(() => {
  if (unsubscribeStore) unsubscribeStore();
  Logger.debug('main.js: Store előfizetés leállítva.');
});

/**
 * Generálja és letölti a narratíva fájlt a megadott formátumban.
 * @param {'markdown'|'text'} format 
 */
function exportNarrative(format) {
  if (!store.narrative || store.narrative.length === 0) {
    store.toastMessage = 'Nincs exportálható tartalom!';
    return;
  }

  const title = store.projectTitle || 'Névtelen-Projekt';
  const date = new Date().toISOString().split('T')[0];
  const filename = `dk-story-${title.replace(/\s+/g, '-')}-${date}.${format === 'markdown' ? 'md' : 'txt'}`;

  let content = '';
  if (format === 'markdown') {
    content = `# ${title.toUpperCase()}\n\n`;
    content += `*Generálva: ${new Date().toLocaleString('hu-HU')}*\n\n---\n\n`;
    store.narrative.forEach((slide, index) => {
      content += `## Dia ${index + 1}: ${slide.title}\n\n${slide.content}\n\n---\n\n`;
    });
  } else {
    content = `${title.toUpperCase()}\n`;
    content += `Generálva: ${new Date().toLocaleString('hu-HU')}\n\n`;
    store.narrative.forEach((slide, index) => {
      content += `DIA ${index + 1}: ${slide.title}\n`;
      content += `${slide.content}\n\n`;
      content += `--------------------------------------------------\n\n`;
    });
  }

  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);

    store.toastMessage = `Sikeres exportálás: ${filename}`;
    Logger.info(`Adatok exportálva: ${filename}`);
  } catch (err) {
    Logger.error('Hiba az exportálás során:', err);
    store.toastMessage = 'Hiba az exportálásnál!';
  }
}

/**
 * Kezeli a történet betöltését fájlból.
 */
function handleLoadStory() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.md,.txt';

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const extension = file.name.split('.').pop().toLowerCase();

      try {
        const result = parseNarrativeContent(content, extension === 'md' ? 'markdown' : 'text');

        if (result && result.narrative.length > 0) {
          // Állapot frissítése
          store.narrative = result.narrative;
          store.projectTitle = result.title || 'Betöltött Projekt';
          store.prompt = '';
          store.projectShortDesc = '';

          // UI nyitva tartása a szinkronizációhoz
          store.sidebarContentVisible = true;
          store.sidebarCollapsed = false;

          store.toastMessage = 'Történet sikeresen betöltve!';
          Logger.info(`Történet betöltve: ${file.name} (${result.narrative.length} dia)`);

          // Jelezzük, hogy szinkronizációra van szükség a fájlrendszerbe
          store.needsSync = true;
        } else {
          throw new Error('Nem sikerült feldolgozni a fájl tartalmát.');
        }
      } catch (err) {
        Logger.error('Hiba a betöltéskor:', err);
        store.toastMessage = 'HIBA: Érvénytelen fájlformátum!';
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

/**
 * Feldolgozza a beolvasott szöveget és kinyeri a címet és a diákat.
 * @param {string} text - A fájl tartalma.
 * @param {'markdown'|'text'} format - A fájl formátuma.
 * @returns {Object} { title, narrative }
 */
function parseNarrativeContent(text, format) {
  const narrative = [];
  let title = '';

  if (format === 'markdown') {
    // Cím keresése (# [Title])
    const titleMatch = text.match(/^#\s+(.*)$/m);
    if (titleMatch) title = titleMatch[1].trim();

    // Diákra bontás (## Dia [X]: [SubTitle])
    // Az elválasztó --- jelek mentén is vághatunk, de a Dia fejléc biztosabb
    const sections = text.split(/\n---\s*\n/);

    sections.forEach(section => {
      const slideMatch = section.match(/## Dia \d+:\s*(.*)\n([\s\S]*)/);
      if (slideMatch) {
        narrative.push({
          id: `slide-load-${Date.now()}-${narrative.length}`,
          title: slideMatch[1].trim(),
          content: slideMatch[2].trim()
        });
      }
    });
  } else {
    // Sima szöveg formátum
    const lines = text.split('\n');
    title = lines[0].trim();

    const sections = text.split(/\n-+\n/); // ------------------- elválasztó

    sections.forEach(section => {
      const slideMatch = section.match(/DIA \d+:\s*(.*)\n([\s\S]*)/i);
      if (slideMatch) {
        narrative.push({
          id: `slide-load-${Date.now()}-${narrative.length}`,
          title: slideMatch[1].trim(),
          content: slideMatch[2].trim()
        });
      }
    });
  }

  return { title, narrative };
}

/**
 * Szinkronizálja az aktuális (betöltött) projektet a fájlrendszerrel a Bridge segítségével.
 */
async function syncProjectData() {
  if (!store.isBridgeOnline) {
    store.toastMessage = 'HIBA: A Bridge nem elérhető a szinkronizációhoz!';
    return;
  }

  const syncBtn = document.querySelector('#sync-project-btn');
  if (syncBtn) {
    syncBtn.innerText = 'SZINKRONIZÁLÁS...';
    syncBtn.classList.add('dkv-btn--loading');
  }

  try {
    const response = await fetch('http://127.0.0.1:3001/sync-full-project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sync-token': 'dk-story-sync-2026'
      },
      body: JSON.stringify({
        title: store.projectTitle,
        narrative: store.narrative
      })
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    store.needsSync = false;
    store.toastMessage = 'Sikeres szinkronizáció! A projekt és a ceruza ikon mostantól használatra kész.';
    Logger.info('Projekt sikeresen szinkronizálva a fájlrendszerbe.');

    // HMR elleni védelem: állapot mentése a localStorage-ba
    localStorage.setItem('dkv_sync_pending', 'true');
    localStorage.setItem('dkv_last_sync_title', store.projectTitle);

  } catch (err) {
    Logger.error('Szinkronizációs hiba:', err);
    store.toastMessage = 'HIBA a szinkronizálás során: ' + err.message;
  } finally {
    if (syncBtn) {
      syncBtn.innerText = 'SZINKRONIZÁCIÓ A PROJEKTBE';
      syncBtn.classList.remove('dkv-btn--loading');
    }
  }
}

initLayout();

/**
 * Globális állapotjelzők (téma, bridge) eseménykezelése delegálással.
 */
function setupGlobalStatusListeners() {
  const root = document.querySelector('#global-status-root');
  if (!root) return;

  root.addEventListener('click', (e) => {
    // Téma váltó gomb
    const themeBtn = e.target.closest('#theme-toggle-btn');
    if (themeBtn) {
      Logger.debug('GlobalStatus: Téma váltás kattintás.');
      themeManager.toggleTheme();
      return;
    }

    // Bridge frissítés
    const bridgeIndicator = e.target.closest('.dkv-bridge-status');
    if (bridgeIndicator) {
      Logger.debug('GlobalStatus: Bridge frissítés kattintás.');
      if (window.refreshBridgeStatus) window.refreshBridgeStatus();
      return;
    }
  });
}
