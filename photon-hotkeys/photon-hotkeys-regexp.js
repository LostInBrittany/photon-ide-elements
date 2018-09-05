import { LitElement, html } from '@polymer/lit-element';

import '@material/mwc-icon';
import '@material/mwc-button';


import photonSharedStyles from '../photon-shared-styles';
import shortcuts from '@lostinbrittany/shortcuts';

import '../photon-textfield/photon-textfield';


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
      max-width: 450px;
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
    }
    .modal-close {
      float: right;
      cursor: pointer;
      align-self: flex-end;
    }
    .modal-content h2 {
      align-self: flex-start;
    } 

    .regexp-field {
      --photon-textfield-width: 400px;
    }

    .hotkey-key {
      background-color: #333;
      border: 1px solid #333;
      border-radius: 5px;
      box-shadow: 0 1px 0 #666 inset, 0 1px 0 #bbb;
      color: #fff;
      display: inline-block;
      font-size: 1em;
      margin-right: 5px;
      padding: 5px 9px;
      text-align: center;
    }
    mwc-button {
      background-color: var(--app-primary-color);
      color: var(--app-primary-contrast);
      margin: 5px;
    }
  </style>
`;

class PhotonHotkeyRegexp extends LitElement {
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
          <h2>Regex selector</h2>
          <photon-textfield 
              id="regexp"
              class="regexp-field" 
              on-change="${(evt) => this._regexp = evt.detail }"
              label="RegExp"></photon-textfield>
          <mwc-button 
              icon="send" 
              on-click="${(evt) => this._select(evt)}"
              raised>Select</mwc-button>
        </div>
      </div>
    `;
  }

  static get properties() {
    return {
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._regexp = '';
    this._setHotkeys();
    this._root.querySelector('photon-textfield').focus();
  }

  // ***************************************************************************
  // Hotkeys
  // ***************************************************************************

  _setHotkeys() {
    this._pressedHotkeys = {};
    // Help
    shortcuts.add('enter', (evt) => this._select(evt), this);
  }

  _closeModal(evt) {
      evt.stopPropagation();
      this.open = false;
      this.dispatchEvent(new CustomEvent('close', {bubbles: true, composed: true}));
  }

  _select(evt) {
    this.dispatchEvent(new CustomEvent('select-regexp', {detail: this._regexp, bubbles: true, composed: true }));
    this._closeModal(evt);
  }
}

customElements.define('photon-hotkeys-regexp', PhotonHotkeyRegexp);
