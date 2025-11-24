import { App, TFile, Notice, requestUrl } from 'obsidian';
import { WebGrabberSettings, TemplateConfig, ParsedData, Parser } from '../types';

export class WebScraperService {
	private app: App;
	private settings: WebGrabberSettings;
	private parsers: Map<string, Parser>;

	constructor(app: App, settings: WebGrabberSettings, parsers: Map<string, Parser>) {
		this.app = app;
		this.settings = settings;
		this.parsers = parsers;
	}

	async createNoteFromUrl(url: string, parserId: string, templateId: string): Promise<void> {
		try {
			// Find the parser
			const parser = this.parsers.get(parserId);
			if (!parser) {
				new Notice(`Parser not found: ${parserId}`);
				return;
			}

			// Find the template
			const template = this.settings.templates.find(t => t.id === templateId);
			if (!template) {
				new Notice(`Template not found: ${templateId}`);
				return;
			}

			// Load template content
			const templateContent = await this.loadTemplateContent(template.filePath);
			if (!templateContent) {
				new Notice(`Template file not found: ${template.filePath}`);
				return;
			}

			// Fetch and parse the URL
			const parsedData = await this.parseContent(url, parser);
			console.debug(parsedData);
			if (!parsedData) {
				return;
			}

			// Apply template
			const content = this.applyTemplate(templateContent, parsedData);

			// Generate filename
			const fileName = this.generateFileName(parsedData);

			// Create the note
			const file = await this.app.vault.create(fileName, content);
			if (file) {
				new Notice(`Note created: ${fileName}`);
				// Open the note
				await this.app.workspace.getLeaf().openFile(file);
			}
		} catch (error) {
			console.error('Error creating note:', error);
			new Notice('Error creating note. Check console for details.');
		}
	}

	private async parseContent(url: string, parser: Parser): Promise<ParsedData | null> {
		try {
			// Use Obsidian's requestUrl to avoid CORS issues
			const response = await requestUrl({
				url: url,
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
				}
			});

			// Parse HTML
			const parser_ = new DOMParser();
			const doc = parser_.parseFromString(response.text, 'text/html');

			// Extract data using the parser
			const parsedData = parser.parse(doc, url);

			return parsedData;
		} catch (error) {
			console.error('Error parsing content:', error);
			new Notice('Error fetching or parsing content. Check console for details.');
			return null;
		}
	}

	private async loadTemplateContent(filePath: string): Promise<string | null> {
		try {
			const file = this.app.vault.getAbstractFileByPath(filePath);
			if (file && file instanceof TFile) {
				return await this.app.vault.read(file);
			}
			return null;
		} catch (error) {
			console.error('Error loading template:', error);
			return null;
		}
	}

	private applyTemplate(template: string, data: ParsedData): string {
		let result = template;
		
		// Replace all template variables
		for (const [key, value] of Object.entries(data)) {
			const placeholder = `{{${key}}}`;
			result = result.replace(new RegExp(placeholder, 'g'), String(value || ''));
		}
		
		return result;
	}

	private generateFileName(data: ParsedData): string {
		const title = data.work_name || data.title || 'Untitled';
		const sanitizedTitle = title.replace(/[<>:"/\\|?*]/g, '').substring(0, 50);

		return `${sanitizedTitle}.md`;
	}
}