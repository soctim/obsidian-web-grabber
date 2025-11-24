export interface WebGrabberSettings {
	templates: TemplateConfig[];
	enabledParsers: string[];
}

export interface TemplateConfig {
	id: string;
	name: string;
	filePath: string;
}

export interface ParsedData {
	[key: string]: any;
}


// Parser field definitions for UI
export interface ParserField {
	name: string;
	label: string;
	description: string;
	type: 'string' | 'number' | 'boolean' | 'array' | 'object';
	example?: string;
}


export interface Parser {
	id: string;
	name: string;
	urlPattern: RegExp;
	parse: (doc: Document, url: string) => ParsedData;
	getFields: () => ParserField[];
}

// Default template definitions
export const DEFAULT_TEMPLATES = [
	{
		id: 'fanfiction',
		name: 'Fanfiction Template',
		filePath: 'Templates/Fanfiction Template.md',
		content: `src: {{url}}
# {{work_name}}

## Author
{{work_author}}

## Fandom
{{work_fandom}}

## Rating
{{work_rating}}

## Warnings
{{work_warnings}}

## Relationships
{{work_relationships}}

## Characters
{{work_characters}}

## Tags
{{work_tags}}

## Summary
{{work_summary}}

## Stats
- Words: {{work_words}}
- Chapters: {{work_chapters}}
- Kudos: {{work_kudos}}
- Hits: {{work_hits}}
- Published: {{work_published}}
- Updated: {{work_updated}}
- Language: {{work_language}}
- Comments: {{work_comments}}`
	},
	{
		id: 'simple',
		name: 'Simple Template',
		filePath: 'Templates/Simple Template.md',
		content: `# {{title}}

**Source:** {{url}}

## Content
{{content}}

## Metadata
- Author: {{author}}
- Description: {{description}}
- Keywords: {{keywords}}`
	},
	{
		id: 'reddit',
		name: 'Reddit Template',
		filePath: 'Templates/Reddit Template.md',
		content: `# {{title}}

**Subreddit:** {{subreddit}} | **Author:** {{author}} | **Score:** {{score}} | **Comments:** {{comments_count}}

## Post Content
{{content}}

## Top Comments
{{comments}}

---
*Posted: {{posted_time}} | Flair: {{flair}}*`
	},
	{
		id: 'github',
		name: 'GitHub Repository Template',
		filePath: 'Templates/GitHub Template.md',
		content: `# {{title}}

**Repository:** {{url}}

## Description
{{description}}

## Repository Info
- **Owner:** {{owner}}
- **Language:** {{language}}
- **License:** {{license}}
- **Stars:** {{stars}}
- **Forks:** {{forks}}
- **Issues:** {{issues}}

## Last Commit
- **Message:** {{last_commit}}
- **Author:** {{last_commit_author}}
- **Date:** {{last_commit_date}}

## README
{{readme}}`
	}
];