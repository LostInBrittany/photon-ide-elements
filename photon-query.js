import { LitElement, html } from '@polymer/lit-element';

import '@granite-elements/granite-yaml/granite-yaml-remote-parser';

import shortcuts from '@lostinbrittany/shortcuts';

import '@material/mwc-icon';

import photonSharedStyles from './photon-shared-styles';

import historyHelper from './photon-history/photon-history-helper';

import './photon-query-editor';

import './photon-backend-chooser/photon-backend-info';

import permalinkTools from '@photon-elements/photon-tools/photon-permalink-tools';

import './photon-hotkeys/photon-hotkeys';

/**
 * @customElement
 */
class PhotonQuery extends LitElement {
  render() {
    console.log('rendering backend', this.backend)
    return html`
      ${photonSharedStyles}
      ${this._renderElementStyles()}


      <granite-yaml-remote-parser 
          id="conf-loader" 
          .url=${this.confPath} 
          @yaml-parsed="${(evt) => this._confLoaded(evt.detail.obj) }}"
          .debug=${this.debug}
          auto ></granite-yaml-remote-parser>

      <div class="row align-items-center flex-end ">
        <photon-backend-info 
            .backend=${this.backend} 
            .conf=${this.conf} 
            @backend-change="${(evt) => {
              if (this.debug) {
                console.log('[photon-query] on-backend-change', evt.detail);
              }
              this.backend = evt.detail;
            }}"
            @keypress="${(evt) => evt.stopPropagation()}"
            @keydown="${(evt) => evt.stopPropagation()}"
            @keyup="${(evt) => evt.stopPropagation()}"
            .debug=${this.debug}></photon-backend-info>
        
        <mwc-icon class="help"
            @click="${()=>this._help()}">help</mwc-icon>
      </div>



      <photon-hotkeys
          @execute="${() => this.queryEditor.execute()}"
          @select-all="${() => this.queryEditor.selectAll()}"
          @select-none="${() => this.queryEditor.selectNone()}"
          @select-regexp="${(evt) => this.queryEditor.selectRegExp(evt.detail)}"
          .debug=${this.debug}
          ></photon-hotkeys>

      <photon-query-editor
          id="photon-query-editor"
          .backend=${this.backend}    
          .warpscript=${this.warpscript}
          .debug=${this.debug}
          @exec='${(evt) => this._onExec(evt)}'
          cloak></photon-query-editor>
    `;
  }

  static get properties() {
    return {
      /**
       * The WarpScript script
       */
      warpscript: {type: String},
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
      backend: {type: Object},
      /**
       * The parsed configuration file
       */
      conf: {type: Object},
      confPath: {type: String},
      debug: {type: Boolean},
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

  firstUpdated() {    
    this.initBackend();


    let decodedPermalink = permalinkTools.decodePermalink(location.hash,this.debug);

    if (this.debug) {
      console.log('[photon-query] connectedCallback - decodedPermalink', decodedPermalink);
    }
    // Restoring from history
    let lastExecWarpsacript = 
        (historyHelper.last() &&  historyHelper.last().warpscript) ? 
        historyHelper.last().warpscript : 
        false;
    this.backend = 
        (historyHelper.last() &&  historyHelper.last().backend) ? 
        historyHelper.last().backend : 
        this.backend;
    this.backend = decodedPermalink.backend || this.backend;    
    this.warpscript = decodedPermalink.warpscript || lastExecWarpsacript || this.innerHTML || this.warpscript || '';
    this.queryEditor = this.renderRoot.querySelector('#photon-query-editor');
    this.removeAttribute('cloak');
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
    historyHelper.push({backend, warpscript, date});
    location.hash = permalinkTools.generatePermalink(warpscript,backend,this.debug);
  }


  _help() {
    if (this.debug) {
      console.debug('[photon-query] _help', this.renderRoot.querySelector('photon-hotkeys'));
    }
    this.renderRoot.querySelector('photon-hotkeys').hotkeysHelp = true;
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
      mwc-icon.help {
          background-color: transparent;
          color: var(--app-primary-color);
          padding: inherit;
          border-radius: inherit;
          margin-bottom: 0;
          cursor: pointer;
          font-weight: inherit;
          --mdc-icon-size: 24px;
          margin-left: 16px;
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
