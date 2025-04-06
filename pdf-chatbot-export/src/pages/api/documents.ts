import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Répertoire des index
    const indexDir = path.join(process.cwd(), 'public/indexes');
    if (!fs.existsSync(indexDir)) {
      return res.status(200).json({ documents: [] });
    }
    
    // Lire tous les fichiers d'index
    const indexFiles = fs.readdirSync(indexDir).filter(file => file.endsWith('.json'));
    
    if (indexFiles.length === 0) {
      return res.status(200).json({ documents: [] });
    }
    
    const documents = [];
    
    // Récupérer les métadonnées de chaque document
    for (const indexFile of indexFiles) {
      const indexPath = path.join(indexDir, indexFile);
      const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      
      documents.push({
        id: path.basename(indexFile, '.json'),
        title: indexData.metadata.title,
        pageCount: indexData.metadata.pageCount,
        author: indexData.metadata.author,
        creationDate: indexData.metadata.creationDate
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      documents
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
  }
}
