import {
	App,
	Editor,
	EditorPosition,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

import { GPTService } from "gtp.service";

export interface GPTSettings {
	openaiApiKey: string;
}

interface AppPluginSettings {
	mySetting: string;
	gptSettings: GPTSettings;
}

const DEFAULT_SETTINGS: AppPluginSettings = {
	mySetting: "default",
	gptSettings: {
		openaiApiKey: "defalt",
	},
};

export default class GTPUtilPlugin extends Plugin {
	settings: AppPluginSettings;

	async onload() {
		await this.loadSettings();

		const text = new GPTService(this.settings.gptSettings);

		this.addCommand({
			id: "translate-content",
			name: "Translate Content",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const sel = editor.getSelection();

				const contentTranslated = await text.textTranslate(sel);

				const selectionStart = editor.getCursor("from");
				const selectionEnd = editor.getCursor("to");

				const insertionPos: EditorPosition =
					this.comparePositions(selectionStart, selectionEnd) > 0
						? selectionStart
						: selectionEnd;

				editor.replaceRange(
					`\n\n**Translated to english:**\n${contentTranslated}`,
					insertionPos
				);
			},
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		console.log(`secret is saved: `, this.settings);
	}

	/**
	 * Function to compare two positions in the editor.
	 *
	 * @param pos1 - First position to be compared.
	 * @param pos2 - Second position to be compared.
	 * @returns Positive number if pos1 is after pos2, negative if before, or 0 if they are equal.
	 */
	comparePositions(pos1: EditorPosition, pos2: EditorPosition): number {
		if (pos1.line === pos2.line) {
			return pos1.ch - pos2.ch;
		} else {
			return pos1.line - pos2.line;
		}
	}
}

class GPTUtilSettingTab extends PluginSettingTab {
	plugin: GTPUtilPlugin;

	constructor(app: App, plugin: GTPUtilPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h1", {
			text: "GTP Util",
		});

		containerEl.createEl("span", {
			text: "Welcome to settings panel!",
		});

		containerEl.createEl("hr");

		containerEl.createEl("h4", {
			text: "GPT Util Settings:",
		});

		new Setting(containerEl)
			.setName("Your OpenAI API Key")
			.setDesc("API Key for OpenAI")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.gptSettings.openaiApiKey)
					.onChange(async (value) => {
						this.plugin.settings.gptSettings.openaiApiKey = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("hr");

		//help section
		containerEl.createEl("h2", {
			text: "Help",
		});

		containerEl.createEl("h4", {
			text: "Create an OpenAI API Key Tutorial:",
		});

		containerEl.createEl("a", {
			text: "Click here to official documentation",
			href: "https://platform.openai.com/docs/api-reference/introduction",
		});
	}
}
