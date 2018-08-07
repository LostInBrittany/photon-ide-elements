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


/**
 * @customElement
 */
class PhotonQueryEditor extends LitElement {
  _render({warpscript, backend, conf, response, debug, _plottedPaths}) {
    console.log('rendering backend', backend)
    return html`
      ${photonSharedStyles}
      ${this._renderElementStyles()}


      <granite-yaml-remote-parser 
          id="conf-loader" 
          url="${this.importPath()}photon-conf.yaml" 
          on-yaml-parsed="${(evt) => this._confLoaded(evt.detail.obj) }}"
          debug$="${debug}"
          auto ></granite-yaml-remote-parser>

      <div class="row flex-end ">
        <photon-backend-info 
            backend='${backend}' 
            conf='${conf}' 
            debug="${debug}"></photon-backend-info>
      </div>

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
       * The WarpScript stack received as response
       */
      stack: Array,
      /**
       * Elapsed time for the call
       */
      elapsed: Number,
      /**
       * The parsed configuration file
       */
      conf: Object,
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
    this._defaultBackend = {
      id: 'default',
      label: 'Default backend',
      url: 'http://127.0.0.1:8080/api/v0',
      execEndpoint: '/exec',
      findEndpoint: '/find',
      updateEndpoint: '/update',
      deleteEndpoint: '/delete',
      headerName: 'X-Warp10-Token',
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.initBackend();
    this.warpscript = this.innerHTML || this.warpscript || '';
    this.$ = {
      editor: this.shadowRoot.querySelector('#editor'),
      warpscriptcaller: this.shadowRoot.querySelector('#warpscriptcaller'),
    };
  }

  initBackend() {
    if (sessionStorage.getItem('warp10-backend')) {
      this.backend = sessionStorage.getItem('warp10-backend');
      return;
    } 
    this.backend = this._defaultBackend;
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
      .exec(`${this.backend.url}${this.backend.execEndpoint}`, this.warpscript)
      .then((response) => this._handleResponse(response))
      .catch((error) => this._handleError(error));
  }

  _handleResponse(response) {
    if (this.debug) {
      console.log('[photon-query-editor] _handleResponse', response);
    }
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

  _confLoaded(conf) {  
    if (!conf) {
      return;
    }
    this.conf = conf;
    if (this.debug) {
      console.debug('[photon-query-editor] _confLoaded', this.conf);
    }
    if (sessionStorage.getItem('warp10-backend')) {
      this.backend = sessionStorage.getItem('warp10-backend');
      return;
    } 
    if (conf.backends && conf.backends.length > 0) {
      let defaultConfBackend = 
        conf.backends.filter((backend) => backend.default);
      if (defaultConfBackend.length > 0) {
        this.backend = defaultConfBackend[0];
        return;
      }
      this.backend = conf.backends[0];
      return;
    }
    this.backend = this._defaultBackend;
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
            }}'></photon-response-inspector>    
      </div>
      <div class-"row">
        <photon-response-plot 
            stack=${this.response.stack}
            plottedPaths=${this._plottedPaths}></photon-response-plot>
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
