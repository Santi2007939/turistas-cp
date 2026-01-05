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

      const templateCode = {
          cpp: 
        `#include <bits/stdc++.h>
        using namespace std;
        #define ios ios::sync_with_stdio(false); cin.tie(nullptr);
        #define nl '\\n'
        #define all(s) s.begin(),s.end()
        #define yesi cout<<"Yes"<<'\\n'
        #define nosi cout<<"No"<<'\\n'

        #define ff first
        #define ss second
        #define inf 1e9
        #define INF 1e18

        template <class T> void read(T &x) {cin >> x;}
        template <class F, class S> void read(pair<F, S> &p) {cin >> p.first >> p.second; };
        template <class T> void read(vector<T> &v) {for(auto& x : v) read(x);}

        template <class T> void debug(T &x) { cout << "Valor: " << x << nl; }
        template <class F, class S> void debug(pair<F, S> &p) { cout << "First: " << p.first << " - " << "Second: " << p.second; }

        #define fori(i,n) for(int i=0;i<(int)n;i++)
        typedef long long ll;
        typedef pair<int, int> ii;
        typedef vector<ll> vll;
        typedef vector<int> vi;
        typedef vector<ii> vii;
        typedef vector<vi> vvi;
        typedef vector<string> vs;
        typedef vector<char> vc;

        void solve() {

        }
        int32_t main() {
            int tt = 1;
            //cin >> tt;
            while (tt--) {
                solve();
            }
            return 0;
        }`,
          java: `public class Main {\n  public static void main(String[] args) {}\n}`, // Tus otros templates...
          py: `print("Hello World")`
        }[language];

      // 1. Asegurar que el editor tenga el foco
        await page.waitForSelector('.view-lines');
        await page.click('.view-lines');

        // 2. Limpiar todo el contenido actual (Ctrl+A -> Backspace)
        const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
        await page.keyboard.down(modifier);
        await page.keyboard.press('A');
        await page.keyboard.up(modifier);
        await page.keyboard.press('Backspace');

        // 3. Inyectar el código al portapapeles del navegador
        // Usamos un textarea temporal porque es el método más compatible
        await page.evaluate((text) => {
            const tempTextarea = document.createElement('textarea');
            tempTextarea.value = text;
            document.body.appendChild(tempTextarea);
            tempTextarea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextarea);
        }, templateCode);

        // 4. Pegar (Ctrl+V)
        // Al "pegar", Monaco ignora gran parte de su lógica de auto-indentación
        await page.keyboard.down(modifier);
        await page.keyboard.press('V');
        await page.keyboard.up(modifier);

        console.log('Código pegado instantáneamente sin errores de formato.');

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
   * Get service status
   * @returns {Object} Service status information
   */
  getStatus() {
    return {
      available: true,
      chromePath: process.env.CHROME_PATH || 'not configured',
      headless: process.env.USACO_HEADLESS || 'default (true)',
      supportedLanguages: ['cpp', 'java', 'py']
    };
  }
}

export default new USACOPermalinkService();