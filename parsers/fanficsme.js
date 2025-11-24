// Fanfics.me Parser - Fixed Version
export const parser = {
    id: 'fanficsme',
    name: 'Fanfics.me',
    urlPattern: /fanfics\.me\/fic\d+/,
    
    parse: (doc, url) => {
        return new FanficsMeParser(doc, url).getData();
    },
    
    getFields: () => {
        return [
            // Basic info
            { name: 'title', label: 'Title', description: 'Fanfic title', type: 'string', example: 'Эффект птеродактиля' },
            { name: 'fic_id', label: 'Fic ID', description: 'Unique fanfic identifier', type: 'string', example: '83015' },
            { name: 'status', label: 'Status', description: 'Publication status', type: 'string', example: 'Завершён' },
            
            // Author info
            { name: 'author', label: 'Author', description: 'Author name', type: 'string', example: 'AuthorName' },
            { name: 'beta', label: 'Beta', description: 'Beta reader', type: 'string', example: 'BetaReader' },
            
            // Fandom info
            { name: 'fandom', label: 'Fandom', description: 'Source fandom', type: 'string', example: 'Гарри Поттер' },
            { name: 'characters', label: 'Characters', description: 'Main characters', type: 'string', example: 'Гарри Поттер, Гермиона Грейнджер' },
            { name: 'events', label: 'Events', description: 'Key events', type: 'string', example: 'Битва за Хогвартс' },
            
            // Metadata
            { name: 'warnings', label: 'Warnings', description: 'Content warnings', type: 'string', example: 'Насилие' },
            { name: 'rating', label: 'Rating', description: 'Content rating', type: 'string', example: 'NC-17' },
            { name: 'genre', label: 'Genre', description: 'Story genre', type: 'string', example: 'Романтика' },
            { name: 'size', label: 'Size', description: 'File size', type: 'string', example: '1.2 MB' },
            { name: 'word_count', label: 'Word Count', description: 'Number of words', type: 'string', example: '50,000' },
            { name: 'character_count', label: 'Character Count', description: 'Number of characters', type: 'string', example: '300,000' },
            { name: 'page_count', label: 'Page Count', description: 'Number of pages', type: 'string', example: '100' },
            
            // Summary and content
            { name: 'summary', label: 'Summary', description: 'Story summary', type: 'string', example: 'История о...' },
            
            // Stats
            { name: 'views', label: 'Views', description: 'Number of views', type: 'string', example: '1,234' },
            { name: 'likes', label: 'Likes', description: 'Number of likes', type: 'string', example: '56' },
            { name: 'comments', label: 'Comments', description: 'Number of comments', type: 'string', example: '23' },
            { name: 'bookmarks', label: 'Bookmarks', description: 'Number of bookmarks', type: 'string', example: '12' },
            
            // URLs
            { name: 'fic_url', label: 'Fic URL', description: 'Link to the fanfic', type: 'string', example: 'https://fanfics.me/fic53370' },
            { name: 'cover_image', label: 'Cover Image', description: 'Cover image URL', type: 'string', example: 'https://example.com/cover.jpg' },
            
            // Additional
            { name: 'tags', label: 'Tags', description: 'Story tags', type: 'string', example: 'Романтика, Драма' },
            
            // Import metadata
            { name: 'src', label: 'Source', description: 'Source URL', type: 'string', example: 'https://fanfics.me/fic53370' },
            { name: 'date', label: 'Import Date', description: 'When content was imported (ISO)', type: 'string', example: '2024-01-15T10:30:45.123Z' },
            { name: 'date_readable', label: 'Import Date (Readable)', description: 'When content was imported (human readable)', type: 'string', example: '15/01/2024, 10:30:45' }
        ];
    }
};

class FanficsMeParser {
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
    
    
    
    getData() {
        return {
            // Basic info
            title: this.title,
            fic_id: this.fic_id,
            status: this.status,
            
            // Author info
            author: this.author,
            beta: this.beta,
            
            // Fandom info
            fandom: this.fandom,
            characters: this.characters,
            events: this.events,
            
            // Metadata
            warnings: this.warnings,
            rating: this.rating,
            genre: this.genre,
            size: this.size,
            word_count: this.word_count,
            character_count: this.character_count,
            page_count: this.page_count,
            
            // Summary and content
            summary: this.summary,
            
            // Stats
            views: this.views,
            likes: this.likes,
            comments: this.comments,
            bookmarks: this.bookmarks,
            
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
    
    get title() {
        const title = this.getText('h1') || 
                     this.getText('.fic_title') || 
                     this.getText('[data-field="title"]') ||
                     this.getText('title');
        
        if (title) {
            return title
                .replace(/&nbsp;/g, ' ')
                .replace(/\s+/g, ' ')
                .replace(' (гет)', '')
                .replace(' (джен)', '')
                .trim();
        }
        return '';
    }
    
    get fic_id() {
        return this.getText('#fic_id') || 
               this.getAttr('meta[property="og:url"]', 'content')?.match(/fic(\d+)/)?.[1] ||
               (typeof window !== 'undefined' && window.location.href.match(/fic(\d+)/)?.[1]) || '';
    }
    
    get status() {
        return this.extractFieldValue('Статус:');
    }
    
    get author() {
        return this.extractFieldValue('Автор:');
    }
    
    get beta() {
        return this.extractFieldValue('Бета:');
    }
    
    get fandom() {
        return this.extractFieldValue('Фандом:');
    }
    
    get characters() {
        const charactersText = this.extractFieldValue('Персонажи:');
        if (charactersText) {
            // Remove "Показать подробно" and other extra text
            const cleanCharacters = charactersText
                .replace(/Показать подробно/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            return cleanCharacters.split(/,\s*/).filter(Boolean);
        }
        return [];
    }
    
    get events() {
        const eventsText = this.extractFieldValueHTML('События:');
        if (eventsText) {
            // Extract text before the first <br> and clean it
            const cleanEvents = eventsText
                .split('<br>')[0]  // Get only the first part before <br>
                .replace(/<[^>]*>/g, '') // Remove all HTML tags
                .replace(/Показать подробно/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            return cleanEvents ? [cleanEvents] : [];
        }
        return [];
    }
    
    get warnings() {
        const warningsText = this.extractFieldValue('Предупреждения:');
        if (warningsText) {
            return warningsText.split(/,\s*/).filter(Boolean);
        }
        return [];
    }
    
    get rating() {
        return this.extractFieldValue('Рейтинг:');
    }
    
    get genre() {
        return this.extractFieldValue('Жанр:');
    }
    
    get size() {
        const sizeText = this.extractFieldValue('Размер:');
        if (sizeText) {
            // Extract only the main size text from the modal link value
            const modalLinkValue = this.doc.querySelector('.ModalLink_value.activ2 a');
            if (modalLinkValue) {
                return modalLinkValue.textContent.trim();
            } else {
                // Fallback to regex extraction
                const mainSizeMatch = sizeText.match(/^([^<]+)/);
                return mainSizeMatch ? mainSizeMatch[1].trim() : sizeText;
            }
        }
        return '';
    }
    
    get word_count() {
        const sizeText = this.extractFieldValue('Размер:');
        if (sizeText) {
            const wordCountMatch = sizeText.match(/(\d+[\s,]*\d*)\s*слов/);
            return wordCountMatch ? wordCountMatch[1].replace(/\s/g, '') : '';
        }
        return '';
    }
    
    get character_count() {
        const sizeText = this.extractFieldValue('Размер:');
        if (sizeText) {
            const charCountMatch = sizeText.match(/(\d+[\s,]*\d*)\s*знаков/);
            return charCountMatch ? charCountMatch[1].replace(/\s/g, '') : '';
        }
        return '';
    }
    
    get page_count() {
        const sizeText = this.extractFieldValue('Размер:');
        if (sizeText) {
            const pageCountMatch = sizeText.match(/(\d+[\s,]*\d*)\s*страниц/);
            return pageCountMatch ? pageCountMatch[1].replace(/\s/g, '') : '';
        }
        return '';
    }
    
    get summary() {
        // First try the more reliable method using div#summary_{fic_id}
        if (this.fic_id) {
            const summaryElement = this.doc.querySelector(`#summary_${this.fic_id}`);
            if (summaryElement) {
                return this.cleanText(summaryElement.textContent || '');
            }
        }
        
        // Fallback: Look for summary in the textarea at the bottom of the page
        const textareas = this.doc.querySelectorAll('textarea');
        for (const textarea of textareas) {
            const text = textarea.textContent.trim();
            // Look for text that contains the summary (after "Саммари:")
            if (text.includes('Саммари:') && text.includes('вопрос')) {
                const summaryMatch = text.match(/Саммари:\s*(.+?)(?:\n|$)/);
                if (summaryMatch) {
                    const summary = summaryMatch[1]
                        .replace(/<br>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                    return this.cleanText(summary);
                }
            }
        }
        
        return '';
    }
    
    get views() {
        return this.extractFieldValue('Просмотры:');
    }
    
    get likes() {
        return this.extractFieldValue('Лайки:');
    }
    
    get comments() {
        return this.extractFieldValue('Комментарии:');
    }
    
    get bookmarks() {
        return this.extractFieldValue('Закладки:');
    }
    
    get fic_url() {
        // Use the provided URL parameter first
        if (this.url) {
            return this.url;
        }
        
        // Fallback to meta tag or construct from fic_id
        const url = this.getAttr('meta[property="og:url"]', 'content') || 
                   (this.fic_id ? 'https://fanfics.me/fic' + this.fic_id : '');
        
        return url;
    }
    
    get cover_image() {
        return this.getAttr('meta[property="og:image"]', 'content');
    }
    
    get tags() {
        return this.extractFieldValue('Теги:');
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
    
    // Helper methods for field extraction
    extractFieldValue(label) {
        const elements = this.doc.querySelectorAll('*');
        for (const element of elements) {
            if (element.textContent?.trim().startsWith(label)) {
                const text = element.textContent?.trim() || '';
                const value = text.substring(label.length).trim();
                return value || '';
            }
        }
        return '';
    }
    
    extractFieldValueHTML(label) {
        const elements = this.doc.querySelectorAll('*');
        for (const element of elements) {
            if (element.textContent?.trim().startsWith(label)) {
                const text = element.innerHTML || '';
                const value = text.substring(text.indexOf(label) + label.length).trim();
                return value || '';
            }
        }
        return '';
    }
    
    cleanText(text) {
        if (!text) return '';
        
        return text
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .replace(/\n\s*\n/g, '\n')  // Replace multiple newlines with single newline
            .replace(/<br\s*\/?>/gi, ' ')  // Replace <br> tags with spaces
            .replace(/<[^>]*>/g, '')  // Remove HTML tags
            .replace(/&nbsp;/g, ' ')  // Replace &nbsp; with space
            .replace(/&amp;/g, '&')  // Replace &amp; with &
            .replace(/&lt;/g, '<')  // Replace &lt; with <
            .replace(/&gt;/g, '>')  // Replace &gt; with >
            .replace(/&quot;/g, '"')  // Replace &quot; with "
            .replace(/&#39;/g, "'")  // Replace &#39; with '
            .trim();
    }
}