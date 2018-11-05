var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import { FormElement, html, property, observer, query, customElement } from '@material/mwc-base/form-element.js';
import { style } from '@material/mwc-switch/mwc-switch-css.js';
import MDCSwitchFoundation from '@material/switch/foundation.js';
import { ripple } from '@material/mwc-ripple/ripple-directive.js';
let Switch = class Switch extends FormElement {
  constructor() {
      super(...arguments);
      this.checked = false;
      this.disabled = false;
      this._changeHandler = (e) => {
          this.mdcFoundation.handleChange(e);
          // catch "click" event and sync properties
          this.dispatchEvent(new CustomEvent('change', {
            detail: { checked: this._input.checked },
            bubbles: true, composed: true,
          }));
          this.checked = this.formElement.checked;
      };
      this.mdcFoundationClass = MDCSwitchFoundation;
  }
  renderStyle() {
      return style;
  }
  createAdapter() {
      return Object.assign({}, super.createAdapter(), { setNativeControlChecked: (checked) => {
              this.formElement.checked = checked;
          }, setNativeControlDisabled: (disabled) => {
              this.formElement.disabled = disabled;
          } });
  }
  get ripple() {
      return this.rippleNode.ripple;
  }
  render() {
      return html `
    ${this.renderStyle()}
    <div class="mdc-switch">
      <div class="mdc-switch__track"></div>
      <div class="mdc-switch__thumb-underlay" .ripple="${ripple()}">
        <div class="mdc-switch__thumb">
          <input type="checkbox" id="basic-switch" class="mdc-switch__native-control" role="switch" @change="${this._changeHandler}">
        </div>
      </div>
    </div>
    <slot></slot>`;
  }
};
__decorate([
  property({ type: Boolean }),
  observer(function (value) {
      this.mdcFoundation.setChecked(value);
  })
], Switch.prototype, "checked", void 0);
__decorate([
  property({ type: Boolean }),
  observer(function (value) {
      this.mdcFoundation.setDisabled(value);
  })
], Switch.prototype, "disabled", void 0);
__decorate([
  query('.mdc-switch')
], Switch.prototype, "mdcRoot", void 0);
__decorate([
  query('input')
], Switch.prototype, "formElement", void 0);
__decorate([
  query('.mdc-switch__thumb-underlay')
], Switch.prototype, "rippleNode", void 0);
Switch = __decorate([
  customElement('photon-switch')
], Switch);
export { Switch };
//# sourceMappingURL=photon-switch.js.map