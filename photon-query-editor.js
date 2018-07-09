import { LitElement, html } from '@polymer/lit-element';

import photonSharedStyles from './photon-shared-styles.js';

import '@photon-elements/photon-iron/photon-warpscript-caller.js';

import '@granite-elements/ace-widget/ace-widget.js';

import './photon-ace-mode-warpscript.js';

/**
 * @customElement
 */
class PhotonQueryEditor extends LitElement {
  _render({warpscript, debug}) {
    return html`
      ${photonSharedStyles}
      ${this._renderElementStyles()}
      <photon-warpscript-caller 
          id="warpscriptcaller"
          url="${this._baseUrl}" warpscript="${this.warpscript}"
          on-response="${(evt) => this._handleResponse(evt)}" 
          on-error="${(evt) => this._handleError(evt)}"
          debug="${this.debug}"
          parse-response></photon-warpscript-caller>

      <ace-widget
          id="editor"
          theme="ace/theme/eclipse"
          mode="ace/mode/warpscript"
          softtabs="true"
          wrap="true"
          placeholder="Type your WarpScript here..."
          on-editor-content="${(evt) => this.editorChangeAction(evt)}"
          initial-focus
          value="${this.warpscript}"
          debug="${this.debug}"> 
      </ace-widget>   
    `;
  }


  static get properties() {
    return {
      /**
       * The WarpScript script
       */
      warpscript: String,
      debug: Boolean,
    };
  }

  ready() {
    super.ready();
    this.warpscript = this.innerHTML || this.warpscript || '';
  }

  // ***************************************************************************
  // Event listeners
  // ***************************************************************************
  editorChangeAction(evt) {
    if (this.warpscript === evt.detail.value) {
      return;
    }
    this.warpscript = evt.detail.value;
    if (this.debug) {
      console.debug('[photon-query-editor] editorChangeAction', this.warpscript);
    }
  }

  // ***************************************************************************
  // Renderers
  // ***************************************************************************

  _renderSlot() {
    return this.innerHTML || this.warpscript || '';
  }

  _renderElementStyles() {
    return html`
    <style>
      :host {
        display: block;
        padding: 30px;
        --app-secondary-color: black;
      }
      
      *:hidden {
        visibility: hidden;
      }

      .title {
        text-transform: capitalize;
      }

      .button_bar {
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }

      .clearfix:before,
      .clearfix:after {
        content: " "; /* 1 */
        display: table; /* 2 */
      }

      .clearfix:after {
        clear: both;
      }
      
      .top-10 {
        margin-top: 10px;
      }

      photon-response[hidden] {
        display: none;
      }
      granite-alert[hidden] {
        display: none;
      }
      paper-button {
        background-color: var(--app-primary-color);
        color: var(--app-primary-contrast);
        margin: 5px;
      }
      paper-button iron-icon {
        padding-right: 10px;
      }

      granite-spinner {
        z-index: 100;
      }

      .currentBackend {
        float: right;
        display: flex;
        flex-flow: row;
        align-items: center;
      }
      .currentBackendInfo{
        display: flex;
        flex-flow: column;
      }
      .currentBackendTitle {
        display: flex;
        flex-flow: row;
        align-items: center;
      }
      .currentBackendLabel {
        font-size: 1em;
        font-weight: bold;
      }
      .currentBackendValue {
        font-size: 0.8em;
        font-family: monospace;
      }
      .currentBackendEdit {
        color: var(--primary-color);
        margin-right: 0.5em;
        cursor: pointer;
      }
    </style>
    `;
  }
}

window.customElements.define('photon-query-editor', PhotonQueryEditor);
