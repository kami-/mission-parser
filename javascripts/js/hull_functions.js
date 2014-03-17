$mp = $mp || {};
$mp.hull = $mp.hull || {};

(function($hull, $af, $p, $l, $pp, undefined) {
    "use strict";
// ["usmc_winter", "usmc_fr", "tk_specf", "ger_ksk", "pmc_specf", "ru_spetsnaz", "us_deltaf", "tk_militia", "us_army", "tk_local", "tk_army", "baf", "un", "chdkz_ins", "cdf", "napa", "pmc", "ru_woodland", "ru_desert", "usmc_woodland", "usmc_desert", "usmc_90_woodland"]
    $hull.addFactions = function(ast, factions) {
        var groups = $af.selectOrAddClass(ast, "Mission", "Groups");
        var vehicles = $af.selectOrAddClass(ast, "Mission", "Vehicles");
        addAllFactionFieldItems(groups, "Groups", factions);
        addAllFactionFieldItems(vehicles, "Vehicles", factions);
    };

    var addAllFactionFieldItems = function(node, nodeName, factions) {
        var allItems = $af.select(node, "Item*");
        for(var i = 0, len = factions.length; i < len; i++) {
            var concat = allItems.concat(getFactionFieldItems(nodeName, factions[i]));
            allItems = concat;
        }
        $af.updateNodeItems(node, allItems);
    };

    var getFactionFieldItems = function(fieldName, faction) {
        var result = [];
        if ($hull.factions[faction][fieldName]) {
            $p.init($hull.factions[faction][fieldName], $l);
            var fields = $p.parse();
            result = $af.select(fields, fieldName + ".Item*");
        }
        return result;
    };

}($mp.hull, $mp.af, $mp.p, $mp.l, $mp.pp));