import React from "react";
import { Editor } from "ketcher-react";
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import { Ketcher } from "ketcher-core";

const structServiceProvider = new StandaloneStructServiceProvider();

const KetcherView = () => {
	return (
		<div className="ketcher-container">
			<Editor
				errorHandler={(message: string) => {}}
				staticResourcesUrl="./"
				structServiceProvider={structServiceProvider}
				onInit={(ketcher: Ketcher) => {
					(global as any).ketcher = ketcher;
					window.parent.postMessage(
						{
							eventType: "init",
						},
						"*"
					);
				}}
			/>
		</div>
	);
};

export default KetcherView;
