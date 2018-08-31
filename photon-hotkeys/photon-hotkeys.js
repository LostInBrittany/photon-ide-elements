import { LitElement, html } from '@polymer/lit-element';
import './photon-hotkeys-help';
import hotkeys from 'hotkeys-js';

class PhotonHotkeys extends LitElement {
  static get properties() {
    return {
      _hotkeysHelp: Boolean,
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._setHotkeys();
  }

  // ***************************************************************************
  // Hotkeys
  // ***************************************************************************

  _setHotkeys() {
    this._pressedHotkeys = {};

    // Execute
    hotkeys('e,r', (evt, handler) => {
      if (this._pressedHotkeys['execute']) {
        return;
      }
      this._pressedHotkeys['execute'] = true;
      this.dispatchEvent(new CustomEvent('execute'));
      setTimeout(() => this._pressedHotkeys['execute'] = false, 2000);
    });

    // Help
    hotkeys('h', (evt, handler) => {
      if (this._pressedHotkeys['help']) {
        return;
      }
      this._hotkeysHelp = true;
      this.dispatchEvent(new CustomEvent('help'));
      setTimeout(() => this._pressedHotkeys['help'] = false, 2000);
    });
  }

  _render( {_hotkeysHelp}) {
    console.log('_hotkeyHelp', _hotkeysHelp);
    if (_hotkeysHelp) {
      return html`
        <photon-hotkeys-help
            on-close='${() => this._hotkeysHelp = false }'></photon-hotkeys-help>
      `;
    }
    return html``;
  }
}

customElements.define('photon-hotkeys', PhotonHotkeys);
