var $mp = $mp || {};
$mp.p = $mp.p || {};
$mp.af = $mp.af || {};

(function($af, $p, undefined) {
    "use strict";

    $af.trigger = $af.trigger || {};
    (function($trigger, $af, $p, undefined) {
        // Triggers are in Missions.Sensors
        $trigger.removeTriggers = function(ast) {
            var missions = $af.select(ast, "Mission");
            if (missions.length === 1) {
                var sensorIndex = $af.firstIndex(missions[0].fields, function(node) { return node.value === "Sensors" });
                if (sensorIndex >= 0) {
                    missions[0].fields.splice(sensorIndex, 1);
                };
            }
        };
    })($af.trigger, $af, $p, undefined);

    $af.select = function(ast, query) {
        var fields = query.split(".");
        var node = ast;
        var result = [];
        for (var i = 0; i < fields.length; i++) {
            var result = findFieldInNode(node, fields[i]);
            if (result.length == 1) {
                node = result[0];
            } else if (i !== fields.length - 1) {
                return [];
            }
        }
        return result;
    };

    var findFieldInNode = function(node, fieldName) {
        var result = [];
        if (node.type === $p.NodeType.ClassField || node.type === $p.NodeType.Root) {
            result = findFieldInArray(node.fields, fieldName);
        }
        return result;
    };

    var findFieldInArray = function(fields, fieldName) {
        var result = [];
        for(var i = 0; i < fields.length; i++) {
            if (fields[i].value === fieldName || fieldNameStarMatch(fields[i].value, fieldName)) {
                result.push(fields[i]);
            }
        }
        return result;
    };

    var fieldNameStarMatch = function(value, fieldName) {
        return fieldName.indexOf("*") === fieldName.length - 1 &&
            value.indexOf(fieldName.substring(0, fieldName.length - 1)) === 0;
    };

    var removeField = function(node, fieldName) {
        
    };

    $af.firstIndex = function(array, compare) {
        for(var i = 0; i < array.length; i++) {
            if (compare(array[i])) {
                return i;
            }
        }
        return -1;
    };

    $af.first = function(array, compare) {
        for(var i = 0; i < array.length; i++) {
            if (compare(array[i])) {
                return [array[i]];
            }
        }
        return [];
    };

    $af.hasValue = function(array, value) {
        return $af.firstIndex(array, function(other){ return other === value; }) >= 0;
    };

    $af.isEmpty = function(array) {
        return array.length === 0;
    };

}($mp.af, $mp.p));
