import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import emoji from 'node-emoji';

// Configure marked for safe rendering
marked.setOptions({
  gfm: true,
  breaks: true,
  sanitize: false
});

// Custom renderer for mentions and emojis
const renderer = {
  text(text) {
    // Handle @mentions
    text = text.replace(/@(\w+)/g, '[@$1](#/user/$1)');
    // Convert emoji shortcodes
    text = emoji.emojify(text);
    return text;
  }
};

marked.use({ renderer });

export const formatMessage = (text) => {
  // Convert markdown to HTML
  const rawHtml = marked(text);
  // Sanitize HTML
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'blockquote', 'a'],
    ALLOWED_ATTR: ['href']
  });
  return cleanHtml;
};

export const extractMentions = (text) => {
  const mentions = [];
  const regex = /@(\w+)/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    mentions.push({
      username: match[1],
      index: match.index
    });
  }
  
  return mentions;
};