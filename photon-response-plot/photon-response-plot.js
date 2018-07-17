import { LitElement, html } from '@polymer/lit-element';
import photonSharedStyles from '../photon-shared-styles.js';
import timeseriesTools from '@photon-elements/photon-tools/photon-timeseries-tools';

class PhotonResponsePlot extends LitElement {
  _render({ stack, plottedPaths }) {
    if (!stack || !plottedPaths) {
      return ``;
    }
    console.log('[photon-response-plot] - _render', this._dataFromPlottedTs(), stack, plottedPaths);
    return html`
        ${photonSharedStyles} 
        ${Object.entries(this._dataFromPlottedTs()).map((tsByLevel) => html`
          ${tsByLevel[1].length >0 ?
            html`
              <div class="flex">
                <div class="key">
                  Stack level ${tsByLevel[0]}
                </div>
                <div>
                  <ul>
                      ${tsByLevel[1].map((ts) => {
                        return html`
                          <li>
                            ${timeseriesTools.serializeTimeseriesMetadata(ts)}
                          </li>
                        `;
                      })}
                    </li>
                  </ul>
                </div>
              </div>
            ` :
            ''
          }
        `)}
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
      plottedPaths: Array,
      /**
       * {Array<any>} A Warp 10 return stack
       */
      stack: Array,
    };
  }

  _renderStyles() {
    return html`
      <style>
        .flex {
          display: flex;
        }
        .key {
          width: 150px;
        }

      </style>
    `;
  }

  _dataFromPlottedTs() {
    let plottedData = {};
    Object.entries(this.plottedPaths).forEach((pathsByLevel) => {
      plottedData[pathsByLevel[0]] = pathsByLevel[1].map((path) => {
        return this._queryObj(this.stack[pathsByLevel[0]], path);
      });
    });
    console.log('rendering', this.plottedPaths, this.stack, plottedData);
    return plottedData;
  }

  _queryObj(obj, path) {
    let steps = path.split('.');
    steps.shift();


    let data = steps.reduce((accumulator, current, ) => {
      if (typeof accumulator !== 'object') {
        return false;
      }
      return (accumulator[current] !== undefined) ? accumulator[current] : false;
    }, obj);
    return data;
  }
}

window.customElements.define('photon-response-plot', PhotonResponsePlot);
