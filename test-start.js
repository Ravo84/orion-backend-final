// Quick test to see if backend can start
import("./src/server.ts").catch((error) => {
  console.error("Error starting server:", error.message);
  console.error(error.stack);
  process.exit(1);
});

