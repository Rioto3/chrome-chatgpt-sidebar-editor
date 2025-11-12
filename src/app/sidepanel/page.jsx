import React, { useState, } from 'react';
import { createRoot } from 'react-dom/client';

export default SidepanelAsPage = () => {
  const [prompt, setPrompt] = useState(() => {
    return localStorage.getItem('prompt') || '';
  });

  const handleChange = (e) => {
    setPrompt(e.target.value);
    localStorage.setItem('prompt', e.target.value);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
  };

  return (
    <div style={{ padding: '1rem', width: '300px' }}>
      <h2>プロンプトエディタ</h2>
      <textarea
        style={{ width: '100%', height: '200px' }}
        value={prompt}
        onChange={handleChange}
        placeholder="ここにプロンプトを書いて保存できます"
      />
      <button onClick={handleCopy}>コピーする</button>
    </div>
  );
};





// DOMContentLoaded後にReactをマウント
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<SidepanelAsPage />);
  }
});
