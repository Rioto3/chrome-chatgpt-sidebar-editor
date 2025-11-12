import { createRoot } from 'react-dom/client';

const PopupAsPage = () => {
  return (
    <div>PopupPage</div>
  );
};

// DOM レンダリング
if (typeof document !== 'undefined') {
  const root = createRoot(document.getElementById('root'));
  root.render(<PopupAsPage />);
}

export default PopupAsPage;
