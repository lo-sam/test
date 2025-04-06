import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Fonction pour charger les documents indexés
export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDocuments() {
      try {
        const response = await fetch('/api/documents');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des documents');
        }
        const data = await response.json();
        setDocuments(data.documents);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, []);

  return { documents, loading, error };
}

// Fonction pour gérer l'upload de PDF
export function useUploadPDF() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const uploadPDF = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setUploadError('Veuillez sélectionner un fichier PDF valide');
      return null;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }

      const result = await response.json();
      
      // Extraire le texte du PDF
      const extractResponse = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath: result.file.path }),
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || 'Erreur lors de l\'extraction du texte');
      }

      const extractResult = await extractResponse.json();
      
      setUploadResult({ ...result, ...extractResult });
      return { ...result, ...extractResult };
    } catch (err) {
      setUploadError(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadPDF, uploading, uploadProgress, uploadError, uploadResult };
}

// Fonction pour rechercher dans les documents
export function useSearch() {
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const search = async (query) => {
    if (!query || query.trim() === '') {
      setSearchError('Veuillez entrer une requête de recherche');
      return null;
    }

    setSearching(true);
    setSearchResults(null);
    setSearchError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la recherche');
      }

      const results = await response.json();
      setSearchResults(results);
      return results;
    } catch (err) {
      setSearchError(err.message);
      return null;
    } finally {
      setSearching(false);
    }
  };

  return { search, searching, searchResults, searchError };
}

// Fonction pour la synthèse vocale
export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    // Initialiser les voix disponibles
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Sélectionner une voix masculine française par défaut si disponible
        const frenchMaleVoice = availableVoices.find(
          voice => voice.lang.includes('fr') && voice.name.toLowerCase().includes('male')
        );
        
        if (frenchMaleVoice) {
          setSelectedVoice(frenchMaleVoice);
        } else {
          // Sinon, prendre la première voix française
          const frenchVoice = availableVoices.find(voice => voice.lang.includes('fr'));
          if (frenchVoice) {
            setSelectedVoice(frenchVoice);
          } else {
            // Si aucune voix française, prendre la première voix
            setSelectedVoice(availableVoices[0]);
          }
        }
      };

      loadVoices();
      
      // Chrome nécessite cet événement pour charger les voix
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const speak = (text) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Arrêter toute synthèse vocale en cours
      window.speechSynthesis.cancel();
      
      if (!text) return;
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = rate;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  return { speak, stop, speaking, voices, selectedVoice, setSelectedVoice, rate, setRate };
}

// Fonction pour la reconnaissance vocale
export function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionError, setRecognitionError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Vérifier si la reconnaissance vocale est disponible
    if (typeof window !== 'undefined' && window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';
      
      recognitionRef.current.onstart = () => {
        setListening(true);
      };
      
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
      };
      
      recognitionRef.current.onerror = (event) => {
        setRecognitionError(`Erreur de reconnaissance: ${event.error}`);
        setListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setListening(false);
      };
    } else {
      setRecognitionError('La reconnaissance vocale n\'est pas prise en charge par votre navigateur');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    setTranscript('');
    setRecognitionError(null);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        setRecognitionError(`Erreur lors du démarrage de la reconnaissance: ${error.message}`);
      }
    } else {
      setRecognitionError('La reconnaissance vocale n\'est pas disponible');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Erreur lors de l\'arrêt de la reconnaissance:', error);
      }
    }
  };

  return { startListening, stopListening, listening, transcript, recognitionError };
}
