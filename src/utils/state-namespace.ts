// This template string tag function is used to 
// generate namespace from local state storage.
// In case of collision with server cache.
// eg. 
// import stateNs from './utils/state_namespace';
// stateNs`global`
// will generate "__STATE_global"
// stateNs`${settingsDva.namespace}` this will also support.

const NAMESPACE = '__STATE_';

export default function (literals: any, ...placeholders: any[]) {
    // We always get literals[0] and then matching post literals for each arg given
    var result = (typeof(literals) === "string") ? literals : literals[0];
  
    for (var i = 0; i < placeholders.length; i++) {
        result += placeholders[i];
        result += literals[i];
    }
    
    return `${NAMESPACE}${result}`;
  }