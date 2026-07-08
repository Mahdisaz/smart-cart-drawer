let app: any;

try {
  // Dynamically import the main server
  const serverModule = await import("../server");
  app = serverModule.default;
} catch (err: any) {
  console.error("Vercel Startup Error:", err);
  
  // Create a minimal Express fallback app to return the exact error to the client
  const express = (await import("express")).default;
  const fallbackApp = express();
  
  fallbackApp.use(express.json());
  
  fallbackApp.all("*", (req: any, res: any) => {
    res.status(500).json({
      success: false,
      error: `Vercel Startup Error: ${err.message || String(err)}`,
      stack: err.stack || "No stack trace available"
    });
  });
  
  app = fallbackApp;
}

export default app;
