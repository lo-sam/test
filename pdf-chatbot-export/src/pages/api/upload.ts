import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public/uploads');

// Assurer que le répertoire d'upload existe
const ensureUploadDir = async () => {
  try {
    await fsPromises.access(uploadDir);
  } catch (error) {
    await fsPromises.mkdir(uploadDir, { recursive: true });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    await ensureUploadDir();

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 20 * 1024 * 1024, // 20 MB
      filter: (part) => part.mimetype === 'application/pdf',
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file;
    
    if (!file || Array.isArray(file)) {
      return res.status(400).json({ error: 'Fichier PDF requis' });
    }

    // Renommer le fichier pour éviter les conflits
    const fileName = file.originalFilename || 'document.pdf';
    const newPath = path.join(uploadDir, fileName);
    
    // Si un fichier avec le même nom existe déjà, le remplacer
    if (fs.existsSync(newPath)) {
      fs.unlinkSync(newPath);
    }
    
    fs.renameSync(file.filepath, newPath);

    // Extraire les métadonnées du PDF (à implémenter avec pdf-parse)
    // Cette partie sera complétée dans l'API d'extraction

    return res.status(200).json({ 
      success: true, 
      file: {
        name: fileName,
        path: `/uploads/${fileName}`,
        size: file.size,
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload du fichier:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'upload du fichier' });
  }
}
