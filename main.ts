import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TAbstractFile,
	TFile,
	TFolder,
	Vault,
	WorkspaceLeaf,
	addIcon,
	normalizePath,
} from "obsidian";
import { ExampleView, VIEW_TYPE_EXAMPLE } from "src/view";
// Remember to rename these classes and interfaces!

interface PluginSettings {
	folder: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	folder: "Ketcher",
};

const FRONTMATTER_KEY = "excalidraw-plugin";

export default class ObsidianKetcher extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(VIEW_TYPE_EXAMPLE, (leaf) => new ExampleView(leaf));

		addIcon(
			"ketcher",
			// https://svgedit.netlify.app/editor/index.html?storagePrompt=false
			`
			<path fill="currentColor" clip-rule="evenodd" d="m47.75,2.91c1.93,-1.1 4.22,-1.1 6.15,0l35.56,20.84c1.93,1.1 3.07,3.12 3.07,5.32l-0.33,42.81c0,2.2 -1.15,4.22 -3.07,5.32l-35.26,20.27c-1.93,1.1 -4.22,1.1 -6.15,0l-36.21,-20.35c-1.88,-1.1 -3.03,-3.12 -3.03,-5.32l0,-43.72c0,-2.2 1.15,-4.22 3.03,-5.32l36.23,-19.86zm-31.8,27.39l0,40.24l34.88,20.1l34.83,-20.1l0,-40.24l-34.83,-20.15l-34.88,20.15z" fill-rule="evenodd" />
     		<path fill="currentColor" d="m74.14,36.96l0,26.89l6.15,3.53l0,-34l-6.15,3.58zm-23.31,-20.56l-29.46,16.98l6.1,3.53l23.36,-13.45l0,-7.07l0,0zm-29.46,50.98l29.46,17.02l0,-7.07l-23.36,-13.49l-6.1,3.53z" />
			`
		);

		this.addRibbonIcon("ketcher", "Ketcher", () => {
			// this.activateView();
			this.createAndOpenDrawing(`${Date.now()}.ket`);
			// this.app.workspace.iterateAllLeaves((leaf) => {
			// 	console.log(leaf.getViewState().type);
			// });
		});

		// // This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
		// 	// Called when the user clicks the icon.
		// 	new Notice('This is a notice(ketcher)!');
		// });
		// // Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text ketcher");

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
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);
	}

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

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_EXAMPLE,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0]
		);
	}

	async createAndOpenDrawing(
		filename: string,
		foldername?: string,
		initData?: string
	): Promise<string> {
		const file = await this.createDrawing(filename, foldername, initData);
		this.openDrawing(file, true);
		return file.path;
	}

	async createDrawing(
		filename: string,
		foldername?: string,
		initData?: string
	): Promise<TFile> {
		const folderpath = normalizePath(
			foldername ? foldername : this.settings.folder
		);
		await this.checkAndCreateFolder(folderpath); //create folder if it does not exist
		const fname = this.getNewUniqueFilepath(
			this.app.vault,
			filename,
			folderpath
		);
		console.log("fname", fname);
		const file = await this.app.vault.create(
			fname,
			initData ??
				`{
			"root": {
				"nodes": []
			}
		}`
		);

		//wait for metadata cache
		// let counter = 0;
		// while (
		// 	file instanceof TFile &&
		// 	!this.isExcalidrawFile(file) &&
		// 	counter++ < 10
		// ) {
		// 	await sleep(50);
		// }

		// if (counter > 10) {
		// 	// errorlog({
		// 	// 	file,
		// 	// 	error: "new drawing not recognized as an excalidraw file",
		// 	// 	fn: this.createDrawing,
		// 	// });
		// 	console.log(`counter > 10`);
		// }

		return file;
	}

	async checkAndCreateFolder(folderPath: string) {
		const vault = app.vault;
		folderPath = normalizePath(folderPath);
		//https://github.com/zsviczian/obsidian-excalidraw-plugin/issues/658
		//@ts-ignore
		const folder = vault.getAbstractFileByPathInsensitive(folderPath);
		if (folder && folder instanceof TFolder) {
			return;
		}
		if (folder && folder instanceof TFile) {
			new Notice(
				`The folder cannot be created because it already exists as a file: ${folderPath}.`
			);
		}
		await vault.createFolder(folderPath);
	}

	getNewUniqueFilepath(
		vault: Vault,
		filename: string,
		folderpath: string
	): string {
		let fname = normalizePath(`${folderpath}/${filename}.md`);
		// let file: TAbstractFile = vault.getAbstractFileByPath(fname);
		// let i = 0;
		// const extension = filename.endsWith(".excalidraw.md")
		// 	? ".excalidraw.md"
		// 	: filename.slice(filename.lastIndexOf("."));
		// while (file) {
		// 	fname = normalizePath(
		// 		`${folderpath}/${filename.slice(
		// 			0,
		// 			filename.lastIndexOf(extension)
		// 		)}_${i}${extension}`
		// 	);
		// 	i++;
		// 	file = vault.getAbstractFileByPath(fname);
		// }
		return fname;
	}

	public isExcalidrawFile(f: TFile) {
		if (!f) return false;
		if (f.extension === "excalidraw") {
			return true;
		}
		const fileCache = f ? this.app.metadataCache.getFileCache(f) : null;
		return (
			!!fileCache?.frontmatter && !!fileCache.frontmatter[FRONTMATTER_KEY]
		);
	}

	public openDrawing(
		drawingFile: TFile,
		active: boolean = false,
		subpath?: string
	) {
		// if(location === "md-properties") {
		//   location = "new-tab";
		// }
		let leaf: WorkspaceLeaf;
		// if(location === "popout-window") {
		//   leaf = app.workspace.openPopoutLeaf();
		// }
		// if(location === "new-tab") {
		leaf = app.workspace.getLeaf("tab");
		// }
		// if(!leaf) {
		//   leaf = this.app.workspace.getLeaf(false);
		//   if ((leaf.view.getViewType() !== 'empty') && (location === "new-pane")) {
		// 	leaf = getNewOrAdjacentLeaf(this, leaf)
		//   }
		// }

		leaf.openFile(
			drawingFile,
			!subpath || subpath === ""
				? { active }
				: { active, eState: { subpath } }
		);
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

class SampleSettingTab extends PluginSettingTab {
	plugin: ObsidianKetcher;

	constructor(app: App, plugin: ObsidianKetcher) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
