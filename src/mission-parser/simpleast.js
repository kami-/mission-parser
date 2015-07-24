var $mp = $mp || {};
$mp.p = require('./parser.js').$p;

$mp.sa = $mp.sa || {};

(function($sa, $p, undefined) {
    "use strict";

    $sa.simplify = function(ast) {
        var newAst = {};
        for(var i = 0; i < ast.fields.length; i++) {
            simplifyNode(newAst, ast.fields[i]);
        }
        return newAst;
    };

    var simplifyNode = function(parent, node) {
        if (node.type === $p.NodeType.SimpleField) {
            parent[node.value] = node.fieldValue.value;
        }
        else if (node.type === $p.NodeType.ArrayField) {
            parent[node.value] = simplifyArray(node.fieldValue.elements);
        }
        else if (node.type === $p.NodeType.ClassField) {
            parent[node.value] = {};
            simplifyFields(parent[node.value], node.fields);
        }
        else {
        }
    };

    var simplifyArray = function(elements) {
        var newElements = [];
        for(var i = 0; i < elements.length; i++) {
            newElements.push(elements[i].value);
        }
        return newElements;
    };

    var simplifyFields = function(parent, fields) {
        for(var i = 0; i < fields.length; i++) {
            simplifyNode(parent, fields[i]);
        }
    };

}($mp.sa, $mp.p));

exports.$sa = $mp.sa;