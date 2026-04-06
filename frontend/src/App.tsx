import { useState } from 'react'
import './App.css'
import Canvas from './components/Canvas'

function App() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [guess, setGuess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCanvasExport = (dataUrl: string) => {
    setImageData(dataUrl);
    // Auto-clear error when drawing
    if (error) setError(null);
  };

  const handleGuess = async () => {
    if (!imageData) return;

    setLoading(true);
    setGuess(null);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to get guess from server');
      }

      const data = await response.json();
      setGuess(data.guess);
    } catch (err: any) {
      console.error('Error guessing:', err);
      setError(err.message || 'Connection error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGuess(null);
    setError(null);
    setImageData(null);
    // Note: Canvas component will handle its own clear via the 'Clear' button in its toolbar
    window.location.reload(); // Quick way to reset all state
  };

  return (
    <div className="App">
      <header style={{ padding: '2rem 1rem', width: '100%', maxWidth: '800px' }}>
        <h1>🎨 Draw & Guess AI</h1>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>
          Draw something and let the local <strong>Ollama AI</strong> guess what it is!
        </p>
      </header>

      <main className="game-container">
        <Canvas onExport={handleCanvasExport} />

        <div className="guess-section">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button 
              className="guess-button"
              onClick={handleGuess}
              disabled={!imageData || loading}
              style={{ 
                padding: '12px 32px', 
                fontSize: '1.2rem', 
                cursor: (imageData && !loading) ? 'pointer' : 'not-allowed',
                backgroundColor: (imageData && !loading) ? '#1a73e8' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '8px'
              }}
            >
              {loading ? 'AI is Thinking...' : 'Guess What This Is!'}
            </button>
            
            <button 
              onClick={handleReset}
              style={{ 
                padding: '12px 16px', 
                backgroundColor: '#fff', 
                color: '#666', 
                border: '1px solid #ccc',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              New Game
            </button>
          </div>

          {error && (
            <div style={{ 
              marginTop: '15px', 
              color: '#d93025', 
              backgroundColor: '#fce8e6', 
              padding: '10px 20px', 
              borderRadius: '4px',
              border: '1px solid #f5c2c7'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {guess && (
            <div className="result-card" style={{ 
              marginTop: '25px', 
              padding: '25px', 
              backgroundColor: '#e8f0fe', 
              borderRadius: '12px',
              border: '2px solid #1a73e8',
              boxShadow: '0 4px 12px rgba(26,115,232,0.1)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1967d2', fontSize: '1rem', textTransform: 'uppercase' }}>
                AI's Best Guess
              </h3>
              <p style={{ 
                fontSize: '2rem', 
                fontWeight: '800', 
                color: '#1a73e8', 
                margin: 0,
                lineHeight: 1.2
              }}>
                "{guess}"
              </p>
            </div>
          )}
        </div>
      </main>

      {imageData && (
        <div className="drawing-preview">
          <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Current Snapshot:</h4>
          <img 
            src={imageData} 
            alt="Your drawing" 
            style={{ 
              border: '1px solid #eee', 
              borderRadius: '4px',
              maxWidth: '200px',
              backgroundColor: 'white' 
            }} 
          />
        </div>
      )}

      <footer style={{ marginTop: '3rem', padding: '2rem', color: '#888', fontSize: '0.9rem' }}>
        Powered by Ollama Local AI & React
      </footer>
    </div>
  )
}

export default App
