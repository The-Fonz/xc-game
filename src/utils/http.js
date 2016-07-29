/*
 * Http request utility functions, using promises
 */

import {l} from './logging';

export function promiseGet (url, responseType) {
 return new Promise(function (resolve, reject) {
   var xhr = new XMLHttpRequest();
   // Default is string
   if (responseType) xhr.responseType = responseType;
   xhr.open('GET', url);
   xhr.onload = function () {
     if (this.status >= 200 && this.status < 300) {
       l("utils.promiseGet: Successfully loaded "+url)
       resolve(xhr.response);
     } else {
       l("utils.promiseGet: Error loading "+url)
       reject({
         status: this.status,
         statusText: xhr.statusText
       });
     }
   };
   xhr.onerror = function () {
     reject({
       status: this.status,
       statusText: xhr.statusText
     });
   };
   xhr.send();
 });
}
