import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Career AI - Working!</h1>
      <p>If you can see this, the frontend is running correctly.</p>
      <button onClick={() => window.location.href = '/login'}>Go to Login</button>
    </div>
  );
}

export default App;
