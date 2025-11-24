// Generic Parser for any website
export const parser = {
    id: 'generic',
    name: 'Generic Parser',
    urlPattern: /.*/,
    
    parse: (doc, url) => {
        return new GenericParser(doc, url).getData();
    },
    
    getFields: () => {
        return [
            { name: 'title', label: 'Title', description: 'Page title', type: 'string', example: 'Amazing Article' },
            { name: 'description', label: 'Description', description: 'Page description', type: 'string', example: 'This is an amazing article about...' },
            { name: 'keywords', label: 'Keywords', description: 'Page keywords', type: 'string', example: 'technology, innovation, future' },
            { name: 'author', label: 'Author', description: 'Page author', type: 'string', example: 'John Doe' },
            { name: 'content', label: 'Content', description: 'Main content', type: 'string', example: 'The main article content...' },
            { name: 'url', label: 'URL', description: 'Page URL', type: 'string', example: 'https://example.com/article' },
            { name: 'image', label: 'Image', description: 'Main image URL', type: 'string', example: 'https://example.com/image.jpg' },
            { name: 'site_name', label: 'Site Name', description: 'Website name', type: 'string', example: 'Example News' },
            { name: 'type', label: 'Type', description: 'Content type', type: 'string', example: 'article' },
            { name: 'published_time', label: 'Published', description: 'Publication date', type: 'string', example: '2024-01-15' },
            { name: 'modified_time', label: 'Modified', description: 'Last modified date', type: 'string', example: '2024-01-16' },
            
            // Open Graph fields
            { name: 'og_title', label: 'OG Title', description: 'Open Graph title', type: 'string', example: 'OG Title' },
            { name: 'og_description', label: 'OG Description', description: 'Open Graph description', type: 'string', example: 'OG Description' },
            { name: 'og_image', label: 'OG Image', description: 'Open Graph image', type: 'string', example: 'https://example.com/og-image.jpg' },
            { name: 'og_url', label: 'OG URL', description: 'Open Graph URL', type: 'string', example: 'https://example.com/article' },
            { name: 'og_type', label: 'OG Type', description: 'Open Graph type', type: 'string', example: 'article' },
            { name: 'og_site_name', label: 'OG Site Name', description: 'Open Graph site name', type: 'string', example: 'Example News' },
            
            // Twitter fields
            { name: 'twitter_card', label: 'Twitter Card', description: 'Twitter card type', type: 'string', example: 'summary_large_image' },
            { name: 'twitter_title', label: 'Twitter Title', description: 'Twitter title', type: 'string', example: 'Twitter Title' },
            { name: 'twitter_description', label: 'Twitter Description', description: 'Twitter description', type: 'string', example: 'Twitter Description' },
            { name: 'twitter_image', label: 'Twitter Image', description: 'Twitter image', type: 'string', example: 'https://example.com/twitter-image.jpg' },
            
            // Import metadata
            { name: 'src', label: 'Source', description: 'Source URL', type: 'string', example: 'https://example.com/article' },
            { name: 'date', label: 'Import Date', description: 'When content was imported (ISO)', type: 'string', example: '2024-01-15T10:30:45.123Z' },
            { name: 'date_readable', label: 'Import Date (Readable)', description: 'When content was imported (human readable)', type: 'string', example: '15/01/2024, 10:30:45' }
        ];
    }
};

class GenericParser {
    constructor(doc, url) {
        this.doc = doc;
        this.url = url;
    }
    
    // Helper methods for DOM operations
    getText(selector) {
        const element = this.doc.querySelector(selector);
        return element ? element.textContent?.trim() || '' : '';
    }
    
    getAttr(selector, attr) {
        const element = this.doc.querySelector(selector);
        return element ? element.getAttribute(attr) || '' : '';
    }
    
    getAllText(selector) {
        const elements = this.doc.querySelectorAll(selector);
        return Array.from(elements).map(el => el.textContent?.trim()).filter(Boolean).join(', ');
    }
    
    getAllAttrs(selector, attr) {
        const elements = this.doc.querySelectorAll(selector);
        return Array.from(elements).map(el => el.getAttribute(attr)).filter(Boolean);
    }
    
    getMetaContent(name) {
        return this.getAttr(`meta[name="${name}"]`, 'content');
    }
    
    getMetaProperty(property) {
        return this.getAttr(`meta[property="${property}"]`, 'content');
    }
    
    // Clean text helper
    cleanText(text) {
        if (!text) return '';
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, ' ')
            .trim();
    }
    
    getData() {
        return {
            title: this.title,
            description: this.description,
            keywords: this.keywords,
            author: this.author,
            content: this.content,
            url: this.url,
            image: this.image,
            site_name: this.site_name,
            type: this.type,
            published_time: this.published_time,
            modified_time: this.modified_time,
            
            // Import metadata
            src: this.src,
            date: this.date,
            date_readable: this.date_readable
        };
    }
    
    get title() {
        return this.getBestTitle();
    }
    
    get description() {
        return this.getMetaContent('description') || 
               this.getMetaProperty('og:description') || 
               this.getMetaProperty('twitter:description') || '';
    }
    
    get keywords() {
        return this.getMetaContent('keywords') || '';
    }
    
    get author() {
        return this.getMetaContent('author') || 
               this.getMetaProperty('article:author') || 
               this.getMetaProperty('og:article:author') || '';
    }
    
    get content() {
        return this.extractMainContent();
    }
    
    get url() {
        return this.getMetaProperty('og:url') || 
               (typeof window !== 'undefined' ? window.location.href : '') || '';
    }
    
    get image() {
        return this.getMetaProperty('og:image') || 
               this.getMetaProperty('twitter:image') || '';
    }
    
    get site_name() {
        return this.getMetaProperty('og:site_name') || '';
    }
    
    get type() {
        return this.getMetaProperty('og:type') || 'website';
    }
    
    get published_time() {
        return this.getMetaProperty('article:published_time') || 
               this.getMetaProperty('og:article:published_time') || '';
    }
    
    get modified_time() {
        return this.getMetaProperty('article:modified_time') || 
               this.getMetaProperty('og:article:modified_time') || '';
    }
    
    // Helper method to get the best title
    getBestTitle() {
        const titleSelectors = [
            'h1',
            'title',
            '[data-field="title"]',
            '.title',
            '.post-title',
            '.entry-title',
            '.page-title'
        ];
        
        for (const selector of titleSelectors) {
            const title = this.getText(selector);
            if (title && title.length > 0) {
                return this.cleanText(title);
            }
        }
        
        return '';
    }
    
    // Helper method to extract main content
    extractMainContent() {
        const contentSelectors = [
            'main',
            'article',
            '.content',
            '.post-content',
            '.entry-content',
            '.page-content',
            '.main-content',
            '#content',
            '.article-content'
        ];
        
        for (const selector of contentSelectors) {
            const content = this.getText(selector);
            if (content && content.length > 50) { // Only use content that's substantial
                return this.cleanText(content);
            }
        }
        
        // Fallback: get all paragraph text
        const paragraphs = this.doc.querySelectorAll('p');
        if (paragraphs.length > 0) {
            const text = Array.from(paragraphs)
                .map(p => p.textContent?.trim())
                .filter(Boolean)
                .join(' ');
            return this.cleanText(text);
        }
        
        return '';
    }
    
    get src() {
        return this.url || '';
    }
    
    get date() {
        return new Date().toISOString();
    }
    
    get date_readable() {
        return new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}