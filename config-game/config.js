import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';
import cloneDeep from 'lodash/cloneDeep';

import {BASICCONFIG} from './basic-config';
import * as missions from './missions';

function customizer(objValue, srcValue, key, object, source, stack) {
    // Do not merge arrays but overwrite them
    if (isArray(objValue)) {
        return srcValue;
    }
    // Merging is handled by `_.merge()` itself if returning `undefined`
}

let configs = [];

for (let key in missions) {
    // Filter test configs in production
    if (!(process.env.NODE_ENV === 'production' && key.indexOf('test')!==-1)) {
        // Merge with standard config
        let cfg = cloneDeep(BASICCONFIG);
        cfg = mergeWith(cfg, missions[key], customizer);
        configs.push(cfg);
    }
}

export {configs};
