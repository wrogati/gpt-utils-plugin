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
			hotkeys: [{ modifiers: ["Mod", "Ctrl"], key: ":" }],
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

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Sample Plugin",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Well na área");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new GPTUtilSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click sample", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
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
