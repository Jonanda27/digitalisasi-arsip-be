import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import fileRoutes from "./routes/file.routes.js";
import folderRoutes from "./routes/folder.routes.js";
import noArsip from "./routes/arsip.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import confidentialityRoutes from "./routes/confidentiality.routes.js";
import typeRoutes from "./routes/type.routes.js";
import ocrRoutes from "./routes/ocr.routes.js";
import accessRequestRoutes from "./routes/accessRequest.routes.js";
import logRoutes from "./routes/log.routes.js";
import fileDraftRoutes from "./routes/draft.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 DEBUG (WAJIB ADA)
app.get("/api/test", (req, res) => {
  res.send("API TEST OK");
});

// 🔥 ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/arsip", noArsip);
app.use("/api/category", categoryRoutes);
app.use("/api/confidentiality", confidentialityRoutes);
app.use("/api/type", typeRoutes);
app.use("/api", ocrRoutes);
app.use("/api/access-requests", accessRequestRoutes);
app.use('/uploads', express.static('uploads'));
app.use("/api/logs", logRoutes);
app.use("/api/draft", fileDraftRoutes);


export default app;
