/**
@license MIT
Copyright (c) 2018 Horacio "LostInBrittany" Gonzalez

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

@element photon-shared-styles
@blurb Shared styles for Photon IDE
 */

import { html } from '@polymer/lit-element';

const photonSharedStyles = html`
<style>
  :host {
    --app-primary-color: #162d50;
    --app-primary-contrast: #ffcc00;
    --app-secondary-color: #162d50;
    --app-secondary-contrast: #ffffff;
    --mdc-theme-primary: #162d50;
    --mdc-theme-on-primary: #ffcc00;
    --app-primary-contrast-2: #ff3675;
    --app-primary-contrast-3: #86eb4e;
    --app-primary-contrast-4: #eeeeee;
    --app-primary-contrast-muted: #dbbe48;
  }
  .row {
    margin-top: 16px;
    margin-bottom: 16px;
    display: flex;
    flex-flow: row nowrap;
  }
  .column {
    display: flex;
    flex-flow: column nowrap;
  }

  .flex {
    display: flex;
    flex-flow: row nowrap;
  }
  .align-items-center {
    align-items: center;
  }
  .wrap {
    flex-wrap: wrap;
  }

  .flex-end {
    justify-content: flex-end;
  }

  .space-around {
    justify-content: space-around;
  }

  .justify-center {
    justify-content: center;
  }

  .flex > .horizontal-flex-item:not(:first-child) {
    padding-left: 16px;
  }
  .flex > .horizontal-flex-item:not(:last-child) {
    padding-right: 16px;
  }

  *[cloak] {
    display: none;
  }
</style>
`;

export default photonSharedStyles;
