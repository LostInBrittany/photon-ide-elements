import { LitElement, html } from '@polymer/lit-element';
import photonSharedStyles from '../photon-shared-styles.js';
import timeseriesTools from '@photon-elements/photon-tools/photon-timeseries-tools';

class PhotonResponsePlot extends LitElement {
  _render({tsToPlot}) {
    if (!tsToPlot) {
      return ``;
    }
    return html`
      ${photonSharedStyles}
      ${tsToPlot.map((ts) => timeseriesTools.serializeTimeseriesMetadata(ts))}
    `;
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }
  static get properties() {
    return {
      /**
       * {Array<ts>} A list of timeseries to plot
       */
      tsToPlot: Array,
    };
  }
}

window.customElements.define('photon-response-plot', PhotonResponsePlot);
