import { LitElement, html } from '@polymer/lit-element';
import photonSharedStyles from '../photon-shared-styles.js';
import timeseriesTools from '@photon-elements/photon-tools/photon-timeseries-tools';
import '@granite-elements/granite-c3/granite-c3';

class PhotonResponsePlot extends LitElement {
  _render({ stack, plottedPaths }) {
    if (!stack || !plottedPaths ) {
      return ``;
    }
    // console.log('[photon-response-plot] - _render', this._dataFromPlottedTs(), stack, plottedPaths);
    return html`
        ${photonSharedStyles} 
        ${this._renderC3()}
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
        let item = this._queryObj(this.stack[pathsByLevel[0]], path);
        item.id=path;
        return item;
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

  _chartConf() {
    let axis = {
      x: {
        show: true,
        centered: true,
        type: 'timeseries',
        tick: {
          centered: true,
          count: 6,
          outer: false,
          culling: { max: 4 },
          fit: true,
          multiline: true,
          format: '%Y-%m-%d %H:%M:%S',
        },
      },
      y: {
        show: true,
      },
    };
    return {
      size: {
        height: 340,
      },
      axis: axis,
      legend: {
        hide: false,
      },
      tooltip: {
        grouped: true,
      },
    };
  }

  _renderC3() {
    console.log('[photon-response-plot] _renderC3 - this._dataFromPlottedTs()', this._dataFromPlottedTs());
    let stack = Object.entries(this._dataFromPlottedTs()).
        map((entry) => entry[1]).
        reduce((acc, val) => acc.concat(val), []);
    console.log('[photon-response-plot] _renderC3 - stack', stack);
  
    let c3Data = timeseriesTools.timeseriesToC3(stack);
    c3Data.unload = true;
    console.log('[photon-response-plot] _renderC3 - c3Data', c3Data);
    
    if (c3Data.columns && c3Data.columns.length >0) {
      return html`
        <granite-c3 
            data=${c3Data} 
            options=${this._chartConf()} 
            debug></granite-c3>
      `;
    }
  }
}

window.customElements.define('photon-response-plot', PhotonResponsePlot);
