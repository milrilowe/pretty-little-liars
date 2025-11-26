import { useState, FormEvent } from 'react';
import './JoinScreen.css';

interface JoinScreenProps {
  onJoin: (name: string) => void;
  isConnected: boolean;
}

export function JoinScreen({ onJoin, isConnected }: JoinScreenProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (name.trim() && !isSubmitting) {
      setIsSubmitting(true);
      onJoin(name.trim());
      // Keep submitting state - parent will handle transition
    }
  };

  return (
    <div className="join-screen">
      <div className="join-container">
        <div className="logo">
          <div className="logo-icon">🎭</div>
          <h1>Truth or Lie</h1>
        </div>

        {!isConnected ? (
          <div className="connection-status">
            <div className="spinner"></div>
            <p>Connecting to game...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="join-form">
            <div className="input-group">
              <label htmlFor="name">Enter your name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={20}
                autoComplete="off"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="join-button"
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? 'Joining...' : 'Join Game'}
            </button>
          </form>
        )}

        <div className="connection-indicator">
          <div className={`indicator-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
          <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>
    </div>
  );
}