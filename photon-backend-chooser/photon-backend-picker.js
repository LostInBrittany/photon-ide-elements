import { LitElement, html } from '@polymer/lit-element';
import photonSharedStyles from '../photon-shared-styles.js';

import '@material/mwc-radio';
import '@material/mwc-icon';
import '../photon-textfield/photon-textfield';

class PhotonBackendPicker extends LitElement {
  render() {
    if (this.debug) {
      console.log('[photon-backend-picker] render', this.backend)
    }
    if (!this.backend || !this.customBackend) {
      return;
    }
    return html`
      ${photonSharedStyles}
      ${this._renderStyle()}

      ${ (this._savedBackends && this._savedBackends.length >0) ?
        html`
          <h3>Your backends</h3>
          ${this._savedBackends.map((item, index) => html`
            <div class='flex align-items-center'>
              <mwc-radio 
                  id='backend_${item.id}'
                  .value='backend_${item.id}'
                  .name='backendRadioGroup' 
                  ?checked='${this._equalBackends(this.backend, item)}'
                  @click='${()=>this._onBackendChosen(item)}'></mwc-radio>        
              <div class='backendRadioGroupItem'>
                <div class="backend_label">${item.label}</div>
                <div class="backend_url">${item.url}${item.execEndpoint}</div>
              </div>
              <mwc-icon 
                class="deleteBackendBtn"
                @click="${()=>this.deleteBackend(index)}">delete</mwc-icon>
            </div>
          `)}
        `:''
      }

      ${ (this.conf && this.conf.backends && this.conf.backends.length > 0) ?
        html`
          <h3>Default backends</h3>
          ${this.conf.backends.map((item) => html`
            <div class='flex align-items-center'>
              <mwc-radio 
                  id='backend_${item.id}'
                  .value='backend_${item.id}'
                  .name='backendRadioGroup' 
                  ?checked='${this._equalBackends(this.backend, item)}'
                  @click='${()=>this._onBackendChosen(item)}'></mwc-radio>        
              <div class='backendRadioGroupItem'>
                <div class="backend_label">${item.label}</div>
                <div class="backend_url">${item.url}${item.execEndpoint}</div>
              </div>
            </div>
          `)}
        `:''
      }

      <h3>Custom backend</h3>
      <div class='flex align-items-center'>
        <mwc-radio 
            id='custom_backend'
            .value='custom_backend'
            .name='backendRadioGroup' 
            ?checked='${this._isCustomBackend()}'
            @click='${()=>this._onCustomBackendChosen()}'></mwc-radio>         
        <div class='backendRadioGroupItem'>   
          <div class='flex align-items-center'>
            <photon-textfield 
                class="custom-backend-url" 
                .label="Backend URL" 
                @change="${(evt) => {
                  let _backend = { ...this.customBackend, url: evt.detail, id: '' };
                  this.customBackend = _backend;
                  this.backend = _backend;
                  if (this.debug) {
                    console.log('[photon-backend-picker] URL changed', this.backend, evt.detail);
                  }
                }}"
                value="${this.customBackend.url}"></photon-textfield>
            <photon-textfield 
                class="custom-backend-execEndpoint" 
                .label="Exec endpoint" 
                @change="${(evt) => {
                  let _backend = { ...this.customBackend, execEndpoint: evt.detail, id: '' };
                  this.customBackend = _backend;
                  this.backend= _backend;
                  if (this.debug) {
                    console.log('[photon-backend-picker] Exec endpoint changed', this.backend, evt.detail);
                  }
                }}"
                .value="${this.customBackend.execEndpoint}"></photon-textfield>
          </div>
          <div class='flex align-items-center'>
            <photon-textfield 
                class="custom-backend-label" 
                .label="Label" 
                @change="${(evt) => {
                  let _backend = { ...this.customBackend, label: evt.detail, id: '' };
                  this.customBackend = _backend;
                  this.backend = _backend;
                  if (this.debug) {
                    console.log('[photon-backend-picker] Label changed', this.backend, evt.detail);
                  }
                }}"
                .value="${this.customBackend.label}"></photon-textfield>
          </div>
        </div>
        ${(this._customBackendChoosen || this._isCustomBackend()) ? html`
          <mwc-icon 
            class="saveBackendBtn"
            @click="${()=>this.saveBackend()}">save</mwc-icon>`:''}
      </div>
    `;
  }

  updated(changedProps) {
    if (changedProps.get('backend') !== undefined) {
      if (this.debug) {
        console.log('[photon-backend-picker] updated - backend changed', this.backend);
      }
      this._delayedFireEvent(new CustomEvent(
          'backend-change',
          {detail: this.backend, bubbles: true, composed: true})
      );
    }
  }

  static get properties() {
    return {
      /**
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
       * An array of pre-configured backends
       */
      conf: {type: Object},
      /**
       * If true, it logs to the console
       */
      debug: {type: Boolean},
      customBackend: {type: Object},
      _customBackendChoosen: {type: Boolean},
      _savedBackends: {type: Array},
    };
  }

  constructor() {
    super();
    this.configuredBackends = [];
    this.customBackend = {
      label: '',
      url: '',
      execEndpoint: '',
    };
    this._savedBackends = this._readBackendsFromLocalStorage();
    this.addEventListener('backend-change', async () => {
      if (this.debug) {
        console.log('[photon-backend-picker] backend-change event listener', this.backend);
      }
      if (!this._equalBackends(this.backend, this.customBackend)) {
        this.customBackend = { url: this.backend.url, execEndpoint: this.backend.execEndpoint, label: '' };
      }
      this._saveCurrentBackend();
      window.dispatchEvent(new StorageEvent('storage', {key: 'warp10-backend-conf'}));
    });
  }

  connectedCallback() {
    super.connectedCallback();
  }

  async _delayedFireEvent(evt) {
    await this.updateComplete;
    this.dispatchEvent(evt);
  }

  _isCurrentBackend(aBackend) {
    if (!this.backend) {
      return false;
    }
    return aBackend.id == this.backend.id;
  }

  _hasConfiguredBackends() {
    return (this.conf.backends && this.conf.backends.length > 0);
  }

  _isCustomBackend() {
    if (!this.backend) {
      return false;
    }
    if (this.conf && this.conf.backends) {
      for (let index in this.conf.backends) {
        if (this._equalBackends(this.backend, this.conf.backends[index])) {
          if (this.debug) {
            console.log('[photon-backend-picker] _isCustomBackend false - Backend in configuredBackends',
                this.backend, this.conf.backends[index]);
          }
          return false;
        }
      }
    }
    if (this._savedBackends) {
      for (let index in this._savedBackends) {
        if (this._equalBackends(this.backend, this._savedBackends[index])) {
          if (this.debug) {
            console.log('[photon-backend-picker] _isCustomBackend false  - Backend in configuredBackends');
          }
          return false;
        }
      }
    }
    if (this.debug) {
      console.log('[photon-backend-picker] _isCustomBackend - true');
    }
    return true;
  }

  _equalBackends(a, b) {
    if (a.url != b.url) {
      return false;
    }
    if (a.execEndpoint != b.execEndpoint) {
      return false;
    }
    return true;
  }

  _readBackendsFromLocalStorage() {
    let backendsFromLocalStorage = JSON.parse(localStorage.getItem('configuredBackends') || '[]');
    if (backendsFromLocalStorage && backendsFromLocalStorage.length > 0) {
      backendsFromLocalStorage.filter((backend) => {
        return (backend.id && backend.label && backend.url && backend.exec);
      });
    }
    return backendsFromLocalStorage;
  }

  _writeBackendsToLocalStorage(backends) {
    localStorage.setItem('configuredBackends', JSON.stringify(backends));
  }


  _saveCurrentBackend() {
    sessionStorage.setItem('warp10-backend-conf', JSON.stringify(this.backend));
  }

  _restoreCurrentBackend() {
    this.backend = JSON.parse(sessionStorage.getItem('warp10-backend-conf'));
  }

  _onBackendChosen(backend) {
    this._customBackendChoosen = false;
    this.backend = backend;
    if (this.debug) {
      console.log('[photon-backend-picker] _onBackendChosen', this.backend);
    }
  }
  _onCustomBackendChosen() {
    this._customBackendChoosen = true;
    this.customBackend = { ...this.backend, label: ''};
    if (this.debug) {
      console.log('[photon-backend-picker] _onCustomBackendChosen', this.customBackend);
    }
  }

  saveBackend() {
    if (!this._isCustomBackend()) {
      return;
    }
    if (this.debug) {
      console.log('[photon-backend-picker] saveBackend', this.customBackend);
    }
    this._savedBackends = [...this._savedBackends, this.customBackend];
    this._writeBackendsToLocalStorage(this._savedBackends);
  }
  deleteBackend(index) {
    if (this.debug) {
      console.log('[photon-backend-picker] deleteBackend', this._savedBackends[index]);
    }
    this._savedBackends.splice(index, 1);
    console.log('[photon-backend-picker] deleteBackend', this._savedBackends);
    this._savedBackends = [...this._savedBackends];
    this._writeBackendsToLocalStorage(this._savedBackends);
  }

  _renderStyle() {
    return html`
      <style>
        .backendRadioGroupItem {
          display: flex;
          flex-flow: column;
        }
        .backend_url {
          font-size: 0.8em;
          font-family: monospace;
        }
        .customBackendEdit {
          display: flex;
          flex-flow: column;
          padding-left: 32px;
        }
        .custom-backend-url {
          --photon-textfield-width: 400px;
        }
        .custom-backend-execEndpoint {
          --photon-textfield-width: 200px;
        }
        mwc-icon {
          color: var(--app-primary-color);
          cursor: pointer;
        }
        .deleteBackendBtn {
          margin-left: 32px;
        }
      </style>
    `;
  }
}
window.customElements.define('photon-backend-picker', PhotonBackendPicker);
