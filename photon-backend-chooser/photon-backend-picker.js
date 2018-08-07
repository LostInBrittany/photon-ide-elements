import { LitElement, html } from '@polymer/lit-element';
import photonSharedStyles from '../photon-shared-styles.js';

import '@material/mwc-radio';
import '@material/mwc-icon';
import '../photon-textfield/photon-textfield';

class PhotonBackendPicker extends LitElement {
  _render({backend, conf, customBackend, _customBackendChoosen, _savedBackends }) {
    console.log('[photon-backend-picker] rendering', {backend, customBackend, _savedBackends });
    if (!backend || !customBackend) {
      return;
    }
    return html`
      ${photonSharedStyles}
      ${this._renderStyle()}

      ${ (_savedBackends && _savedBackends.length >0) ?
        html`
          <h3>Your backends</h3>
          ${_savedBackends.map((item) => html`
            <div class='flex align-items-center'>
              <mwc-radio 
                  id$='backend_${item.id}'
                  value='backend_${item.id}'
                  name='backendRadioGroup' 
                  checked?='${item.id === backend.id}'
                  on-click='${()=>this._onBackendChosen(item)}'></mwc-radio>        
              <div class='backendRadioGroupItem'>
                <div class="backend_label">${item.label}</div>
                <div class="backend_url">${item.url}${item.execEndpoint}</div>
              </div>
            </div>
          `)}
        `:''
      }

      ${ (conf && conf.backends && conf.backends.length > 0) ?
        html`
          <h3>Default backends</h3>
          ${conf.backends.map((item) => html`
            <div class='flex align-items-center'>
              <mwc-radio 
                  id$='backend_${item.id}'
                  value='backend_${item.id}'
                  name='backendRadioGroup' 
                  checked?='${item.id === backend.id}'
                  on-click='${()=>this._onBackendChosen(item)}'></mwc-radio>        
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
            id$='custom_backend'
            value='custom_backend'
            name='backendRadioGroup' 
            on-click='${()=>this._onCustomBackendChosen()}'></mwc-radio>       
        <photon-textfield 
            class="custom-backend-url" 
            label="Backend URL" 
            on-change="${(evt) => {
              let _backend = { ...customBackend, url: evt.detail, id: '' };
              this.customBackend = _backend;
              this.backend = _backend;
              if (this.debug) {
                console.log('[photon-backend-picker] URL changed', this.backend, evt.detail);
              }
            }}"
            value="${customBackend.url}"></photon-textfield>
        <photon-textfield 
            class="custom-backend-execEndpoint" 
            label="Exec endpoint" 
            on-change="${(evt) => {
              let _backend = { ...customBackend, execEndpoint: evt.detail, id: '' };
              this.customBackend = _backend;
              this.backend= _backend;
              if (this.debug) {
                console.log('[photon-backend-picker] Exec endpoint changed', this.backend, evt.detail);
              }
            }}"
            value="${customBackend.execEndpoint}"></photon-textfield>
        ${_customBackendChoosen ? html`
          <mwc-icon 
            class="saveBackendBtn"
            on-click="${()=>this.saveBackend()}">save</mwc-icon>`:''}
      </div>
    `;
  }

  _didRender(props, changedProps, prevProps) {
    if (changedProps.backend !== undefined) {
      if (this.debug) {
        console.log('[photon-backend-picker] _didRender - backend changed', changedProps.backend);
      }
      this._delayedFireEvent(new CustomEvent(
          'backend-change',
          {detail: changedProps.backend, bubbles: true, composed: true})
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
      backend: Object,
      /**
       * An array of pre-configured backends
       */
      conf: Object,
      /**
       * If true, it logs to the console
       */
      debug: Boolean,
      customBackend: Object,
      _customBackendChoosen: Boolean,
      _savedBackends: Array,
    };
  }

  constructor() {
    super();
    this.configuredBackends = [];
    this.customBackend = {
      id: '',
      label: '',
      url: '',
      execEndpoint: '',
    };
    this._savedBackends = this._readBackendsFromLocalStorage();
    this.addEventListener('backend-change', async () => {
      if (this.debug) {
        console.log('[photon-backend-picker] backend-change event listener', this.backend);
      }
      sessionStorage.setItem('warp10-backend-conf', JSON.stringify(this.backend));
      window.dispatchEvent(new StorageEvent('storage', {key: 'warp10-backend-conf'}));
      if (this._isCustomBackend()) {
        this.configuredBackends = [...this.configuredBackends, this.backend];
      }
    });
  }

  connectedCallback() {
    super.connectedCallback();
  }


  get customBackend() {
    return this._getProperty('customBackend');
  }

  set customBackend(value) {
    this._setProperty('customBackend', value);
  }

  async _delayedFireEvent(evt) {
    await this.renderComplete;
    this.dispatchEvent(evt);
  }

  _isCurrentBackend(aBackend) {
    if (!this.backend) {
      return false;
    }
    return aBackend.id == this.backend.id;
  }

  _hasConfiguredBackends() {
    return (this.configuredBackends && this.configuredBackends.length > 0);
  }

  _isCustomBackend() {
    if (this.debug) {
      console.log('[photon-backend-picker] _isCustomBackend',
          this.backend, this.configuredBackends, this._savedBackends);
    }
    if (!this.backend) {
      return false;
    }
    for (let index in this.configuredBackends) {
      if (this._equalBackends(this.backend, this.configuredBackends[index])) {
        if (this.debug) {
          console.log('[photon-backend-picker] _isCustomBackend - false');
        }
        return false;
      }
    }
    for (let index in this._savedBackends) {
      if (this._equalBackends(this.backend, this._savedBackends[index])) {
        if (this.debug) {
          console.log('[photon-backend-picker] _isCustomBackend - false');
        }
        return false;
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
    let backendsFromLocalStorage = localStorage.getItem('configuredBackends') || [];
    if (backendsFromLocalStorage && backendsFromLocalStorage.length > 0) {
      backendsFromLocalStorage.filter((backend) => {
        return (backend.id && backend.label && backend.url && backend.exec);
      });
    }
    return backendsFromLocalStorage;
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
    this.customBackend = this.backend;
    if (this.debug) {
      console.log('[photon-backend-picker] _onCustomBackendChosen', this.customBackend);
    }
  }

  saveBackend() {
    if (this.debug) {
      console.log('[photon-backend-picker] saveBackend', this.customBackend);
    }
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
      </style>
    `;
  }
}
window.customElements.define('photon-backend-picker', PhotonBackendPicker);
