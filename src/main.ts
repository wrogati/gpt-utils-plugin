import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { TargetLanguageService } from "src/features/translate/targetLanguage.service";
import { TranslateContentCommand } from "src/features/translate/translateContent.command";
import { LANG_OPTIONS } from "./constants/settings";

export interface GPTSettings {
	openaiApiKey: string;
}

export interface langOptions {
	label: string;
	isoCode: string;
}

export interface TranslationOptionsSettings {
	targetLang: langOptions;
}

export interface AppPluginSettings {
	gptSettings: GPTSettings;
	translationOptionsSettings: TranslationOptionsSettings;
}

const DEFAULT_SETTINGS: AppPluginSettings = {
	gptSettings: {
		openaiApiKey: "empty",
	},
	translationOptionsSettings: {
		targetLang: {
			label: "empty",
			isoCode: "empty",
		},
	},
};

export default class GPTUtilPlugin extends Plugin {
	settings: AppPluginSettings;

	async onload() {
		await this.loadSettings();

		const translateContentCommand = new TranslateContentCommand(
			this,
			this.app,
			this.settings
		);

		await translateContentCommand.register();

		this.addSettingTab(new GPTUtilSettingTab(this.app, this));
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
	}
}

class GPTUtilSettingTab extends PluginSettingTab {
	plugin: GPTUtilPlugin;
	private targetLanguageService: TargetLanguageService;

	constructor(app: App, plugin: GPTUtilPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.targetLanguageService = new TargetLanguageService();
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h1", {
			text: "GPT Util",
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

		//preferences
		containerEl.createEl("h2", {
			text: "Translate Preferences",
		});

		new Setting(containerEl)
			.setName("Choose a target language")
			.setDesc("Select an option from the dropdown menu.")
			.addDropdown((dropdown) => {
				LANG_OPTIONS.forEach((option) => {
					dropdown.addOption(option.isoCode, option.label);
				});
				dropdown
					.setValue(
						this.plugin.settings.translationOptionsSettings
							.targetLang.isoCode
					)
					.onChange(async (value) => {
						this.plugin.settings.translationOptionsSettings.targetLang.isoCode =
							value;

						this.plugin.settings.translationOptionsSettings.targetLang.label =
							await this.targetLanguageService.setLabelTargetLang(
								value
							);
						await this.plugin.saveSettings();
					});
			});

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
