import { disposalService } from '../services/disposal-service.js';
import { Logger } from '../services/Logger.js';

/**
 * SHADOW BASE COMPONENT
 * Minden UI elem ebből származik az Árnyék-rendszerben.
 * Megvalósítja az életciklus-kezelést és a célzott DOM-frissítést (Targeted Update).
 * Az Árnyék-rendszerben TILOS az innerHTML használata a mount() utáni frissítésekben. (Rule 60)
 */
export class BaseComponent {
  constructor() {
    this.element = null;
    this.children = [];
    this.id = `shadow-comp-${Math.random().toString(36).substr(2, 9)}`;
  }

  render() {
    return '';
  }

  mount(container, position = 'append') {
    const parent = typeof container === 'string' ? document.querySelector(container) : container;
    if (!parent) return;

    // String alapú renderelés konvertálása DOM-má (Rule 60 kompatibilis parser)
    const template = document.createElement('template');
    template.innerHTML = this.render().trim();
    this.element = template.content.firstElementChild;
    
    if (!this.element) {
      Logger.error(`BaseComponent (${this.constructor.name}): Sikertelen renderelés (üres v. érvénytelen HTML).`);
      return;
    }

    if (position === 'prepend') {
      parent.prepend(this.element);
    } else {
      parent.appendChild(this.element);
    }
    this.setupEventListeners();
  }

  setupEventListeners() { }

  update(property, value) {
    if (!this.element) return;
    this.handleUpdate(property, value);
  }

  /**
   * Célzott DOM frissítés fókusz-megőrzéssel (Rule 61).
   * @param {string} selector - CSS szelektor
   * @param {string} value - Az új érték
   * @param {string} attr - A frissítendő attribútum (value, textContent, innerHTML)
   */
  updateElement(selector, value, attr = 'textContent') {
    if (!this.element) return;
    const target = this.element.querySelector(selector);
    if (!target) return;

    // Fókusz és kijelölés mentése (ha szükséges)
    const isFocused = document.activeElement === target || target.contains(document.activeElement);
    let selection = null;
    
    if (isFocused && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      selection = { start: target.selectionStart, end: target.selectionEnd };
    }

    // Frissítés (Zéró innerHTML stratégia)
    if (attr === 'value') {
      if (target.value !== value) target.value = value;
    } else if (attr === 'textContent') {
      if (target.textContent !== value) target.textContent = value;
    } else {
      Logger.warn(`BaseComponent (${this.constructor.name}): Tiltott attribútum frissítés kísérlet: ${attr}. Csak 'value' vagy 'textContent' megengedett.`);
    }

    // Fókusz és kijelölés visszaállítása
    if (isFocused) {
      target.focus();
      if (selection && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        target.setSelectionRange(selection.start, selection.end);
      }
    }
  }

  handleUpdate(property, value) { }

  destroy() {
    this.children.forEach(child => child.destroy());
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
