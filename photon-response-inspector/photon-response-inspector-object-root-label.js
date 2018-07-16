import { html, LitElement } from '@polymer/lit-element';

import '@granite-elements/granite-inspector/object-inspector/granite-inspector-object-name';
import './photon-response-inspector-object-preview';

class PhotonResponseInspectorObjectRootLabel extends LitElement {
  /**
   * We don't want Shadow DOM for this element
   * See https://github.com/Polymer/lit-element/issues/42
   * @overrides
   * @return {Object} this
   */
  _createRoot() {
    return this;
  }

  _render({name, data}) {
    if (typeof name === 'string') {
      return html`
        <span>
          <granite-inspector-object-name 
              name=${name}></granite-inspector-object-name>
          <span>:&nbsp;</span>
          <granite-inspector-object-preview 
              data=${data}></granite-inspector-object-preview>
        </span>
      `;
    } else {
      return html`
        <photon-response-inspector-object-preview 
            data=${data}></photon-response-inspector-object-preview>
      `;
    }
  }

  static get properties() {
    return {
      data: Object,
      name: String,
    };
  }
}

window.customElements.define('photon-response-inspector-object-root-label', PhotonResponseInspectorObjectRootLabel);
