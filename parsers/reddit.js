// Reddit Parser
export const parser = {
    id: 'reddit',
    name: 'Reddit',
    urlPattern: /reddit\.com/,
    
    parse: (doc, url) => {
        return new RedditParser(doc, url).getData();
    },
    
    getFields: () => {
        return [
            { name: 'title', label: 'Title', description: 'Post title', type: 'string', example: 'Amazing discovery!' },
            { name: 'subreddit', label: 'Subreddit', description: 'Subreddit name', type: 'string', example: 'r/science' },
            { name: 'author', label: 'Author', description: 'Post author username', type: 'string', example: 'u/username' },
            { name: 'score', label: 'Score', description: 'Post score (upvotes - downvotes)', type: 'string', example: '1.2k' },
            { name: 'upvote_ratio', label: 'Upvote Ratio', description: 'Ratio of upvotes to total votes', type: 'string', example: '0.95' },
            { name: 'comments_count', label: 'Comments', description: 'Number of comments', type: 'string', example: '45' },
            { name: 'posted_time', label: 'Posted', description: 'When the post was made', type: 'string', example: '2 hours ago' },
            { name: 'flair', label: 'Flair', description: 'Post flair/tag', type: 'string', example: 'Discussion' },
            { name: 'content', label: 'Content', description: 'Post content/body', type: 'string', example: 'This is the post content...' },
            { name: 'comments', label: 'Comments', description: 'Top comments', type: 'string', example: 'Comment 1, Comment 2...' },
            { name: 'post_type', label: 'Post Type', description: 'Type of post (text, link, image, etc.)', type: 'string', example: 'text' },
            { name: 'nsfw', label: 'NSFW', description: 'Not Safe For Work flag', type: 'boolean', example: 'false' },
            { name: 'locked', label: 'Locked', description: 'Whether comments are locked', type: 'boolean', example: 'false' },
            { name: 'archived', label: 'Archived', description: 'Whether post is archived', type: 'boolean', example: 'false' },
            
            // Import metadata
            { name: 'src', label: 'Source', description: 'Source URL', type: 'string', example: 'https://reddit.com/r/science/comments/abc123' },
            { name: 'date', label: 'Import Date', description: 'When content was imported (ISO)', type: 'string', example: '2024-01-15T10:30:45.123Z' },
            { name: 'date_readable', label: 'Import Date (Readable)', description: 'When content was imported (human readable)', type: 'string', example: '15/01/2024, 10:30:45' }
        ];
    }
};

class RedditParser {
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
            subreddit: this.subreddit,
            author: this.author,
            score: this.score,
            upvote_ratio: this.upvote_ratio,
            comments_count: this.comments_count,
            posted_time: this.posted_time,
            flair: this.flair,
            content: this.content,
            comments: this.comments,
            post_type: this.post_type,
            nsfw: this.nsfw,
            locked: this.locked,
            archived: this.archived,
            
            // Import metadata
            src: this.src,
            date: this.date,
            date_readable: this.date_readable
        };
    }
    
    get title() {
        return this.getText('h1[data-testid="post-content"], h1, [data-testid="post-content"] h1') || '';
    }
    
    get subreddit() {
        return this.getText('[data-testid="subreddit-name"], .subreddit') || '';
    }
    
    get author() {
        return this.getText('[data-testid="post_author_link"], .author') || '';
    }
    
    get score() {
        return this.getText('[data-testid="post-content"] [data-testid="vote-arrows"] span, .score') || '';
    }
    
    get upvote_ratio() {
        return this.getText('[data-testid="upvote-ratio"]') || '';
    }
    
    get comments_count() {
        return this.getText('[data-testid="comments-page-link-num-comments"], .comments') || '';
    }
    
    get posted_time() {
        return this.getText('[data-testid="post_timestamp"], time') || '';
    }
    
    get flair() {
        return this.getText('[data-testid="post_flair"], .flair') || '';
    }
    
    get content() {
        const contentSelectors = [
            '[data-testid="post-content"] .usertext-body',
            '.usertext-body',
            '[data-testid="post-content"] p',
            '.post-content',
            '.entry-content'
        ];
        
        for (const selector of contentSelectors) {
            const content = this.getText(selector);
            if (content) {
                return this.cleanText(content);
            }
        }
        return '';
    }
    
    get comments() {
        const commentElements = this.doc.querySelectorAll('[data-testid="comment"]');
        return Array.from(commentElements)
            .slice(0, 5) // Get top 5 comments
            .map(comment => comment.textContent?.trim())
            .filter(Boolean)
            .join(' | ');
    }
    
    get post_type() {
        // Determine post type based on content
        if (this.doc.querySelector('[data-testid="post-content"] img')) return 'image';
        if (this.doc.querySelector('[data-testid="post-content"] video')) return 'video';
        if (this.doc.querySelector('[data-testid="post-content"] a[href*="reddit.com"]')) return 'crosspost';
        return 'text';
    }
    
    get nsfw() {
        return this.doc.querySelector('[data-testid="nsfw-badge"]') !== null;
    }
    
    get locked() {
        return this.doc.querySelector('[data-testid="locked-indicator"]') !== null;
    }
    
    get archived() {
        return this.doc.querySelector('[data-testid="archived-indicator"]') !== null;
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