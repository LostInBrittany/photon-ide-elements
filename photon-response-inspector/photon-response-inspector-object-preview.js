import { html, LitElement } from '@polymer/lit-element';


import '@granite-elements/granite-inspector/object-inspector/granite-inspector-object-name';
import '@granite-elements/granite-inspector/object-inspector/granite-inspector-object-value';

import './photon-timeseries-renderer';

import timeseriesTools from '@photon-elements/photon-tools/photon-timeseries-tools';

/**
 * A view for object property names.
 *
 * If the property name is enumerable (in Object.keys(object)),
 * the property name will be rendered normally.
 *
 * If the property name is not enumerable (`Object.prototype.propertyIsEnumerable()`),
 * the property name will be dimmed to show the difference.
 */
class PhotonResponseInspectorObjectPreview extends LitElement {
  /**
   * We don't want Shadow DOM for this element
   * See https://github.com/Polymer/lit-element/issues/42
   * @overrides
   * @return {Object} this
   */
  _createRoot() {
    return this;
  }

  _render({ data, path }) {
    return html`
      ${this.markup(data, path)}
    `;
  }

  static get properties() {
    return {
      data: Object,
      path: String,
      maxProperties: Number,
    };
  }

  constructor() {
    super();
    this.maxProperties = 3;
  }


  markup() {
    if (typeof this.data !== 'object' ||
        this.data === null ||
        this.data instanceof Date ||
        this.data instanceof RegExp) {
      return html`<granite-inspector-object-value data=${this.data}></granite-inspector-object-value>`;
    }

    if (this.data instanceof Array) {
      return html`
        <span class='objectValueObject'>
          <span>(${this.data.length}) [</span>
            ${html`${
              this.data.map((element, i) => {
                if (timeseriesTools.isTimeseries(element)) {
                  return html`                  
                    <photon-timeseries-renderer ts=${element} path='${this.path}.${i}'></photon-timeseries-renderer>                    
                    ${i<this.data.length-1 ? html`<span>,&nbsp;</span>` : ``}`;
                } else {
                  return html`
                    <granite-inspector-object-value data=${element}></granite-inspector-object-value> 
                    ${i<this.data.length-1 ? html`<span>,&nbsp;</span>` : ``}
                  `;
                }
              })
            }`}
          <span>]</span>
        </span>
      `;
    } else if (typeof this.data === 'string') {
      return html`<granite-inspector-object-value data='${this.data}' ></granite-inspector-object-value>`;
    } else if (timeseriesTools.isTimeseries(this.data)) {
      return html`        
        <photon-timeseries-renderer ts=${this.data} path=${this.path}></photon-timeseries-renderer> `;
    } else {
      let propertyNodes = [];
      for (let propertyName in this.data) {
        if (Object.prototype.hasOwnProperty.call(this.data, propertyName)) {
          const propertyValue = this.data[propertyName];
          let ellipsis = '';
          if (propertyNodes.length === this.maxProperties - 1 &&
              Object.keys(this.data).length > this.maxProperties) {
            ellipsis = html`<span>…</span>`;
          }
          if (timeseriesTools.isTimeseries(propertyValue)) {
            propertyNodes.push(html`
            <span>
              <granite-inspector-object-name name=${propertyName}></granite-inspector-object-name>:&nbsp;
              <photon-timeseries-renderer 
                  ts=${propertyValue} 
                  path='${this.path}.${propertyName}'></photon-timeseries-renderer>
              ${ellipsis}
            </span>`);
          } else {
            propertyNodes.push(html`
            <span>
              <granite-inspector-object-name name=${propertyName}></granite-inspector-object-name>
              <span>:&nbsp;</span>
              <granite-inspector-object-value data=${propertyValue}></granite-inspector-object-value>
              ${ellipsis}
            </span>`);
          }
          if (ellipsis != '') break;
        }
      }
      if (propertyNodes.length == 0) {
        return html`${this.data.constructor.name} {}`;
      }
      return html`
        <span class='objectValueObject'>
          <span>${this.data.constructor.name} {</span>
          ${propertyNodes.map((element, i) => html`${element}${i<propertyNodes.length-1 ? html`<span>,&nbsp;</span>` : ``}`)}
          <span>}</span> 
        </span>
      `;
    }
  }
}

window.customElements.define('photon-response-inspector-object-preview', PhotonResponseInspectorObjectPreview);
