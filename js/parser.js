var $mp = $mp || {};
$mp.l = $mp.l || {};
$mp.p = $mp.p || {};

(function($p, undefined) {
    "use strict";

    $p.NodeType = {
        Error:          -1,
        Root:           0,
        Int:            1,
        Float:          2,
        String:         3,
        Array:          4,
        ArrayField:     5,
        ClassField:     6,
        SimpleField:    7
    };

    var $l = {};
    var currentToken = {};
    var ast = null;

    $p.init = function(input, lex) {
        $l = lex;
        $l.init(input);
        ast = { "type": $p.NodeType.Root };
    };

    // Parses tokens from Lexer
    $p.parse = function() {
        currentToken = $l.getNextToken();
        ast.fields = start();
        if (currentToken.type !== $l.Token.End) {
            parserError();
        }
        return ast;
    };

    var start = function() {
        var elems = [];
        // Rule: start -> fields
        if (currentToken.type === $l.Token.ID || currentToken.type === $l.Token.Class) {
            elems = fields(elems);
        }
        // Error
        else {
            parserError();
            return [];
        }

        return elems;
    };

    // Non-terminal: fields
    var fields = function(elems) {
        // Rule: fields -> field fields
        if (currentToken.type === $l.Token.ID || currentToken.type === $l.Token.Class) {
            elems.push(field());
            elems = fields(elems);
        }

        // Rule: fields -> EPSILON
        return elems;
    };

    // Non-terminal: field
    var field = function() {
        var token = currentToken;
        var node = {};

        // Rule: field -> idField ;
        if (currentToken.type === $l.Token.ID) {
            acceptToken($l.Token.ID);
            node = idField();
            node.value = token.lexeme;
            acceptToken($l.Token.SemiColon);
        }
        // Rule: field -> classField ;
        else if (currentToken.type === $l.Token.Class) {
            acceptToken($l.Token.Class);
            node = classField();
            acceptToken($l.Token.SemiColon);
        }
        // Error
        else {
            parserError();
            return null;
        }
        return node;
    };

    // Non-terminal: idField
    var idField = function() {
        var node = {};

        // Rule: idField -> simpleField
        if (currentToken.type === $l.Token.Equal) {
            acceptToken($l.Token.Equal);
            node.fieldValue = simpleField();
            node.type = $p.NodeType.SimpleField;
        }
        // Rule: idField -> arrayField
        else if (currentToken.type === $l.Token.LSB) {
            acceptToken($l.Token.LSB);
            node.fieldValue = arrayField();
            node.type = $p.NodeType.ArrayField;
        }
        // Error
        else {
            parserError();
            return null;
        }
        return node;
    };

    // Non-terminal: simpleField
    var simpleField = function() {
        // Rule: simpleField -> primitiveValue
        if (currentToken.type === $l.Token.Int || currentToken.type === $l.Token.Float
            || currentToken.type === $l.Token.String) {
            return primitiveValue();
        }
        // Error
        else {
            parserError();
        }
    };

    // Non-terminal: primitiveValue
    var primitiveValue = function() {
        var token = currentToken;
        var node = { "value": token.lexeme };

        // Rule: primitiveValue -> Int
        if (currentToken.type === $l.Token.Int) {
            acceptToken($l.Token.Int);
            node.type = $p.NodeType.Int;
        }
        // Rule: primitiveValue -> Float
        else if (currentToken.type === $l.Token.Float) {
            acceptToken($l.Token.Float);
            node.type = $p.NodeType.Float;
        }
        // Rule: primitiveValue -> String
        else if (currentToken.type === $l.Token.String) {
            acceptToken($l.Token.String);
            node.type = $p.NodeType.String;
        }
        // Error
        else {
            parserError();
        }
        return node;
    };

    var arrayField = function() {
        var token = currentToken;
        var node = { "elements": [] };

        // Rule: arrayField -> ] = { array
        if (currentToken.type === $l.Token.RSB) {
            acceptToken($l.Token.RSB);
            acceptToken($l.Token.Equal);
            acceptToken($l.Token.LCB);
            node.type = $p.NodeType.Array;
            node.elements = array();
        }
        // Error
        else {
            parserError();
            return null;
        }
        return node;
    };

    var array = function() {
        var elems = []

        // Rule: array -> }
        if (currentToken.type === $l.Token.RCB) {
            acceptToken($l.Token.RCB);
        }
        // Rule: array -> primitiveValue arrayTail
        else if (currentToken.type === $l.Token.Int || currentToken.type === $l.Token.Float
            || currentToken.type === $l.Token.String) {
            elems.push(primitiveValue());
            elems = arrayTail(elems);
        }
        // Error
        else {
            parserError();
            return null;
        }
        return elems;
    };

    // Non-terminal: arrayTail
    var arrayTail = function (elems) {
        // Rule: arrayTail -> }
        if (currentToken.type === $l.Token.RCB) {
            acceptToken($l.Token.RCB);
        }
        // Rule: arrayTail -> , primitiveValue arrayTail
        else if (currentToken.type === $l.Token.Comma) {
            acceptToken($l.Token.Comma);
            elems.push(primitiveValue());
            elems = arrayTail(elems);
        }
        else {
            parserError();
            return null;
        }
        return elems;
    };

    // Non-terminal: classField
    var classField = function () {
        var token = currentToken;
        var node = { "value": token.lexeme, "fields": [] };

        // Rule: classField -> id { fields }
        if (currentToken.type === $l.Token.ID) {
            acceptToken($l.Token.ID);
            acceptToken($l.Token.LCB);
            node.type = $p.NodeType.ClassField;
            node.fields = fields(node.fields);
            acceptToken($l.Token.RCB);
        }
        else {
            parserError();
            return null;
        }
        return node;
    }

    var parserError = function () {
        console.log("Parsing error!");
    };

    var acceptToken = function (tokenType) {
        if (currentToken.type === tokenType) {
            currentToken = $l.getNextToken();
        }
        else {
            parserError();
        }
    };

}($mp.p));
