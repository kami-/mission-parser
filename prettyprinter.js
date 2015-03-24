var $mp = $mp || {};

$mp.pp = $mp.pp || {};

(function($pp, $p, undefined) {
    "use strict";

    var identationString = '    ';

    $pp.pp = function(ast, identString) {
        if (identString) { 
            identationString = identString;
        }
        return ppNode(ast, "");
    };
    
    var ppNode = function(node, identation) {
        var ppString = identation;
        if (node.type === $p.Node.Root) {
            ppString += ppRootFields(node.fields, identation);
        }
        else if (node.type === $p.Node.LiteralField) {
            ppString += ppLiteralField(node);
        }
        else if (isLiteral(node.type)) {
            ppString += ppLiteral(node);
        }
        else if (node.type === $p.Node.ArrayField) {
            ppString += ppArrayField(node, identation);
        }
        else if (node.type === $p.Node.Array) {
            ppString += ppArray(node.elements, identation);
        }
        else if (node.type === $p.Node.ClassField) {
            ppString += ppClassField(node, identation);
        }
        else {
        }
        return ppString;
    };
    
    var ppLiteralField = function(node) {
        var ppString = node.field;
        ppString += " = ";
        ppString += node.value;
        return ppString += ";";
    };

    var ppLiteral = function(node) {
        return node.value;
    };

    var ppArrayField = function(node, identation) {
        var ppString = node.field;
        ppString += "[] = ";
        if (node.elements.length > 1 && node.elements[0].type === $p.Node.Array) {
            ppString += ppNestedArray(node.elements, identation);
        } else {
            ppString += ppArray(node.elements, identation);
        }
        return ppString += ";";
    };
    
    var ppArray = function(elements, identation) {
        var ppString = "{";
        for(var i = 0; i < elements.length; i++) {
            if (i !== 0) {
                ppString += ", ";
            }
            ppString += ppNode(elements[i], '');
        }
        return ppString + "}";
    };

    var ppNestedArray = function(elements, identation) {
        var ppString = "{";
        for(var i = 0; i < elements.length; i++) {
            if (i !== 0) {
                ppString += ",";
            }
            ppString += '\n';
            
            ppString += ppNode(elements[i], identation + identationString);
        }
        ppString += '\n'
        ppString += identation;
        return ppString + "}";
    };
    
    var ppClassField = function(node, identation) {
        var ppString = "class ";
        ppString += node.class;
        if (node.inheritsFrom !== "") {
            ppString += " : " + node.inheritsFrom;
        }
        ppString += " {";
        ppString += ppClassesFields(node.fields, identation);
        ppString += '\n'
        ppString += identation;
        return ppString + "};\n";
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

    var isLiteral = function(nodeType) {
        return nodeType === $p.Node.Number || nodeType === $p.Node.String;
    };

}($mp.pp, $mp.p));