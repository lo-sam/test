import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Chemin du fichier requis' });
    }

    // Construire le chemin complet du fichier
    const fullPath = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''));
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    // Lire le fichier PDF
    const dataBuffer = fs.readFileSync(fullPath);
    
    // Extraire le texte et les métadonnées
    const pdfData = await pdfParse(dataBuffer);
    
    // Diviser le texte par pages (approximation basée sur les sauts de page)
    const pageTexts = [];
    const pageBreakPattern = /\f/g; // Form feed character souvent utilisé comme saut de page
    const pages = pdfData.text.split(pageBreakPattern);
    
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].trim()) {
        pageTexts.push({
          page: i + 1,
          content: pages[i].trim()
        });
      }
    }

    // Créer un index simple pour la recherche
    const textIndex = {
      fullText: pdfData.text,
      pages: pageTexts,
      metadata: {
        title: path.basename(fullPath),
        pageCount: pdfData.numpages,
        author: pdfData.info?.Author || 'Non spécifié',
        creationDate: pdfData.info?.CreationDate || 'Non spécifié'
      }
    };

    // Sauvegarder l'index dans un fichier JSON
    const indexDir = path.join(process.cwd(), 'public/indexes');
    if (!fs.existsSync(indexDir)) {
      fs.mkdirSync(indexDir, { recursive: true });
    }
    
    const indexFileName = path.basename(fullPath, '.pdf') + '.json';
    const indexPath = path.join(indexDir, indexFileName);
    
    fs.writeFileSync(indexPath, JSON.stringify(textIndex, null, 2));

    return res.status(200).json({ 
      success: true, 
      metadata: textIndex.metadata,
      indexPath: `/indexes/${indexFileName}`
    });
  } catch (error) {
    console.error('Erreur lors de l\'extraction du texte:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'extraction du texte' });
  }
}
