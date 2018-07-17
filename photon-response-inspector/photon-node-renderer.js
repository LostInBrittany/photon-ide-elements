import { html } from '@polymer/lit-element';
import './photon-response-inspector-object-root-label';
import './photon-response-inspector-object-label';

const defaultNodeRenderer = ({ depth, name, data, isNonEnumerable }) => {
   return html`
      ${depth === 0 ?
        html`<photon-response-inspector-object-root-label name=${name} data=${data}></photon-response-inspector-object-root-label>` :
        html`
        <photon-response-inspector-object-label name=${name} data=${data} isNonEnumerable=${isNonEnumerable}>        
        </photon-response-inspector-object-label>
        `
      }
    `;
  };

export default defaultNodeRenderer;
