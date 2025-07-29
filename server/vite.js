const fs = require("fs");
const path = require("path");

const serveStatic = (app) => {
  const distPath = path.join(__dirname, "..", "dist");
  
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}.\nPlease run \`npm run build\` first.`,
    );
  }
  
  // Serve static files from the build directory
  app.use(require("express").static(distPath));
  
  // Serve the index.html file for all routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
};

const setupVite = async (app, server) => {
  const vite = await (await import("vite")).createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  
  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);
  
  return vite;
};

const log = (msg) => {
  console.log(`6:16:33 PM [express] ${msg}`);
};

module.exports = { setupVite, serveStatic, log };