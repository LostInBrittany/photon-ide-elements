import { LitElement, html } from '@polymer/lit-element';

import photonSharedStyles from '../photon-shared-styles';

import '@material/mwc-icon';


class PhotonBackendInfo extends LitElement {
  _render({backend}) {
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
      </style>
      <div class="flex flex-end align-items-center">
        <div class="column">
          <div class="currentBackendLabel">Backend: ${backend.label}</div>
          <div class="currentBackendValue">${backend.url}${backend.execEndpoint}</div>
        </div> 
        <mwc-icon 
            class="editBackendBtn"
            on-click="${()=>this.editBackend()}">edit</mwc-icon>
      </div>
    `;
  }

  static get properties() {
    return {
      backend: Object,
    };
  }
}

window.customElements.define('photon-backend-info', PhotonBackendInfo);