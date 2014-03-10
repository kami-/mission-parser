var MisPars = MisPars || {};
MisPars.Lexer = MisPars.Lexer || {};
MisPars.Parser = MisPars.Parser || {};

(function(Parser, undefined) {
    "use strict";

    Parser.NodeType = {
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

    var Lexer = {};
    var currentToken = {};
    var ast = null;

    Parser.init = function(input, lex) {
        Lexer = lex;
        Lexer.init(input);
        ast = { "type": Parser.NodeType.Root };
    };

    // Parses tokens from Lexer
    Parser.parse = function() {
        currentToken = Lexer.getNextToken();
        ast.fields = start();
        if (currentToken.type !== Lexer.Token.End) {
            parserError();
        }
        return ast;
    };

    var start = function() {
        var elems = [];
        // Rule: start -> fields
        if (currentToken.type === Lexer.Token.ID || currentToken.type === Lexer.Token.Class) {
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
        if (currentToken.type === Lexer.Token.ID || currentToken.type === Lexer.Token.Class) {
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
        if (currentToken.type === Lexer.Token.ID) {
            acceptToken(Lexer.Token.ID);
            node = idField();
            node.value = token.lexeme;
            acceptToken(Lexer.Token.SemiColon);
        }
        // Rule: field -> classField ;
        else if (currentToken.type === Lexer.Token.Class) {
            acceptToken(Lexer.Token.Class);
            node = classField();
            acceptToken(Lexer.Token.SemiColon);
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
        if (currentToken.type === Lexer.Token.Equal) {
            acceptToken(Lexer.Token.Equal);
            node.fieldValue = simpleField();
            node.type = Parser.NodeType.SimpleField;
        }
        // Rule: idField -> arrayField
        else if (currentToken.type === Lexer.Token.LSB) {
            acceptToken(Lexer.Token.LSB);
            node.fieldValue = arrayField();
            node.type = Parser.NodeType.ArrayField;
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
        if (currentToken.type === Lexer.Token.Int || currentToken.type === Lexer.Token.Float
            || currentToken.type === Lexer.Token.String) {
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
        if (currentToken.type === Lexer.Token.Int) {
            acceptToken(Lexer.Token.Int);
            node.type = Parser.NodeType.Int;
        }
        // Rule: primitiveValue -> Float
        else if (currentToken.type === Lexer.Token.Float) {
            acceptToken(Lexer.Token.Float);
            node.type = Parser.NodeType.Float;
        }
        // Rule: primitiveValue -> String
        else if (currentToken.type === Lexer.Token.String) {
            acceptToken(Lexer.Token.String);
            node.type = Parser.NodeType.String;
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
        if (currentToken.type === Lexer.Token.RSB) {
            acceptToken(Lexer.Token.RSB);
            acceptToken(Lexer.Token.Equal);
            acceptToken(Lexer.Token.LCB);
            node.type = Parser.NodeType.Array;
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
        if (currentToken.type === Lexer.Token.RCB) {
            acceptToken(Lexer.Token.RCB);
        }
        // Rule: array -> primitiveValue arrayTail
        else if (currentToken.type === Lexer.Token.Int || currentToken.type === Lexer.Token.Float
            || currentToken.type === Lexer.Token.String) {
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
        if (currentToken.type === Lexer.Token.RCB) {
            acceptToken(Lexer.Token.RCB);
        }
        // Rule: arrayTail -> , primitiveValue arrayTail
        else if (currentToken.type === Lexer.Token.Comma) {
            acceptToken(Lexer.Token.Comma);
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
        if (currentToken.type === Lexer.Token.ID) {
            acceptToken(Lexer.Token.ID);
            acceptToken(Lexer.Token.LCB);
            node.type = Parser.NodeType.ClassField;
            node.fields = fields(node.fields);
            acceptToken(Lexer.Token.RCB);
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
            currentToken = Lexer.getNextToken();
        }
        else {
            parserError();
        }
    };

}(MisPars.Parser));
