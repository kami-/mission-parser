var $mp = $mp || {};

$mp.p = $mp.p || {};

(function($p, undefined) {
    "use strict";

    $p.Node = {
        Error:          -1,
        Root:           0,
        Number:         1,
        String:         3,
        Array:          4,
        ArrayField:     5,
        ClassField:     6,
        LiteralField:   7
    };

    $p.ErrorCode = {
        ExpectedEndOfFile: 0,
        ExpectedToken: 1,
        ExpectedFieldOrClass: 2,
        ExpectedIdOrKeywordClass: 3,
        ExpectedEqualOrArrayBegin: 4,
        ExpectedLiteral: 5,
        ExpectedArrayFieldEnd: 10,
        ExpectedArrayOrLiteral: 12,
        ExpectedEmptyArrayOrExpression: 13,
        ExpectedArrayEndOrComma: 15,
        ExpectedClassFieldId: 20
    }

    var $l = {};
    var currentToken = {};
    var ast = null;
    var input = "";

    $p.init = function(inp, lex) {
        input = inp;
        $l = lex;
        $l.init(input);
        ast = { "type": $p.Node.Root };
    };

    // Parses tokens from Lexer
    $p.parse = function() {
        currentToken = $l.getNextToken();
        ast.fields = start();
        if (currentToken.type !== $l.Token.End) {
            parserError(currentToken, $p.ErrorCode.ExpectedEndOfFile);
        }
        return ast;
    };

    var start = function() {
        // Rule: start -> fields
        if (currentToken.type === $l.Token.ID || currentToken.type === $l.Token.Class) {
            return fields();
        }
        // Error
        else {
            parserError(currentToken, $p.ErrorCode.ExpectedFieldOrClass);
        }
    };

    // Non-terminal: fields
    var fields = function() {
        // Rule: fields -> field fields
        if (currentToken.type === $l.Token.ID || currentToken.type === $l.Token.Class) {
            var elems = [field()];
            return elems.concat(fields(elems));
        }

        // Rule: fields -> EPSILON
        return [];
    };

    // Non-terminal: field
    var field = function() {
        var token = currentToken;
        var node = {};
        // Rule: field -> idField ;
        if (currentToken.type === $l.Token.ID) {
            acceptToken($l.Token.ID);
            node = idField();
            node.field = token.lexeme;
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
            parserError(currentToken, $p.ErrorCode.ExpectedIdOrKeywordClass);
        }
        return node;
    };

    // Non-terminal: idField
    var idField = function() {
        // Rule: idField -> literalField
        if (currentToken.type === $l.Token.Equal) {
            acceptToken($l.Token.Equal);
            return literalField();
        }
        // Rule: idField -> arrayField
        else if (currentToken.type === $l.Token.LSB) {
            acceptToken($l.Token.LSB);
            return arrayField();
        }
        // Error
        else {
            parserError(currentToken, $p.ErrorCode.ExpectedEqualOrArrayBegin);
        }
    };

    // Non-terminal: literalField
    var literalField = function() {
        // Rule: literalField -> literal
        if (isLiteral(currentToken.type)) {
            var node = literal();
            node.type = $p.Node.LiteralField;
            return node;
        }
        // Error
        else {
            parserError(currentToken, $p.ErrorCode.ExpectedLiteral);
        }
    };

    // Non-terminal: literal
    var literal = function() {
        var node = {"value": currentToken.lexeme};
        // Rule: literal -> Number
        if (currentToken.type === $l.Token.Number) {
            acceptToken($l.Token.Number);
            node.type = $p.Node.Number;
        }
        // Rule: literal -> String
        else if (currentToken.type === $l.Token.String) {
            acceptToken($l.Token.String);
            node.type = $p.Node.String;
        }
        // Error
        else {
            parserError(currentToken, $p.ErrorCode.ExpectedLiteral);
        }
        return node;
    };

    var arrayField = function() {
        // Rule: arrayField -> ] = array
        if (currentToken.type === $l.Token.RSB) {
            acceptToken($l.Token.RSB);
            acceptToken($l.Token.Equal);
            return { "type": $p.Node.ArrayField, "elements": array().elements };
        }
        // Error
        else {
            parserError(currentToken, $p.ErrorCode.ExpectedArrayFieldEnd);
        }
    };

    var array = function() {
        var node = { "type": $p.Node.Array, "elements": [] };
        // Rule: array -> { for all rules
        acceptToken($l.Token.LCB);
        // Rule: array -> }
        if (currentToken.type === $l.Token.RCB) {
            acceptToken($l.Token.RCB);
            return node;
        }
        // Rule: array -> expressionList }
        else if (isExpression(currentToken.type)) {
            node.elements = expressionList();
            acceptToken($l.Token.RCB);
            return node;
        }
        // Error
        else {
            parserError(currentToken, $p.ErrorCode.ExpectedEmptyArrayOrExpression);
        }
    };

    var expressionList = function () {
        // Rule: expressionList -> expression expressionListTail
        var elems = [expression()];
        return elems.concat(expressionListTail());
    };

    var expression = function () {
        // Rule: expression -> literal
        if (isLiteral(currentToken.type)) {
            return literal();
        }
        // Rule: expression -> array
        else if (currentToken.type === $l.Token.LCB) {
            return array();
        }
        else {
            parserError(currentToken, $p.ErrorCode.ExpectedArrayOrLiteral);
        }
    };

    var expressionListTail = function () {
        // Rule: expressionListTail -> , expression expressionListTail
        if (currentToken.type === $l.Token.Comma) {
            acceptToken($l.Token.Comma);
            var elems = [expression()];
            return elems.concat(expressionListTail());
        }
        // Rule: expressionListTail -> EPSILON
        return [];
    };

    // Non-terminal: classField
    var classField = function () {
        // Rule: classField -> ID inheritance { fields }
        if (currentToken.type === $l.Token.ID) {
            var node = { "type": $p.Node.ClassField, "class": currentToken.lexeme, "inheritsFrom": "", "fields": [] };
            acceptToken($l.Token.ID);
            node.inheritsFrom = inheritance();
            acceptToken($l.Token.LCB);
            node.fields = fields();
            acceptToken($l.Token.RCB);
            return node;
        }
        else {
            parserError(currentToken, $p.ErrorCode.ExpectedClassFieldId);
        }
    }

    // Non-terminal: inheritance
    var inheritance = function () {
        // Rule: inheritance -> : ID
        if (currentToken.type === $l.Token.Colon) {
            acceptToken($l.Token.Colon);
            var inheritsFrom = currentToken.lexeme;
            acceptToken($l.Token.ID);
            return inheritsFrom;
        }
        return "";
    }

    var acceptToken = function (tokenType) {
        if (currentToken.type === tokenType) {
            currentToken = $l.getNextToken();
        }
        else {
            parserError(currentToken, $p.ErrorCode.ExpectedToken);
        }
    };

    var parserError = function (token, errorCode) {
        throw {"errorCode": errorCode, "message": getErrorMessage(token, errorCode), "token": token, "context": getErrorContext(token)};
    };

    var getErrorMessage = function (token, errorCode) {
        var message = "",
            position = "" + (token.line + 1) + ":" + (token.column + 1);
        switch (errorCode) {
            case $p.ErrorCode.ExpectedEndOfFile:
                message = "Expected end of file at " + position + "!";
                break;
            case $p.ErrorCode.ExpectedToken:
                message = "Unexpected character '" + token.lexeme + "' at " + position + "!";
                break;
            case $p.ErrorCode.ExpectedFieldOrClass:
                message = "Expected a field or a class at " + position + "!";
                break;
            case $p.ErrorCode.ExpectedIdOrKeywordClass:
                message = "Expected a field name or keyword 'class' at " + position + "!";
                break;
            case $p.ErrorCode.ExpectedEqualOrArrayBegin:
                message = "Field must be followed by '=' or '[' at " + position + "!";
                break;
            case $p.ErrorCode.ExpectedLiteral:
                message = "Expected a number or string at " + position + "!";
                break;
            case $p.ErrorCode.ExpectedArrayFieldEnd:
                message = "Expected ']' at " + position + "! Array field must have the format 'field[] = {...};'";
                break;
            case $p.ErrorCode.ExpectedArrayOrLiteral:
                message = "Expected an array, a number or a string at " + position + "!";
                break;
            case $p.ErrorCode.ExpectedEmptyArrayOrExpression:
                message = "Expected '}' to close the array, or ',' to separate the next element at " + position + "!";
                break;
            case $p.ErrorCode.ExpectedClassFieldId:
                message = "Expected a class name at " + position + "!";
                break;
        }
        return message;
    };

    var getErrorContext = function (token) {
        var pad = "        ",
            context = "",
            lines = input.split("\n"),
            from = token.line - 2 >= 0 ? token.line - 2 : token.line,
            to = token.line + 2 < lines.length ? token.line + 2 : token.line;
        for (var i = from; i <= to; i++) {
            var rowPrefix = (i + 1) + " | ";
            context += (pad + rowPrefix).slice(-pad.length);
            context += lines[i] + '\n';
            if (i === token.line) {
                context += Array(pad.length + token.column - 1).join('~');
                context += ' ^\n';
            }
        }
        return context;
    };

    var isLiteral = function (tokenType) {
        return tokenType === $l.Token.Number || tokenType === $l.Token.String;
    };

    var isExpression = function (tokenType) {
        return isLiteral(tokenType) || tokenType === $l.Token.LCB;
    };

}($mp.p));