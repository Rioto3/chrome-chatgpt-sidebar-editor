import { createRoot } from 'react-dom/client';

const SettingsPage = () => {
  return (
    <div>Settings</div>
  );
};

// DOM レンダリング
if (typeof document !== 'undefined') {
  const root = createRoot(document.getElementById('root'));
  root.render(<SettingsPage />);
}

export default SettingsPage;
