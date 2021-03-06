import { LitElement, html } from '@polymer/lit-element';
import timeseriesTools from '@photon-elements/photon-tools/photon-timeseries-tools';
import '@material/mwc-icon';

class PhotonTimeseriesRenderer extends LitElement {
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
    if (!this.ts) {
      return;
    }
    return html`
      <style>
        :host {
          --mdc-icon-size: 11px; 
        }        
        mwc-icon {
          background-color: var(--app-primary-contrast-muted);
          color: var(--app-primary-color);
          padding: 1px;
          border-radius: 3px;
          margin-bottom: 4px;
          cursor: pointer;
          font-weight: bolder;
          --mdc-icon-size: 11px;
        }
      </style>
      <span class="serializedTimeseries">
        ${timeseriesTools.serializeTimeseriesMetadata(this.ts, 5)}
        <mwc-icon
            @click='${(evt) => this.firePlotTsEvent(evt)}'>timeline</mwc-icon>
      </span>
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
      ts: {type: Object},
      path: {type: String},
    };
  }

  firePlotTsEvent(evt) {
    console.log('Fire plot-ts', timeseriesTools.serializeTimeseriesMetadata(this.ts, 5), this.path);
    evt.stopPropagation();
    this.dispatchEvent(new CustomEvent('plot-ts', 
        {detail: {ts: this.ts, path: this.path}, bubbles: true, composed: true}));
  }
}

window.customElements.define(
    'photon-timeseries-renderer',
    PhotonTimeseriesRenderer
);
