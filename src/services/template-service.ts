import { App, Notice } from 'obsidian';
import { WebGrabberSettings, TemplateConfig, DEFAULT_TEMPLATES } from '../types';

export class TemplateService {
	private app: App;
	private settings: WebGrabberSettings;

	constructor(app: App, settings: WebGrabberSettings) {
		this.app = app;
		this.settings = settings;
	}

	async importDefaultTemplates(): Promise<void> {
		try {
			// Create Templates directory if it doesn't exist
			const templatesDir = 'Templates';
			const templatesFolder = this.app.vault.getAbstractFileByPath(templatesDir);
			if (!templatesFolder) {
				await this.app.vault.createFolder(templatesDir);
			}

			let importedCount = 0;
			for (const template of DEFAULT_TEMPLATES) {
				// Check if template file already exists
				const existingFile = this.app.vault.getAbstractFileByPath(template.filePath);
				if (existingFile) {
					console.log(`Template file already exists: ${template.filePath}`);
					continue;
				}

				// Create template file
				await this.app.vault.create(template.filePath, template.content);
				importedCount++;

				// Add to settings if not already present
				const existingTemplate = this.settings.templates.find(t => t.id === template.id);
				if (!existingTemplate) {
					this.settings.templates.push({
						id: template.id,
						name: template.name,
						filePath: template.filePath
					});
				}
			}

			new Notice(`Imported ${importedCount} default templates to ${templatesDir}/`);
		} catch (error) {
			console.error('Error importing default templates:', error);
			new Notice('Error importing default templates. Check console for details.');
		}
	}

	addTemplate(name: string, filePath: string): TemplateConfig {
		const newTemplate: TemplateConfig = {
			id: `template_${Date.now()}`,
			name: name,
			filePath: filePath
		};
		
		this.settings.templates.push(newTemplate);
		return newTemplate;
	}

	removeTemplate(templateId: string): boolean {
		const index = this.settings.templates.findIndex(t => t.id === templateId);
		if (index !== -1) {
			this.settings.templates.splice(index, 1);
			return true;
		}
		return false;
	}

	getTemplate(templateId: string): TemplateConfig | undefined {
		return this.settings.templates.find(t => t.id === templateId);
	}

	getAllTemplates(): TemplateConfig[] {
		return [...this.settings.templates];
	}

	updateTemplate(templateId: string, updates: Partial<TemplateConfig>): boolean {
		const template = this.settings.templates.find(t => t.id === templateId);
		if (template) {
			Object.assign(template, updates);
			return true;
		}
		return false;
	}
}