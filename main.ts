import {
	App,
	Modal,
	Notice,
	Plugin,
	TFile,
	TFolder,
	WorkspaceLeaf,
	addIcon,
	normalizePath,
} from "obsidian";
import { KetView, VIEW_TYPE_KET } from "src/ketView";
import KetcherSettingTab from "src/KetcherSettingTab";

interface PluginSettings {
	folder: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	folder: "Ketcher",
};

export default class ObsidianKetcher extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(VIEW_TYPE_KET, (leaf) => new KetView(leaf));
		this.registerExtensions(["ket"], VIEW_TYPE_KET);

		addIcon(
			"ketcher",
			// https://svgedit.netlify.app/editor/index.html?storagePrompt=false
			`
			<path fill="currentColor" clip-rule="evenodd" d="m47.75,2.91c1.93,-1.1 4.22,-1.1 6.15,0l35.56,20.84c1.93,1.1 3.07,3.12 3.07,5.32l-0.33,42.81c0,2.2 -1.15,4.22 -3.07,5.32l-35.26,20.27c-1.93,1.1 -4.22,1.1 -6.15,0l-36.21,-20.35c-1.88,-1.1 -3.03,-3.12 -3.03,-5.32l0,-43.72c0,-2.2 1.15,-4.22 3.03,-5.32l36.23,-19.86zm-31.8,27.39l0,40.24l34.88,20.1l34.83,-20.1l0,-40.24l-34.83,-20.15l-34.88,20.15z" fill-rule="evenodd" />
     		<path fill="currentColor" d="m74.14,36.96l0,26.89l6.15,3.53l0,-34l-6.15,3.58zm-23.31,-20.56l-29.46,16.98l6.1,3.53l23.36,-13.45l0,-7.07l0,0zm-29.46,50.98l29.46,17.02l0,-7.07l-23.36,-13.49l-6.1,3.53z" />
			`
		);

		this.addRibbonIcon("ketcher", "Create new structure", () => {
			this.createAndOpenDrawing(
				`Ketcher ${new Date()
					.toLocaleString("en-US", { hour12: false })
					.replace(/\//g, "-")
					.replace(/:/g, ".")
					.replace(/,/, "")}.ket`
			);
		});

		this.addSettingTab(new KetcherSettingTab(this.app, this));
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
		const folderPath = normalizePath(foldername || this.settings.folder);
		await this.checkAndCreateFolder(folderPath); //create folder if it does not exist
		const fname = normalizePath(`${folderPath}/${filename}`);
		console.log(fname);
		const file = await this.app.vault.create(fname, initData ?? "");

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

	public openDrawing(
		drawingFile: TFile,
		active: boolean = false,
		subpath?: string
	) {
		let leaf: WorkspaceLeaf;
		leaf = app.workspace.getLeaf("tab");

		leaf.openFile(
			drawingFile,
			!subpath || subpath === ""
				? { active }
				: { active, eState: { subpath } }
		);
	}
}
