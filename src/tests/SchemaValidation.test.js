import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { bridgeService } from '../shadow/services/ShadowBridgeService.js';
import { SchemaValidator } from '../shadow/services/SchemaValidator.js';
import { setupBridgeMock } from './mocks/bridge-mock.js';
import { store } from '../shadow/services/store.js';

/**
 * Séma-validáció és Adat-integritás Unit Tesztek (Rule 62 / NFR6)
 */
describe('Schema Validation & Data Integrity', () => {
  
  describe('SchemaValidator (Unit)', () => {
    it('validateCard - elfogadja és megtisztítja a helyes diát', () => {
      const card = { id: 's-1', title: 'Cím', content: 'Tartalom', junk: 123 };
      const result = SchemaValidator.validateCard(card);
      
      expect(result).toEqual({ id: 's-1', title: 'Cím', content: 'Tartalom' });
    });

    it('validateCard - nullt ad vissza ha hiányzik kötelező mező', () => {
      expect(SchemaValidator.validateCard({ id: '1', title: 'X' })).toBeNull(); // hiányzó content
      expect(SchemaValidator.validateCard({})).toBeNull();
      expect(SchemaValidator.validateCard(null)).toBeNull();
    });

    it('validateProject - ellenőrzi a projekt struktúrát', () => {
      const valid = { title: 'T', prompt: 'P', narrativeConfig: {}, extra: 'X' };
      const result = SchemaValidator.validateProject(valid);
      
      expect(result).not.toBeNull();
      expect(result).not.toHaveProperty('extra'); // Sanitization check
    });
  });

  describe('ShadowBridgeService (Integration)', () => {
    beforeEach(() => {
      store.mode = 'bridge';
    });

    afterEach(() => {
      vi.restoreAllMocks();
      bridgeService.disposal();
    });

    it('getNarrative - automatikusan kiszűri a sérült diákat a válaszból', async () => {
      const mockResponse = {
        success: true,
        narrative: [
          { id: 'id-1', title: 'Valid 1', content: 'Content 1' },
          { id: 'id-2', content: 'Missing Title' }, // INVALID
          { title: 'Missing ID', content: 'Content 3' } // INVALID
        ]
      };
      setupBridgeMock({ '/get-narrative': mockResponse });
      
      const narrative = await bridgeService.getNarrative();
      
      // Csak 1 érvényes dia maradhat
      expect(narrative.length).toBe(1);
      expect(narrative[0].id).toBe('id-1');
    });

    it('getProjectData - megszakítja a folyamatot (hibát dob) kritikus hiba esetén', async () => {
      // Csak részleges projekt adat érkezik
      setupBridgeMock({ '/get-project-data': { title: 'Hiányos projekt' } });
      
      await expect(bridgeService.getProjectData())
        .rejects.toThrow('Shadow Error: Érvénytelen projekt metaadatok (Adat-integritás hiba).');
    });

    it('getMasterBlueprint - validálja a Mesterleírót hálózati módban', async () => {
      setupBridgeMock({ '/get-master-blueprint': { blueprint: 'Valid text', version: 'V5' } });
      
      const bp = await bridgeService.getMasterBlueprint();
      expect(bp.version).toBe('V5');
      expect(bp.blueprint).toBe('Valid text');
    });
  });
});
