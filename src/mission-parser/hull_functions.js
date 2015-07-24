var $mp = $mp || {};
$mp.l = require('./lexer.js').$l;
$mp.p = require('./parser.js').$p;
$mp.af = require('./ast_functions.js').$af;
$mp.pp = require('./prettyprinter.js').$pp;

$mp.hull = $mp.hull || {};

(function($hull, $af, $p, $l, $pp, undefined) {
    "use strict";

    $hull.addFactions = function(ast, factionFiles) {
        var groups = $af.selectOrAddClass(ast, "Mission", "Groups");
        var vehicles = $af.selectOrAddClass(ast, "Mission", "Vehicles");
        addAllFactionFieldItems(groups, "Mission.Groups", factionFiles);
        addAllFactionFieldItems(vehicles, "Mission.Vehicles", factionFiles);
    };

    var addAllFactionFieldItems = function(node, nodeName, factionFiles) {
        var allItems = $af.select(node, "Item*");
        for (var i = 0, len = factionFiles.length; i < len; i++) {
            var concat = allItems.concat(getFactionFieldItems(nodeName, factionFiles[i]));
            allItems = concat;
        }
        $af.updateNodeItems(node, allItems);
    };

    var getFactionFieldItems = function(fieldName, factionFile) {
        $p.init(factionFile, $l);
        var fields = $p.parse();
        return $af.select(fields, fieldName + ".Item*");
    };

}($mp.hull, $mp.af, $mp.p, $mp.l, $mp.pp));

exports.$hull = $mp.hull;