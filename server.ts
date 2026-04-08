import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  let sessionCache: { baseUrl: string; signature: string; expires: number } | null = null;

  async function getSession(key: string) {
    if (sessionCache && sessionCache.expires > Date.now() + 60000) {
      return sessionCache;
    }

    console.log("Fetching new OAQ session...");
    const response = await fetch(`https://us-central1-oaqdms.cloudfunctions.net/brokerData?action=api_session&token=${key}`);
    if (!response.ok) throw new Error("Failed to get OAQ session");
    
    const data = await response.json();
    const expiresMatch = data.signature.match(/Expires=(\d+)/);
    const expires = expiresMatch ? parseInt(expiresMatch[1]) * 1000 : Date.now() + 3600000;

    sessionCache = {
      baseUrl: data.baseUrl,
      signature: data.signature,
      expires
    };
    return sessionCache;
  }

  // API Proxy Route to bypass CORS and handle OAQ flow
  app.get("/api/proxy/locations", async (req, res) => {
    const key = req.headers.authorization?.replace('Bearer ', '') || process.env.OAQ_API_KEY;
    if (!key) return res.status(401).json({ error: "API Key required" });

    try {
      const session = await getSession(key);
      
      // 1. Get providers
      const providersRes = await fetch(`${session.baseUrl}meta/providers.json?${session.signature}`);
      const providersData = await providersRes.json();
      const providers = Array.isArray(providersData) ? providersData : (providersData.providers || ["cpcb", "aurassure", "airnet"]);

      // 2. Get stations for each provider
      const allStations: any[] = [];
      await Promise.all(providers.map(async (provider: string) => {
        try {
          const stationsRes = await fetch(`${session.baseUrl}provider=${provider}/live/global/all_stations_latest.json?${session.signature}`);
          if (stationsRes.ok) {
            const data = await stationsRes.json();
            if (data.stations) {
              allStations.push(...data.stations.map((s: any) => ({
                id: `${provider}:${s.id}`,
                name: s.name,
                city: s.city || 'Unknown',
                state: s.state || 'India',
                country: 'India',
                coordinates: { latitude: s.lat, longitude: s.lon },
                lastUpdated: s.last_seen,
                parameters: Object.keys(s).filter(k => ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'nh3'].includes(k) && s[k] !== null),
                measurements: Object.keys(s)
                  .filter(k => ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'nh3'].includes(k) && s[k] !== null)
                  .map(k => ({
                    parameter: k,
                    value: s[k],
                    unit: k === 'co' ? 'mg/m³' : 'µg/m³',
                    date: s.last_seen
                  }))
              })));
            }
          }
        } catch (e) {
          console.error(`Error fetching stations for ${provider}:`, e);
        }
      }));

      res.json(allStations);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Failed to fetch from OAQ API", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/proxy/measurements", async (req, res) => {
    const key = req.headers.authorization?.replace('Bearer ', '') || process.env.OAQ_API_KEY;
    const { locationId } = req.query;
    if (!key) return res.status(401).json({ error: "API Key required" });
    if (!locationId) return res.status(400).json({ error: "locationId required" });

    try {
      const session = await getSession(key as string);
      const [provider, id] = (locationId as string).split(':');
      
      const url = `${session.baseUrl}provider=${provider}/live/sensors/${id}/last24h.json?${session.signature}`;
      const response = await fetch(url);
      const data = await response.json();
      
      // Format response to match frontend expectations
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch measurements" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
