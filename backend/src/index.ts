import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index';

// Multer para uploads
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Carpeta y storage de uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${ext || '.jpg'}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Hacer disponible el uploader a las rutas
app.set('upload', upload);

// Servir archivos subidos
app.use('/uploads', express.static(uploadsDir));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/', routes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});