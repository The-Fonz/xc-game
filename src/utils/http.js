/*
 * Http request utility functions, using promises
 */

export function promiseGet (url, responseType) {
 return new Promise(function (resolve, reject) {
   var xhr = new XMLHttpRequest();
   // Default is string
   if (responseType) xhr.responseType = responseType;
   xhr.open('GET', url);
   xhr.onload = function () {
     if (this.status >= 200 && this.status < 300) {
       resolve(xhr.response);
     } else {
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
