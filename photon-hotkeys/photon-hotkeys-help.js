import { LitElement, html } from '@polymer/lit-element';

import photonSharedStyles from '../photon-shared-styles';

import '@material/mwc-icon';

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
    .modal-close {
        float: right;
        cursor: pointer;
    } 
  </style>
`;

class PhotonHotkeyHelp extends LitElement {
  _render() {
    return html`
      ${photonSharedStyles} ${modalStyles}
      <div 
          class$="${open?'modal open':'modal'}"
          on-click="${(evt) => this._closeModal(evt)}">
        <div class='modal-content'
          on-click="${(evt) => {
            evt.stopPropagation();
          }}">
          <div 
              class='modal-close'
              on-click="${(evt) => this._closeModal(evt)}">
            <mwc-icon 
              class="modalCloseIcon">close</mwc-icon>
          </div>
          <h1>Hotkeys</h1>
          <div><b>e, r</b>: Execute</div>
          <div><b>h</b>: Help</div> 
        </div>
      </div>
    `;
  }

  static get properties() {
    return {
    };
  }

  _closeModal(evt) {
      evt.stopPropagation();
      this.open = false;
      this.dispatchEvent(new CustomEvent('close', {bubbles: true, composed: true}));
  }
}

customElements.define('photon-hotkeys-help', PhotonHotkeyHelp);
