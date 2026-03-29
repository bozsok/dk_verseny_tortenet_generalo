import { describe, it, expect } from 'vitest';

describe('Vitest Health-Check', () => {
  it('alapvető aritmetika működik', () => {
    expect(1 + 1).toBe(2);
  });

  it('jsdom környezet elérhető (window és document)', () => {
    expect(typeof window).not.toBe('undefined');
    expect(typeof document).not.toBe('undefined');

    const div = document.createElement('div');
    div.id = 'test-div';
    document.body.appendChild(div);

    expect(document.getElementById('test-div')).not.toBeNull();
  });

  it('global GameLogger mock elérhető', () => {
    expect(global.GameLogger).toBeDefined();
    GameLogger.log('Teszt üzenet');
    expect(GameLogger.log).toHaveBeenCalledWith('Teszt üzenet');
  });
});
