// GitHub Repository Parser
export const parser = {
    id: 'github',
    name: 'GitHub Repository',
    urlPattern: /github\.com\/[^\/]+\/[^\/]+/,

    parse: (doc, url) => {
        return new GitHubParser(doc, url).getData();
    },

    getFields: () => {
        return [
            { name: 'title', label: 'Repository Name', description: 'Repository title/name', type: 'string', example: 'awesome-project' },
            { name: 'description', label: 'Description', description: 'Repository description', type: 'string', example: 'An awesome project' },
            { name: 'owner', label: 'Owner', description: 'Repository owner', type: 'string', example: 'username' },
            { name: 'language', label: 'Language', description: 'Primary programming language', type: 'string', example: 'JavaScript' },
            { name: 'license', label: 'License', description: 'Repository license', type: 'string', example: 'MIT' },
            { name: 'stars', label: 'Stars', description: 'Number of stars', type: 'string', example: '1,234' },
            { name: 'forks', label: 'Forks', description: 'Number of forks', type: 'string', example: '567' },
            { name: 'issues', label: 'Issues', description: 'Number of open issues', type: 'string', example: '23' },
            { name: 'pull_requests', label: 'Pull Requests', description: 'Number of open pull requests', type: 'string', example: '5' },
            { name: 'watchers', label: 'Watchers', description: 'Number of watchers', type: 'string', example: '89' },
            { name: 'last_commit', label: 'Last Commit', description: 'Last commit message', type: 'string', example: 'Fix bug in authentication' },
            { name: 'last_commit_author', label: 'Last Commit Author', description: 'Last commit author', type: 'string', example: 'username' },
            { name: 'last_commit_date', label: 'Last Commit Date', description: 'Last commit date', type: 'string', example: '2 days ago' },
            { name: 'readme', label: 'README', description: 'Repository README content', type: 'string', example: '# Awesome Project...' },
            { name: 'topics', label: 'Topics', description: 'Repository topics/tags', type: 'array', example: '["javascript", "nodejs", "web"]' },
            { name: 'repository_url', label: 'Repository URL', description: 'Repository URL', type: 'string', example: 'https://github.com/user/repo' },
            { name: 'default_branch', label: 'Default Branch', description: 'Default branch name', type: 'string', example: 'main' },
            { name: 'is_fork', label: 'Is Fork', description: 'Whether repository is a fork', type: 'boolean', example: 'false' },
            { name: 'parent_repo', label: 'Parent Repository', description: 'Parent repository if forked', type: 'string', example: 'original/repo' },
            { name: 'size', label: 'Size', description: 'Repository size', type: 'string', example: '2.5 MB' },
            { name: 'created_at', label: 'Created At', description: 'Repository creation date', type: 'string', example: '2023-01-15' },
            { name: 'updated_at', label: 'Updated At', description: 'Last update date', type: 'string', example: '2024-01-15' },

            // Import metadata
            { name: 'src', label: 'Source', description: 'Source URL', type: 'string', example: 'https://github.com/user/repo' },
            { name: 'date', label: 'Import Date', description: 'When content was imported (ISO)', type: 'string', example: '2024-01-15T10:30:45.123Z' },
            { name: 'date_readable', label: 'Import Date (Readable)', description: 'When content was imported (human readable)', type: 'string', example: '15/01/2024, 10:30:45' }
        ];
    }
};

class GitHubParser {
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

    // Clean text content
    cleanText(text) {
        if (!text) return '';
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();
    }

    // Extract number from text (e.g., "1,234 stars" -> "1,234")
    extractNumber(text) {
        if (!text) return '';
        const match = text.match(/[\d,]+/);
        return match ? match[0] : '';
    }

    // Extract repository info from URL
    getRepoInfo() {
        if (!this.url) return { owner: '', name: '' };
        const match = this.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        return match ? { owner: match[1], name: match[2] } : { owner: '', name: '' };
    }

    // Method to get all data
    getData() {
        return {
            title: this.title,
            description: this.description,
            owner: this.owner,
            language: this.language,
            license: this.license,
            stars: this.stars,
            forks: this.forks,
            issues: this.issues,
            pull_requests: this.pull_requests,
            watchers: this.watchers,
            last_commit: this.last_commit,
            last_commit_author: this.last_commit_author,
            last_commit_date: this.last_commit_date,
            readme: this.readme,
            topics: this.topics,
            repository_url: this.repository_url,
            default_branch: this.default_branch,
            is_fork: this.is_fork,
            parent_repo: this.parent_repo,
            size: this.size,
            created_at: this.created_at,
            updated_at: this.updated_at,

            // Import metadata
            src: this.src,
            date: this.date,
            date_readable: this.date_readable
        };
    }

    // Getter methods for data fields
    get title() {
        // Try multiple selectors for repository name
        return this.getText('strong[itemprop="name"] a') ||
            this.getText('h1[data-pjax="#js-repo-pjax-container"] strong a') ||
            this.getText('h1 strong a[data-pjax="#js-repo-pjax-container"]') ||
            this.getText('.repository-meta-content h1') ||
            this.getText('h1[data-testid="repository-name"]') ||
            this.getRepoInfo().name;
    }

    get description() {
        return this.getText('[data-testid="repository-description"]') ||
            this.getText('.repository-meta-content .repository-description') ||
            this.getText('.repository-description') ||
            this.getMetaProperty('og:description') ||
            '';
    }

    get owner() {
        return this.getText('[data-testid="repository-owner"]') ||
            this.getText('.author a') ||
            this.getText('.repository-meta-content .author') ||
            this.getRepoInfo().owner;
    }

    get language() {
        return this.getText('[data-testid="repository-language"]') ||
            this.getText('.repository-meta-content .language') ||
            this.getText('.language-color') ||
            this.getText('.repository-lang-stats-graph .language-color') ||
            '';
    }

    get license() {
        return this.getText('[data-testid="repository-license"]') ||
            this.getText('.repository-meta-content .license') ||
            this.getText('.octicon-law + span') ||
            '';
    }

    get stars() {
        const starsText = this.getText('[data-testid="repository-stars"]') ||
            this.getText('.social-count[href*="stargazers"]') ||
            this.getText('.octicon-star + span') ||
            '';
        return this.extractNumber(starsText);
    }

    get forks() {
        const forksText = this.getText('[data-testid="repository-forks"]') ||
            this.getText('.social-count[href*="network"]') ||
            this.getText('.octicon-repo-forked + span') ||
            '';
        return this.extractNumber(forksText);
    }

    get issues() {
        const issuesText = this.getText('[data-testid="repository-issues"]') ||
            this.getText('.social-count[href*="issues"]') ||
            this.getText('.octicon-issue-opened + span') ||
            '';
        return this.extractNumber(issuesText);
    }

    get pull_requests() {
        const prText = this.getText('.social-count[href*="pulls"]') ||
            this.getText('.octicon-git-pull-request + span') ||
            '';
        return this.extractNumber(prText);
    }

    get watchers() {
        const watchersText = this.getText('.social-count[href*="watchers"]') ||
            this.getText('.octicon-eye + span') ||
            '';
        return this.extractNumber(watchersText);
    }

    get last_commit() {
        return this.getText('.commit-tease .commit-message') ||
            this.getText('.commit-message') ||
            this.getText('.commit-title') ||
            '';
    }

    get last_commit_author() {
        return this.getText('.commit-tease .commit-author') ||
            this.getText('.commit-author') ||
            this.getText('.commit-meta .author') ||
            '';
    }

    get last_commit_date() {
        return this.getText('.commit-tease relative-time') ||
            this.getText('relative-time') ||
            this.getText('.commit-meta relative-time') ||
            '';
    }

    get readme() {
        const readmeContent = this.getText('#readme .markdown-body') ||
            this.getText('.markdown-body') ||
            this.getText('#readme') ||
            '';
        return this.cleanText(readmeContent);
    }

    get topics() {
        const topicElements = this.doc.querySelectorAll('.topic-tag, .topic-tag-link');
        return Array.from(topicElements).map(el => el.textContent?.trim()).filter(Boolean);
    }

    get repository_url() {
        return this.getMetaProperty('og:url') ||
            this.getAttr('link[rel="canonical"]', 'href') ||
            this.url ||
            '';
    }

    get default_branch() {
        return this.getText('.branch-select-menu .css-truncate-target') ||
            this.getText('.branch-select-menu .SelectMenu-title') ||
            this.getText('[data-testid="branch-select"]') ||
            'main';
    }

    get is_fork() {
        const forkIndicator = this.getText('.fork-flag') ||
            this.getText('.octicon-repo-forked') ||
            this.getText('[data-testid="fork-flag"]') ||
            '';
        return forkIndicator.includes('forked') || forkIndicator.includes('Fork');
    }

    get parent_repo() {
        if (!this.is_fork) return '';

        const parentLink = this.getAttr('.fork-flag a', 'href') ||
            this.getAttr('.octicon-repo-forked + a', 'href') ||
            '';

        if (parentLink) {
            const match = parentLink.match(/github\.com\/([^\/]+\/[^\/]+)/);
            return match ? match[1] : '';
        }

        return '';
    }

    get size() {
        return this.getText('.repository-meta-content .octicon-database + span') ||
            this.getText('.octicon-database + span') ||
            '';
    }

    get created_at() {
        return this.getText('.repository-meta-content .octicon-calendar + span') ||
            this.getText('.octicon-calendar + span') ||
            '';
    }

    get updated_at() {
        return this.getText('.repository-meta-content .octicon-clock + span') ||
            this.getText('.octicon-clock + span') ||
            this.getText('relative-time[datetime]') ||
            '';
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