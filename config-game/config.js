import isArray from 'lodash/isArray';
import merge from 'lodash/merge';

import {BASICCONFIG} from './basic-config';
import * as missions from './missions';

function customizer(objValue, srcValue) {
    // Do not merge arrays but overwrite them
    if (isArray(objValue)) {
        return srcValue;
    }
    // Merging is handled by `_.merge()` itself if returning `undefined`
}

let configs = [];

for (let key in missions) {
    // Filter test configs in production
    if (!(ENV === 'production' && key.indexOf('test')!==-1)) {
        // Merge with standard config
        let cfg = merge({}, BASICCONFIG, missions[key], customizer);
        configs.push(cfg);
    }
}

export {configs};