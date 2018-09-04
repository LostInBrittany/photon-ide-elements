import { LitElement, html } from '@polymer/lit-element';

import photonSharedStyles from './photon-shared-styles';

import '@material/mwc-button/mwc-button';

import PhotonWarpscriptExec from '@photon-elements/photon-tools/photon-warpscript-exec';

import '@granite-elements/granite-yaml/granite-yaml-remote-parser';

import './photon-query-editor';

import './photon-backend-chooser/photon-backend-info';

import historyHelper from './photon-history/photon-history-helper';

import './photon-hotkeys/photon-hotkeys';

import shortcuts from '@lostinbrittany/shortcuts';
/**
 * @customElement
 */
class PhotonQuery extends LitElement {
  _render({warpscript, backend, conf, confPath, response, debug}) {
    console.log('rendering backend', backend)
    return html`
      ${photonSharedStyles}
      ${this._renderElementStyles()}


      <granite-yaml-remote-parser 
          id="conf-loader" 
          url="${confPath}" 
          on-yaml-parsed="${(evt) => this._confLoaded(evt.detail.obj) }}"
          debug$="${debug}"
          auto ></granite-yaml-remote-parser>

      <div class="row flex-end ">
        <photon-backend-info 
            backend='${backend}' 
            conf='${conf}' 
            on-backend-change='${(evt) => {
              if (this.debug) {
                console.log('[photon-query] on-backend-change', evt.detail);
              }
              this.backend = evt.detail;
            }}'
            on-keypress="${(evt) => evt.stopPropagation()}"
            on-keydown="${(evt) => evt.stopPropagation()}"
            on-keyup="${(evt) => evt.stopPropagation()}"
            debug='${debug}'></photon-backend-info>
      </div>

      <photon-hotkeys
          on-execute='${() => this._root.querySelector('#photon-query-editor').execute()}'
          debug='${debug}'
          ></photon-hotkeys>
      <photon-query-editor
          id="photon-query-editor"
          backend='${backend}'    
          warpscript='${warpscript}'
          debug='${debug}'
          on-exec='${(evt) => this._onExec(evt)}'
          cloak
          >
      </photon-query-editor>
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
       * The parsed configuration file
       */
      conf: Object,
      confPath: String,
      debug: Boolean,
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
    this.confPath = `${this.importPath()}photon-conf.yaml`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.initBackend();
    // Restoring from history
    let lastExecWarpsacript = 
        (historyHelper.last() &&  historyHelper.last().warpscript) ? 
        historyHelper.last().warpscript : 
        false;
    this.backend = 
        (historyHelper.last() &&  historyHelper.last().backend) ? 
        historyHelper.last().backend : 
        this.backend;
    this.warpscript = lastExecWarpsacript || this.innerHTML || this.warpscript || '';
    this.removeAttribute('cloak');
    shortcuts.add('d', () => console.log('[SHORTCUTS] d pressed'));
  }

  initBackend() {
    if (sessionStorage.getItem('warp10-backend-conf')) {
      this.backend = JSON.parse(sessionStorage.getItem('warp10-backend-conf'));
      return;
    } 
    this.backend = this._defaultBackend;
  }


  // ***************************************************************************
  // Event listeners
  // ***************************************************************************

  _confLoaded(conf) {  
    if (!conf) {
      return;
    }
    this.conf = conf;
    if (this.debug) {
      console.debug('[photon-query] _confLoaded', this.conf);
    }
    if (sessionStorage.getItem('warp10-backend-conf')) {
      this.backend = JSON.parse(sessionStorage.getItem('warp10-backend-conf'));
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

  _onExec(evt) {
    let backend = evt.detail.backend;
    let warpscript = evt.detail.warpscript;
    if (this.debug) {
      console.debug('[photon-query] _onExec', {backend, warpscript});
    }
    let date = new Date();    
    historyHelper.push({backend, warpscript, date})
  }



  



  // ***************************************************************************
  // Renderers
  // ***************************************************************************

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

window.customElements.define('photon-query', PhotonQuery);
