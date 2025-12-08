# USACO Permalink Service Integration

This document describes the integration of the USACO IDE permalink generation service into the Turistas CP API.

## Overview

The USACO Permalink Service allows you to programmatically generate permanent links for code shared on [ide.usaco.guide](https://ide.usaco.guide). This is useful for sharing code snippets, solutions, or examples with your team or students.

## API Endpoints

### 1. Create Permalink

**Endpoint:** `POST /api/integrations/usaco-ide/permalink`

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "language": "cpp",      // Optional: "cpp", "java", or "py" (default: "cpp")
  "headless": true,       // Optional: run browser in headless mode (default: true)
  "timeout": 30000        // Optional: timeout in milliseconds (default: 30000)
}
```

**Query Parameters:**
- `lang`: Alternative way to specify language (overridden by body.language)
- `headless`: Alternative way to specify headless mode (overridden by body.headless)

**Success Response (201):**
```json
{
  "ok": true,
  "url": "https://ide.usaco.guide/abc123xyz"
}
```

**Error Response (502):**
```json
{
  "ok": false,
  "reason": "Timeout waiting for permalink generation"
}
```

### 2. Get Service Status

**Endpoint:** `GET /api/integrations/usaco-ide/status`

**Authentication:** Required (JWT token)

**Response (200):**
```json
{
  "ok": true,
  "service": "usaco-permalink",
  "envHeadless": null,
  "available": true,
  "chromePath": "/usr/bin/google-chrome",
  "headless": "default (true)",
  "supportedLanguages": ["cpp", "java", "py"]
}
```

## Usage Examples

### Using curl

```bash
# Get service status
curl -X GET http://localhost:3000/api/integrations/usaco-ide/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create a permalink for C++ code
curl -X POST http://localhost:3000/api/integrations/usaco-ide/permalink \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"language": "cpp"}'

# Create a permalink with custom timeout
curl -X POST http://localhost:3000/api/integrations/usaco-ide/permalink \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"language": "py", "timeout": 45000}'
```

### Using JavaScript (fetch)

```javascript
// Get service status
const status = await fetch('http://localhost:3000/api/integrations/usaco-ide/status', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const statusData = await status.json();

// Create permalink
const response = await fetch('http://localhost:3000/api/integrations/usaco-ide/permalink', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    language: 'cpp',
    headless: true
  })
});
const data = await response.json();
if (data.ok) {
  console.log('Permalink:', data.url);
} else {
  console.error('Error:', data.reason);
}
```

## Environment Configuration

The service uses the following environment variables:

### Required Configuration

- **`CHROME_PATH`**: Path to Chrome/Chromium executable
  ```bash
  # Linux
  CHROME_PATH=/usr/bin/google-chrome
  
  # macOS
  CHROME_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
  
  # Windows
  CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
  ```

### Optional Configuration

- **`USACO_HEADLESS`**: Run browser in headless mode (default: `true`)
  ```bash
  USACO_HEADLESS=false  # Show browser window for debugging
  ```

- **`NODE_ENV`**: Environment mode
  ```bash
  NODE_ENV=development  # Returns mock responses without browser
  NODE_ENV=production   # Uses actual browser automation
  ```

## Installation & Setup

### 1. Install Dependencies

The service requires `puppeteer-core`:

```bash
cd server
npm install puppeteer-core
```

### 2. Install Chrome/Chromium

The service needs a Chrome or Chromium browser installed:

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y chromium-browser
# or
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
```

**macOS:**
```bash
brew install --cask google-chrome
```

**Windows:**
Download and install from https://www.google.com/chrome/

### 3. Configure Environment

Add to your `.env` file:
```env
CHROME_PATH=/usr/bin/google-chrome
USACO_HEADLESS=true
```

### 4. Test the Service

```bash
# Start the server
npm run dev

# In another terminal, test the endpoint
curl -X GET http://localhost:3000/api/integrations/usaco-ide/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Considerations

⚠️ **IMPORTANT SECURITY WARNINGS**

### 1. Authentication & Authorization

This endpoint **MUST** be protected with proper authentication and authorization:

- ✅ Currently requires JWT authentication (via `protect` middleware)
- ⚠️ Consider adding role-based access control (RBAC)
- ⚠️ Consider restricting access to specific user roles (e.g., coaches, admins)

### 2. Rate Limiting

**CRITICAL:** This endpoint uses browser automation which is resource-intensive.

Implement rate limiting **immediately** before deploying to production:

```javascript
import rateLimit from 'express-rate-limit';

const permalinkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each user to 10 requests per 15 minutes
  message: 'Too many permalink requests, please try again later'
});

router.post('/usaco-ide/permalink', protect, permalinkLimiter, createUsacoPermalink);
```

### 3. Queue System

For production use, implement a job queue to:

- Prevent resource exhaustion from concurrent browser instances
- Provide better error handling and retry logic
- Allow status checking for long-running operations

**Recommended:** Use Bull or Agenda.js with Redis:

```javascript
import Queue from 'bull';

const permalinkQueue = new Queue('permalink-generation', process.env.REDIS_URL);

// Producer (in controller)
export const createUsacoPermalink = asyncHandler(async (req, res) => {
  const job = await permalinkQueue.add({
    language: req.body.language,
    userId: req.user.id
  });
  
  res.status(202).json({
    jobId: job.id,
    status: 'pending'
  });
});

// Consumer (worker process)
permalinkQueue.process(async (job) => {
  return await usacoPermalinkService.getPermalink(job.data.language);
});
```

### 4. Resource Limits

Set proper resource limits:

- **Timeout:** Maximum 60 seconds per request
- **Memory:** Monitor memory usage of Chromium instances
- **Concurrent browsers:** Limit to 2-3 concurrent instances maximum

### 5. Input Validation

Validate all inputs:

```javascript
// In controller
const { body, query } = req;
const language = body.language || query.lang || 'cpp';

if (!['cpp', 'java', 'py'].includes(language)) {
  return res.status(400).json({
    ok: false,
    reason: 'Invalid language'
  });
}
```

### 6. Error Handling

Current implementation handles:
- ✅ Browser launch failures
- ✅ Network timeouts
- ✅ Invalid selectors (UI changes)
- ✅ Browser cleanup (always closes browser)

### 7. Logging & Monitoring

Implement comprehensive logging:

```javascript
// Add structured logging
import winston from 'winston';

logger.info('Permalink request', {
  userId: req.user.id,
  language,
  timestamp: new Date()
});
```

### 8. Network Security

- Ensure the server can reach ide.usaco.guide
- Consider firewall rules if needed
- Use HTTPS in production

## Testing

### Manual Testing Script

Create a test script `server/scripts/test-usaco-permalink.js`:

```javascript
import usacoPermalinkService from '../src/services/usaco-permalink.service.js';

async function test() {
  console.log('Testing USACO Permalink Service...\n');
  
  // Test 1: Get status
  console.log('1. Testing service status:');
  const status = usacoPermalinkService.getStatus();
  console.log(JSON.stringify(status, null, 2));
  
  // Test 2: Generate permalink
  console.log('\n2. Testing permalink generation:');
  const result = await usacoPermalinkService.getPermalink('cpp', {
    headless: true,
    timeout: 30000
  });
  console.log(JSON.stringify(result, null, 2));
}

test().catch(console.error);
```

Run it with:
```bash
node server/scripts/test-usaco-permalink.js
```

### Optional NPM Scripts

Add to `server/package.json`:

```json
{
  "scripts": {
    "usaco:link": "node scripts/test-usaco-permalink.js",
    "usaco:server": "USACO_HEADLESS=false npm run dev"
  }
}
```

## Troubleshooting

### Issue: "Chrome path not configured"

**Solution:** Set the `CHROME_PATH` environment variable to point to your Chrome installation.

### Issue: "Timeout waiting for permalink generation"

**Possible causes:**
- Slow network connection to ide.usaco.guide
- IDE website is down or slow
- Timeout value is too low

**Solution:** Increase timeout in request or check network connectivity.

### Issue: "IDE interface changed - selectors need updating"

**Cause:** The ide.usaco.guide website has changed its HTML structure.

**Solution:** Update the selectors in `usaco-permalink.service.js` to match the new structure. Use Chrome DevTools to inspect the current DOM.

### Issue: High memory usage

**Cause:** Chromium instances not being properly closed.

**Solution:** The service already includes cleanup in `finally` blocks. If issues persist, consider implementing a process-level cleanup script.

## Development vs Production

### Development Mode

When `NODE_ENV=development` or `CHROME_PATH` is not set:
- Returns mock permalink URLs
- No actual browser automation
- Fast and resource-light

### Production Mode

When `NODE_ENV=production` and `CHROME_PATH` is set:
- Uses actual browser automation
- Resource-intensive
- Requires proper security measures (see above)

## Migration to Worker Pattern (Recommended)

For production deployments, consider this architecture:

1. **API Server:** Receives requests, queues jobs, returns job ID
2. **Worker Process:** Processes queued jobs using Puppeteer
3. **Redis:** Stores job queue and results
4. **Status Endpoint:** Allows checking job status

This pattern:
- ✅ Prevents server overload
- ✅ Better error handling
- ✅ Can scale workers independently
- ✅ Provides async/await status checking

## Support

For issues or questions:
- Check the troubleshooting section above
- Review service logs for detailed error messages
- Open an issue on the repository

## License

This integration is part of the Turistas CP project and follows the same MIT license.
