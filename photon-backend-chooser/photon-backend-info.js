import { LitElement, html } from '@polymer/lit-element';

import photonSharedStyles from '../photon-shared-styles';
import './photon-backend-modal';

import '@material/mwc-icon';


class PhotonBackendInfo extends LitElement {
  _render({backend, conf, showBackendChooser, debug}) {
    if (!backend) {
      return '';
    }
    return html`
      ${photonSharedStyles}
      <style>
          .editBackendBtn {
            margin-left: 1rem;
            color: var(--app-primary-color);
            cursor: pointer;
          }
          .currentBackendLabel {
            font-size: 1em;
            font-weight: bold;
          }
          .currentBackendValue {
            font-size: 0.8em;
            font-family: monospace;
          }
          mwc-icon {
          background-color: transparent;
          color: var(--app-primary-color);
          padding: inherit;
          border-radius: inherit;
          margin-bottom: inherit;
          cursor: pointer;
          font-weight: inherit;
          --mdc-icon-size: 24px;
          }
      </style>
      <photon-backend-modal  
          backend='${backend}' 
          conf='${conf}'
          debug?='${debug}'
          open?='${showBackendChooser}'
          on-close='${() => this.showBackendChooser = false}'></photon-backend-modal>
      <div class="flex align-items-center">
        <div class="column">
          <div class="currentBackendLabel">Backend: ${backend.label}</div>
          <div class="currentBackendValue">${backend.url}${backend.execEndpoint}</div>
        </div> 
        <mwc-icon 
            class="editBackendBtn"
            on-click="${()=>this.editBackend()}">settings</mwc-icon>
      </div>
    `;
  }

  static get properties() {
    return {
      backend: Object,
      conf: Object,
      showBackendChooser: Boolean,
      debug: Boolean,
    };
  }

  editBackend() {
    this.showBackendChooser = true;
  }
}

window.customElements.define('photon-backend-info', PhotonBackendInfo);