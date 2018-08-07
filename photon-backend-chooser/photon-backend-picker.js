import { LitElement, html } from '@polymer/lit-element';
import photonSharedStyles from '../photon-shared-styles.js';

import '@material/mwc-radio';

class PhotonBackendPicker extends LitElement {
  _render({backend, conf, customBackend, _showCustomBackend, _savedBackends }) {
    console.log('[photon-backend-picker] rendering', {backend, customBackend, _showCustomBackend, _savedBackends });
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
        <div class='backendRadioGroupItem'>
          <div class="backend_label">Custom backend</div>
          <div class="backend_url">${customBackend.url}${customBackend.execEndpoint}</div>
        </div>
      </div>
    </div>
    
      ${_showCustomBackend ?
        html`
          <div class="customBackendEdit">
            Let's edit
          </div>
        ` :
        ``
      }
    `;
  }

  _didRender(props, changedProps, prevProps) {
    if (changedProps.backend !== undefined) {
      if (this.debug) {
        console.log('[photon-backend-picker] _didRender - backend changed', changedProps.backend);
      }
      this._delayedFireEvent(new CustomEvent('backend-change', {detail: changedProps.backend}));
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
      _showCustomBackend: Boolean,
      _savedBackends: Array,
    };
  }

  constructor() {
    super();
    this.configuredBackends = [];
    this.customBackend = {
      id: '',
      label: 'Custom',
      url: 'http://127.0.0.1:8080/api/v0',
      execEndpoint: '/exec',
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
    console.log('[photon-backend-picker] _delayedFireEvent 1', evt);
    await this.renderComplete;
    console.log('[photon-backend-picker] _delayedFireEvent 2', evt);
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
      console.log('[photon-backend-picker] _isCustomBackend', this.backend, this.configuredBackends);
    }
    if (!this.backend) {
      return false;
    }
    for (let index in this.configuredBackends) {
      if (this.configuredBackends[index].id == this.backend.id) {
        return false;
      }
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
    this.backend = backend;
  }
  _onCustomBackendChosen() {
    this._customBackend = this.backend;
    this._showCustomBackend = true;
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
      </style>
    `;
  }
}
window.customElements.define('photon-backend-picker', PhotonBackendPicker);
