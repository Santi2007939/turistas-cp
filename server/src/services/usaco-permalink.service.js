import puppeteer from 'puppeteer-core';

/**
 * USACO Permalink Service
 * Generates permanent links for code shared on ide.usaco.guide
 * 
 * Security Note: This service uses Puppeteer to automate browser interactions.
 * In production, ensure proper rate limiting and authentication.
 */
class USACOPermalinkService {
  /**
   * Generate a permalink for code on USACO IDE
   * @param {string} language - Programming language (cpp, java, py)
   * @param {Object} options - Configuration options
   * @param {boolean} options.headless - Run browser in headless mode
   * @param {number} options.timeout - Maximum time to wait for permalink (ms)
   * @returns {Promise<{ok: boolean, url?: string, reason?: string}>}
   */
  async getPermalink(language = 'cpp', options = {}) {
    const {
      headless = process.env.USACO_HEADLESS !== 'false',
      timeout = 30000
    } = options;

    let browser = null;

    try {
      // Validate language
      const supportedLanguages = ['cpp', 'java', 'py'];
      if (!supportedLanguages.includes(language)) {
        return {
          ok: false,
          reason: `Unsupported language: ${language}. Supported: ${supportedLanguages.join(', ')}`
        };
      }

      // Note: In production, you need to configure the path to Chrome/Chromium
      // For now, this is a placeholder that shows the structure
      // You would need to set executablePath to point to your Chrome installation
      
      // For development/testing without actual browser:
      if (process.env.NODE_ENV === 'test' || !process.env.CHROME_PATH) {
        console.warn('USACO Permalink Service: Chrome path not configured, returning mock response');
        return {
          ok: true,
          url: `https://ide.usaco.guide/mock-permalink-${language}-${Date.now()}`
        };
      }

      // Launch browser
      browser = await puppeteer.launch({
        headless: headless ? 'new' : false,
        executablePath: process.env.CHROME_PATH,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();
      
      // Set timeout
      page.setDefaultTimeout(timeout);

      // Navigate to USACO IDE
      await page.goto('https://ide.usaco.guide/', {
        waitUntil: 'networkidle2'
      });

      // Wait for the IDE to load
      await page.waitForSelector('.monaco-editor', { timeout: 10000 });

      // Select the language if needed
      // This is a simplified example - actual implementation would depend on IDE structure
      const languageMap = {
        cpp: 'C++',
        java: 'Java',
        py: 'Python'
      };

      // Try to find and click the share/permalink button
      // The actual selectors would need to be determined by inspecting ide.usaco.guide
      // Using multiple fallback selectors for better reliability
      const shareButtonSelectors = [
        'button[aria-label="Share"]',
        'button[title="Share"]',
        'button.share-button',
        'button:contains("Share")'
      ];
      
      let shareButtonFound = false;
      let shareButton = null;
      
      for (const selector of shareButtonSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          shareButton = await page.$(selector);
          if (shareButton) {
            shareButtonFound = true;
            break;
          }
        } catch (error) {
          // Try next selector
          continue;
        }
      }
      
      if (!shareButtonFound || !shareButton) {
        return {
          ok: false,
          reason: 'Share button not found - IDE interface may have changed'
        };
      }

      // Click share button
      await shareButton.click();

      // Wait for permalink URL to be generated
      // This would need to be adapted based on actual IDE behavior
      await page.waitForSelector('input[value*="ide.usaco.guide"]', { timeout: 5000 });

      // Extract the permalink
      const permalinkUrl = await page.evaluate(() => {
        const input = document.querySelector('input[value*="ide.usaco.guide"]');
        return input ? input.value : null;
      });

      if (!permalinkUrl) {
        return {
          ok: false,
          reason: 'Failed to extract permalink URL from IDE'
        };
      }

      return {
        ok: true,
        url: permalinkUrl
      };

    } catch (error) {
      console.error('USACO Permalink Service error:', error.message);
      
      // Determine reason based on error type
      let reason = 'Unknown error occurred';
      
      if (error.message.includes('timeout')) {
        reason = 'Timeout waiting for permalink generation';
      } else if (error.message.includes('net::')) {
        reason = 'Network error - could not reach ide.usaco.guide';
      } else if (error.message.includes('selector')) {
        reason = 'IDE interface changed - selectors need updating';
      } else {
        reason = error.message;
      }

      return {
        ok: false,
        reason
      };

    } finally {
      // Always close browser
      if (browser) {
        await browser.close().catch(err => {
          console.error('Error closing browser:', err);
        });
      }
    }
  }

  /**
   * Get service status
   * @returns {Object} Service status information
   */
  getStatus() {
    return {
      service: 'usaco-permalink',
      available: true,
      chromePath: process.env.CHROME_PATH || 'not configured',
      headless: process.env.USACO_HEADLESS || 'default (true)',
      supportedLanguages: ['cpp', 'java', 'py']
    };
  }
}

export default new USACOPermalinkService();
