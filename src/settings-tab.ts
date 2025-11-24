import { App, Plugin, Setting, TFile, PluginSettingTab, Notice } from 'obsidian';
import { WebGrabberSettings, TemplateConfig, ParserField } from './types';
import { ParserService } from './services/parser-service';

export class WebGrabberSettingTab extends PluginSettingTab {
	plugin: Plugin;
	settings: WebGrabberSettings;
	parserService: ParserService;

	constructor(app: App, plugin: Plugin, settings: WebGrabberSettings, parserService: ParserService) {
		super(app, plugin);
		this.plugin = plugin;
		this.settings = settings;
		this.parserService = parserService;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Web Grabber Settings' });

		// Parser Management Section
		const parserSection = containerEl.createDiv({ cls: 'web-grabber-collapsible-section' });
		const parserHeader = parserSection.createDiv({ cls: 'web-grabber-collapsible-header' });
		parserHeader.createEl('h3', { text: 'Parser Management' });
		parserHeader.createEl('button', { 
			text: '▼', 
			cls: 'web-grabber-collapse-button',
			attr: { 'data-section': 'parser' }
		});
		parserSection.createEl('p', { text: 'Manage your web content parsers. Each parser is a JavaScript file stored in the plugin directory.' });
		
		const parserContent = parserSection.createDiv({ 
			cls: 'web-grabber-collapsible-content',
			attr: { 'data-section': 'parser' }
		});

		// Get available parsers from the plugin
		const availableParsers = (this.plugin as any).getParsers() || new Map();

		// Display existing parsers
		if (availableParsers.size > 0) {
			parserContent.createEl('h4', { text: 'Available Parsers' });
			
			for (const [id, parser] of availableParsers) {
				const parserDiv = parserContent.createDiv({ cls: 'web-grabber-setting-item' });
				
				// Parser info
				const infoDiv = parserDiv.createDiv({ cls: 'web-grabber-parser-info' });
				infoDiv.createEl('h5', { text: parser.name });
				infoDiv.createEl('p', { text: `ID: ${parser.id}` });
				infoDiv.createEl('p', { text: `URL Pattern: ${parser.urlPattern}` });
				
				// Available fields as chips
				const parserFields = parser.getFields();
				if (parserFields && parserFields.length > 0) {
					const fieldsLabel = infoDiv.createEl('p', { text: 'Available Fields:' });
					fieldsLabel.style.marginTop = '10px';
					fieldsLabel.style.marginBottom = '8px';
					fieldsLabel.style.fontWeight = '500';
					fieldsLabel.style.color = 'var(--text-accent)';
					
					const fieldsContainer = infoDiv.createDiv({ cls: 'web-grabber-fields-chips' });
					parserFields.forEach((field: ParserField) => {
						const chip = fieldsContainer.createEl('span', { 
							text: `${field.name}`,
							cls: 'web-grabber-field-chip'
						});
						chip.title = field.description;
					});
				}
				
				// Parser controls
				const controlsDiv = parserDiv.createDiv({ cls: 'web-grabber-parser-controls' });
				
				// Enable/Disable toggle
				new Setting(controlsDiv)
					.setName('Enabled')
					.addToggle(toggle => toggle
						.setValue(this.settings.enabledParsers.includes(id))
						.onChange(async (value) => {
							if (value) {
								this.settings.enabledParsers.push(id);
							} else {
								this.settings.enabledParsers = this.settings.enabledParsers.filter(parserId => parserId !== id);
							}
							await (this.plugin as any).saveSettings();
						}));

				// Delete button
				new Setting(controlsDiv)
					.addButton(button => button
						.setButtonText('Delete Parser')
						.setWarning()
						.onClick(async () => {
							const confirmed = confirm(`Are you sure you want to delete the parser "${parser.name}"? This will permanently delete the parser file.`);
							if (confirmed) {
								const success = await (this.plugin as any).deleteParser(id);
								if (success) {
									this.display();
								}
							}
						}));
			}
		} else {
			parserContent.createEl('p', { text: 'No parsers found. Create a new parser below.' });
		}

		// Add new parser section
		parserContent.createEl('h4', { text: 'Add New Parser' });
		
		const newParserDiv = parserContent.createDiv({ cls: 'web-grabber-new-parser' });
		
		// Parser name input
		new Setting(newParserDiv)
			.setName('Parser Name')
			.setDesc('Display name for the parser')
			.addText(text => text
				.setPlaceholder('e.g., GitHub Parser')
				.setValue('')
				.inputEl.setAttribute('id', 'new-parser-name'));

		// Parser ID input
		new Setting(newParserDiv)
			.setName('Parser ID')
			.setDesc('Unique identifier (used for filename)')
			.addText(text => text
				.setPlaceholder('e.g., github')
				.setValue('')
				.inputEl.setAttribute('id', 'new-parser-id'));

		// URL Pattern input
		new Setting(newParserDiv)
			.setName('URL Pattern')
			.setDesc('Regex pattern to match URLs (e.g., /github\.com/)')
			.addText(text => text
				.setPlaceholder('/github\\.com/')
				.setValue('')
				.inputEl.setAttribute('id', 'new-parser-pattern'));

		// Create parser button
		new Setting(newParserDiv)
			.addButton(button => button
				.setButtonText('Create Parser')
				.setCta()
				.onClick(async () => {
					const nameInput = containerEl.querySelector('#new-parser-name') as HTMLInputElement;
					const idInput = containerEl.querySelector('#new-parser-id') as HTMLInputElement;
					const patternInput = containerEl.querySelector('#new-parser-pattern') as HTMLInputElement;

					const name = nameInput.value.trim();
					const id = idInput.value.trim();
					const pattern = patternInput.value.trim();

					if (!name || !id || !pattern) {
						new Notice('Please fill in all fields');
						return;
					}

					// Validate ID (should be valid filename)
					if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
						new Notice('Parser ID can only contain letters, numbers, underscores, and hyphens');
						return;
					}

					// Validate pattern (should be valid regex)
					try {
						new RegExp(pattern);
					} catch (error) {
						new Notice('Invalid URL pattern. Please enter a valid regex.');
						return;
					}

					const success = await (this.plugin as any).createParser(name, id, pattern);
					if (success) {
						// Clear inputs
						nameInput.value = '';
						idInput.value = '';
						patternInput.value = '';
						this.display();
					}
				}));

		// Templates section
		const templateSection = containerEl.createDiv({ cls: 'web-grabber-collapsible-section' });
		const templateHeader = templateSection.createDiv({ cls: 'web-grabber-collapsible-header' });
		templateHeader.createEl('h3', { text: 'Templates' });
		templateHeader.createEl('button', { 
			text: '▼', 
			cls: 'web-grabber-collapse-button',
			attr: { 'data-section': 'template' }
		});
		templateSection.createEl('p', { text: 'Configure templates for note creation. Templates are markdown files in your vault. Use {{variable_name}} to insert parsed data.' });
		
		const templateContent = templateSection.createDiv({ 
			cls: 'web-grabber-collapsible-content',
			attr: { 'data-section': 'template' }
		});

		for (let i = 0; i < this.settings.templates.length; i++) {
			const template = this.settings.templates[i];
			const templateDiv = templateContent.createDiv({ cls: 'web-grabber-setting-item' });
			
			const templateHeader = templateDiv.createEl('h4', { text: template.name });
			
			// Template name
			new Setting(templateDiv)
				.setName('Template Name')
				.addText((text: any) => text
					.setValue(template.name)
					.onChange(async (value: string) => {
						template.name = value;
						templateHeader.textContent = value; // Update header in real-time
						await (this.plugin as any).saveSettings();
					}));

			// Template file path with autocomplete
			const templateFileSetting = new Setting(templateDiv)
				.setName('Template File')
				.setDesc('Enter the path to a markdown file to use as template (with autocomplete)');
			
			// Create the autocomplete input
			const inputContainer = templateFileSetting.controlEl.createDiv({ cls: 'web-grabber-autocomplete-container' });
			const textInput = inputContainer.createEl('input', {
				type: 'text',
				value: template.filePath || '',
				placeholder: 'e.g., Templates/My Template.md',
				cls: 'web-grabber-autocomplete-input'
			});
			
			// Create autocomplete dropdown
			const dropdown = inputContainer.createDiv({ 
				cls: 'web-grabber-autocomplete-dropdown'
			});
			dropdown.style.display = 'none';
			
			// Add autocomplete functionality
			this.setupAutocomplete(textInput, dropdown, template, i);
			
			// Add refresh button
			templateFileSetting.addButton((button: any) => button
				.setButtonText('Refresh')
				.setTooltip('Refresh file list')
				.onClick(() => {
					this.display();
				}));

			// Delete template button
			new Setting(templateDiv)
				.addButton((button: any) => button
					.setButtonText('Delete Template')
					.setCta()
					.onClick(async () => {
						this.settings.templates.splice(i, 1);
						await (this.plugin as any).saveSettings();
						this.display();
					}));
		}

		// Add new template button
		new Setting(templateContent)
			.addButton((button: any) => button
				.setButtonText('Add New Template')
				.setCta()
				.onClick(async () => {
					// Generate a unique template name
					const templateCount = this.settings.templates.length;
					const templateName = `Template ${templateCount + 1}`;
					const templatePath = `Templates/${templateName}.md`;
					
					const newTemplate: TemplateConfig = {
						id: `template_${Date.now()}`,
						name: templateName,
						filePath: templatePath
					};
					this.settings.templates.push(newTemplate);
					await (this.plugin as any).saveSettings();
					this.display();
				}));

		// Import default templates button
		new Setting(templateContent)
			.addButton((button: any) => button
				.setButtonText('Import Default Templates')
				.setCta()
				.onClick(async () => {
					await (this.plugin as any).importDefaultTemplates();
					this.display();
				}));

		// Template help section
		templateContent.createEl('h4', { text: 'Template Help' });
		templateContent.createEl('p', { text: 'Use field names in your templates with {{field_name}} syntax. Available fields are shown as chips in the Parser Management section above.' });

		// Parser development info
		containerEl.createEl('h3', { text: 'Parser Development' });
		containerEl.createEl('p', { text: 'Parsers are JavaScript files stored in the plugin directory. Each parser should export a parser object with id, name, urlPattern, and parse function. You can create new parsers using the form above or manually create files in the plugin directory.' });
		
		const codeBlock = containerEl.createEl('pre', { cls: 'web-grabber-parser-example' });
		codeBlock.createEl('code', { text: `export const parser = {
    id: 'myparser',
    name: 'My Parser',
    urlPattern: /example\.com/,
    parse: (doc) => {
        return new MyParser(doc).parse();
    }
};

class MyParser {
    constructor(doc) {
        this.doc = doc;
        this.data = {};
    }
    
    parse() {
        this.data.title = this.getText('h1') || 'Untitled';
        this.data.content = this.getText('.content') || '';
        return this.data;
    }
    
    getText(selector) {
        const element = this.doc.querySelector(selector);
        return element ? element.textContent?.trim() || '' : '';
    }
}` });

		// Add collapse/expand functionality
		this.addCollapseFunctionality(containerEl);
	}

	private setupAutocomplete(input: HTMLInputElement, dropdown: HTMLElement, template: TemplateConfig, templateIndex: number): void {
		let selectedIndex = -1;
		let suggestions: TFile[] = [];

		const updateSuggestions = () => {
			const query = input.value.toLowerCase().trim();
			const markdownFiles = this.app.vault.getMarkdownFiles();
			
			// Filter files based on query
			suggestions = markdownFiles.filter(file => 
				file.path.toLowerCase().includes(query)
			);
			
			// Sort suggestions by relevance (exact matches first, then by path length)
			suggestions.sort((a, b) => {
				const aExact = a.path.toLowerCase() === query;
				const bExact = b.path.toLowerCase() === query;
				if (aExact && !bExact) return -1;
				if (!aExact && bExact) return 1;
				return a.path.length - b.path.length;
			});
			
			// Limit to 10 suggestions
			suggestions = suggestions.slice(0, 10);
			
			this.renderSuggestions(dropdown, suggestions, selectedIndex);
		};

		// Input event handlers
		input.addEventListener('input', () => {
			selectedIndex = -1;
			updateSuggestions();
		});

		input.addEventListener('focus', () => {
			updateSuggestions();
		});

		input.addEventListener('blur', (e) => {
			// Delay hiding to allow clicks on suggestions
			setTimeout(() => {
				dropdown.style.display = 'none';
				selectedIndex = -1;
			}, 150);
		});

		// Keyboard navigation
		input.addEventListener('keydown', (e) => {
			if (dropdown.style.display === 'none') return;

			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
					this.renderSuggestions(dropdown, suggestions, selectedIndex);
					break;
				case 'ArrowUp':
					e.preventDefault();
					selectedIndex = Math.max(selectedIndex - 1, -1);
					this.renderSuggestions(dropdown, suggestions, selectedIndex);
					break;
				case 'Enter':
					e.preventDefault();
					if (selectedIndex >= 0 && suggestions[selectedIndex]) {
						input.value = suggestions[selectedIndex].path;
						template.filePath = suggestions[selectedIndex].path;
						(this.plugin as any).saveSettings();
						dropdown.style.display = 'none';
						selectedIndex = -1;
					}
					break;
				case 'Escape':
					dropdown.style.display = 'none';
					selectedIndex = -1;
					break;
			}
		});

		// Save on change
		input.addEventListener('change', async () => {
			template.filePath = input.value;
			await (this.plugin as any).saveSettings();
		});
	}

	private renderSuggestions(dropdown: HTMLElement, suggestions: TFile[], selectedIndex: number): void {
		dropdown.empty();
		
		if (suggestions.length === 0) {
			dropdown.style.display = 'none';
			return;
		}
		
		dropdown.style.display = 'block';
		
		suggestions.forEach((file, index) => {
			const suggestion = dropdown.createDiv({ 
				cls: `web-grabber-autocomplete-suggestion ${index === selectedIndex ? 'selected' : ''}`,
				text: file.path
			});
			
			suggestion.addEventListener('click', () => {
				const input = dropdown.parentElement?.querySelector('.web-grabber-autocomplete-input') as HTMLInputElement;
				if (input) {
					input.value = file.path;
					// Find the template and update it
					const templateDiv = dropdown.closest('.web-grabber-setting-item');
					if (templateDiv) {
						const templateIndex = Array.from(templateDiv.parentElement?.children || []).indexOf(templateDiv);
						if (templateIndex >= 0 && this.settings.templates[templateIndex]) {
							this.settings.templates[templateIndex].filePath = file.path;
							(this.plugin as any).saveSettings();
						}
					}
					dropdown.style.display = 'none';
				}
			});
		});
	}

	private addCollapseFunctionality(containerEl: HTMLElement): void {
		const collapseButtons = containerEl.querySelectorAll('.web-grabber-collapse-button');
		
		collapseButtons.forEach(button => {
			button.addEventListener('click', () => {
				const section = button.getAttribute('data-section');
				const content = containerEl.querySelector(`[data-section="${section}"].web-grabber-collapsible-content`);
				
				if (content) {
					const isCollapsed = content.classList.contains('collapsed');
					
					if (isCollapsed) {
						content.classList.remove('collapsed');
						button.textContent = '▼';
					} else {
						content.classList.add('collapsed');
						button.textContent = '▶';
					}
				}
			});
		});
	}
}