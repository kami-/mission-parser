var $mp = $mp || {};
$mp.p = require('./parser.js').$p;
$mp.af = require('./ast_functions.js').$af;
$mp.sa = require('./simpleast.js').$sa;

$mp.cg = $mp.cg || {};

(function($cg, $p, $af, $sa, undefined) {
    "use strict";

    $cg.allTrigger = function(triggerNodes) {
        var code = '\nprivate ["_triggers, _trigger"];\n';
        code += '_triggers = [];\n'
        for(var i = 0; i < triggerNodes.length; i++) {
            var trigger = $cg.trigger(triggerNodes[i]);
            code += trigger.code;
            code += "_triggers set " + array("count _triggers", trigger.trigger.name) + ";\n\n";
        }
        return code;
    };

    $cg.trigger = function(triggerNode) {
        var trigger = $sa.simplify(triggerNode);
        initTrigger(trigger);
        var code = assignment(trigger.name, "createTrigger " + array('"EmptyDetector"', fromArray(trigger.position))) + '\n';
        code += trigger.name + " setTriggerArea " + array(trigger.a, trigger.b, trigger.angle, bool(trigger.rectangular)) + ';\n';
        code += trigger.name + " setTriggerActivation " + array(trigger.activationBy, trigger.activationType, bool(trigger.repeating)) + ";\n";
        code += trigger.name + " setTriggerStatements " + array(trigger.expCond, trigger.expActiv, trigger.expDesactiv)+ ";\n";
        code += trigger.name + " setTriggerTimeout " + array(trigger.timeoutMin, trigger.timeoutMid, trigger.timeoutMax, bool(trigger.interruptable)) + ";\n";
        code += trigger.name + " setTriggerText " + trigger.text + ";\n";
        return {"trigger": trigger, "code": code};
    };

    var assignment = function(left, right) {
        return left + " = " + right + ";";
    };

    var array = function() {
        var code = "[";
        for(var i = 0; i < arguments.length; i++) {
            if (i !== 0) {
                code += ", ";
            }
            code += arguments[i];
        }
        return code += "]";
    };

    var fromArray = function(elements) {
        var code = "[";
        for(var i = 0; i < elements.length; i++) {
            if (i !== 0) {
                code += ", ";
            }
            code += elements[i];
        }
        return code += "]";
    };

    var bool = function(value) {
        if (value === "1") {
            return "true";
        } else {
            return "false";
        }
    };

    var initTrigger = function(trigger) {
        properties = {
            "name": "_trigger", "a": "100", "b": "100", "angle": "0", "text": '""', "rectangular": "0", "repeating": "0",
            "age": '"UNKNOWN"', "activationBy": '"NONE"', "expCond": '"this"', "expActiv": '""', "expDesactiv": '""',
            "interruptable": "1", "activationType": '"NOT PRESENT"', "timeoutMin": "0", "timeoutMid": "0", "timeoutMax": "0"
        };
        setProperties(trigger, properties);
        trigger.name = unQuoteString(trigger.name);
    };

    var unQuoteString = function(string) {
        if (string.length > 2 && string[0] === '"' && string[string.length - 1] === '"') {
            return string.substring(1, string.length - 1);
        }
        return string;
    };

    var setProperties = function(object, properties) {
        for (property in properties) {
            setProperty(object, property, properties[property]);
        };
    };

    var setProperty = function(object, prop, defval) {
        if (!object.hasOwnProperty(prop)) {
            object[prop] = defval;
        }
    };

}($mp.cg, $mp.p, $mp.af, $mp.sa));

exports.$cg = $mp.cg;