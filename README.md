# Web Grabber Plugin for Obsidian

~~A powerful Obsidian plugin that allows you to grab content from web pages and create structured notes using configurable parsers and templates.~~

vibe-coded bullshit. With the tons of text, bruh.

## Features

- **URL Input**: Enter any URL to grab content from
- **Modular Parser System**: Separate JavaScript parser files for different websites
- **Template System**: Create custom templates with variable substitution
- **Built-in Parsers**: Includes parsers for Archive of Our Own, Reddit, and generic websites
- **Flexible Parser System**: Object-oriented parsers with getters/setters for dynamic DOM operations
- **Easy Parser Development**: Simple JavaScript files that can be easily added
- **CORS-Free Requests**: Uses Obsidian's built-in `requestUrl()` API for reliable web scraping
- **Settings Management**: Enable/disable parsers and manage templates through settings
- **Automatic Note Creation**: Generated notes are automatically created and opened in Obsidian

## Installation

1. Copy the `main.js`, `styles.css`, `manifest.json` files, `parsers/` folder, and `templates/` folder to your Obsidian vault's `.obsidian/plugins/web-grabber/` directory
2. Enable the plugin in Obsidian's Community Plugins settings
3. The plugin will add a globe icon to your ribbon for quick access
4. Default templates are included in the `templates/` folder - you can modify them or create your own

## Network Requests

The plugin uses Obsidian's built-in `requestUrl()` API to fetch web content, which automatically handles CORS restrictions and provides better reliability than external proxy services. No additional configuration is required.

## Usage

### Basic Usage

1. Click the globe icon in the ribbon or use the "Open Web Grabber" command
2. Enter a URL (e.g., `https://archiveofourown.org/works/15623103`)
3. Select a parser (e.g., "Archive of Our Own")
4. Select a template (e.g., "Fanfiction Template")
5. Click "Generate Note"

### Built-in Parsers

#### Archive of Our Own Parser
Extracts fanfiction metadata including:
- Work name, author, fandom
- Rating, warnings, relationships, characters
- Tags, word count, chapters, kudos, hits
- Publication and update dates
- Work summary

#### Reddit Parser
Extracts Reddit post information including:
- Post title, subreddit, author
- Score, comments count, posted time
- Post content and flair
- Top comments

#### Generic Parser
Extracts basic content from any website:
- Page title, meta description
- Main content area
- Open Graph and Twitter Card data

### Built-in Templates

The plugin comes with several built-in templates that can be imported into your vault:

#### Fanfiction Template
Creates a structured note with:
- Source URL
- Work title as heading
- Metadata section with all fanfiction details
- Stats section with engagement metrics
- Summary section

#### Simple Template
Creates a basic note with:
- Title
- Source URL
- Description
- Content

#### Reddit Template
Creates a Reddit post note with:
- Post title and metadata
- Subreddit, author, score, comments count
- Post content
- Top comments section

#### GitHub Template
Creates a GitHub repository note with:
- Repository information
- Stats (stars, forks, issues)
- README content
- Commit information

**Note**: These templates are not automatically available. Use the "Import Default Templates" button in settings to add them to your vault.

## Configuration

### Adding Custom Parsers

1. Create a new JavaScript file in the `parsers/` directory
2. Export a parser object with the required structure (see example below)
3. The parser will automatically be loaded and available in settings
4. Enable/disable parsers in Settings → Community Plugins → Web Grabber

#### Parser File Structure

**Simple Parser:**
```javascript
export const parser = {
    id: 'myparser',
    name: 'My Parser',
    urlPattern: /example\.com/,
    parse: (doc) => {
        return new MyParser(doc).parse();
    }
};

class MyParser extends BaseParser {
    parse() {
        this.addFields([
            {
                name: 'title',
                selector: 'h1, h2, .title',
                options: { fallback: 'Untitled' }
            },
            {
                name: 'content',
                selector: '.content, .post-content, main',
                options: { fallback: '' }
            }
        ]);
        
        return this.data;
    }
}
```

**Advanced Parser with Custom Logic:**
```javascript
import { BaseParser } from './base-parser.js';

export const parser = {
    id: 'advanced',
    name: 'Advanced Parser',
    urlPattern: /example\.com/,
    parse: (doc) => {
        return new AdvancedParser(doc).parse();
    }
};

class AdvancedParser extends BaseParser {
    parse() {
        // Extract basic fields
        this.extractBasicFields();
        
        // Perform complex extraction
        this.performComplexExtraction();
        
        // Add custom fields
        this.addCustomFields();
        
        return this.data;
    }
    
    extractBasicFields() {
        this.addFields([
            { name: 'title', selector: 'h1', options: { fallback: '' } },
            { name: 'author', selector: '.author', options: { fallback: 'Unknown' } }
        ]);
    }
    
    performComplexExtraction() {
        this.performComplexExtraction((doc) => {
            // Custom DOM operations
            const customData = {};
            // ... complex logic here
            return customData;
        });
    }
}
```

#### Parser Features

The new parser system provides several powerful features:

**BaseParser Class:**
- `addField(fieldName, selector, options)` - Add a single field with options
- `addFields(fieldConfigs)` - Add multiple fields at once
- `performComplexExtraction(fn)` - Execute custom DOM operations
- `getText(selector)` - Get text content safely
- `getAttr(selector, attr)` - Get attribute value safely
- `getAllText(selector)` - Get text from multiple elements
- `cleanText(text)` - Clean and normalize text content

**Field Options:**
- `attribute` - Extract attribute instead of text content
- `multiple` - Get text from multiple elements
- `transform` - Apply transformation function to extracted value
- `fallback` - Default value if extraction fails

**Example Usage:**
```javascript
// Add a field with transformation
this.addField('word_count', '.stats .words', {
    transform: (value) => value.replace(/[^\d]/g, ''),
    fallback: '0'
});

// Add multiple fields
this.addFields([
    { name: 'title', selector: 'h1', options: { fallback: 'Untitled' } },
    { name: 'author', selector: '.author', options: { fallback: 'Unknown' } },
    { name: 'tags', selector: '.tags a', options: { multiple: true } }
]);

// Perform complex extraction
this.performComplexExtraction((doc) => {
    const data = {};
    // Custom logic here
    return data;
});
```

### Adding Custom Templates

1. Create a markdown file in your vault (e.g., `Templates/My Template.md`)
2. Write your template content using `{{variable_name}}` placeholders
3. Go to Settings → Community Plugins → Web Grabber
4. Click "Add New Template"
5. Configure:
   - **Template Name**: Display name for the template
   - **Template File**: Path to your markdown template file

### Importing Default Templates

The plugin comes with several built-in templates that you can import into your vault:

1. Go to Settings → Community Plugins → Web Grabber
2. Click "Import Default Templates"
3. The plugin will create a `Templates/` folder in your vault with the following templates:
   - **Fanfiction Template** - For Archive of Our Own fanfiction
   - **Simple Template** - Basic template for any website
   - **Reddit Template** - For Reddit posts
   - **GitHub Template** - For GitHub repositories

These templates will be automatically added to your template list and can be customized as needed.

### Troubleshooting Network Issues

If you encounter network errors:

1. **Check Internet Connection**: Ensure you have a stable internet connection
2. **Verify URL**: Make sure the URL is correct and accessible
3. **Check Website Status**: The target website may be down or blocking requests
4. **Try Different URLs**: Test with other websites to isolate the issue

**Common Error Messages:**
- "Network Error": Check your internet connection and try again
- "Page not found (404)": The URL may be invalid or the page may have been moved
- "Access denied (403)": The website may be blocking requests

### Template Variables

Use `{{variable_name}}` in your templates to insert parsed data. Available variables depend on the parser:

**Common Variables:**
- `{{url}}` - The source URL (always available)

**Archive of Our Own:**
- `{{work_name}}`, `{{work_author}}`, `{{work_summary}}`
- `{{work_fandom}}`, `{{work_rating}}`, `{{work_warnings}}`
- `{{work_relationships}}`, `{{work_characters}}`, `{{work_tags}}`
- `{{work_words}}`, `{{work_chapters}}`, `{{work_kudos}}`, `{{work_hits}}`
- `{{work_published}}`, `{{work_updated}}`

**Reddit:**
- `{{title}}`, `{{subreddit}}`, `{{author}}`
- `{{score}}`, `{{comments_count}}`, `{{posted_time}}`
- `{{content}}`, `{{flair}}`, `{{comments}}`

**Generic:**
- `{{title}}`, `{{description}}`, `{{content}}`
- `{{og_title}}`, `{{og_description}}`, `{{og_image}}`
- `{{twitter_title}}`, `{{twitter_description}}`

## Example: Archive of Our Own

For the URL `https://archiveofourown.org/works/15623103`, using the "Archive of Our Own" parser and "Fanfiction Template" will create a note like:

```markdown
src: https://archiveofourown.org/works/15623103
# Purgatory

## Metadata
- **Author:** Cole88
- **Fandom:** Silicon Valley (TV)
- **Rating:** Not Rated
- **Warnings:** Creator Chose Not To Use Archive Warnings
- **Relationships:** Bertram Gilfoyle/Monica Hall
- **Characters:** Bertram Gilfoyle, Monica Hall, Dinesh Chugtai, Richard Hendricks, Jared Dunn, Erlich Bachmann, Nelson Bighetti, Laurie Bream, Jian Yang
- **Tags:** [tags will be extracted]

## Stats
- **Words:** 1,628
- **Chapters:** 1/?
- **Kudos:** 26
- **Hits:** 750
- **Published:** 2018-08-09
- **Updated:** 2018-08-09

### Summary
Gilfoyle has convinced himself that he is content. Monica disagrees. Sort of.
```

## Development

### Building

```bash
npm install
npm run build
```

### Development Mode

```bash
npm run dev
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Support

If you encounter any issues or have questions, please open an issue on the project repository.