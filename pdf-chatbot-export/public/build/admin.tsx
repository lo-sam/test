import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useDocuments, useUploadPDF } from '../hooks/pdfHooks';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const { documents, loading: loadingDocs } = useDocuments();
  const { uploadPDF, uploading, uploadError, uploadResult } = useUploadPDF();
  const fileInputRef = useRef(null);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulation d'authentification simple
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Identifiants incorrects');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      uploadPDF(file);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setLogo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteDocument = (documentId) => {
    // Cette fonction serait implémentée pour supprimer un document
    console.log('Suppression du document:', documentId);
    // Appel API à implémenter
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Administration | Assistant PDF Technique</title>
        <meta name="description" content="Interface d'administration de l'assistant technique" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-md mr-3 flex items-center justify-center">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain rounded-md" />
              ) : (
                <span className="text-gray-500 text-xl font-bold">P</span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
          </div>
          <Link href="/" className="btn btn-secondary text-sm">
            Retour à l'accueil
          </Link>
        </header>

        {!isAuthenticated ? (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Connexion administrateur</h2>
              <p className="text-sm text-gray-500">Connectez-vous pour gérer les documents PDF</p>
            </div>
            
            <form onSubmit={handleLogin} className="p-4">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>
              
              <button type="submit" className="w-full btn btn-primary">
                Se connecter
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800">Gestion des documents</h2>
                <p className="text-sm text-gray-500">Ajoutez ou supprimez des documents PDF</p>
              </div>
              
              <div className="p-4">
                {loadingDocs ? (
                  <p className="text-center py-4">Chargement des documents...</p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {documents.length === 0 ? (
                      <p className="text-center py-4 text-gray-500">Aucun document disponible</p>
                    ) : (
                      documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-sm text-gray-500">
                              {doc.pageCount} pages {doc.author !== 'Non spécifié' && `• ${doc.author}`}
                            </p>
                          </div>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ajouter un nouveau document
                  </label>
                  <div className="flex items-center">
                    <label className="flex-1 cursor-pointer">
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-md text-center hover:border-gray-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mt-1 text-sm text-gray-500">
                          {uploading ? 'Téléchargement en cours...' : 'Cliquez pour sélectionner un fichier PDF'}
                        </p>
                        {uploadError && (
                          <p className="mt-1 text-sm text-red-500">{uploadError}</p>
                        )}
                        {uploadResult && (
                          <p className="mt-1 text-sm text-green-500">Document téléchargé avec succès!</p>
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept=".pdf" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                    </label>
                    <button 
                      className="btn btn-primary ml-3"
                      onClick={() => fileInputRef.current.click()}
                      disabled={uploading}
                    >
                      {uploading ? 'En cours...' : 'Télécharger'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800">Personnalisation</h2>
                <p className="text-sm text-gray-500">Modifiez l'apparence de l'assistant</p>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo de l'application
                  </label>
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex items-center justify-center">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain rounded-md" />
                      ) : (
                        <span className="text-gray-500 text-2xl font-bold">P</span>
                      )}
                    </div>
                    <label className="flex-1 cursor-pointer">
                      <div className="p-3 border border-gray-300 rounded-md text-center hover:border-gray-400 transition-colors">
                        <p className="text-sm text-gray-500">Choisir une image (PNG, JPG)</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleLogoChange}
                      />
                    </label>
                  </div>
                </div>
                
                <button className="btn btn-primary">
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>Assistant PDF Technique © 2025</p>
      </footer>
    </div>
  );
}
