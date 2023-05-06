import React from "react";
import { Editor } from "ketcher-react";
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import { Ketcher } from "ketcher-core";

const structServiceProvider = new StandaloneStructServiceProvider();

type Props = {
	data: string;
	onInit: (ketcher: Ketcher) => void;
};

const KetcherReact = ({ data, onInit }: Props) => {
	return (
		<div className="ketcher-container">
			<Editor
				errorHandler={(_message: string) => {}}
				staticResourcesUrl="./"
				structServiceProvider={structServiceProvider}
				onInit={(ketcher: Ketcher) => {
					ketcher.setMolecule(data);
					onInit(ketcher);
				}}
			/>
		</div>
	);
};

export default KetcherReact;
