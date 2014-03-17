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

    $af.updateNodeItems = function(node, items) {
        var fields = [];
        var fieldItems = $af.select(node, "items");
        if (fieldItems.length === 0) {
            addEmptySimpleNode(node, "items", "1", items.length);
            fieldItems = $af.select(node, "items")[0];
        } else {
            fieldItems = fieldItems[0];
            fieldItems.fieldValue.value = items.length;
        }
        fields.push(fieldItems);
        addNewItemIds(fields, items);
        node.fields = fields;
    };

    var addNewItemIds = function(fields, items) {
        for (var i = 0, len = items.length; i < len; i++) {
            items[i].value = "Item" + i;
            fields.push(items[i]);
        }
    };

    $af.select = function(ast, query) {
        var fields = query.split(".");
        var node = ast;
        var result = [];
        for (var i = 0; i < fields.length; i++) {
            result = findFieldInNode(node, fields[i]);
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

    $af.selectOrAddClass = function(ast, selector, className) {
        var nodes = $af.select(ast, selector + "." + className);
        var result = {};
        if (nodes.length > 0) {
            result = nodes[0];
        } else {
            addEmptyClassNode($af.select(ast, selector)[0], className);
            result = $af.select(ast, selector + "." + className)[0];
        }
        return result;
    };

    var addEmptyClassNode = function(node, className) {
        node.fields.push({
            fields: [],
            type: 6,
            value: className
        });
    };

    var addEmptySimpleNode = function(node, fieldName, valueType, fieldValue) {
        node.fields.push({
            "fieldValue": {"type": valueType, "value": fieldValue},
            "type": 7,
            "value": fieldName
        });
    };

    $af.firstIndex = function(array, compare) {
        for(var i = 0; i < array.length; i++) {
            if (compare(array[i])) {
                return i;
            }
        }
        return -1;
    };

    $af.unQuote = function(value) {
        return value.substring(1, value.length - 1);
    };

}($mp.af, $mp.p));
