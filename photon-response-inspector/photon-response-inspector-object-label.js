import { html, LitElement } from '@polymer/lit-element';

import '@granite-elements/granite-inspector/object-inspector/granite-inspector-object-name';
import './photon-response-inspector-object-preview';

import timeseriesTools from '@photon-elements/photon-tools/photon-timeseries-tools';

class PhotonResponseInspectorObjectLabel extends LitElement {
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
    return html`
      <granite-inspector-object-name 
          .name=${this.name} 
          .dimmed=${this.isNonEnumerable}></granite-inspector-object-name>
      <span>:&nbsp;</span>
      ${timeseriesTools.isTimeseries(this.data) ?
        html`
          <span class='objectValueObject'><span class="serializedTimeseries">
            <photon-timeseries-renderer 
                .ts=${this.data} 
                .path=$this.path}></photon-timeseries-renderer>
          </span>`
        :
        html`
          <granite-inspector-object-value 
              .data=${this.data}></granite-inspector-object-value>`
      }
    `;
  }

  static get properties() {
    return {
      data: {type: Object},
      name: {type: String},
      path: {type: String},
      isNonEnumerable: {type: Boolean},
    };
  }
}

window.customElements.define('photon-response-inspector-object-label', PhotonResponseInspectorObjectLabel);
