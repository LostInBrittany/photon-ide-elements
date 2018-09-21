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
  createRenderRoot() {
    return this;
  }

  render() {
    console.log('[photon-response-inspector-object-root-label] render', this.data, typeof this.data);
    if (typeof this.name === 'string' && this.length > 0) {
      return html`
        <span>
          <granite-inspector-object-name 
              .name=${this.name}></granite-inspector-object-name>
          <span>:&nbsp;</span>
          <photon-response-inspector-object-preview 
              .data=${this.data} 
              .path=${this.path} 
              ?expanded=${this.expanded}></photon-response-inspector-object-preview>
        </span>
      `;
    } else {
      return html`
        <photon-response-inspector-object-preview 
            .data=${this.data} 
            .path=${this.path} 
            ?expanded=${this.expanded}></photon-response-inspector-object-preview>
      `;
    }
  }

  static get properties() {
    return {
      data: {type: Object},
      name: {type: String},
      path: {type: String},
      expanded: {type: Boolean},
    };
  }
}

window.customElements.define('photon-response-inspector-object-root-label', PhotonResponseInspectorObjectRootLabel);
