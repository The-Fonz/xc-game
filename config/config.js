import {BASICCONFIG} from './basic-config';
import * as missions from './missions';
import * as _ from 'lodash';

function customizer(objValue, srcValue) {
    // Do not merge arrays but overwrite them
    if (_.isArray(objValue)) {
        return srcValue;
    }
    // Merging is handled by `_.merge()` itself if returning `undefined`
}

let configs = [];

for (let key in missions) {
    // Test if 'test' in name
    if (!process.env.DEV && key.indexOf('test')!==-1) {
        // TODO: Filter test configs in production build
    } else {
        // Merge with standard config
        let cfg = _.merge({}, BASICCONFIG, missions[key], customizer);
        configs.push(cfg);
    }
}

export {configs};
