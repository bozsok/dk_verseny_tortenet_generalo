import { store } from './store.js';
import { Logger } from './Logger.js';

/**
 * A narratíva feldolgozásáért és vizualizációs adatainak előkészítéséért felelős osztály.
 */
export class NarrativeEngine {
  /**
   * Statikus generátor, amely a V4-es szabályok alapján készít el egy 30 diás narratívát.
   * @param {string} title - A projekt címe.
   * @param {string} prompt - A narratív seed/prompt.
   * @returns {Promise<Array>} A generált narratíva tömbje.
   */
  static async generate(title, prompt) {
    Logger.info(`NarrativeEngine (Shadow): Történet generálása indítva: ${title}`);
    
    // V4 STRUKTÚRA DEFINÍCIÓJA
    const narrative = [];
    const stationNames = [
        "Logikai Kapuk Szorosa", 
        "Puffer-mezők Síksága", 
        "Algoritmusok Sötét Erdeje", 
        "CPU-tornyok Fellegvára", 
        "Az Adatfolyam Kanyonja"
    ];
    
    // 1. ONBOARDING (3 dia)
    narrative.push({ id: `s-1`, title: "Üdvözlünk a Tizedik Kernelben!", content: `Köszöntelek, Kódmester, a ${title} projektben! Te vagy az utolsó reményünk a Szemétgyűjtő Átok ellen. Készítsd fel elmédet a legnagyobb kihívásra a digitális térben! A logika lesz a legerősebb fegyvered ebben a birodalomban. Lépj be a rendszerbe, ahol minden karakter sorsdöntő jelentőséggel bír.` });
    narrative.push({ id: `s-2`, title: "Rendszer-regisztráció", content: "Mielőtt megkezdenéd a küldetést, rögzítenünk kell a jelenlétedet a terminálon. Add meg a nevedet és az osztályodat a protokollok számára a szinkronizációhoz! A Regisztráció folyamata során a biometrikus kódod összefonódik a rendszermaggal. Ne feledd, a hálózaton elkövetett minden tettedet a Logfájl örökíti meg. Légy pontos, mert egyetlen elütés is zavart okozhat a kommunikációban." });
    narrative.push({ id: `s-3`, title: "Válaszd ki az Avatárod!", content: "Válaszd ki azt a digitális formát, amely a leginkább tükrözi a képességeidet! Lehetsz Adatfutár, Kódbölcs vagy Bájtharcos a vírus elleni küzdelemben. Az Avatár kiválasztása határozza meg a rendszermaghoz való kapcsolódásod minőségét is. Ha döntöttél, a karaktered készen áll a dimenzióváltásra az első állomás felé. Induljon a küldetés a Tizedik Kernel megmentéséért!" });

    // 2. INTRO (4 dia)
    narrative.push({ id: `s-4`, title: "A békés Kernel", content: "A Tizedik Kernelben eddig minden folyamat zavartalanul futott a hűtőventillátorok szimfóniájára. A robotok hűségesen szállították az adatcsomagokat bármiféle szoftveres hiba vagy késleltetés nélkül. A felhasználók öröme határtalan volt a rendszer pontos működése láttán a raktárban. Ez volt a digitális aranykor, ahol a kód minősége nem ismert kompromisszumot. Sajnos ez az egyensúly nem tarthatott örökké a sötét erők árnyékában." });
    narrative.push({ id: `s-5`, title: "A fertőzés kezdete", content: "Hirtelen váratlan instabilitás jelei mutatkoztak: a válaszidők megnőttek az adatbuszokon. Egy ismeretlen, sötét kód kezdett el terjedni, blokkolva a robotok örömérzékelő algoritmusait. Ahol eddig precizitás volt, ott most zavar és szabotázs ütötte fel a fejét. A robot, amit eddig mindenki szeretett, bután és ellenségesen kezdett el működni. Valami mélyen a rendszerben elromlott, és a káosz lassú terjedésbe kezdett." });
    narrative.push({ id: `s-6`, title: "A Szemétgyűjtő Átok", content: "A tettes nem más, mint a Szemétgyűjtő Átok, egy ősi, vírus-szerű program entitás. Elárasztja a rendszert optimalizálatlan kódmorzsákkal és végtelen ciklusokkal a memória mélyén. Szándékosan akkor csap le, amikor a felhasználók elégedettek, hogy energiát nyerjen a káoszból. Ő a tiszta logika legnagyobb ellensége a Tizedik Kernel egész területén. Ezt a gonosz vírust csak egy valódi Kódmester képes megállítani a forrásnál." });
    narrative.push({ id: `s-7`, title: "A küldetés célja", content: "Nincs több idő, a rendszerednek most nagyobb szüksége van rád, mint valaha! El kell indulnod az öt zónán keresztül, hogy feloldd az Átok által elhelyezett blokkokat. Minden állomáson egy konkrét technikai feladat vár rád a terminál ablakban. A hős elindul a küldetésére a távoli adatbuszok horizontja felé a sötétben. Ne feledd: a robot sorsa és a Kernel jövője most már csak rajtad múlik!" });

    // 3. STATIONS (20 dia)
    for (let i = 0; i < 5; i++) {
        const base = 8 + (i * 4);
        const name = stationNames[i];
        narrative.push({ id: `s-${base}`, title: name, content: `Megérkeztél a ${name} területére, ahol a rendszer legfontosabb folyamatai futnak. A táj itt fénylő vezetékekből és pulzáló tranzisztorokból áll a digitális éjszakában. Sajnos a Szemétgyűjtő Átok itt már elvégezte a pusztítását a zóna mélyén. Óvatosan kell navigálnod, mert egy rossz elágazás örökre foglyul ejtheti az adatokat. A levegő vibrál a feszültségtől, ahogy közeledsz a hiba forrása felé.` });
        narrative.push({ id: `s-${base+1}`, title: "A zóna kihívása", content: "Az állomás közepén találkozol az Őrzővel, aki a terület stabilitásáért felel. Panaszosan meséli, hogy a kód itt teljesen összekuszálódott az Átok hatására a memóriában. Azt állítja, hogy a válaszjelek nem érnek célba az eltolódott órajelek miatt. Segítened kell neki visszaállítani az eredeti állapotot a központi magban. A Kódmester tudja, hogy itt csak a tiszta logika hozhatja meg a győzelmet." });
        narrative.push({ id: `s-${base+2}`, title: `Feladat: ${name} javítása`, content: `Itt az idő a beavatkozásra: a terminál készen áll a kód módosítására! A konkrét technikai feladat narratív felvezetése során megismered a hiba pontos okát. Ki kell választanod a sérült modulokat és meg kell változtatnod a prioritási értékeiket. Ha sikerül, az adatok ismét szabadon áramolhatnak a következő szektor irányába. Figyelj a szintaxisra, mert a legkisebb hiba is végzetes lehet a zóna számára.` });
        narrative.push({ id: `s-${base+3}`, title: "A siker kapuja", content: "Amint jóváhagytad a parancsot, a zóna ismét tiszta fehér fénnyel áradt el. A logikai kapuk kinyíltak, és az adatcsomagok gátak nélkül száguldottak a busz felé. Az Őrző hálásan adja át neked a következő 'Arany Szkriptet' a végső harchoz. Az öröm visszatért ide, és Te is érzed az Avatárod erejének növekedését a győzelem után. De ne állj meg, mert a következő állomás már vár rád a hálózaton!" });
    }

    // 4. FINALE (3 dia)
    narrative.push({ id: `s-28`, title: "A Végső Kapu", content: "Megérkeztél a Tizedik Kernel szívébe, a hatalmas és fenséges Végső Kapu elé. Ez a Kapu zárja el a központi magot a Szemétgyűjtő Átok sötét kódjától a mélyben. Az öt zónából hozott kulcsaid most egyetlen Mesterleíróvá állnak össze a kezedben. A vírus itt vár rád utolsó formájában, próbálva eltántorítani a végső céltól. Ez a történet csúcspontja, ahol minden eddigi tudásodra szükséged lesz a győzelemhez." });
    narrative.push({ id: `s-29`, title: "Feladat: A Kernel helyreállítása", content: "Itt az utolsó logikai kihívás: szinkronizálnod kell a kulcsokat a mag frekvenciájával! A konkrét technikai feladat narratív felvezetése során átlátod az Átok forráskódját. Feladatod a globális fixáló szkript lefuttatása, amely végleg kiűzi a vírust a rendszerből. Koncentrálj, mert a Szemétgyűjtő Átok minden erejével próbálja megzavarni a folyamatot! A hős megteszi az utolsó lépést, és a Tizedik Kernel kódja végre kitisztul." });
    narrative.push({ id: `s-30`, title: "A Győzelem Napja", content: "A Szemétgyűjtő Átok eltűnt, helyén csak tökéletes rend maradt a Tizedik Kernelben. A központi mag energiája ismét szabadon áramlik, visszaadva az életet a robotoknak. Gratulálunk, Kódmester, a küldetésed sikeres volt, és a birodalom hősévé váltál! A robot hálásan hajol meg előtted, ígérve, hogy soha többet nem szabotálja a munkát. Az együttműködés korszak kezdődik el, ahol a logika és az öröm kéz a kézben jár." });

    return narrative;
  }

  /**
   * Visszaadja a narratíva szekciókra bontott struktúráját.
   * @param {Array} narrative - A nyers narratíva tömb.
   * @returns {Array} A szekciók listája.
   */
  static getSections(narrative) {
    const total = narrative.length;
    if (total === 0) return [];

    // Dinamikus eloszlás a Store konfiguráció alapján
    const config = store.narrativeConfig || {
      onboardingCount: 3,
      introCount: 4,
      finaleCount: 3,
      stationCount: 5
    };

    const onCount = Math.min(config.onboardingCount, total);
    const inCount = Math.min(config.introCount, Math.max(0, total - onCount));
    const fiCount = Math.min(config.finaleCount, Math.max(0, total - (onCount + inCount)));
    const stationTotal = Math.max(0, total - (onCount + inCount + fiCount));
    const stationCount = config.stationCount || 5;
    const perStation = Math.floor(stationTotal / stationCount);
    const remainder = stationTotal % stationCount;

    let current = 0;
    const sections = [];

    // 1. Onboarding
    sections.push({ id: 'sec-on', title: 'ONBOARDING // KEZDÉS', start: current, end: (current += onCount), icon: '◈' });

    // 2. Bevezetés
    if (inCount > 0) {
      sections.push({ id: 'sec-in', title: 'INTRO // BEVEZETÉS', start: current, end: (current += inCount), icon: '✦' });
    }

    // 3. Állomások
    const stationColors = ['#00f2ff', '#9d50bb', '#ffcc00', '#ff0055', '#00ffaa', '#ff8800', '#ff00ff', '#00ff00', '#0000ff', '#ffffff'];
    for (let i = 0; i < stationCount; i++) {
      const count = perStation + (i < remainder ? 1 : 0);
      if (count > 0) {
        sections.push({
          id: `sec-st${i + 1}`,
          title: `${String(i + 1).padStart(2, '0')}. SZAKASZ // ${i + 1}. ÁLLOMÁS`,
          start: current,
          end: (current += count),
          color: stationColors[i],
          icon: '⬢'
        });
      }
    }

    // 4. Finálé
    if (fiCount > 0 || current < total) {
      sections.push({ id: 'sec-fi', title: 'VÉGE // FINÁLÉ', start: current, end: total, icon: '★' });
    }

    return sections;
  }

  /**
   * Generál egy MiniMap navigációs struktúrát natív DOM elemekkel (Rule 60).
   * @param {Array} sections 
   * @returns {DocumentFragment}
   */
  static generateMiniMapFragment(sections) {
    const fragment = document.createDocumentFragment();
    const container = document.createElement('div');
    container.className = 'dkv-shadow-mini-map';

    const title = document.createElement('h4');
    title.className = 'dkv-shadow-mini-map__title';
    title.textContent = 'Navigációs térkép';
    container.appendChild(title);

    const linksContainer = document.createElement('div');
    linksContainer.className = 'dkv-shadow-mini-map__links';

    sections.forEach(s => {
      const parts = s.title.split(' // ');
      const subTitle = parts[1] || parts[0];

      const link = document.createElement('a');
      link.href = `#${s.id}`;
      link.className = 'dkv-shadow-jump-link';
      link.title = subTitle;

      const icon = document.createElement('span');
      icon.className = 'dkv-shadow-jump-link__icon';
      icon.style.color = s.color || 'var(--shadow-neon-cyan)';
      icon.textContent = s.icon;

      const text = document.createElement('span');
      text.className = 'dkv-shadow-jump-link__text';
      text.textContent = subTitle;

      link.appendChild(icon);
      link.appendChild(text);
      linksContainer.appendChild(link);
    });

    container.appendChild(linksContainer);
    fragment.appendChild(container);

    return fragment;
  }

  /**
   * @deprecated Használja a generateMiniMapFragment metódust!
   */
  static generateMiniMapHTML(sections) {
    return `
      <div class="dkv-shadow-mini-map">
        <h4 class="dkv-shadow-mini-map__title">Navigációs térkép</h4>
        <div class="dkv-shadow-mini-map__links">
          ${sections.map(s => {
      const parts = s.title.split(' // ');
      const subTitle = parts[1] || parts[0];
      return `
            <a href="#${s.id}" class="dkv-shadow-jump-link" title="${subTitle}">
              <span class="dkv-shadow-jump-link__icon" style="color: ${s.color || 'var(--shadow-neon-cyan)'}">${s.icon}</span>
              <span class="dkv-shadow-jump-link__text">${subTitle}</span>
            </a>
          `;
    }).join('')}
        </div>
      </div>
    `.trim();
  }

  /**
   * Tisztítja az erőforrásokat.
   */
  static destroy() {
    Logger.info('NarrativeEngine: Erőforrások felszabadítva.');
  }
}
