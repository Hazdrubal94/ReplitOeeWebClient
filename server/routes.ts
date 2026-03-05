import type { Express } from "express";
import { createServer, type Server } from "http";
import https from "https";

const API_BASE_URL = "https://localhost:8443";

async function proxyRequest(
  path: string,
  method: string,
  body?: unknown
): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    const bodyStr = body ? JSON.stringify(body) : undefined;

    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}),
      },
      rejectUnauthorized: false,
    };

    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        let data: unknown = raw;
        try {
          if (raw.trim()) data = JSON.parse(raw);
          else data = null;
        } catch {}
        resolve({ status: res.statusCode ?? 500, data });
      });
    });

    req.on("error", (err) => reject(err));
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use("/proxy", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,Accept");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.all("/proxy/*path", async (req, res) => {
    const targetPath = req.path.replace(/^\/proxy/, "");
    const method = req.method;
    const body = ["POST", "PUT", "PATCH"].includes(method) ? req.body : undefined;

    try {
      const { status, data } = await proxyRequest(targetPath, method, body);
      return res.status(status).json(data);
    } catch (err: any) {
      console.error(`[proxy] Error forwarding ${method} ${targetPath}:`, err.message);
      return res.status(502).json({
        message: `Cannot reach API at ${API_BASE_URL}: ${err.message}`,
        code: err.code,
      });
    }
  });

  return httpServer;
}
