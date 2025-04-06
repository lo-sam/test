import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Fonction pour initialiser les données de test
function initializeTestData() {
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  const indexDir = path.join(process.cwd(), 'public/indexes');
  
  // Créer les répertoires s'ils n'existent pas
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  if (!fs.existsSync(indexDir)) {
    fs.mkdirSync(indexDir, { recursive: true });
  }
  
  // Créer des données de test pour les documents
  const testDocuments = [
    {
      id: 'manuel-fr-evo-blue-1130-9450',
      title: 'Manuel_FR_EVO-BLUE_1130-9450.pdf',
      pageCount: 68,
      author: 'Paolo Bertoz',
      creationDate: '2025-01-15'
    },
    {
      id: 'manuel-fr-evo-blue-22-1000',
      title: 'Manuel_FR_EVO-BLUE_22-1000.pdf',
      pageCount: 64,
      author: 'Simone Goriup',
      creationDate: '2025-02-20'
    },
    {
      id: 'datasheet-evo-blue',
      title: 'Datasheet EVO-BLUE.pdf',
      pageCount: 84,
      author: 'Non spécifié',
      creationDate: '2025-03-10'
    }
  ];
  
  // Enregistrer les données de test dans des fichiers JSON
  for (const doc of testDocuments) {
    const indexPath = path.join(indexDir, `${doc.id}.json`);
    
    // Créer un index de test simple
    const testIndex = {
      metadata: {
        title: doc.title,
        pageCount: doc.pageCount,
        author: doc.author,
        creationDate: doc.creationDate
      },
      fullText: `Ceci est un exemple de contenu pour le document ${doc.title}. 
      Ce document contient des informations techniques sur les produits EVO-BLUE.
      Les caractéristiques principales incluent la résistance à l'eau, la durabilité et la facilité d'utilisation.
      Pour plus d'informations, consultez le manuel complet.`,
      pages: [
        {
          page: 1,
          content: `Page de couverture - ${doc.title}`
        },
        {
          page: 2,
          content: `Table des matières - ${doc.title}`
        },
        {
          page: 3,
          content: `Introduction - Les produits EVO-BLUE sont conçus pour offrir une performance optimale dans tous les environnements.`
        }
      ]
    };
    
    fs.writeFileSync(indexPath, JSON.stringify(testIndex, null, 2));
  }
  
  return testDocuments;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Initialiser les données de test
    const testDocuments = initializeTestData();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Données de test initialisées avec succès',
      documents: testDocuments
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des données de test:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'initialisation des données de test' });
  }
}
