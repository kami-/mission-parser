var FS = require('fs');

exports.log = function(msg) {
    console.log('[MIS-PARS] ' + (new Date()).toISOString() + ' - ' + msg + '\n');
};

exports.sendHTML = function (res, htmlFile) {
    res.writeHeader(200, {"Content-Type": "text/html"});
    res.write(FS.readFileSync(htmlFile, 'utf8'));
    res.end();
};

exports.sendCSS = function (res, cssFile) {
    res.writeHeader(200, {"Content-Type": "text/css"});
    res.write(FS.readFileSync(cssFile, 'utf8'));
    res.end();
};

exports.sendText = function (res, text) {
    res.writeHeader(200, {"Content-Type": "text/plain"});
    res.write(text);
    res.end();
};
 
exports.sendJSON = function (res, obj) {
    res.writeHeader(200, {"Content-Type": "application/json"});
    res.write(JSON.stringify(obj));
    res.end();
};
 
exports.sendError = function (res, status, msg) {
    res.statusCode = status;
    res.write(msg);
    res.end();
};
 
exports.send404 = function (res) {
    exports.sendError(res, 404, '404 - Not found');
};
 
exports.send405 = function (res) {
    exports.sendError(res, 405, '405 - Method Not Allowed');
};

exports.send500 = function (res) {
    exports.sendError(res, 500, '500 - Internal Server Error');
};

exports.getPostData = function (req, doneCallback) {
    var postData = '';
    req.on('data', function(chunk) {
        postData += chunk;
    });
    req.on('end', function() {
        doneCallback(postData);
    });
};