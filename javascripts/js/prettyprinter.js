var $mp = $mp || {};
$mp.p = $mp.p || {};
$mp.pp = $mp.pp || {};

(function($pp, $p, undefined) {
    "use strict";

    var identationString = '\t';

    $pp.pp = function(ast, identString) {
        identationString = identString;
        return ppNode(ast, "");
    };
    
    var ppNode = function(node, identation) {
        var ppString = identation;
        if (node.type === $p.NodeType.Root) {
            ppString += ppRootFields(node.fields, identation);
        }
        else if (node.type === $p.NodeType.SimpleField) {
            ppString += ppSimpleField(node);
        }
        else if (node.type === $p.NodeType.ArrayField) {
            ppString += ppArrayField(node, identation);
        }
        else if (node.type === $p.NodeType.ClassField) {
            ppString += ppClassField(node, identation);
        }
        else {
        }
        return ppString;
    };
    
    var ppSimpleField = function(node) {
        var ppString = node.value;
        ppString += "=";
        ppString += node.fieldValue.value;
        return ppString += ";";
    };
    
    var ppArrayField = function(node, identation) {
        var ppString = node.value;
        ppString += "[]=";
        if (node.fieldValue.elements[0].type === $p.NodeType.String) {
            ppString += ppStringArray(node.fieldValue.elements, identation);
        }
        else {
            ppString += ppArray(node.fieldValue.elements, identation + identationString);
        }
        return ppString += ";";
    };
    
    var ppArray = function(elements, identation) {
        var ppString = "{";
        for(var i = 0; i < elements.length; i++) {
            if (i !== 0) {
                ppString += ",";
            }
            ppString += elements[i].value;
        }
        return ppString + "}";
    };
    
    var ppStringArray = function(elements, identation) {
        var ppString = '\n';
        ppString += identation;
        ppString += "{";
        for(var i = 0; i < elements.length; i++) {
            if (i !== 0) {
                ppString += ",";
            }
            ppString += '\n';
            ppString += identation + identationString;
            ppString += elements[i].value;
        }
        ppString += '\n'
        ppString += identation;
        return ppString + "}";
    };
    
    var ppClassField = function(node, identation) {
        var ppString = "class ";
        ppString += node.value;
        ppString += '\n';
        ppString += identation;
        ppString += "{";
        ppString += ppClassesFields(node.fields, identation);
        ppString += '\n'
        ppString += identation;
        return ppString + "};";
    };

    var ppClassesFields = function(fields, identation) {
        var ppString = "";
        for(var i = 0; i < fields.length; i++) {
            ppString += '\n';
            ppString += ppNode(fields[i], identation + identationString);
        }
        return ppString;
    };

    var ppRootFields = function(fields, identation) {
        var ppString = "";
        for(var i = 0; i < fields.length; i++) {
            if (i !== 0) {
                ppString += '\n';
            }
            ppString += ppNode(fields[i], identation);
        }
        return ppString;
    };

}($mp.pp, $mp.p));
