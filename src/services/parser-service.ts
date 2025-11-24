import { App, Notice, TFile } from 'obsidian';
import { Parser } from '../types';

export class ParserService {
	private app: App;
	private parsers: Map<string, Parser> = new Map();

	constructor(app: App) {
		this.app = app;
	}

	async loadParsers(): Promise<void> {
		try {
			// Get the plugin directory path
			const pluginId = 'obsidian-web-scraper'; // Replace with your actual plugin ID
			const pluginPath = `${(this.app.vault.adapter as any).basePath}/.obsidian/plugins/${pluginId}`;
			
			// Use Node.js fs to read the parsers directory
			const fs = require('fs');
			const path = require('path');
			
			const parsersDir = path.join(pluginPath, 'parsers');
			
			console.log('parsersDir', parsersDir);
			// Check if parsers directory exists
			if (!fs.existsSync(parsersDir)) {
				console.log('Parsers directory does not exist, creating it...');
				fs.mkdirSync(parsersDir, { recursive: true });
				return;
			}
			
			// Read all JavaScript files in the parsers directory
			const files = fs.readdirSync(parsersDir).filter((file: string) => 
				file.endsWith('.js')
			);

			for (const file of files) {
				console.log('file', file);
				try {
					const filePath = path.join(parsersDir, file);
					const content = fs.readFileSync(filePath, 'utf8');
					
					// Create a module from the content
					const module = await this.createModuleFromContent(content);
					
					// Extract the parser
					if (module && module.parser) {
						this.parsers.set(module.parser.id, module.parser);
						console.log(`Loaded parser: ${module.parser.name}`);
					}
				} catch (error) {
					console.error(`Error loading parser from ${file}:`, error);
				}
			}
		} catch (error) {
			console.error('Error loading parsers:', error);
		}
	}

	private async createModuleFromContent(content: string): Promise<any> {
		try {
			// Create a blob URL for the module
			const blob = new Blob([content], { type: 'application/javascript' });
			const url = URL.createObjectURL(blob);
			
			// Import the module
			const module = await import(url);
			
			// Clean up the blob URL
			URL.revokeObjectURL(url);
			
			return module;
		} catch (error) {
			console.error('Error creating module from content:', error);
			return null;
		}
	}

	getParsers(): Map<string, Parser> {
		return this.parsers;
	}

	getParser(id: string): Parser | undefined {
		return this.parsers.get(id);
	}

	getEnabledParsers(enabledIds: string[]): Parser[] {
		return enabledIds
			.map(id => this.parsers.get(id))
			.filter(parser => parser !== undefined) as Parser[];
	}

	async deleteParser(parserId: string): Promise<boolean> {
		try {
			const parser = this.parsers.get(parserId);
			if (!parser) {
				new Notice(`Parser not found: ${parserId}`);
				return false;
			}

			// Get the plugin directory path
			const pluginId = 'obsidian-web-scraper';
			const pluginPath = `${(this.app.vault.adapter as any).basePath}/.obsidian/plugins/${pluginId}`;
			const fs = require('fs');
			const path = require('path');
			
			const parsersDir = path.join(pluginPath, 'parsers');
			const fileName = `${parserId}.js`;
			const filePath = path.join(parsersDir, fileName);

			// Check if file exists and delete it
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
				this.parsers.delete(parserId);
				new Notice(`Deleted parser: ${parser.name}`);
				return true;
			} else {
				new Notice(`Parser file not found: ${fileName}`);
				return false;
			}
		} catch (error) {
			console.error('Error deleting parser:', error);
			new Notice('Error deleting parser. Check console for details.');
			return false;
		}
	}

	async createParser(name: string, id: string, urlPattern: string): Promise<boolean> {
		try {
			// Get the plugin directory path
			const pluginId = 'obsidian-web-scraper';
			const pluginPath = `${(this.app.vault.adapter as any).basePath}/.obsidian/plugins/${pluginId}`;
			const fs = require('fs');
			const path = require('path');
			
			const parsersDir = path.join(pluginPath, 'parsers');

			// Create parsers directory if it doesn't exist
			if (!fs.existsSync(parsersDir)) {
				fs.mkdirSync(parsersDir, { recursive: true });
			}

			const fileName = `${id}.js`;
			const filePath = path.join(parsersDir, fileName);

			// Check if parser already exists
			if (fs.existsSync(filePath)) {
				new Notice(`Parser already exists: ${fileName}`);
				return false;
			}

			// Create parser template with full boilerplate
			const parserContent = `// ${name} Parser
export const parser = {
    id: '${id}',
    name: '${name}',
    urlPattern: ${urlPattern},
    
    parse: (doc) => {
        return new ${this.toPascalCase(id)}Parser(doc).parse();
    }
};

class ${this.toPascalCase(id)}Parser {
    constructor(doc) {
        this.doc = doc;
        this.data = {};
    }
    
    parse() {
        // Add your parsing logic here
        this.data.title = this.getText('h1');
        this.data.content = this.getText('.content');
        
        return this.data;
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
        return this.getAttr(\`meta[name="\${name}"]\`, 'content');
    }
    
    getMetaProperty(property) {
        return this.getAttr(\`meta[property="\${property}"]\`, 'content');
    }
    
    // Method to add custom field with options
    addField(fieldName, selector, options = {}) {
        const { attribute, multiple, transform, fallback } = options;
        
        let value = '';
        
        if (multiple) {
            value = this.getAllText(selector);
        } else if (attribute) {
            value = this.getAttr(selector, attribute);
        } else {
            value = this.getText(selector);
        }
        
        if (transform && typeof transform === 'function') {
            value = transform(value);
        }
        
        this.data[fieldName] = value || fallback || '';
    }
    
    // Method to add multiple fields at once
    addFields(fieldConfigs) {
        fieldConfigs.forEach(config => {
            this.addField(config.name, config.selector, config.options || {});
        });
    }
    
    // Method to perform complex DOM operations
    performComplexExtraction(extractionFn) {
        try {
            const result = extractionFn(this.doc);
            if (typeof result === 'object') {
                Object.assign(this.data, result);
            }
        } catch (error) {
            console.warn('Error in complex extraction:', error);
        }
    }
    
    // Method to clean text content
    cleanText(text) {
        return text
            .replace(/\\s+/g, ' ')
            .replace(/\\n\\s*\\n/g, '\\n')
            .trim();
    }
    
    // Method to extract structured data
    extractStructuredData() {
        const scripts = this.doc.querySelectorAll('script[type="application/ld+json"]');
        const structuredData = [];
        
        scripts.forEach(script => {
            try {
                const data = JSON.parse(script.textContent);
                structuredData.push(data);
            } catch (error) {
                console.warn('Error parsing structured data:', error);
            }
        });
        
        if (structuredData.length > 0) {
            this.data.structured_data = structuredData;
        }
    }
    
    // Method to validate required fields
    validateRequiredFields(requiredFields) {
        const missing = requiredFields.filter(field => !this.data[field]);
        if (missing.length > 0) {
            console.warn(\`Missing required fields: \${missing.join(', ')}\`);
        }
        return missing.length === 0;
    }
    
    // Method to get all data
    getData() {
        return { ...this.data };
    }
    
    // Method to set data
    setData(data) {
        this.data = { ...this.data, ...data };
    }
}`;

			// Create the parser file
			fs.writeFileSync(filePath, parserContent, 'utf8');
			new Notice(`Created parser: ${name}`);
			
			// Reload parsers
			await this.loadParsers();
			return true;
		} catch (error) {
			console.error('Error creating parser:', error);
			new Notice('Error creating parser. Check console for details.');
			return false;
		}
	}

	private toPascalCase(str: string): string {
		return str.replace(/(?:^|[-_])(\w)/g, (_, c) => c.toUpperCase());
	}

	getParserFiles(): string[] {
		try {
			// Get the plugin directory path
			const pluginId = 'obsidian-web-scraper';
			const pluginPath = `${(this.app.vault.adapter as any).basePath}/.obsidian/plugins/${pluginId}`;
			const fs = require('fs');
			const path = require('path');
			
			const parsersDir = path.join(pluginPath, 'parsers');
			
			// Check if parsers directory exists
			if (!fs.existsSync(parsersDir)) {
				return [];
			}
			
			// Return list of parser files
			return fs.readdirSync(parsersDir).filter((file: string) => 
				file.endsWith('.js')
			);
		} catch (error) {
			console.error('Error getting parser files:', error);
			return [];
		}
	}
}