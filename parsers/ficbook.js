// Ficbook.net Parser
export const parser = {
    id: 'ficbook',
    name: 'Ficbook.net',
    urlPattern: /ficbook\.net\/readfic/,
    
    parse: (doc, url) => {
        return new FicbookParser(doc, url).getData();
    },
    
    getFields: () => {
        return [
            // Basic info
            { name: 'title', label: 'Title', description: 'Fanfic title', type: 'string', example: 'Название фанфика' },
            { name: 'fic_id', label: 'Fic ID', description: 'Unique fanfic identifier', type: 'string', example: '2709789' },
            { name: 'status', label: 'Status', description: 'Publication status', type: 'string', example: 'В процессе' },
            
            // Author info
            { name: 'author', label: 'Author', description: 'Author name', type: 'string', example: 'AuthorName' },
            { name: 'author_url', label: 'Author URL', description: 'Author profile URL', type: 'string', example: 'https://ficbook.net/authors/12345' },
            { name: 'beta', label: 'Beta', description: 'Beta reader', type: 'string', example: 'BetaReader' },
            { name: 'translator', label: 'Translator', description: 'Translator name', type: 'string', example: 'TranslatorName' },
            
            // Fandom info
            { name: 'fandoms', label: 'Fandoms', description: 'Source fandoms', type: 'array', example: '["Гарри Поттер", "Перси Джексон"]' },
            { name: 'pairings', label: 'Pairings', description: 'Character pairings', type: 'array', example: '["Гарри Поттер/Гермиона Грейнджер"]' },
            { name: 'characters', label: 'Characters', description: 'Main characters', type: 'array', example: '["Гарри Поттер", "Гермиона Грейнджер"]' },
            
            // Metadata
            { name: 'rating', label: 'Rating', description: 'Content rating', type: 'string', example: 'R' },
            { name: 'direction', label: 'Direction', description: 'Story direction (slash/het/gen)', type: 'string', example: 'Гет' },
            { name: 'genres', label: 'Genres', description: 'Story genres', type: 'array', example: '["Романтика", "Драма"]' },
            { name: 'warnings', label: 'Warnings', description: 'Content warnings', type: 'array', example: '["Насилие"]' },
            
            // Chapter and size info
            { name: 'chapters', label: 'Chapters', description: 'Number of chapters', type: 'string', example: '15' },
            { name: 'words', label: 'Words', description: 'Word count', type: 'string', example: '50000' },
            { name: 'pages', label: 'Pages', description: 'Page count', type: 'string', example: '100' },
            { name: 'size', label: 'Size', description: 'File size', type: 'string', example: '1.2 MB' },
            
            // Dates
            { name: 'published', label: 'Published', description: 'Publication date', type: 'string', example: '2024-01-15' },
            { name: 'updated', label: 'Updated', description: 'Last update date', type: 'string', example: '2024-01-20' },
            
            // Summary and content
            { name: 'summary', label: 'Summary', description: 'Story summary', type: 'string', example: 'Краткое описание...' },
            { name: 'dedication', label: 'Dedication', description: 'Story dedication', type: 'string', example: 'Посвящается...' },
            { name: 'notes', label: 'Notes', description: 'Author notes', type: 'string', example: 'Примечания автора...' },
            
            // Stats
            { name: 'likes', label: 'Likes', description: 'Number of likes', type: 'string', example: '123' },
            { name: 'rewards', label: 'Rewards', description: 'Number of rewards', type: 'string', example: '5' },
            { name: 'in_collections', label: 'In Collections', description: 'Number of collections', type: 'string', example: '10' },
            { name: 'comments', label: 'Comments', description: 'Number of comments', type: 'string', example: '45' },
            
            // URLs
            { name: 'fic_url', label: 'Fic URL', description: 'Link to the fanfic', type: 'string', example: 'https://ficbook.net/readfic/2709789' },
            { name: 'cover_image', label: 'Cover Image', description: 'Cover image URL', type: 'string', example: 'https://example.com/cover.jpg' },
            
            // Additional
            { name: 'tags', label: 'Tags', description: 'Story tags', type: 'array', example: '["Магия", "Приключения"]' },
            
            // Import metadata
            { name: 'src', label: 'Source', description: 'Source URL', type: 'string', example: 'https://ficbook.net/readfic/2709789' },
            { name: 'date', label: 'Import Date', description: 'When content was imported (ISO)', type: 'string', example: '2024-01-15T10:30:45.123Z' },
            { name: 'date_readable', label: 'Import Date (Readable)', description: 'When content was imported (human readable)', type: 'string', example: '15/01/2024, 10:30:45' }
        ];
    }
};

class FicbookParser {
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
        return Array.from(elements).map(el => el.textContent?.trim()).filter(Boolean);
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
            .replace(/\n\s*\n/g, '\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();
    }
    
    // Extract number from text
    extractNumber(text) {
        if (!text) return '';
        const match = text.match(/[\d\s]+/);
        return match ? match[0].replace(/\s/g, '') : '';
    }
    
    // Main data extraction method
    getData() {
        return {
            // Basic info
            title: this.title,
            fic_id: this.fic_id,
            status: this.status,
            
            // Author info
            author: this.author,
            author_url: this.author_url,
            beta: this.beta,
            translator: this.translator,
            
            // Fandom info
            fandoms: this.fandoms,
            pairings: this.pairings,
            characters: this.characters,
            
            // Metadata
            rating: this.rating,
            direction: this.direction,
            genres: this.genres,
            warnings: this.warnings,
            
            // Chapter and size info
            chapters: this.chapters,
            words: this.words,
            pages: this.pages,
            size: this.size,
            
            // Dates
            published: this.published,
            updated: this.updated,
            
            // Summary and content
            summary: this.summary,
            dedication: this.dedication,
            notes: this.notes,
            
            // Stats
            likes: this.likes,
            rewards: this.rewards,
            in_collections: this.in_collections,
            comments: this.comments,
            
            // URLs
            fic_url: this.fic_url,
            cover_image: this.cover_image,
            
            // Additional
            tags: this.tags,
            
            // Import metadata
            src: this.src,
            date: this.date,
            date_readable: this.date_readable
        };
    }
    
    // Getter methods for data fields
    get title() {
        return this.getText('h1.fanfic-title') ||
               this.getText('h1.fanfic-main-info') ||
               this.getText('.fanfic-hat-title') ||
               this.getText('h1[itemprop="name"]') ||
               this.getText('h1') ||
               this.getMetaProperty('og:title') ||
               '';
    }
    
    get fic_id() {
        if (this.url) {
            const match = this.url.match(/readfic\/(\d+)/);
            if (match) return match[1];
        }
        return this.getMetaProperty('og:url')?.match(/readfic\/(\d+)/)?.[1] || '';
    }
    
    get status() {
        // Look for status indicators like "В процессе" or "Завершён"
        const statusText = this.getText('.fanfic-status') ||
                          this.getText('.status') ||
                          this.getText('[data-status]') ||
                          '';
        
        if (statusText) return statusText;
        
        // Check for completion indicators
        const completedIndicators = ['завершен', 'закончен', 'завершён'];
        const inProgressIndicators = ['в процессе', 'продолжается'];
        
        const pageText = this.doc.body?.textContent?.toLowerCase() || '';
        
        for (const indicator of completedIndicators) {
            if (pageText.includes(indicator)) return 'Завершён';
        }
        
        for (const indicator of inProgressIndicators) {
            if (pageText.includes(indicator)) return 'В процессе';
        }
        
        return '';
    }
    
    get author() {
        return this.getText('.creator-nickname') ||
               this.getText('.author-name') ||
               this.getText('a[href*="/authors/"]') ||
               this.getText('[itemprop="author"]') ||
               this.getText('.fanfic-author') ||
               '';
    }
    
    get author_url() {
        const authorLink = this.getAttr('.creator-nickname', 'href') ||
                          this.getAttr('.author-name', 'href') ||
                          this.getAttr('a[href*="/authors/"]', 'href') ||
                          '';
        
        if (authorLink && !authorLink.startsWith('http')) {
            return 'https://ficbook.net' + authorLink;
        }
        
        return authorLink;
    }
    
    get beta() {
        // Look for beta reader information
        const betaText = this.getText('.beta-nickname') ||
                        this.getText('[data-role="beta"]') ||
                        '';
        return betaText;
    }
    
    get translator() {
        // Look for translator information
        const translatorText = this.getText('.translator-nickname') ||
                              this.getText('[data-role="translator"]') ||
                              '';
        return translatorText;
    }
    
    get fandoms() {
        return this.getAllText('.fandom-tag') ||
               this.getAllText('.fanfic-fandom a') ||
               this.getAllText('a[href*="/fanfiction/"]') ||
               [];
    }
    
    get pairings() {
        return this.getAllText('.pairing-tag') ||
               this.getAllText('.fanfic-pairings a') ||
               this.getAllText('a[href*="/pairings/"]') ||
               [];
    }
    
    get characters() {
        return this.getAllText('.character-tag') ||
               this.getAllText('.fanfic-characters a') ||
               this.getAllText('a[href*="/characters/"]') ||
               [];
    }
    
    get rating() {
        return this.getText('.rating-tag') ||
               this.getText('.fanfic-rating') ||
               this.getText('[data-rating]') ||
               this.getText('a[href*="/rating/"]') ||
               '';
    }
    
    get direction() {
        // Direction can be "Гет", "Слэш", "Джен", "Фемслэш", etc.
        return this.getText('.direction-tag') ||
               this.getText('.fanfic-direction') ||
               this.getText('a[href*="/direction/"]') ||
               '';
    }
    
    get genres() {
        return this.getAllText('.genre-tag') ||
               this.getAllText('.fanfic-genres a') ||
               this.getAllText('a[href*="/genre/"]') ||
               [];
    }
    
    get warnings() {
        return this.getAllText('.warning-tag') ||
               this.getAllText('.fanfic-warnings a') ||
               this.getAllText('a[href*="/warning/"]') ||
               [];
    }
    
    get chapters() {
        const chaptersText = this.getText('.fanfic-parts-count') ||
                            this.getText('.parts-count') ||
                            this.getText('[data-chapters]') ||
                            '';
        return this.extractNumber(chaptersText);
    }
    
    get words() {
        const sizeText = this.getText('.fanfic-size') ||
                        this.getText('.size-info') ||
                        this.getText('[data-words]') ||
                        '';
        
        if (sizeText) {
            const wordMatch = sizeText.match(/(\d+[\s,]*\d*)\s*слов/);
            return wordMatch ? wordMatch[1].replace(/[\s,]/g, '') : '';
        }
        return '';
    }
    
    get pages() {
        const sizeText = this.getText('.fanfic-size') ||
                        this.getText('.size-info') ||
                        this.getText('[data-pages]') ||
                        '';
        
        if (sizeText) {
            const pageMatch = sizeText.match(/(\d+[\s,]*\d*)\s*страниц/);
            return pageMatch ? pageMatch[1].replace(/[\s,]/g, '') : '';
        }
        return '';
    }
    
    get size() {
        const sizeText = this.getText('.fanfic-size') ||
                        this.getText('.size-info') ||
                        '';
        
        // Extract size in MB or KB
        const sizeMatch = sizeText.match(/[\d.,]+\s*[KM]B/i);
        return sizeMatch ? sizeMatch[0] : '';
    }
    
    get published() {
        const dateText = this.getText('.published-date') ||
                        this.getText('[data-published]') ||
                        this.getText('time[datetime]') ||
                        this.getAttr('time[datetime]', 'datetime') ||
                        '';
        return dateText;
    }
    
    get updated() {
        const dateText = this.getText('.updated-date') ||
                        this.getText('[data-updated]') ||
                        this.getText('time.updated[datetime]') ||
                        this.getAttr('time.updated[datetime]', 'datetime') ||
                        '';
        return dateText;
    }
    
    get summary() {
        const summary = this.getText('.fanfic-summary') ||
                       this.getText('.annotation') ||
                       this.getText('[itemprop="description"]') ||
                       this.getText('.description') ||
                       this.getMetaProperty('og:description') ||
                       '';
        return this.cleanText(summary);
    }
    
    get dedication() {
        const dedication = this.getText('.fanfic-dedication') ||
                          this.getText('.dedication') ||
                          '';
        return this.cleanText(dedication);
    }
    
    get notes() {
        const notes = this.getText('.fanfic-notes') ||
                     this.getText('.author-notes') ||
                     this.getText('.notes') ||
                     '';
        return this.cleanText(notes);
    }
    
    get likes() {
        const likesText = this.getText('.likes-count') ||
                         this.getText('[data-likes]') ||
                         this.getText('.fanfic-likes') ||
                         '';
        return this.extractNumber(likesText);
    }
    
    get rewards() {
        const rewardsText = this.getText('.rewards-count') ||
                           this.getText('[data-rewards]') ||
                           this.getText('.fanfic-rewards') ||
                           '';
        return this.extractNumber(rewardsText);
    }
    
    get in_collections() {
        const collectionsText = this.getText('.collections-count') ||
                               this.getText('[data-collections]') ||
                               this.getText('.fanfic-collections') ||
                               '';
        return this.extractNumber(collectionsText);
    }
    
    get comments() {
        const commentsText = this.getText('.comments-count') ||
                            this.getText('[data-comments]') ||
                            this.getText('.fanfic-comments') ||
                            '';
        return this.extractNumber(commentsText);
    }
    
    get fic_url() {
        if (this.url) return this.url;
        
        const url = this.getMetaProperty('og:url') ||
                   this.getAttr('link[rel="canonical"]', 'href') ||
                   '';
        
        if (url && !url.startsWith('http')) {
            return 'https://ficbook.net' + url;
        }
        
        return url || (this.fic_id ? `https://ficbook.net/readfic/${this.fic_id}` : '');
    }
    
    get cover_image() {
        const imageUrl = this.getAttr('.fanfic-cover img', 'src') ||
                        this.getAttr('.cover-image', 'src') ||
                        this.getMetaProperty('og:image') ||
                        '';
        
        if (imageUrl && !imageUrl.startsWith('http')) {
            return 'https://ficbook.net' + imageUrl;
        }
        
        return imageUrl;
    }
    
    get tags() {
        return this.getAllText('.tag') ||
               this.getAllText('.fanfic-tags a') ||
               this.getAllText('a[href*="/tags/"]') ||
               [];
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

