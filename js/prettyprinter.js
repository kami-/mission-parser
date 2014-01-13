var MisPars = MisPars || {};
MisPars.Lexer = MisPars.Lexer || {};
MisPars.Parser = MisPars.Parser || {};
MisPars.PrettyPrinter = MisPars.PrettyPrinter || {};

(function(PrettyPrinter, Parser, undefined) {

    var identationString = '\t';

    PrettyPrinter.pp = function(ast, identString) {
        var ppString = "";
        identationString = identString;
        for(var i = 0; i < ast.length; i++) {
            ppString += ppNode(ast[i], "");
            ppString += '\n';
        }
        return ppString;
    };
    
    var ppNode = function(node, identation) {
        var ppString = identation;
        if (node.type === Parser.NodeType.SimpleField) {
            ppString += ppSimpleField(node);
        }
        else if (node.type === Parser.NodeType.ArrayField) {
            ppString += ppArrayField(node, identation);
        }
        else if (node.type === Parser.NodeType.ClassField) {
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
        if (node.fieldValue.elements[0].type === Parser.NodeType.String) {
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
        return ppString + "};";
    };
    
    var ppClassField = function(node, identation) {
        var ppString = "class ";
        ppString += node.value;
        ppString += '\n';
        ppString += identation;
        ppString += "{";
        for(var i = 0; i < node.fields.length; i++) {
            ppString += '\n';
            ppString += ppNode(node.fields[i], identation + identationString);
        }
        ppString += '\n'
        ppString += identation;
        return ppString + "};";
    };

}(MisPars.PrettyPrinter, MisPars.Parser));
