var MisPars = MisPars || {};
MisPars.Lexer = MisPars.Lexer || {};
MisPars.Parser = MisPars.Parser || {};
MisPars.SimpleAst = MisPars.SimpleAst || {};

(function(SimpleAst, Parser, undefined) {

    SimpleAst.simplify = function(ast) {
        var newAst = {};
        for(var i = 0; i < ast.length; i++) {
            simplifyNode(newAst, ast[i]);
        }
        return newAst;
    };

    var simplifyNode = function(parent, node) {
        if (node.type === Parser.NodeType.SimpleField) {
            parent[node.value] = node.fieldValue.value;
        }
        else if (node.type === Parser.NodeType.ArrayField) {
            parent[node.value] = simplifyArray(node.fieldValue.elements);
        }
        else if (node.type === Parser.NodeType.ClassField) {
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

}(MisPars.SimpleAst, MisPars.Parser));
