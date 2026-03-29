const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  // Click on the toggle explicitly to collapse the sidebar if it's open
  try {
    await page.waitForSelector('#sidebar-toggle', { timeout: 2000 });
    await page.click('#sidebar-toggle');
    // Wait for the full 700ms sequence to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (e) {
    console.log('Toggle not clicked or not present:', e.message);
  }

  const result = await page.evaluate(() => {
    const nav = document.querySelector('#quick-jump-root');
    const panel = document.querySelector('#setup-panel-root');
    const layout = document.querySelector('.dkv-main-layout');
    const sidebar = document.querySelector('#sidebar');

    if (!nav) return 'Nav not found';

    const rect = nav.getBoundingClientRect();
    const style = window.getComputedStyle(nav);
    const panelRect = panel ? panel.getBoundingClientRect() : null;
    const panelStyle = panel ? window.getComputedStyle(panel) : null;

    return {
      nav: {
        x: rect.x, y: rect.y, width: rect.width, height: rect.height,
        display: style.display, visibility: style.visibility, opacity: style.opacity,
        marginTop: style.marginTop, paddingTop: style.paddingTop, zIndex: style.zIndex
      },
      panel: panel ? {
        x: panelRect.x, y: panelRect.y, width: panelRect.width, height: panelRect.height,
        display: panelStyle.display, flex: panelStyle.flex
      } : 'No panel',
      classes: {
        sidebar: sidebar ? sidebar.className : '',
        layout: layout ? layout.className : ''
      },
      innerHTML: nav.innerHTML.trim()
    };
  });

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
