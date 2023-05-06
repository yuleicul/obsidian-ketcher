import { App, PluginSettingTab, Setting } from "obsidian";
import ObsidianKetcher from "../main";

export default class KetcherSettingTab extends PluginSettingTab {
	plugin: ObsidianKetcher;

	constructor(app: App, plugin: ObsidianKetcher) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h1", { text: "General" });

		new Setting(containerEl)
			.setName("Ketcher folder")
			.setDesc("The location for new ket files.")
			.addText((text) =>
				text
					.setPlaceholder("Foldername")
					.setValue(this.plugin.settings.folder)
					.onChange(async (value) => {
						this.plugin.settings.folder = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
