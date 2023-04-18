import { Ketcher } from "ketcher-core";
import { Notice, TextFileView } from "obsidian";
import React from "react";
import ReactDOM from "react-dom";
import KetcherComponent from "./KetcherComponent";
export const VIEW_TYPE_KET = "ket-view";

declare const ketcher: Ketcher;

export class KetView extends TextFileView {
	getViewData() {
		return this.data;
	}

	// If clear is set, then it means we're opening a completely different file.
	setViewData(data: string, clear: boolean) {
		this.data = data;

		ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
		const container = this.containerEl.children[1];
		ReactDOM.render(
			<React.StrictMode>
				<KetcherComponent data={this.data} />
			</React.StrictMode>,
			container
		);
	}

	clear() {}

	getViewType() {
		return VIEW_TYPE_KET;
	}

	async onOpen() {
		this.addAction("save", "Save", async (eventType) => {
			try {
				this.data = await ketcher.getKet();
				await this.save(); // will call `getViewData`
				new Notice("Successful save");
			} catch (error) {
				new Notice(error);
			}
		});
	}

	async onClose() {
		ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
	}
}
