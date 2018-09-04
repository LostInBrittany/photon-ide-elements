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
          <h2>Hotkeys outside WarpScript editor</h2>
          <p>            
            <span class="hotkey-key">e</span>,
            <span class="hotkey-key">r</span>
            Execute WarpScript
          </p>
          <p>            
            <span class="hotkey-key">h</span>
            Help
          </p>
          <p>            
            <span class="hotkey-key">Esc</span>
            Close dialog
          </p>
          <hr />
          <h2>Hotkeys in WarpScript editor</h2>
          <p>            
            <span class="hotkey-key">Ctrl+e</span>
            Execute WarpScript
          </p>
          <p>            
            <span class="hotkey-key">Ctrl+Space</span>
            Editor autocompletion
          </p>
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
