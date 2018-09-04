import { LitElement, html } from '@polymer/lit-element';
import './photon-hotkeys-help';

import shortcuts from '@lostinbrittany/shortcuts';


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
    shortcuts.add('e', (evt) => {
      this.hotkeyHandlerWrapper(evt, 'execute',
        () => this.dispatchEvent(new CustomEvent('execute'))
      );
    });
    shortcuts.add('ctrl+e', (evt) => {
      this.hotkeyHandlerWrapper(evt, 'execute',
        () => {
          this.dispatchEvent(new CustomEvent('execute'));
        }
      );
    });
    shortcuts.add('r', (evt) => {
      this.hotkeyHandlerWrapper(evt, 'execute',
        () => this.dispatchEvent(new CustomEvent('execute'))
      );
    });

    // Help
    shortcuts.add('h', (evt) => {
      this.hotkeyHandlerWrapper(evt, 'help',
        () => {
          this._hotkeysHelp = true;
          this.dispatchEvent(new CustomEvent('help'));
        }
      );
    });
  }

  hotkeyHandlerWrapper(evt, hotkey, callback) {
    evt.preventDefault();
    if (this._pressedHotkeys[hotkey]) {
      return;
    }
    this._pressedHotkeys[hotkey] = true;
    callback();
    setTimeout(() => this._pressedHotkeys[hotkey] = false, 2000);
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
