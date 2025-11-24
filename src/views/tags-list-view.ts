import { ItemView, WorkspaceLeaf, Notice } from 'obsidian';
import { Parser } from '../types';
import { ParserService } from '../services/parser-service';

export const TAGS_LIST_VIEW_TYPE = 'web-grabber-tags-list';

export class TagsListView extends ItemView {
	private parserService: ParserService;

	constructor(leaf: WorkspaceLeaf, parserService: ParserService) {
		super(leaf);
		this.parserService = parserService;
	}

	getViewType(): string {
		return TAGS_LIST_VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'Tags List';
	}

	getIcon(): string {
		return 'tags';
	}

	async onOpen(): Promise<void> {
		await this.render();
	}

	async onClose(): Promise<void> {
		// Cleanup if needed
	}

	private async render(): Promise<void> {
		const container = this.containerEl.children[1];
		container.empty();

		const content = container.createDiv({ cls: 'web-grabber-tags-list-container' });

		// Header
		const header = content.createDiv({ cls: 'web-grabber-tags-list-header' });
		header.createEl('h2', { text: 'Parser Fields' });
		header.createEl('p', { 
			text: 'Click on any field chip to copy it to clipboard with {{ }} syntax',
			cls: 'web-grabber-tags-list-description'
		});

		// Get all parsers
		const parsers = this.parserService.getParsers();

		if (parsers.size === 0) {
			content.createEl('p', { 
				text: 'No parsers available. Add parsers in settings.',
				cls: 'web-grabber-tags-list-empty'
			});
			return;
		}

		// Render each parser
		for (const [id, parser] of parsers) {
			const parserSection = content.createDiv({ cls: 'web-grabber-tags-list-parser' });
			
			// Parser header
			const parserHeader = parserSection.createDiv({ cls: 'web-grabber-tags-list-parser-header' });
			parserHeader.createEl('h3', { text: parser.name });
			parserHeader.createEl('p', { 
				text: `ID: ${parser.id}`,
				cls: 'web-grabber-tags-list-parser-id'
			});

			// Get fields
			const fields = parser.getFields ? parser.getFields() : [];

			if (fields.length === 0) {
				parserSection.createEl('p', { 
					text: 'No fields available for this parser.',
					cls: 'web-grabber-tags-list-no-fields'
				});
				continue;
			}

			// Fields label
			const fieldsLabel = parserSection.createEl('p', { 
				text: 'Available Fields:',
				cls: 'web-grabber-tags-list-fields-label'
			});

			// Fields chips container
			const fieldsContainer = parserSection.createDiv({ cls: 'web-grabber-fields-chips' });

			// Create chips for each field
			fields.forEach((field) => {
				const chip = fieldsContainer.createEl('span', {
					text: field.name,
					cls: 'web-grabber-field-chip web-grabber-field-chip-clickable'
				});
				
				// Tooltip with description
				if (field.description) {
					chip.title = field.description;
				}

				// Click handler to copy to clipboard
				chip.addEventListener('click', async () => {
					const fieldName = `{{${field.name}}}`;
					await navigator.clipboard.writeText(fieldName);
					new Notice(`Copied ${fieldName} to clipboard`);
					
					// Visual feedback
					chip.classList.add('web-grabber-field-chip-copied');
					setTimeout(() => {
						chip.classList.remove('web-grabber-field-chip-copied');
					}, 500);
				});
			});
		}
	}
}

