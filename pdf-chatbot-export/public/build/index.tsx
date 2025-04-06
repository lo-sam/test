import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ChatMessage, ChatInput, DocumentList } from '../components/ChatComponents';
import { useDocuments } from '../hooks/pdfHooks';
import { useSpeechRecognition, useSpeechSynthesis } from '../hooks/speechHooks';

export default function Home() {
  const { documents, loading: loadingDocs } = useDocuments();
  const { speak, stop, speaking, rate, setRate } = useSpeechSynthesis();
  const { startListening, stopListening, listening, transcript, error: speechError } = useSpeechRecognition();
  
  const [messages, setMessages] = useState([
    { isUser: false, message: "Bienvenue ! Je suis votre assistant technique. Posez-moi une question sur les manuels EVO-BLUE." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Effet pour faire défiler vers le bas quand de nouveaux messages sont ajoutés
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Effet pour mettre à jour l'entrée avec la transcription vocale
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
      // Envoyer automatiquement le message après la transcription
      handleSendMessage(transcript);
    }
  }, [transcript]);

  // Gérer l'envoi d'un message
  const handleSendMessage = async (message) => {
    if (!message || message.trim() === '') return;
    
    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, { isUser: true, message }]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Appeler l'API du chatbot
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: message.trim() }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec le chatbot');
      }
      
      const data = await response.json();
      
      let responseMessage = '';
      let reference = '';
      
      if (data.found) {
        responseMessage = data.response;
        reference = data.reference;
      } else {
        responseMessage = "Je ne trouve pas cette information dans les fichiers fournis.";
      }
      
      // Ajouter la réponse du chatbot
      setMessages(prev => [...prev, { isUser: false, message: responseMessage, reference }]);
      
      // Lire la réponse à voix haute
      speak(responseMessage);
    } catch (error) {
      console.error('Erreur:', error);
      setMessages(prev => [...prev, { 
        isUser: false, 
        message: "Désolé, j'ai rencontré une erreur lors de la recherche dans les documents." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer le basculement de l'écoute vocale
  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Formater les documents pour l'affichage
  const formattedDocuments = documents.map(doc => ({
    title: doc.title,
    pages: doc.pageCount,
    author: doc.author !== 'Non spécifié' ? doc.author : undefined
  }));

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Assistant PDF Technique</title>
        <meta name="description" content="Assistant technique basé sur vos manuels PDF" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-md mr-3 flex items-center justify-center">
              {/* Emplacement pour le logo */}
              <span className="text-gray-500 text-xl font-bold">P</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Assistant PDF Technique</h1>
          </div>
          <Link href="/admin" className="btn btn-secondary text-sm">
            Admin
          </Link>
        </header>

        {loadingDocs ? (
          <div className="text-center py-8">
            <p>Chargement des documents...</p>
          </div>
        ) : (
          <DocumentList documents={formattedDocuments} />
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Posez votre question</h2>
            <p className="text-sm text-gray-500">L'assistant répondra en se basant uniquement sur les documents disponibles</p>
          </div>
          
          <div className="p-4 h-64 overflow-y-auto bg-white">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <ChatMessage 
                  key={index} 
                  isUser={msg.isUser} 
                  message={msg.message} 
                  reference={msg.reference} 
                />
              ))}
              {isLoading && (
                <div className="flex items-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%] flex items-center">
                    <div className="w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin mr-2"></div>
                    <p className="text-gray-500">Recherche dans les documents...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} className="flex items-center">
              <button 
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-full mr-2 ${listening ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:bg-gray-100'}`}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={listening ? "Parlez maintenant..." : "Tapez votre question ici..."}
                className="input flex-1"
                disabled={listening || isLoading}
              />
              <button 
                type="submit" 
                className="p-2 rounded-full text-blue-600 hover:bg-blue-50 ml-2"
                disabled={!inputValue.trim() || isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </form>
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center">
                <button 
                  className={`text-sm flex items-center ${speaking ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => speaking ? stop() : speak(messages[messages.length - 1]?.isUser ? messages[messages.length - 2]?.message : messages[messages.length - 1]?.message)}
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
                  </svg>
                  {speaking ? 'Arrêter la lecture' : 'Lecture vocale'}
                </button>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-2">Vitesse: {rate.toFixed(1)}x</span>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>
            
            {speechError && (
              <div className="mt-2 text-xs text-red-500">
                {speechError}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>Assistant PDF Technique © 2025</p>
      </footer>
    </div>
  );
}
