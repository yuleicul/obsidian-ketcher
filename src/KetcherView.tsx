import React from "react";
import { ButtonsConfig, Editor } from 'ketcher-react'
import { StandaloneStructServiceProvider } from 'ketcher-standalone'
import { Ketcher } from 'ketcher-core'

  const structServiceProvider =
    new StandaloneStructServiceProvider()
  

export const KetcherView = () => {
  return <Editor
  staticResourcesUrl='./'
  structServiceProvider={structServiceProvider}
  onInit={(ketcher: Ketcher) => {
    ;(global as any).ketcher = ketcher
    window.parent.postMessage(
      {
        eventType: 'init'
      },
      '*'
    )
  }}
/>
};