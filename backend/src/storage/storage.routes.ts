import { Router } from "express";
import mime from "mime-types";
import multer from "multer";
import { checkIfAuthenticated } from "../middlewares/authMiddleware";
import { storageProvider } from "./storage.provider";

const upload = multer({ storage: multer.memoryStorage() });

export const storageRoutes = Router();

storageRoutes.post(
  "/upload",
  checkIfAuthenticated,
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file)
        return res.status(400).json({ error: "file es requerido" });
      const fileName = req.file.originalname;
      const file = await storageProvider.upload(fileName, req.file.buffer);
      return res.json({
        msg: "file uploaded successfully",
        name: fileName,
        file,
        path: fileName,
      });
    } catch (error) {
      return next(error);
    }
  },
);

storageRoutes.delete(
  "/upload",
  checkIfAuthenticated,
  async (req, res, next) => {
    try {
      const fileName = String(req.body.fileName || "");
      if (!fileName)
        return res.status(400).json({ error: "fileName es requerido" });
      const deleted = await storageProvider.delete(fileName);
      return res.json({ name: fileName, deleted });
    } catch (error) {
      return next(error);
    }
  },
);

storageRoutes.get("/file/:filename", async (req, res, next) => {
  try {
    const filename = req.params.filename;
    const exists = await storageProvider.exists(filename);
    if (!exists) return res.status(404).send("File not found");
    res.setHeader(
      "Content-Type",
      String(mime.lookup(filename) || "application/octet-stream"),
    );
    storageProvider.stream(filename).pipe(res);
  } catch (error) {
    next(error);
  }
});
