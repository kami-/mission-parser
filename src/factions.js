var FS = require('fs'),
    SETTINGS = require('../settings.js'),
    $mp = require('./mission-parser/mission-parser.js').$mp;

var getFactionDataByGame = function (game) {
    var result = {},
        factionData;
    try {
        factionData = FS.readFileSync(SETTINGS.FILE_PATHS.factions, 'utf8');
        factionData = JSON.parse(factionData);
        if (factionData[game]) {
            result = factionData[game];
        }
    } catch (e) {
        console.log('Failed to read faction data file!\n', e);
    }
    return result
};

var readFactionFile = function (game, factionData, faction) {
    var result = '';
    if (factionData[faction]) {
        try {
            result = FS.readFileSync(SETTINGS.FILE_PATHS.factions_base + '/' + game + '/' + factionData[faction], 'utf8');
        } catch (e) {
            console.log('Failed to read faction file!\n', e);
        }
    }
    return result
};

var getFactionFiles = function (game, factionData, factions) {
    var result = [];
    for(var i = 0, len = factions.length; i < len; i++) {
        var factionFile = readFactionFile(game, factionData, factions[i]);
        if (factionFile !== '') {
            result.push(factionFile);
        }
    }
    return result;
};

var getDefaultMission = function (game, factionData) {
    return readFactionFile(game, factionData, SETTINGS.DEFAULT_MISSION_SQM);
};

exports.getFactionNamesByGame = function (game) {
    var result = [],
        factionData = getFactionDataByGame(game);
    for (prop in factionData) {
        if (factionData.hasOwnProperty(prop) && prop !== SETTINGS.DEFAULT_MISSION_SQM) {
            result.push(prop);
        }
    }
    return result;
};

exports.getMissionWithFactions = function (game, factions) {
    var factionData = getFactionDataByGame(game);
    var missionFile = getDefaultMission(game, factionData);
    $mp.p.init(missionFile, $mp.l);
    var missionAst = $mp.p.parse();
    $mp.hull.addFactions(missionAst, getFactionFiles(game, factionData, factions));
    return $mp.pp.pp(missionAst, '    ');
};