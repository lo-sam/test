import { useRef, useEffect } from 'react';

// Hook pour la reconnaissance vocale
export function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Vérifier si la reconnaissance vocale est disponible dans le navigateur
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';
      
      recognitionRef.current.onstart = () => {
        setListening(true);
        setError(null);
      };
      
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
      };
      
      recognitionRef.current.onerror = (event) => {
        setError(`Erreur de reconnaissance: ${event.error}`);
        setListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setListening(false);
      };
    } else {
      setError('La reconnaissance vocale n\'est pas prise en charge par votre navigateur');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    setTranscript('');
    setError(null);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        setError(`Erreur lors du démarrage de la reconnaissance: ${error.message}`);
      }
    } else {
      setError('La reconnaissance vocale n\'est pas disponible');
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

  return { startListening, stopListening, listening, transcript, error };
}

// Hook pour la synthèse vocale
export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const utteranceRef = useRef(null);

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
      stop();
      
      if (!text) return;
      
      utteranceRef.current = new SpeechSynthesisUtterance(text);
      
      if (selectedVoice) {
        utteranceRef.current.voice = selectedVoice;
      }
      
      utteranceRef.current.rate = rate;
      utteranceRef.current.lang = 'fr-FR';
      
      utteranceRef.current.onstart = () => setSpeaking(true);
      utteranceRef.current.onend = () => setSpeaking(false);
      utteranceRef.current.onerror = () => setSpeaking(false);
      
      window.speechSynthesis.speak(utteranceRef.current);
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

// N'oubliez pas d'importer useState
import { useState } from 'react';
