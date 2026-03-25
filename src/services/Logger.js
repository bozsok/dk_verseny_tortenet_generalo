/**
 * Logger - A projekt egységes naplózó rendszere.
 * A project-context.md előírásai szerint a console.log használata közvetlen formában kerülendő.
 */
export const Logger = {
  /**
   * Információs üzenet naplózása.
   * @param {string} message - Az üzenet szövege.
   * @param {any} data - Opcionális adat.
   */
  info(message, data = null) {
    if (data) console.info(`[DKV-INFO] ${message}`, data);
    else console.info(`[DKV-INFO] ${message}`);
  },

  /**
   * Hibaüzenet naplózása.
   * @param {string} message - A hiba leírása.
   * @param {any} error - A konkrét hibaobjektum.
   */
  error(message, error = null) {
    if (error) console.error(`[DKV-ERROR] ${message}`, error);
    else console.error(`[DKV-ERROR] ${message}`);
  },

  /**
   * Figyelmeztetés naplózása.
   * @param {string} message - A figyelmeztetés szövege.
   */
  warn(message) {
    console.warn(`[DKV-WARN] ${message}`);
  }
};
