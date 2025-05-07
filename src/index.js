import dotenv from "dotenv";
import server from "./server.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const serverPort = process.env.PORT || 8080;

connectDB()
  .then(() => {
    server.on("error", (err) => {  // Changed to receive error parameter
      console.log("Error Occurred at index.js:", err);  // Use the actual error object
    });

    server.listen(serverPort, () => {
      console.log({
        serverStatus: "🌐  Application is Running",
        URL: `🔗 http://localhost:${serverPort}`,  // Made port dynamic
      });
    });
  })
  .catch((error) => {
    console.log("DB connection Failed from Index.js:", error);
  });