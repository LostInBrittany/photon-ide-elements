import { LitElement, html } from '@polymer/lit-element';

import photonSharedStyles from '../photon-shared-styles';

import './photon-backend-picker';


import '@material/mwc-radio';

let modalStyles = html`
  <style>
    /* The Modal (background) */
    .modal {
        display: none; /* Hidden by default */
        position: fixed; /* Stay in place */
        z-index: 10000; /* Sit on top */
        left: 0;
        top: 0;
        right: 0; /* Full width */
        bottom: 0; /* Full height */
        overflow: auto; /* Enable scroll if needed */
        background-color: rgb(0,0,0); /* Fallback color */
        background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
    }

    .modal.open {
      display: block;
    }
    /* Modal Content/Box */
    .modal-content {
        background-color: #fefefe;
        margin: 15% auto; /* 15% from the top and centered */
        padding: 20px;
        border: 1px solid #888;
        width: 80%; /* Could be more or less, depending on screen size */
        max-width: 800px;
    }

    /* The Close Button */
    .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
    }

    .close:hover,
    .close:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
    } 
  </style>
`;

class PhotonBackendModal extends LitElement {
  _render({backend, conf, open, debug}) {
    return html`
           ${photonSharedStyles} ${modalStyles}
          <div 
              class$="${open?'modal open':'modal'}"
              on-click="${(evt) => this._closeModal(evt)}">
            <div class='modal-content'
              on-click="${(evt) => {
                evt.stopPropagation();
              }}">
              <photon-backend-picker
                  backend='${backend}' 
                  conf='${conf}'
                  debug?='${debug}'></photon-backend-picker>
            </div>
          </div>
        `;
  }

  static get properties() {
    return {
      backend: Object,
      conf: Object,
      open: Boolean,
      debug: Boolean,
    };
  }

  _closeModal(evt) {
      evt.stopPropagation();
      this.open = false;
      this.dispatchEvent(new CustomEvent('close', {bubbles: true, composed: true}));
  }
}

window.customElements.define('photon-backend-modal', PhotonBackendModal);
