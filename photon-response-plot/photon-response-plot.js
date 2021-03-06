import { LitElement, html } from '@polymer/lit-element';
import photonSharedStyles from '../photon-shared-styles.js';
import timeseriesTools from '@photon-elements/photon-tools/photon-timeseries-tools';
import '@granite-elements/granite-c3/granite-c3';
import '../photon-switch/photon-switch';

class PhotonResponsePlot extends LitElement {
  render() {
    if (!this.stack || !this.plottedPaths ) {
      return ``;
    }
    return html`
        ${photonSharedStyles} 
        ${this._renderStyles()}
        ${this._renderC3()}        
        <div class="row flex justify-center">
          <div class="horizontal-flex-item">Dates</div> 
          <photon-switch 
              checked="${this.timestamps}" 
              on-change="${(evt) => this._onTimestampsChange(evt)}"
              class="horizontal-flex-item"></photon-switch> 
          <div class="horizontal-flex-item">Timestamps</div>           
        </div>
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
      plottedPaths: {type: Array},
      /**
       * {Array<any>} A Warp 10 return stack
       */
      stack: {type: Array},
      /**
       * Boolean If true, display timestamps instead of dates
       */
      timestamps: {type: Boolean},
      /**
       * Boolean If true, log to the console
       */
      debug: {type: Boolean},
    };
  }

  _renderStyles() {
    return html`
      <style>
        :host {
          display: block;
          width: 100%;
        }
        photon-switch {
          --mdc-theme-secondary: var(--app-primary-color);
        }

      </style>
    `;
  }

  _onTimestampsChange(evt) {
    if (this.debug) {
      console.log('[photon-response-plot] _onTimestampsChange - timestamps:', evt.detail.checked);
    }
    this.timestamps = evt.detail.checked;
  }

  _dataFromPlottedTs() {
    let plottedData = {};
    if (this.debug) {
      console.log('[photon-response-plot] _dataFromPlottedTs - plottedPaths:', this.plottedPaths);
    }
    Object.entries(this.plottedPaths).forEach((pathsByLevel) => {
      plottedData[pathsByLevel[0]] = pathsByLevel[1]
        .filter((path) => {
          return !!this._queryObj(this.stack[pathsByLevel[0]], path);
        })
        .map((path) => {
          let item = this._queryObj(this.stack[pathsByLevel[0]], path);
            item.id=path;
            item.level = pathsByLevel[0];
            item.name = `${pathsByLevel[0]}: ${timeseriesTools.serializeTimeseriesMetadata(item)}`;
            return item;
        });
    });
    if (this.debug) {
      console.log('[photon-response-plot] _dataFromPlottedTs', this.plottedPaths, this.stack, plottedData);
    }
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
    let point = {
      r: 2,
      focus: {
        expand: {
          enabled: true,
          r: 4,
        },
      },
    };
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
          format: (x) => {
            try {
              if (!this.timestamps) {
                return x.toISOString().replace('T', ' ').replace(/\.[0-9]+Z/, '');
              }
              return x.getTime();
            } catch (err) {
              return '';
            }
          },
        },
      },
      y: {
        show: true,
        tick: {
          centered: true,
          outer: false,
          fit: true,
          format: (y) => {
            let value = y.toFixed(5);
            let splittedValue = value.split('.');
            let formattedIntPart = splittedValue[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            let formattedDecimalPart = splittedValue[1].replace(/0+$/g, '');
            if (formattedDecimalPart.length === 0) {
              return formattedIntPart;
            }
            return formattedIntPart + '.' + formattedDecimalPart;
          },
        },
      },
    };
    let grid = {
      x: {
        show: true,
      },
      y: {
        show: true,
      },
    };

    let conf = {
      size: {
        height: 340,
      },
      point: point,
      axis: axis,
      grid: grid,
      legend: {
        hide: false,
      },
      tooltip: {
        grouped: true,
      },
    };
    if (this.debug) {
      console.log('[photon-response-plot] _chartConf', conf);
    }
    return conf;
  }

  _renderC3() {
    if (this.debug) {
      console.log('[photon-response-plot] _renderC3 - this._dataFromPlottedTs()', this._dataFromPlottedTs());
    }

    let stack = Object.entries(this._dataFromPlottedTs()).
        map((entry) => entry[1]).
        reduce((acc, val) => acc.concat(val), []);
    if (this.debug) {
      console.log('[photon-response-plot] _renderC3 - stack', stack);
    }

    let c3Data = timeseriesTools.timeseriesToC3(stack, {}, this.timestamps);
    c3Data.unload = true;
    if (this.debug) {
      console.log('[photon-response-plot] _renderC3 - c3Data', c3Data, 'timestamps', this.timestamps);
    }

    if (c3Data.columns && c3Data.columns.length >0) {
      return html`
        <granite-c3 
            .data=${c3Data} 
            .options=${this._chartConf()} 
            .debug=${this.debug}></granite-c3>
      `;
    }
  }
}

window.customElements.define('photon-response-plot', PhotonResponsePlot);
