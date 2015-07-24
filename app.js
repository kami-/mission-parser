var SETTINGS = require('./settings.js'),
    HTTP = require('http'),
    FS = require('fs'),
    URL = require('url'),
    UTIL = require('./src/util.js');
    FACTIONS = require('./src/factions.js');
 
var sendIndexHTML = function (req, res) {
    UTIL.sendHTML(res, SETTINGS.FILE_PATHS.index);
};

var sendStyleCSS = function (req, res) {
    UTIL.sendCSS(res, SETTINGS.FILE_PATHS.styles);
};

var sendFactionData = function(req, res, game) {
    UTIL.sendJSON(res, FACTIONS.getFactionNamesByGame(game));
};

var sendArma2FactionData = function (req, res) {
    sendFactionData(req, res, 'arma2');
};

var sendArma2I44FactionData = function (req, res) {
    sendFactionData(req, res, 'arma2-i44');
};

var sendArma3FactionData = function (req, res) {
    sendFactionData(req, res, 'arma3');
};

var sendMissionWithFactions = function (req, res, game) {
    UTIL.getPostData(req, function (factionsString) {
        UTIL.sendText(res, FACTIONS.getMissionWithFactions(game, JSON.parse(factionsString)));
    });
};

var sendMissionWithArm2Factions = function (req, res) {
    sendMissionWithFactions(req, res, 'arma2');
};

var sendMissionWithArm2I44Factions = function (req, res) {
    sendMissionWithFactions(req, res, 'arma2-i44');
};

var sendMissionWithArm3Factions = function (req, res) {
    sendMissionWithFactions(req, res, 'arma3');
};

var ROUTES = {};
ROUTES[SETTINGS.CONTEXT_PATH] = {
    'GET': sendIndexHTML
};
ROUTES[SETTINGS.CONTEXT_PATH + '/styles.css'] = {
    'GET': sendStyleCSS
};
ROUTES[SETTINGS.CONTEXT_PATH + '/faction/arma2'] = {
    'GET': sendArma2FactionData,
    'POST': sendMissionWithArm2Factions
};
ROUTES[SETTINGS.CONTEXT_PATH + '/faction/arma2-i44'] = {
    'GET': sendArma2I44FactionData,
    'POST': sendMissionWithArm2I44Factions
};
ROUTES[SETTINGS.CONTEXT_PATH + '/faction/arma3'] = {
    'GET': sendArma3FactionData,
    'POST': sendMissionWithArm3Factions
};

HTTP.createServer(function (req, res) {
    try {
        var pathName = URL.parse(req.url).pathname;
        if (ROUTES[pathName]) {
            if (ROUTES[pathName][req.method]) {
                ROUTES[pathName][req.method](req, res);
            } else {
                UTIL.send405(res);
            }
        } else {
            UTIL.send404(res);
        }
    } catch (e) {
        console.log('There was an error.\n', e);
        UTIL.send500(res);
    }
}).listen(SETTINGS.PORT, SETTINGS.HOST_NAME);
