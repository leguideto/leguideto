const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets (CSS, JS, images) from the public/ folder.
app.use(express.static(path.join(__dirname, 'public')));

// Serve local data files (e.g. the Toronto neighbourhoods GeoJSON) at /data.
app.use('/data', express.static(path.join(__dirname, 'public/data')));

// Parse form submissions (contact form on the About page).
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PAGES_DIR = path.join(__dirname, 'pages');

// Map clean URLs to the HTML files in pages/.
const ROUTES = {
  '/': 'index.html',
  '/guide': 'guide.html',
  '/directory': 'directory.html',
  '/map': 'map.html',
  '/toronto': 'toronto.html',
  '/budget': 'budget.html',
  '/money': 'money.html',
  '/housing': 'housing.html',
  '/work': 'work.html',
  '/health': 'health.html',
  '/events': 'events.html',
  '/about': 'about.html'
};

Object.entries(ROUTES).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(PAGES_DIR, file));
  });
  // Also allow the explicit .html path.
  app.get('/' + file, (req, res) => {
    res.sendFile(path.join(PAGES_DIR, file));
  });
});

// Contact form endpoint — logs the message and returns a friendly response.
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  console.log('New contact message:', { name, email, message });
  res.json({ ok: true });
});

// 404 — fall back to the homepage so the app feels seamless.
app.use((req, res) => {
  res.status(404).sendFile(path.join(PAGES_DIR, 'index.html'));
});

// Vercel imports the app; running directly starts the listener.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`leGuideTO running at http://localhost:${PORT}`);
  });
}

module.exports = app;

// Mailchimp newsletter subscription
app.post('/subscribe', async (req, res) => {
  const { email, firstname } = req.body;
  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
  const DATACENTER = 'us1';
  
  try {
    const response = await fetch(
      `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`,
      {
        method: 'POST',
        headers: {
          'Authorization': `apikey ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email_address: email,
          first_name: firstname,
          status: 'subscribed'
        })
      }
    );
    const data = await response.json();
    if (response.ok || data.title === 'Member Exists') {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    res.json({ success: false });
  }
});
