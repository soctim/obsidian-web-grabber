// Archive of Our Own Parser
export const parser = {
    id: 'archiveofourown',
    name: 'Archive of Our Own',
    urlPattern: /archiveofourown\.org/,
    
    parse: (doc, url) => {
        return new ArchiveOfOurOwnParser(doc, url).getData();
    },
    
    getFields: () => {
        return [
            { name: 'work_name', label: 'Work Name', description: 'Title of the fanwork', type: 'string', example: 'The Great Adventure' },
            { name: 'work_summary', label: 'Summary', description: 'Work summary/description', type: 'string', example: 'A story about...' },
            { name: 'work_author', label: 'Author', description: 'Author of the fanwork', type: 'string', example: 'AuthorName' },
            { name: 'work_fandom', label: 'Fandom', description: 'Source fandom', type: 'string', example: 'Harry Potter' },
            { name: 'work_rating', label: 'Rating', description: 'Content rating', type: 'string', example: 'Teen And Up Audiences' },
            { name: 'work_warnings', label: 'Warnings', description: 'Content warnings', type: 'string', example: 'No Archive Warnings Apply' },
            { name: 'work_relationships', label: 'Relationships', description: 'Character relationships', type: 'string', example: 'Harry Potter/Hermione Granger' },
            { name: 'work_characters', label: 'Characters', description: 'Main characters', type: 'string', example: 'Harry Potter, Hermione Granger' },
            { name: 'work_tags', label: 'Tags', description: 'Additional tags', type: 'string', example: 'Adventure, Romance' },
            { name: 'work_language', label: 'Language', description: 'Work language', type: 'string', example: 'English' },
            { name: 'work_comments', label: 'Comments', description: 'Number of comments', type: 'string', example: '89' },
            { name: 'work_stats', label: 'Stats', description: 'Work statistics', type: 'string', example: 'Words: 50,000, Kudos: 1,234' },
            { name: 'work_url', label: 'Work URL', description: 'Link to the work', type: 'string', example: 'https://archiveofourown.org/works/12345' },
            { name: 'work_id', label: 'Work ID', description: 'Unique work identifier', type: 'string', example: '12345' },
            
            // Import metadata
            { name: 'src', label: 'Source', description: 'Source URL', type: 'string', example: 'https://archiveofourown.org/works/12345' },
            { name: 'date', label: 'Import Date', description: 'When content was imported (ISO)', type: 'string', example: '2024-01-15T10:30:45.123Z' },
            { name: 'date_readable', label: 'Import Date (Readable)', description: 'When content was imported (human readable)', type: 'string', example: '15/01/2024, 10:30:45' }
        ];
    }
};

class ArchiveOfOurOwnParser {
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
            work_name: this.work_name,
            work_summary: this.work_summary,
            work_author: this.work_author,
            work_fandom: this.work_fandom,
            work_rating: this.work_rating,
            work_warnings: this.work_warnings,
            work_relationships: this.work_relationships,
            work_characters: this.work_characters,
            work_tags: this.work_tags,
            work_language: this.work_language,
            work_comments: this.work_comments,
            work_stats: this.work_stats,
            work_url: this.work_url,
            work_id: this.work_id,
            
            // Import metadata
            src: this.src,
            date: this.date,
            date_readable: this.date_readable
        };
    }
    
    get work_name() {
        return this.getText('h2.title.heading') || 
               this.getText('h2.heading') || 
               this.getText('h2.title') || 
               this.getText('h2') ||
               this.getText('.title') ||
               this.getText('[data-field="title"]') || '';
    }
    
    get work_summary() {
        return this.getText('blockquote.userstuff') || 
               this.getText('.summary blockquote') ||
               this.getText('.userstuff') || '';
    }
    
    get work_author() {
        return this.getText('a[rel="author"]') || 
               this.getText('.byline a') ||
               this.getText('.author a') || '';
    }
    
    get work_fandom() {
        return this.getAllText('.fandom a') || 
               this.getAllText('.fandom .tag') || '';
    }
    
    get work_rating() {
        return this.getText('.rating') || 
               this.getText('.rating .tag') || '';
    }
    
    get work_warnings() {
        return this.getText('.warnings') || 
               this.getText('.warnings .tag') || '';
    }
    
    get work_relationships() {
        return this.getAllText('.relationships a') || 
               this.getAllText('.relationships .tag') || '';
    }
    
    get work_characters() {
        return this.getAllText('.characters a') || 
               this.getAllText('.characters .tag') || '';
    }
    
    get work_tags() {
        return this.getAllText('.tags a') || 
               this.getAllText('.tags .tag') || '';
    }
    
    get work_language() {
        return this.getText('.language') || 
               this.getText('.language .tag') || '';
    }
    
    get work_comments() {
        return this.getText('.comments') || 
               this.getText('.comments .tag') || '';
    }
    
    get work_stats() {
        const stats = {};
        
        // Extract word count
        const wordCount = this.getText('.stats .words');
        if (wordCount) {
            stats.words = wordCount.replace(/[^\d]/g, '');
        }
        
        // Extract chapter count
        const chapterCount = this.getText('.stats .chapters');
        if (chapterCount) {
            stats.chapters = chapterCount.replace(/[^\d]/g, '');
        }
        
        // Extract hits
        const hits = this.getText('.stats .hits');
        if (hits) {
            stats.hits = hits.replace(/[^\d]/g, '');
        }
        
        // Extract kudos
        const kudos = this.getText('.stats .kudos');
        if (kudos) {
            stats.kudos = kudos.replace(/[^\d]/g, '');
        }
        
        // Extract bookmarks
        const bookmarks = this.getText('.stats .bookmarks');
        if (bookmarks) {
            stats.bookmarks = bookmarks.replace(/[^\d]/g, '');
        }
        
        return stats;
    }
    
    get work_url() {
        return this.getAttr('meta[property="og:url"]', 'content') || 
               (typeof window !== 'undefined' ? window.location.href : '') || '';
    }
    
    get work_id() {
        const url = this.work_url;
        const match = url.match(/works\/(\d+)/);
        return match ? match[1] : '';
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