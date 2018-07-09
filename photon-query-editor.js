import { LitElement, html } from '@polymer/lit-element';

import photonSharedStyles from './photon-shared-styles.js';

import '@material/mwc-button/mwc-button.js';

import PhotonWarpscriptExec from '@photon-elements/photon-iron/photon-warpscript-exec.js';

import '@granite-elements/ace-widget/ace-widget.js';

import './photon-ace-mode-warpscript.js';


/**
 * @customElement
 */
class PhotonQueryEditor extends LitElement {
  _render({warpscript, response, debug}) {
    return html`
      ${photonSharedStyles}
      ${this._renderElementStyles()}

      <div class='row'>
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
      </div>
      <div class='row flex-end'>
        <mwc-button icon="send" 
            on-click="${(evt) => this.execute()}"
            raised>Execute</mwc-button>
      </div>
      ${
        this.response ?
        this._renderResponseMetadata(this.response)
        : ''}
    `;
  }


  static get properties() {
    return {
      /**
       * The WarpScript script
       */
      warpscript: String,
      /**
        * The choosen backend
        *  The `backend` object is composed of:
        *
        *  - `id`: an unique id, a simple string to be used as HTML id
        *  - `label`: the label to show in the UI
        *  - `url`: the backend URL
        *  - `execEndpoint`: the path of the WarpScript execution endpoint
        *  - `findEndpoint`: the path of the Find endpoint
        *  - `updateEndpoint`: the path of the update endpoint
        *  - `deleteEndpoint`: the path of the delete endpoint
        *  - `headerName`: the Warp10 header name to add for different operations
        *
        *  @type Backend
        */
      backend: Object,
      /**
        * The default backend
        *  {
        *    "id": "default",
        *    "label": "Default backend",
        *    "url": "http://127.0.0.1:8080/api/v0",
        *    "execEndpoint": "/exec",
        *    "findEndpoint": "/find",
        *    "updateEndpoint": "/update",
        *    "deleteEndpoint": "/delete",
        *    "headerName": "X-Warp10-Token"
        *  }
        */
      defaultBackend: Object,
      /**
       * The WarpScript stack received as response
       */
      stack: Array,
      /**
       * Elapsed time for the call
       */
      elapsed: Number,
      response: Object,
      debug: Boolean,
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.warpscript = this.innerHTML || this.warpscript || '';
    this.$ = {
      editor: this.shadowRoot.querySelector('#editor'),
      warpscriptcaller: this.shadowRoot.querySelector('#warpscriptcaller'),
    };
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

  execute(evt) {
    if (this.debug) {
      console.debug('[photon-query-editor] Execute', this.warpscript);
    }
    PhotonWarpscriptExec
      .exec('https://warp10.bhs1.metrics.ovh.net/api/v0/exec', this.warpscript)
      .then((response) => this._handleResponse(response))
      .catch((error) => this._handleError(error));
  }

  _handleResponse(response) {
    if (this.debug) {
      console.log('[photon-query-editor] _handleResponse', response);
    }
    this.response = response;
  }

  _handleError(error) {
    if (this.debug) {
      console.log('[photon-query-editor] _handleError', error);
    }
    if (!error.errorLine || !error.errorMsg) {
      this.errorMsg = error;
    } else {
      this.errorMsg = 'ERROR line #' + error.errorLine + ': ' + error.errorMsg;
    }
    if (this.debug) {
      console.debug('[photon-query-editor] _handleError', {error: error, errorMsg: this.errorMsg});
    }
  }

  _formatElapsedTime(elapsed) {
    if (elapsed < 1000) {
      return `${this.elapsed} ns`;
    }
    if (elapsed < 1000000) {
      return `${(elapsed / 1000).toFixed(3)} μs`;
    }
    if (elapsed < 1000000000) {
      return `${(elapsed / 1000000).toFixed(3)} ms`;
    }
    return `${(this.elapsed / 1000000000).toFixed(3)} s`;
  }

  // ***************************************************************************
  // Renderers
  // ***************************************************************************

  _renderResponseMetadata() {
    return html`
      <div class="row flex-end">
          Your last script execution took ${this._formatElapsedTime(this.response.options.elapsed)} serverside, 
          fetched ${this.response.options.fetched}} datapoints and performed 
          ${this.response.options.operations} WarpScript operations.
      </div>
    `;
  }

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
