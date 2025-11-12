import React, { useState, } from 'react';
import { createRoot } from 'react-dom/client';

const SidepanelPage = () => {
  return (
    <div>
      <h1>title</h1>
    </div>
  );
};







// DOMContentLoaded後にReactをマウント
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<SidepanelPage />);
  }
});

export default SidepanelPage;