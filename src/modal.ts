import { App, Modal, Setting, Notice } from 'obsidian';
import { WebGrabberSettings, TemplateConfig, ParsedData, Parser } from './types';

export class WebGrabberModal extends Modal {
	app: App;
	settings: WebGrabberSettings;
	onSubmit: (url: string, parserId: string, templateId: string) => void;
	parsers: Map<string, Parser> = new Map();

	constructor(app: App, settings: WebGrabberSettings, parsers: Map<string, Parser>, onSubmit: (url: string, parserId: string, templateId: string) => void) {
		super(app);
		this.app = app;
		this.settings = settings;
		this.parsers = parsers;
		this.onSubmit = onSubmit;
	}

	// Auto-detect parser based on URL pattern
	private detectParser(url: string): string | null {
		for (const [parserId, parser] of this.parsers) {
			if (this.settings.enabledParsers.includes(parserId) && parser.urlPattern.test(url)) {
				return parserId;
			}
		}
		return null;
	}

	// Auto-detect template based on parser
	private detectTemplate(parserId: string): string | null {
		// Map parsers to their default templates
		const parserToTemplateMap: Record<string, string> = {
			'reddit': 'reddit',
			'archiveofourown': 'fanfiction',
			'fanficsme': 'fanfiction',
			'github': 'github',
			'generic': 'simple'
		};

		const templateId = parserToTemplateMap[parserId];
		if (templateId) {
			// Check if template exists in settings
			const templateExists = this.settings.templates.some(t => t.id === templateId);
			return templateExists ? templateId : null;
		}
		return null;
	}

	// Handle URL change and auto-detect parser/template
	private handleUrlChange(url: string): void {
		if (!url) return;

		const parserSelect = this.contentEl.querySelector('#web-grabber-parser-select') as HTMLSelectElement;
		const templateSelect = this.contentEl.querySelector('#web-grabber-template-select') as HTMLSelectElement;

		if (!parserSelect || !templateSelect) return;

		// Auto-detect parser
		const detectedParser = this.detectParser(url);
		if (detectedParser) {
			parserSelect.value = detectedParser;
			
			// Add visual feedback for auto-detection
			parserSelect.style.backgroundColor = '#e8f5e8';
			setTimeout(() => {
				parserSelect.style.backgroundColor = '';
			}, 1000);
			
			// Auto-detect template based on parser
			const detectedTemplate = this.detectTemplate(detectedParser);
			if (detectedTemplate) {
				templateSelect.value = detectedTemplate;
				
				// Add visual feedback for auto-detection
				templateSelect.style.backgroundColor = '#e8f5e8';
				setTimeout(() => {
					templateSelect.style.backgroundColor = '';
				}, 1000);
			}
		}
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Web Grabber' });
		contentEl.createEl('p', { text: 'Enter a URL to grab content and create a new note.' });

		// URL input
		const urlSetting = new Setting(contentEl)
			.setName('URL')
			.setDesc('Enter the URL to grab content from')
			.addText(text => {
				text.setPlaceholder('https://example.com')
					.setValue('')
					.inputEl.setAttribute('id', 'web-grabber-url-input');
				
				// Add event listener after setting up the input
				text.inputEl.addEventListener('input', (evt) => {
					const url = (evt.target as HTMLInputElement).value.trim();
					this.handleUrlChange(url);
				});
			});

		// Parser selection
		const parserSetting = new Setting(contentEl)
			.setName('Parser')
			.setDesc('Select a parser for the website (auto-detected based on URL)')
			.addDropdown(dropdown => {
				// Add available parsers
				const parserOptions: Record<string, string> = {};
				this.settings.enabledParsers.forEach(parserId => {
					const parser = this.parsers.get(parserId);
					parserOptions[parserId] = parser ? parser.name : parserId;
				});
				dropdown.addOptions(parserOptions);
				// Set ID on the select element
				(dropdown as any).selectEl.setAttribute('id', 'web-grabber-parser-select');
			});

		// Template selection
		const templateSetting = new Setting(contentEl)
			.setName('Template')
			.setDesc('Select a template for the note (auto-detected based on parser)')
			.addDropdown(dropdown => {
				// Add available templates
				const templateOptions: Record<string, string> = {};
				this.settings.templates.forEach(template => {
					templateOptions[template.id] = template.name;
				});
				dropdown.addOptions(templateOptions);
				// Set ID on the select element
				(dropdown as any).selectEl.setAttribute('id', 'web-grabber-template-select');
			});

		// Buttons
		const buttonContainer = contentEl.createDiv({ cls: 'web-grabber-modal-button-container' });
		
		new Setting(buttonContainer)
			.addButton(button => button
				.setButtonText('Generate Note')
				.setCta()
				.onClick(() => {
					const urlInput = contentEl.querySelector('#web-grabber-url-input') as HTMLInputElement;
					const parserSelect = contentEl.querySelector('#web-grabber-parser-select') as HTMLSelectElement;
					const templateSelect = contentEl.querySelector('#web-grabber-template-select') as HTMLSelectElement;

					const url = urlInput.value.trim();
					const parserId = parserSelect.value;
					const templateId = templateSelect.value;

					if (!url) {
						new Notice('Please enter a URL');
						return;
					}

					if (!parserId) {
						new Notice('Please select a parser');
						return;
					}

					if (!templateId) {
						new Notice('Please select a template');
						return;
					}

					this.onSubmit(url, parserId, templateId);
					this.close();
				}))
			.addButton(button => button
				.setButtonText('Cancel')
				.onClick(() => this.close()));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}