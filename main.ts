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

import {
	GPTService,
	OpenAIAPIKeyMisConfigurationException,
	TargetLangMisConfigurationException,
} from "gtp.service";
import { TargetLanguageSettingModal } from "targetLanguage.modal";
import { TargetLanguageService } from "targetLanguage.service";
import { OpenAIAPIKeySettingModal } from "openAIApiKeySettings.modal";
import { TranslateContentCommand } from "translateContent.command";

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

const OPTIONS = [
	{ label: "Empty", isoCode: "empty" },
	{ label: "English", isoCode: "en" },
	{ label: "Portuguese Brazil", isoCode: "pt-br" },
	{ label: "Espanhol", isoCode: "es" },
];

export default class GTPUtilPlugin extends Plugin {
	settings: AppPluginSettings;

	async onload() {
		console.log(`estou vivo`);
		await this.loadSettings();

		const translateContentCommand = new TranslateContentCommand(
			this,
			this.app,
			this.settings,
			OPTIONS
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
	plugin: GTPUtilPlugin;
	private targetLanguageService: TargetLanguageService;

	constructor(app: App, plugin: GTPUtilPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.targetLanguageService = new TargetLanguageService();
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

		//preferences
		containerEl.createEl("h2", {
			text: "Translate Preferences",
		});

		// new Setting(containerEl)
		// 	.setName("Origin Language")
		// 	.setDesc("Text language will auto detected.")
		// 	.addToggle((toggle) =>
		// 		toggle
		// 			.setValue(
		// 				this.plugin.settings.translationOptionsSettings
		// 					.targetLang.label
		// 			)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.translationOptionsSettings.targetLang.label =
		// 					value;
		// 				await this.plugin.saveSettings();
		// 			})
		// 	);

		new Setting(containerEl)
			.setName("Choose a target language")
			.setDesc("Select an option from the dropdown menu.")
			.addDropdown((dropdown) => {
				OPTIONS.forEach((option) => {
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
								value,
								OPTIONS
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
