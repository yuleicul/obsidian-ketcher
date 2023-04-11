import { ItemView, WorkspaceLeaf } from "obsidian";
import React from "react";
import ReactDOM from "react-dom";
import KetcherView from "./KetcherView";

export const VIEW_TYPE_EXAMPLE = "example-view";

export class ExampleView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		return "Example view";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		ReactDOM.render(
			<React.StrictMode>
				<KetcherView />
			</React.StrictMode>,
			container
		);
	}

	async onClose() {
		ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
	}
}
