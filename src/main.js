import { store, subscribe } from './services/store.js';
import { Logger } from './services/Logger.js';
import { eventBus } from './services/EventBus.js';
import { narrative } from './data/narrative.js';
import { NarrativeCard } from './components/NarrativeCard.js';
import { SetupPanel } from './components/SetupPanel.js';
import { IterationModal } from './components/IterationModal.js';
import { BlueprintModal } from './components/BlueprintModal.js';
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
    toast.innerText = 'GENERÁLÁS FOLYAMATBAN... KÉRJÜK VÁRJON!';
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

/**
 * Inicializálja az alkalmazás alapvető elrendezését (layout).
 */
async function initLayout() {
  // Beolvassuk a mentett állapotot a fájlból indításkor
  await loadInitialState();

  app.innerHTML = `
    <div class="dkv-main-layout ${store.sidebarCollapsed ? 'dkv-main-layout--collapsed' : ''} ${store.isGenerating ? 'dkv-main-layout--locked' : ''}">
      <!-- BAL OLDAL: GENERATOR -->
      <aside id="sidebar" class="dkv-sidebar ${!store.sidebarContentVisible ? 'dkv-sidebar--content-hidden' : ''}">
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
          <div style="display: flex; gap: 10px;">
             <button class="dkv-nav-btn" data-action="scroll-top">↑</button>
          </div>
        </header>

        <section id="slides-container" class="dkv-slides-viewer">
          <!-- Ide kerülnek a kártyák -->
        </section>
      </main>

      <!-- Generálási Overlay -->
      <div id="gen-overlay" class="dkv-gen-overlay" style="display: none;">
          <div class="dkv-gen-overlay__content">
            <h2 class="dkv-neon-text">ADATOK KÜLDÉSE AZ AI-NAK...</h2>
            <p style="color: var(--text-dim);">Várj 3 másodpercet a szinkronizációig, majd jelezd nekem az AI-nak a chatben, hogy kész vagy!</p>
          </div>
      </div>
    </div>
    
    <div id="modal-root"></div>
  `;

  UIController.setupGlobalListeners();
  setupEventListeners();
  updateDynamicContent();
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
  } catch (err) {
    Logger.debug('Nem található mentett blueprint.json (elsố indítás?).');
  }
}

/**
 * Frissíti az alkalmazás dinamikus tartalmait a Store változásai alapján.
 * @param {string} property - A megváltozott tulajdonság neve a store-ban.
 * @param {any} value - Az új érték.
 */
function updateDynamicContent(property, value) {
  const header = document.querySelector('#preview-title-header');
  const overlay = document.querySelector('#gen-overlay');
  const modalRoot = document.querySelector('#modal-root');
  const slidesContainer = document.querySelector('#slides-container');

  // Csak a címet frissítjük, ha az változott
  if (property === 'projectTitle' && header) {
    header.innerText = `TÖRTÉNET ELŐNÉZETE: ${value.toUpperCase()}`;
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

  // Generálási állapot kezelése
  if (property === 'isGenerating') {
    const layout = document.querySelector('.dkv-main-layout');
    if (layout) layout.classList.toggle('dkv-main-layout--locked', value);

    const setupRoot = document.querySelector('#setup-panel-root');
    if (setupRoot) setupRoot.innerHTML = SetupPanel();
    
    if (overlay) overlay.style.display = value ? 'flex' : 'none';
    if (value && slidesContainer) {
      slidesContainer.innerHTML = `<div style="padding: 100px; text-align: center; width: 100%;"><div class="dkv-digital-pulse"></div></div>`;
      return;
    }
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
      let html = `<h2 id="slides-title" class="dkv-neon-text" style="margin-bottom: 40px; font-size: 2.2rem; font-weight: 900; letter-spacing: 3px; text-transform: uppercase;">
                     ${store.projectTitle || 'NÉVTELEN PROJEKT'}
                   </h2>`;

      sections.forEach((sec, idx) => {
        const items = n.slice(sec.start, sec.end);
        if (items.length > 0) {
          html += `
             <div id="${sec.id}" class="dkv-section-block" style="margin-bottom: 80px;">
               <div class="dkv-zone-card dkv-card--animated" style="border-left: 6px solid ${sec.color || 'var(--neon-cyan)'}; animation-delay: ${sec.start * 0.08}s;">
                 <div class="dkv-zone-icon" style="color: ${sec.color || 'var(--neon-cyan)'}; text-shadow: 0 0 15px ${sec.color || 'var(--neon-cyan)'};">${sec.icon}</div>
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
}

/**
 * Beállítja a fő alkalmazás eseménykezelőit.
 */
/**
 * Beállítja a fő alkalmazás eseménykezelőit delegációs mintával.
 * Ez biztosítja, hogy az újrarenderelt (például generálás utáni) elemek is működjenek.
 */
function setupEventListeners() {
  // --- ESEMÉNY DELEGÁCIÓ (Pattogó események kezelése) ---
  document.body.onclick = async (e) => {
    const target = e.target.closest('[data-action], #generate-btn, #save-config-btn, #blueprint-btn, #export-btn, #sidebar-toggle');
    if (!target || store.isGenerating) return;

    const action = target.getAttribute('data-action');
    const id = target.id;

    // 1. GENERÁLÁS (A legfontosabb funkció)
    if (action === 'generate' || id === 'generate-btn' || id === 'save-config-btn') {
      e.preventDefault();
      store.isGenerating = true;
      Logger.info('Generálási folyamat indítása (Delegált esemény)...');

      // ADATOK MENTÉSE A SZERVERRE (AI Sync Bridge)
      try {
        const response = await fetch('http://localhost:3001/save-blueprint', {
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
        Logger.info('Blueprint sikeresen mentve a szerverre.');
        store.toastMessage = 'Adatok elküldve az AI motornak...';
      } catch (err) {
        Logger.error('Hiba a mentés során:', err);
        store.toastMessage = 'HIBA: Az AI Bridge (server.js) nem érhető el!';
        store.isGenerating = false;
        return;
      }

      // Megvárjuk a vizuális visszajelzést (overlay)
      setTimeout(async () => {
        try {
          // Dinamikus import kényszerítése friss időbélyeggel
          const modulePath = `/src/data/narrative.js?t=${Date.now()}`;
          const { narrative: newNarrative } = await import(modulePath);
          
          if (newNarrative && Array.isArray(newNarrative)) {
            store.narrative = [...newNarrative];
            Logger.info(`Sikeres importálás: ${newNarrative.length} dia betöltve.`);
            store.toastMessage = 'Új narratíva betöltve!';
            // A felhasználói élmény kedvéért néha töröljük a promptot, 
            // ha már "feldolgoztuk" (ahogy a felhasználó említette)
            // de a címet érdemes megtartani. Itt most csak naplózzuk.
          } else {
            throw new Error('Érvénytelen narratíva adatstruktúra érkezett a fájlból.');
          }
        } catch (err) {
          Logger.error('Hiba a generálás befejezésekor:', err);
          store.toastMessage = 'Hiba a fájl betöltésekor.';
        } finally {
          store.isGenerating = false;
          Logger.info('Generálási folyamat kész, UI feloldva.');
        }
      }, 3000);
      return;
    }

    // 2. BLUEPRINT SZERKESZTÉS
    if (action === 'edit-blueprint' || id === 'blueprint-btn') {
      store.isEditingBlueprint = true;
      return;
    }

    // 3. EXPORTÁLÁS (Markdown vagy Sima Szöveg)
    if (action === 'export-md') {
      exportNarrative('markdown');
      return;
    }

    if (action === 'export-txt') {
      exportNarrative('text');
      return;
    }

    // 4. SIDEBAR TOGGLE
    if (id === 'sidebar-toggle') {
      if (!store.sidebarCollapsed) {
        store.sidebarContentVisible = false;
        setTimeout(() => { store.sidebarCollapsed = true; }, 50);
      } else {
        store.sidebarCollapsed = false;
        await new Promise(r => setTimeout(r, 450));
        store.sidebarContentVisible = true;
      }
      return;
    }

    // 5. SCROLL TOP
    if (action === 'scroll-top') {
      eventBus.emit('SCROLL_TOP');
      return;
    }
  };

  // Input mezők figyelése (ezeket nem delegáljuk a jobb UX miatt, de újra kötni kell rendereléskor)
  const bindInputs = () => {
    const titleIn = document.querySelector('#input-title');
    const promptIn = document.querySelector('#prompt-input');
    if (titleIn) titleIn.oninput = (e) => { store.projectTitle = e.target.value; };
    if (promptIn) promptIn.oninput = (e) => { store.prompt = e.target.value; };
  };

  bindInputs();
  
  // Minden store frissítéskor újra kell kötni az input mezőket a SetupPanel-ben
  subscribe((prop) => {
    if (prop === 'isGenerating' || prop === 'sidebarCollapsed') {
      setTimeout(bindInputs, 0); // Megvárjuk míg bekerül a DOM-ba
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
          await fetch('http://localhost:3001/save-iteration', {
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
  const closeBtn = document.querySelector('#close-blueprint');
  const saveBtn = document.querySelector('#save-blueprint');
  const modalicCard = document.querySelector('.dkv-modal-card');
  const textarea = document.querySelector('#blueprint-textarea');
  
  if (closeBtn) closeBtn.onclick = () => store.isEditingBlueprint = false;
  
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
        const response = await fetch('http://localhost:3001/save-blueprint', {
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
