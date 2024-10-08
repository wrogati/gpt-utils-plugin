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
		openaiApiKey: "",
	},
	translationOptionsSettings: {
		targetLang: {
			label: "",
			isoCode: "",
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
		
		new Setting(containerEl).setName('GPT util').setHeading()
	
		containerEl.createEl("span", {
			text: "Welcome to settings panel!",
		});

		containerEl.createEl("hr");

		containerEl.createEl("h4", {
			text: "GPT util settings:",
		});

		new Setting(containerEl)
			.setName("Your openAI api key")
			.setDesc("Api key for openAI")
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
			text: "Translate configurations",
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
			text: "Create an openAI api key tutorial:",
		});

		containerEl.createEl("a", {
			text: "Click here to official documentation",
			href: "https://platform.openai.com/docs/api-reference/introduction",
		});
	}
}
