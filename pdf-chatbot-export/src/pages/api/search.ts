import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Fonction pour trouver les correspondances dans le texte avec contexte
function findMatchesWithContext(text: string, query: string, contextSize: number = 100): Array<{match: string, context: string, position: number}> {
  const matches = [];
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  let position = textLower.indexOf(queryLower);
  while (position !== -1) {
    // Extraire le contexte autour de la correspondance
    const start = Math.max(0, position - contextSize);
    const end = Math.min(text.length, position + queryLower.length + contextSize);
    const context = text.substring(start, end);
    
    matches.push({
      match: text.substring(position, position + queryLower.length),
      context,
      position
    });
    
    position = textLower.indexOf(queryLower, position + 1);
  }
  
  return matches;
}

// Fonction pour trouver la page contenant une position spécifique
function findPageForPosition(pages: any[], position: number): number {
  let currentPosition = 0;
  
  for (let i = 0; i < pages.length; i++) {
    const pageLength = pages[i].content.length;
    if (position >= currentPosition && position < currentPosition + pageLength) {
      return pages[i].page;
    }
    currentPosition += pageLength;
  }
  
  return -1; // Page non trouvée
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Requête de recherche requise' });
    }

    // Répertoire des index
    const indexDir = path.join(process.cwd(), 'public/indexes');
    if (!fs.existsSync(indexDir)) {
      return res.status(404).json({ error: 'Aucun index disponible' });
    }
    
    // Lire tous les fichiers d'index
    const indexFiles = fs.readdirSync(indexDir).filter(file => file.endsWith('.json'));
    
    if (indexFiles.length === 0) {
      return res.status(404).json({ error: 'Aucun document indexé' });
    }
    
    const results = [];
    
    // Rechercher dans chaque index
    for (const indexFile of indexFiles) {
      const indexPath = path.join(indexDir, indexFile);
      const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      
      // Rechercher des correspondances dans le texte complet
      const matches = findMatchesWithContext(indexData.fullText, query);
      
      if (matches.length > 0) {
        // Pour chaque correspondance, trouver la page correspondante
        const matchesWithPages = matches.map(match => {
          const page = findPageForPosition(indexData.pages, match.position);
          return {
            ...match,
            page,
            document: indexData.metadata.title
          };
        });
        
        results.push({
          document: indexData.metadata.title,
          metadata: indexData.metadata,
          matches: matchesWithPages
        });
      }
    }
    
    if (results.length === 0) {
      return res.status(200).json({ 
        success: true, 
        found: false,
        message: "Je ne trouve pas cette information dans les fichiers fournis."
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      found: true,
      results
    });
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    return res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
}
