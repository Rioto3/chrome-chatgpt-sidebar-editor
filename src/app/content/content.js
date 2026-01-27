import { initChatGPTIntegration } from './content-scripts/chatgpt.js';
import { initBookmarkIntegration } from './content-scripts/bookmark.js';

// ChatGPTページでのみ専用ロジックを初期化
if (location.hostname.includes('chatgpt.com') || location.hostname.includes('chat.openai.com')) {
  console.log('🎯 ChatGPTページを検出、専用機能を初期化します');
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initChatGPTIntegration();
      initBookmarkIntegration();
    });
  } else {
    initChatGPTIntegration();
    initBookmarkIntegration();
  }
}