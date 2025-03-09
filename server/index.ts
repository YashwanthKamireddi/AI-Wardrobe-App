import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db, testDatabaseConnection, pool, verifyDatabaseHealth, getPoolStatus } from "./db";
import { sql } from "drizzle-orm";

// Detect environment
const isReplit = process.env.REPL_ID !== undefined;
const isDevelopment = process.env.NODE_ENV !== 'production';
const defaultPort = isReplit ? 3000 : 5000; // Replit prefers port 3000

// Initialize Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add environment info to app
app.set('isReplit', isReplit);
app.set('env', isDevelopment ? 'development' : 'production');

// Basic request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Type definition for database health status
type DbHealthStatus = {
  healthy: boolean;
  message: string;
  details: any;
};

// Middleware to verify database connection on each API request (with caching)
let dbHealthStatus: DbHealthStatus = { healthy: false, message: 'Not checked yet', details: null };
let lastDbCheck = 0;
const DB_CHECK_INTERVAL = 60000; // 1 minute

app.use('/api', async (req, res, next) => {
  const now = Date.now();
  
  // Skip health checks for health endpoint to avoid circular dependency
  if (req.path === '/api/health') {
    return next();
  }
  
  // Only check connection every minute to avoid flooding the database
  if (!dbHealthStatus.healthy || (now - lastDbCheck > DB_CHECK_INTERVAL)) {
    try {
      dbHealthStatus = await verifyDatabaseHealth();
      lastDbCheck = now;
      
      if (!dbHealthStatus.healthy) {
        log(`Database health check failed: ${dbHealthStatus.message}`);
        return res.status(503).json({ 
          message: 'Database service unavailable',
          details: dbHealthStatus.message,
          retry: true
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error checking database health:', errorMessage);
      return res.status(503).json({ 
        message: 'Database service error',
        details: errorMessage,
        retry: true
      });
    }
  }
  
  next();
});

// Add dedicated health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    // Get current database health
    const dbHealth = await verifyDatabaseHealth();
    
    // Get pool stats
    const poolStatus = getPoolStatus();
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    
    if (dbHealth.healthy) {
      return res.status(200).json({
        status: 'OK',
        environment: app.get('env'),
        platform: isReplit ? 'Replit' : 'Local',
        database: {
          status: 'connected',
          pool: poolStatus,
          tables: dbHealth.details?.tables || []
        },
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        },
        uptime: Math.round(process.uptime()) + 's'
      });
    } else {
      return res.status(500).json({
        status: 'ERROR',
        environment: app.get('env'),
        platform: isReplit ? 'Replit' : 'Local',
        database: {
          status: 'disconnected',
          message: dbHealth.message,
          details: dbHealth.details
        },
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        },
        uptime: Math.round(process.uptime()) + 's'
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to check system health',
      error: errorMessage
    });
  }
});

// Start the server
(async () => {
  try {
    // Perform comprehensive database health check before starting server
    log("Verifying database health...");
    const dbHealth = await verifyDatabaseHealth();
    
    if (!dbHealth.healthy) {
      log(`WARNING: Database health check failed: ${dbHealth.message}`);
      if (dbHealth.details) {
        log(`Details: ${JSON.stringify(dbHealth.details)}`);
      }
      log("The server will start, but database-dependent features may not work correctly.");
    } else {
      log("Database health check successful");
      log(`Connected to ${dbHealth.details?.tables?.length || 0} tables`);
      log(`Connection pool status: ${JSON.stringify(getPoolStatus())}`);
    }

    // Register all routes
    const server = await registerRoutes(app);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error(`Server error (${status}): ${message}`, err);
      res.status(status).json({ message });
    });

    // Set up Vite for development or serve static files for production
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Get port from environment or use default
    const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : null;
    const startPort = envPort || defaultPort;
    
    // Try to serve the app on the preferred port, with fallback options
    const tryPort = (port: number) => {
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`Server running at http://0.0.0.0:${port}`);
        log(`Environment: ${app.get('env')} (${isReplit ? 'Replit' : 'Local'})`);
      }).on('error', (err: any) => {
        if (err.code === 'EADDRINUSE' && port < startPort + 10) {
          log(`Port ${port} is busy, trying ${port + 1}...`);
          tryPort(port + 1);
        } else {
          console.error('Server startup error:', err);
        }
      });
    };
    
    // Start listening on the configured port (or fallback ports)
    log(`Starting server on port ${startPort}...`);
    tryPort(startPort);
    
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('Received SIGINT. Shutting down gracefully...');
  // Close database pool properly before exit
  pool.end().then(() => {
    log('Database connections closed');
    process.exit(0);
  }).catch(err => {
    console.error('Error closing database connections:', err);
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  log('Received SIGTERM. Shutting down gracefully...');
  // Close database pool properly before exit
  pool.end().then(() => {
    log('Database connections closed');
    process.exit(0);
  }).catch(err => {
    console.error('Error closing database connections:', err);
    process.exit(1);
  });
});
