import puppeteer from 'puppeteer-core';

class USACOPermalinkService {
  async getPermalink(language = 'cpp', options = {}) {
    const { headless = false, timeout = 60000 } = options;
    let browser = null;

    try {
      browser = await puppeteer.launch({
        headless: headless ? 'new' : false,
        executablePath: process.env.CHROME_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,720']
      });

      const page = await browser.newPage();
      page.setDefaultTimeout(timeout);

      // 1. Navegación
      await page.goto('https://ide.usaco.guide', { waitUntil: 'networkidle2' });
      
      // 2. Crear archivo
      await page.waitForSelector('a[href="/new"]');
      await page.click('a[href="/new"]');
      await page.waitForSelector('button[type="submit"]');
      await page.click('button[type="submit"]');

      // 3. ESPERA CRÍTICA: Aguardar a que el editor sea "interactuable"
      // No basta con que exista, debe estar listo para recibir foco
      await page.waitForSelector('.monaco-editor', { visible: true });
      console.log('Editor listo.');

      const finalUrl = page.url();
      console.log('Permalink generado:', finalUrl);

      await browser.close();
      return { ok: true, url: finalUrl };

    } catch (error) {
      console.error('Fallo en el servicio:', error.message);
      if (browser) await browser.close();
      return { ok: false, reason: error.message };
    }
  }

  /**
   * Get service status and configuration
   * @returns {Object} Service status information
   * @property {boolean} available - Whether the service is available (Chrome path configured)
   * @property {string|null} chromePath - Path to Chrome executable or null if not configured
   * @property {string} headless - Headless mode setting ('true', 'false', or 'default')
   * @property {string[]} supportedLanguages - Array of supported programming languages
   * 
   * Note: This method only checks if Chrome path is configured, not if Chrome is actually
   * accessible. The actual availability is verified when attempting to launch the browser.
   */
  getStatus() {
    const chromePath = process.env.CHROME_PATH;
    const headlessEnv = process.env.USACO_HEADLESS;
    
    // Service is considered available if Chrome path is configured
    // Actual accessibility is verified during browser launch
    const available = !!chromePath;
    
    let headlessMode = 'default (true)';
    if (headlessEnv !== undefined) {
      headlessMode = headlessEnv === 'false' ? 'false (from env)' : 'true (from env)';
    }

    return {
      available,
      chromePath: chromePath || null,
      headless: headlessMode,
      supportedLanguages: ['cpp', 'java', 'py']
    };
  }
}

export default new USACOPermalinkService();