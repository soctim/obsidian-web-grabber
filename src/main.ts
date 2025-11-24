import { Plugin, PluginSettingTab } from 'obsidian';
import { WebGrabberSettings } from './types';
import { WebGrabberSettingTab } from './settings-tab';
import { WebGrabberModal } from './modal';
import { WebScraperService } from './services/web-scraper';
import { ParserService } from './services/parser-service';
import { TemplateService } from './services/template-service';
import { TagsListView, TAGS_LIST_VIEW_TYPE } from './views/tags-list-view';

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

		// Register view
		this.registerView(
			TAGS_LIST_VIEW_TYPE,
			(leaf) => new TagsListView(leaf, this.parserService)
		);

		// Add commands
		this.addCommand({
			id: 'web-grabber-open',
			name: 'Open Web Grabber',
			callback: () => {
				this.showModal();
			}
		});

		this.addCommand({
			id: 'web-grabber-open-tags-list',
			name: 'Open tags list',
			callback: () => {
				this.openTagsListView();
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

	private async openTagsListView() {
		const { workspace } = this.app;

		// Check if view already exists
		let leaf = workspace.getLeavesOfType(TAGS_LIST_VIEW_TYPE)[0];

		if (!leaf) {
			// Create new leaf on the right side
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				await rightLeaf.setViewState({
					type: TAGS_LIST_VIEW_TYPE,
					active: true,
				});
				leaf = rightLeaf;
			} else {
				// Fallback: create a new leaf
				leaf = workspace.getLeaf(true);
				await leaf.setViewState({
					type: TAGS_LIST_VIEW_TYPE,
					active: true,
				});
			}
		}

		// Reveal the leaf
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
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