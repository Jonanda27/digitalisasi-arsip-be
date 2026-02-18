import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./db.js";

const PORT = 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running http://localhost:${PORT}`);
  });
});
