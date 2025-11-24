import { Plugin, PluginSettingTab } from 'obsidian';
import { WebGrabberSettings } from './types';
import { WebGrabberSettingTab } from './settings-tab';
import { WebGrabberModal } from './modal';
import { WebScraperService } from './services/web-scraper';
import { ParserService } from './services/parser-service';
import { TemplateService } from './services/template-service';

const DEFAULT_SETTINGS: WebGrabberSettings = {
	templates: [],
	enabledParsers: ['archiveofourown', 'generic', 'reddit']
};

export default class WebGrabberPlugin extends Plugin {
	settings: WebGrabberSettings;
	private parserService: ParserService;
	private templateService: TemplateService;
	private webScraperService: WebScraperService;
	private settingTab: WebGrabberSettingTab;

	async onload() {
		await this.loadSettings();
		
		// Initialize services
		this.parserService = new ParserService(this.app);
		this.templateService = new TemplateService(this.app, this.settings);
		this.webScraperService = new WebScraperService(this.app, this.settings, this.parserService.getParsers());
		
		// Load parsers
		await this.parserService.loadParsers();
		
		// Update web scraper with loaded parsers
		this.webScraperService = new WebScraperService(this.app, this.settings, this.parserService.getParsers());

		// Add ribbon icon
		this.addRibbonIcon('globe', 'Web Grabber', () => {
			this.showModal();
		});

		// Add command
		this.addCommand({
			id: 'web-grabber-open',
			name: 'Open Web Grabber',
			callback: () => {
				this.showModal();
			}
		});

		// Add settings tab
		this.settingTab = new WebGrabberSettingTab(this.app, this, this.settings, this.parserService);
		this.addSettingTab(this.settingTab);
	}

	onunload() {
		// Cleanup if needed
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private showModal() {
		new WebGrabberModal(this.app, this.settings, this.parserService.getParsers(), (url, parserId, templateId) => {
			this.webScraperService.createNoteFromUrl(url, parserId, templateId);
		}).open();
	}

	// Public methods for services to use
	async importDefaultTemplates(): Promise<void> {
		await this.templateService.importDefaultTemplates();
		await this.saveSettings();
	}

	async deleteParser(parserId: string): Promise<boolean> {
		return await this.parserService.deleteParser(parserId);
	}

	async createParser(name: string, id: string, urlPattern: string): Promise<boolean> {
		return await this.parserService.createParser(name, id, urlPattern);
	}

	getParsers() {
		return this.parserService.getParsers();
	}

	getEnabledParsers() {
		return this.parserService.getEnabledParsers(this.settings.enabledParsers);
	}
}