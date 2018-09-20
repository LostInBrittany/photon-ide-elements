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

  _render({name, data, path, isNonEnumerable}) {
    return html`
      <granite-inspector-object-name 
          name=${name} 
          dimmed=${isNonEnumerable}></granite-inspector-object-name>
      <span>:&nbsp;</span>
      ${timeseriesTools.isTimeseries(data) ?
        html`
          <span class='objectValueObject'><span class="serializedTimeseries">
            <photon-timeseries-renderer ts=${data} path=${path}></photon-timeseries-renderer>
          </span>`
        :
        html`<granite-inspector-object-value data=${data}></granite-inspector-object-value>`
      }
    `;
  }

  static get properties() {
    return {
      data: Object,
      name: String,
      path: String,
      isNonEnumerable: Boolean,
    };
  }
}

window.customElements.define('photon-response-inspector-object-label', PhotonResponseInspectorObjectLabel);
