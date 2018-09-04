import { LitElement, html } from '@polymer/lit-element';

import photonSharedStyles from './photon-shared-styles';

import '@material/mwc-button/mwc-button';

import PhotonWarpscriptExec from '@photon-elements/photon-tools/photon-warpscript-exec';

import '@granite-elements/ace-widget/ace-widget';
import '@granite-elements/granite-alert/granite-alert';
import '@granite-elements/granite-yaml/granite-yaml-remote-parser';

import './photon-ace-mode-warpscript';

import './photon-response-inspector/photon-response-inspector';
import './photon-response-plot/photon-response-plot';

import './photon-backend-chooser/photon-backend-info';

import shortcuts from '@lostinbrittany/shortcuts';

/**
 * @customElement
 */
class PhotonQueryEditor extends LitElement {
  _render({warpscript, backend, response, debug, _plottedPaths}) {
    console.log('rendering backend', backend)
    return html`
      ${photonSharedStyles}
      ${this._renderElementStyles()}

          <slot></slot>
      <div class='row'>
        <ace-widget
            id="editor"
            theme="ace/theme/eclipse"
            mode="ace/mode/warpscript"
            softtabs="true"
            wrap="true"
            placeholder="Type your WarpScript here..."
            on-editor-content="${(evt) => this.editorChangeAction(evt)}"
            on-keypress="${(evt) => evt.stopPropagation()}"
            on-keydown="${(evt) => evt.stopPropagation()}"
            on-keyup="${(evt) => evt.stopPropagation()}"
            initial-focus
            value="${warpscript}"
            debug="${debug}"> 
        </ace-widget>   
      </div>
      <div class='row flex-end'>
        <mwc-button icon="send" 
            on-click="${(evt) => this.execute()}"
            raised>Execute</mwc-button>
      </div>
      ${
        this.response ?
        this._renderResponse(response, _plottedPaths)
        : ''}
    `;
  }


  /**
   * Fired when an execution is done
   *
   * @event exec
   * @param {string} warpscript The warpscript being executed
   * @param {object} backend The backend where the warpscript is executed
   */


  /**
   * Properties
   */
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
       * Elapsed time for the call
       */
      elapsed: Number,
      response: Object,
      debug: Boolean,
      /**
       * The paths of the timeseries to plot
       */
      _plottedPaths: Array,
    };
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.debug) {
      console.debug('[photon-query-editor] connectedCallback');
    }
    this.warpscript = this.innerHTML || this.warpscript || '';
    this.$ = {
      editor: this.shadowRoot.querySelector('#editor'),
      warpscriptcaller: this.shadowRoot.querySelector('#warpscriptcaller'),
    };
    this.removeAttribute('cloak');

    this._setHotkeys()
  }

  _setHotkeys() {
    this._pressedHotkeys = {};

    // Execute
    shortcuts.add('ctrl+e', (evt) => {
        this.hotkeyHandlerWrapper(evt, 'execute', () => this.execute());
      },
      this.$.editor
    );
  }

  hotkeyHandlerWrapper(evt, hotkey, callback) {
    console.log('[photon-query-editor] hotkeyHandlerWrapper', hotkey)
    evt.preventDefault();
    if (this._pressedHotkeys[hotkey]) {
      return;
    }
    this._pressedHotkeys[hotkey] = true;
    callback();
    setTimeout(() => this._pressedHotkeys[hotkey] = false, 2000);
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
    this.dispatchEvent(new CustomEvent('exec', {
      detail: {
        warpscript: this.warpscript,
        backend: this.backend,
      },
      bubbles: true,
      composed: true,
    }));
    PhotonWarpscriptExec
      .exec(`${this.backend.url}${this.backend.execEndpoint}`, this.warpscript)
      .then((response) => this._handleResponse(response))
      .catch((error) => this._handleError(error));
  }

  _handleResponse(response) {
    if (this.debug) {
      console.log('[photon-query-editor] _handleResponse', response);
    }
    this.dispatchEvent(new CustomEvent('response', {
      detail: {
        warpscript: this.warpscript,
        backend: this.backend,
        response: this.response,
      },
      bubbles: true,
      composed: true,
    }));
    this.response = response;
    if (this._plottedPaths) {
      let plottedPaths = {};
      Object.entries(this._plottedPaths).forEach((kv) => plottedPaths[kv[0]] = []);
      this._plottedPaths= plottedPaths;
    }
  }

  _handleError(error) {
    if (this.debug) {
      console.log('[photon-query-editor] _handleError', error);
    }
    this.dispatchEvent(new CustomEvent('error', {
      detail: {
        warpscript: this.warpscript,
        backend: this.backend,
        error: error,
      },
      bubbles: true,
      composed: true,
    }));
    this.response = error;

    if (this.debug) {
      console.debug('[photon-query-editor] _handleError', this.response);
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

  _renderResponse() {
    return html`
      ${this._renderResponseMetadata()}
      ${this._renderResponseData()}
      ${this._renderError()}
    `;
  }

  _renderResponseMetadata() {
    return html`
      <div class="row flex-end">
          Your last script execution took ${this._formatElapsedTime(this.response.options.elapsed)} serverside, 
          fetched ${this.response.options.fetched} datapoints and performed 
          ${this.response.options.operations} WarpScript operations.
      </div>
    `;
  }

  _renderResponseData() {
    if (!this.response.errorLine && !this.response.errorMsg) {
      return html`

      <div class="row">
        <photon-response-inspector 
            stack=${this.response.stack}
            on-plotted-changed='${(evt) => {
              this._plottedPaths = { ...evt.detail };
            }}'
            debug="${this.debug}"></photon-response-inspector>    
      </div>
      <div class="row">
        <photon-response-plot 
            stack=${this.response.stack}
            plottedPaths=${this._plottedPaths}
            debug="${this.debug}"></photon-response-plot>
      </div>
      `;
    }
  }
  _renderError() {
    if (this.response.errorLine || this.response.errorMsg) {
      return html `
        <granite-alert level="danger">        
          ERROR ${this.response.errorLine ? `line #${this.response.errorLine}` : ''} ${this.response.errorMsg}
        </granite-alert>
      `;
    }
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
      mwc-button {
        background-color: var(--app-primary-color);
        color: var(--app-primary-contrast);
        margin: 5px;
      }
      mwc-button iron-icon {
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


      photon-response-inspector {
        width: 100%;
      }
    </style>
    `;
  }

  pathFromUrl(url) {
      return url.substring(0, url.lastIndexOf('/') + 1);
  }

  importPath() {
      return `${this.pathFromUrl(import.meta.url)}`;
  }


}

window.customElements.define('photon-query-editor', PhotonQueryEditor);
