import { vi } from 'vitest';

/**
 * Vitest Globális Setup
 * Ebben a fájlban konfiguráljuk a tesztkörnyezet közös alapjait.
 */

// Szigorú fókuszmegőrzés ellenőrzéséhez (Rule 61)
// Itt lehetne globális fókusz-figyelőt is beállítani, ha szükséges.

// Mock GameLogger - Ne szennyezzük a teszt kimenetet
const mockLogger = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};

vi.stubGlobal('GameLogger', mockLogger);

// Minden teszt után alaphelyzetbe állítjuk a mockokat
import { beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  // vi.unstubAllGlobals(); // Csak ha minden teszt után le akarjuk venni a mockot
});

// Console.log elnyomása (opcionális, de ajánlott)
// console.log = vi.fn();
// console.error = vi.fn();
