import { Ketcher } from "ketcher-core";
import { Notice, TextFileView } from "obsidian";
import React from "react";
import ReactDOM from "react-dom";
import KetcherReact from "./KetcherReact";

export const VIEW_TYPE_KET = "ket-view";

export class KetView extends TextFileView {
	ketcher: Ketcher;
	subscriber: any;

	getViewData() {
		return this.data;
	}

	setViewData(data: string, _clear: boolean) {
		this.data = data;

		// If clear is set, then it means we're opening a completely different file.
		if (_clear) {
			this.ketcher?.editor.unsubscribe("change", this.subscriber);
			ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
			const container = this.containerEl.children[1];
			ReactDOM.render(
				<React.StrictMode>
					<KetcherReact
						data={this.data}
						onInit={(ketcher: Ketcher, subscriber: any) => {
							this.ketcher = ketcher;
							// https://github.com/epam/ketcher/issues/2250
							// @ts-ignore
							global.ketcher = ketcher;
							this.subscriber = subscriber;
						}}
						onChange={async () => {
							this.data = await this.ketcher.getKet();
							this.requestSave();
						}}
					/>
				</React.StrictMode>,
				container
			);
		}
		// Updates the same file in other tabs/splits after `save()` is called
		else {
			this.ketcher.setMolecule(this.data);
		}

	}

	clear() {}

	getViewType() {
		return VIEW_TYPE_KET;
	}

	getIcon() {
		return "ketcher";
	}

	getDisplayText() {
		return this.file?.basename ?? "ketcher";
	}

	async onOpen() {
		this.addAction("save", "Save", async (_eventType) => {
			try {
				this.data = await this.ketcher.getKet();
				await this.save(); // will call `getViewData`
				new Notice("Your structures/reactions have been saved."); // https://stackoverflow.design/content/examples/success-messages/
			} catch (error) {
				new Notice(error);
			}
		});
	}

	async onClose() {
		this.ketcher.editor.unsubscribe("change", this.subscriber);
		ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
	}
}
