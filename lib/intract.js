console.log("before - from intract.js " + new Date); // REMOVE

(function() {
  var version = "0.1.0";
  var url = '//' + intract_remote_path + '/intract-main.js?' + version + parseInt(Math.random * 10000);
  var iframe = document.createElement('iframe');
  (iframe.frameElement || iframe).style.cssText = "width: 0; height: 0; border: 0";
  iframe.src = "javascript:false";
  document.getElementById('intract').appendChild(iframe);
  var doc = iframe.contentWindow.document;
  doc.open().write('<body onload="'+
    'window.inIF = true;' +
    'var js = document.createElement(\'script\');'+
    'js.src = \''+ url +'\';'+
    'document.body.appendChild(js);">');
  doc.close();
})();

console.log("after - from intract.js " + new Date); // REMOVE
