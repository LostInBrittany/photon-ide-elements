import { LitElement, html } from '@polymer/lit-element';

import './photon-query-editor';


/**
 * @customElement
 */
class PhotonQueryApp extends LitElement {
  _render({debug}) {
    return html`
      <photon-query-editor debug?='${debug}'></photon-query-editor>
    `;
  }

  static get properties() {
    return {
      debug: Boolean,
    };
  }
}

window.customElements.define('photon-query-app', PhotonQueryApp);
