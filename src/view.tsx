import { ItemView, WorkspaceLeaf } from "obsidian";
import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { KetcherView } from './KetcherView'

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
    container.empty();
    container.createEl("h4", { text: "Example view" });

    const root = createRoot(this.containerEl.children[1]);
    root.render(
      <React.StrictMode>
        <KetcherView />
      </React.StrictMode>
    );
  }

  async onClose() {
    // Nothing to clean up.
    ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
  }
}