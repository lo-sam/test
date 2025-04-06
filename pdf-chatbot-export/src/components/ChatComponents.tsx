import { useState, useEffect, useRef } from 'react';

interface ChatMessageProps {
  isUser: boolean;
  message: string;
  reference?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ isUser, message, reference }) => {
  return (
    <div className={`flex items-start ${isUser ? 'justify-end' : ''}`}>
      <div className={`rounded-lg p-3 max-w-[80%] ${isUser ? 'bg-blue-50 text-blue-900' : 'bg-gray-100 text-gray-800'}`}>
        <p>{message}</p>
        {reference && (
          <p className="text-xs text-gray-500 mt-1">
            Source: {reference}
          </p>
        )}
      </div>
    </div>
  );
};

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isListening: boolean;
  toggleListening: () => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isListening, 
  toggleListening, 
  speechRate, 
  setSpeechRate 
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="flex items-center">
        <button 
          type="button"
          onClick={toggleListening}
          className={`p-2 rounded-full mr-2 ${isListening ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tapez votre question ici..." 
          className="input flex-1"
        />
        <button type="submit" className="p-2 rounded-full text-blue-600 hover:bg-blue-50 ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </form>
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center">
          <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
            </svg>
            Lecture vocale
          </button>
        </div>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">Vitesse: {speechRate}x</span>
          <input 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.1" 
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
};

interface DocumentListProps {
  documents: Array<{
    title: string;
    pages: number;
    author?: string;
  }>;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  return (
    <div className="bg-gray-50 rounded-xl shadow-sm p-4 mb-8">
      <h2 className="text-lg font-medium text-gray-800 mb-2">Documents disponibles</h2>
      <div className="space-y-2">
        {documents.map((doc, index) => (
          <div key={index} className="bg-white p-3 rounded-md border border-gray-200">
            <p className="font-medium">{doc.title}</p>
            <p className="text-sm text-gray-500">
              {doc.pages} pages {doc.author && `• ${doc.author}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ChatMessage, ChatInput, DocumentList };
