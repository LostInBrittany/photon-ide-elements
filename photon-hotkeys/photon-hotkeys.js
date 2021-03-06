import { LitElement, html } from '@polymer/lit-element';
import './photon-hotkeys-help';
import './photon-hotkeys-regexp';

import shortcuts from '@lostinbrittany/shortcuts';


class PhotonHotkeys extends LitElement {
  static get properties() {
    return {
      _hotkeysRegexp: {type: Boolean},
      hotkeysHelp: {type: Boolean},
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
    shortcuts.add('r', (evt) => {
      this.hotkeyHandlerWrapper(evt, 'execute',
        () => this.dispatchEvent(new CustomEvent('execute'))
      );
    });

    // Regexp
    shortcuts.add('/', (evt) => {
      this.hotkeyHandlerWrapper(evt, 'regexp',
        () => {
          this._hotkeysRegexp = true;
        }
      );
    });

    // Select all
    shortcuts.add('a', (evt) => {
      this.hotkeyHandlerWrapper(evt, 'select-all',
        () => this.dispatchEvent(new CustomEvent('select-all'))
      );
    });

    // Select all
    shortcuts.add('n', (evt) => {
      this.hotkeyHandlerWrapper(evt, 'select-none',
        () => this.dispatchEvent(new CustomEvent('select-none'))
      );
    });

    // Help
    shortcuts.add('h', (evt) => {
      this.hotkeyHandlerWrapper(evt, 'help',
        () => {
          this.hotkeysHelp = true;
          this.dispatchEvent(new CustomEvent('help'));
        }
      );
    });

    // Close dialog
    shortcuts.add('esc', (evt) => {
      this.hotkeyHandlerWrapper(evt, 'close',
        () => {
          this.hotkeysHelp = false;
          this._hotkeysRegexp = false;
          this.dispatchEvent(new CustomEvent('close'));
        },
        this
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

  render() {
    if (this.hotkeysHelp) {
      return html`
        <photon-hotkeys-help
            id="hotkeyHelp"
            @close='${() => this.hotkeysHelp = false }'
            open></photon-hotkeys-help>
      `;
    }
    if (this._hotkeysRegexp) {
      return html`
        <photon-hotkeys-regexp
            id="hotkeyRegexp"
            @keypress="${(evt) => evt.stopPropagation()}"
            @keydown="${(evt) => evt.stopPropagation()}"
            @keyup="${(evt) => evt.stopPropagation()}"
            @regexp='${(evt) => console.log('[REGEXP]', evt.detail)}'
            @close='${() => this._hotkeysRegexp = false }'></photon-hotkeys-regexp>
      `;
    }
    return html``;
  }
}

customElements.define('photon-hotkeys', PhotonHotkeys);
