import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function TestPage() {
  useEffect(() => {
    // Initialiser les données de test au chargement de la page
    const initTestData = async () => {
      try {
        const response = await fetch('/api/init-test-data');
        if (!response.ok) {
          throw new Error('Erreur lors de l\'initialisation des données de test');
        }
        const data = await response.json();
        console.log('Données de test initialisées:', data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    initTestData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Test | Assistant PDF Technique</title>
        <meta name="description" content="Page de test pour l'assistant technique" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Page de test</h1>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Initialisation des données de test</h2>
          <p className="mb-4">Cette page initialise automatiquement des données de test pour l'application.</p>
          <p className="text-sm text-gray-500 mb-6">Les documents suivants ont été créés :</p>
          
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>Manuel_FR_EVO-BLUE_1130-9450.pdf (68 pages)</li>
            <li>Manuel_FR_EVO-BLUE_22-1000.pdf (64 pages)</li>
            <li>Datasheet EVO-BLUE.pdf (84 pages)</li>
          </ul>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/" className="btn btn-primary text-center">
              Aller à la page d'accueil
            </Link>
            <Link href="/admin" className="btn btn-secondary text-center">
              Aller à la page d'administration
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Instructions de test</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">1. Test de l'interface utilisateur</h3>
              <p className="text-sm text-gray-600">Vérifiez que l'interface s'adapte correctement à différentes tailles d'écran (desktop, tablette, smartphone).</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">2. Test du chatbot</h3>
              <p className="text-sm text-gray-600">Posez des questions comme "Quelles sont les caractéristiques des produits EVO-BLUE ?" pour tester les réponses du chatbot.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">3. Test des fonctionnalités vocales</h3>
              <p className="text-sm text-gray-600">Testez la reconnaissance vocale et la synthèse vocale avec le contrôle de vitesse.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">4. Test de l'interface d'administration</h3>
              <p className="text-sm text-gray-600">Connectez-vous avec les identifiants (admin/admin123) et testez la gestion des documents.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>Assistant PDF Technique © 2025</p>
      </footer>
    </div>
  );
}
