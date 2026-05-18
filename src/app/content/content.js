import { initChatGPTIntegration } from './content-scripts/chatgpt.js';
import { initClaudeIntegration } from './content-scripts/claude.js';
import { initBookmarkIntegration } from './content-scripts/bookmark.js';

// ChatGPTページ
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

// Claudeページ
if (location.hostname.includes('claude.ai')) {
  console.log('🎯 Claudeページを検出、専用機能を初期化します');
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClaudeIntegration);
    initBookmarkIntegration();
  } else {
    initClaudeIntegration();
    initBookmarkIntegration();
  }
}