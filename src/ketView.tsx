import { Ketcher } from "ketcher-core";
import { Notice, TFile, TextFileView } from "obsidian";
import React from "react";
import ReactDOM from "react-dom";
import KetcherReact from "./KetcherReact";

export const VIEW_TYPE_KET = "ket-view";

export class KetView extends TextFileView {
	ketcher: Ketcher;
	interval: number;

	getViewData() {
		return this.data;
	}

	setViewData(data: string, _clear: boolean) {
		this.data = data;

		// If clear is set, then it means we're opening a completely different file.
		if (_clear) {
			ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
			const container = this.containerEl.children[1];
			ReactDOM.render(
				<React.StrictMode>
					<KetcherReact
						data={this.data}
						onInit={(ketcher: Ketcher) => {
							this.ketcher = ketcher;
							// https://github.com/epam/ketcher/issues/2250
							// @ts-ignore
							global.ketcher = ketcher;
						}}
					/>
				</React.StrictMode>,
				container
			);
		}
		// Update the same file in other tabs/splits after `save()` is called
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

	async onLoadFile(file: TFile) {
		window.clearInterval(this.interval);
		this.interval = window.setInterval(
			async () => {
				try {
					this.data = await this.ketcher.getKet();
					await this.save(); // will call `getViewData`
				} catch (error) {
					new Notice(error);
				}
			}, 2 * 1000
		)
		return super.onLoadFile(file);
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
		ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
		window.clearInterval(this.interval)
	}
}
