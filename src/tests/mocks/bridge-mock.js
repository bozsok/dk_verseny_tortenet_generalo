import { vi } from 'vitest';

/**
 * Shadow Bridge API Mock
 * Szimulálja a 3003-as porton futó AI Sync Bridge válaszait.
 * NFR1 és FR1-4 teszteléséhez elengedhetetlen.
 */
export const setupBridgeMock = (overrides = {}) => {
  const defaultResponses = {
    '/status': { status: 'online', version: '1.0.0', mode: 'bridge' },
    '/blueprint': { blueprint: 'Default Test Blueprint' },
    '/narrative': { slides: [{ id: '1', title: 'Test Slide', content: 'Content' }] }
  };

  const responses = { ...defaultResponses, ...overrides };

  const fetchMock = vi.fn((url) => {
    // Relatív URL támogatása (alapértelmezett localhost:3003-ra ha hiányzik a protokoll)
    const fullUrl = url.includes('://') ? url : `http://localhost:3003${url.startsWith('/') ? '' : '/'}${url}`;

    // Port ellenőrzése (3003 a Bridge portja)
    if (!fullUrl.includes(':3003')) {
      return Promise.reject(new Error('Csak a 3003-as port hívása engedélyezett a Bridge mock-ban.'));
    }

    const urlObj = new URL(fullUrl);
    const path = urlObj.pathname;
    const responseData = responses[path] || { error: 'Not Found' };

    return Promise.resolve({
      ok: responseData.error ? false : true,
      status: responseData.error ? 404 : 200,
      json: () => Promise.resolve(responseData)
    });
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

/**
 * Mock hálózati késleltetés (NFR1: 500ms timeout teszteléséhez)
 */
export const setupDelayedBridgeMock = (ms = 600) => {
  const fetchMock = vi.fn((url, options) => new Promise((resolve, reject) => {
    const signal = options?.signal;
    
    if (signal?.aborted) {
      return reject(new Error('AbortError'));
    }

    const timeoutId = setTimeout(() => {
      resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'online' })
      });
    }, ms);

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        const abortError = new Error('The operation was aborted.');
        abortError.name = 'AbortError'; // Rule 60/62: Explicit hiba-típus a tesztekhez
        reject(abortError);
      }, { once: true });
    }
  }));

  vi.stubGlobal('fetch', fetchMock);
};
