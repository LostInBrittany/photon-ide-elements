import { LitElement, html } from '@polymer/lit-element';

import { createStyles } from '@granite-elements/granite-inspector/styles/createStyles';
import createIterator from '@granite-elements/granite-inspector/tools/createIterator';
import '@granite-elements/granite-inspector/tree-view/granite-inspector-tree-view';

import photonSharedStyles from '../photon-shared-styles.js';

import defaultNodeRenderer from './photon-node-renderer';

const photonTheme = {
  BASE_FONT_FAMILY: 'monospace',
  BASE_FONT_SIZE: '14px',
  BASE_LINE_HEIGHT: '18px',

  BASE_BACKGROUND_COLOR: 'var(--app-primary-color)',
  BASE_COLOR: 'rgb(213, 213, 213)',

  OBJECT_NAME_COLOR: 'var(--app-primary-contrast-2)',
  OBJECT_VALUE_NULL_COLOR: 'rgb(127, 127, 127)',
  OBJECT_VALUE_UNDEFINED_COLOR: 'rgb(127, 127, 127)',
  OBJECT_VALUE_REGEXP_COLOR: 'var(--app-primary-contrast-4)',
  OBJECT_VALUE_STRING_COLOR: 'var(--app-primary-contrast-4)',
  OBJECT_VALUE_SYMBOL_COLOR: 'var(--app-primary-contrast-4)',
  OBJECT_VALUE_NUMBER_COLOR: 'var(--app-primary-contrast-3)',
  OBJECT_VALUE_BOOLEAN_COLOR: 'var(--app-primary-contrast-3)',
  OBJECT_VALUE_FUNCTION_KEYWORD_COLOR: 'rgb(242, 85, 217)',

  HTML_TAG_COLOR: 'rgb(93, 176, 215)',
  HTML_TAGNAME_COLOR: 'rgb(93, 176, 215)',
  HTML_TAGNAME_TEXT_TRANSFORM: 'lowercase',
  HTML_ATTRIBUTE_NAME_COLOR: 'rgb(155, 187, 220)',
  HTML_ATTRIBUTE_VALUE_COLOR: 'rgb(242, 151, 102)',
  HTML_COMMENT_COLOR: 'rgb(137, 137, 137)',
  HTML_DOCTYPE_COLOR: 'rgb(192, 192, 192)',

  ARROW_COLOR: 'rgb(145, 145, 145)',
  ARROW_MARGIN_RIGHT: '3px',
  ARROW_FONT_SIZE: '12px',

  TREENODE_FONT_FAMILY: 'monospace',
  TREENODE_FONT_SIZE: '14px',
  TREENODE_LINE_HEIGHT: '1.2rem',
  TREENODE_PADDING_LEFT: '12px',

  TABLE_BORDER_COLOR: 'rgb(85, 85, 85)',
  TABLE_TH_BACKGROUND_COLOR: 'rgb(44, 44, 44)',
  TABLE_TH_HOVER_COLOR: 'rgb(48, 48, 48)',
  TABLE_SORT_ICON_COLOR: 'black', // 'rgb(48, 57, 66)',
  TABLE_DATA_BACKGROUND_IMAGE:
    'linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0) 50%, rgba(51, 139, 255, 0.0980392) 50%, rgba(51, 139, 255, 0.0980392))',
  TABLE_DATA_BACKGROUND_SIZE: '128px 32px',
};


class PhotonResponseInspector extends LitElement {
  /**
   * We don't want Shadow DOM for this element
   * See https://github.com/Polymer/lit-element/issues/42
   * @overrides
   * @return {Object} this
   */
  _createRoot() {
    return this;
  }

  _render({ stack, nodeRenderer }) {
    let iterator = createIterator(true);
    return html`
      ${photonSharedStyles}
      ${this._renderElementStyles()}
      <style>
        ${this.styles}
      </style>
    <div class="response-panel">
      ${stack !== undefined ?
        stack.map((line, index) => {
          return html`
            <div class="line">
              <div class="line-number">${index}:</div>
              <div class="line-content-container">
                <div 
                    class="line-content" 
                    on-plot-ts='${(evt) => this._onPlotTs(evt.detail, index)}'>
                  <granite-inspector-tree-view
                      data=${line}
                      expandLevel=0
                      expandPath=''
                      sortObjectKeys='true'
                      nodeRenderer=${nodeRenderer}
                      dataIterator=${iterator}></granite-inspector-tree-view>
                </div>
              </div>
            </div>
          `;
        }) : ''}      
    </div>
      
    `;
  }

  constructor() {
    super();
    this.styles = createStyles(photonTheme);
    this.nodeRenderer = defaultNodeRenderer;
    this.plottedTs = {};
  }

  connectedCallback() {
    super.connectedCallback();
  }
  static get properties() {
    return {
      /**
       * The Warp 10 response stack you would like to inspect
       */
      stack: Array,
      nodeRenderer: Function,
    };
  }

  _onPlotTs(ts, index) {
    if (!this.plottedTs[index]) {
      this.plottedTs[index] = [];
    }
    
  }

  _renderElementStyles() {
    return html`
      <style>
        .response-panel {
          width: 100%;
          margin-top: 1.5rem;
          min-height: 1.5rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          background-color: var(--app-primary-color); 
          border: 1px solid #e3e3e3;
          border-radius: 4px;
          -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05)
        }

        .line {
          width: 100%;
          font-size: 14px;
          font-family: monospace;
          display: flex;
          flex-wrap: nowrap;
          justify-content: stretch;
          
        }

        .line-number {
          width: 3rem;
          text-align: right;
          color: white;
        }

        .line-content-container {
          width: calc(100% - 3rem);
        }

        .line-content {
          margin-left: 1rem;
          color: white;
          word-wrap: break-word;
        }

        .serializedTimeseries {
          color: var(--app-primary-contrast);
        }

        photon-response-inspector-object-preview,
        photon-response-inspector-object-root-label,
        photon-response-inspector-object-label {
          font-size: 0px;
        }
        photon-response-inspector-object-preview span,
        photon-response-inspector-object-root-label span,
        photon-response-inspector-object-label span {
          font-size: 14px;
        }

        photon-response-inspector-object-preview .objectValueObject {
          font-size: 0px;
          font-style: italic;
        }

      </style>
    `;
  }
}

window.customElements.define('photon-response-inspector', PhotonResponseInspector);
