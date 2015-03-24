var $mp = $mp || {};
$mp.l = $mp.l || {};

// Lexer
(function ($l, undefined) {
    "use strict";

    $l.Token = {
        // Special
        Error: -1, // Signals error in lexing
        End: 0, // Signals the end of lexing

        // Basic terms
        Number: 1, // Integer or Floating point number 
        String: 3, // Double Quoted string with "\" escaping
        ID: 4, // Identifier, alphanumerical starting with letter

        // Punctuation
        LB: 11, // (
        RB: 12, // )
        LCB: 13, // {
        RCB: 14, // }
        LSB: 15, // [
        RSB: 16, // ]
        Comma: 17,  // ,
        SemiColon: 18,  // ;
        Equal: 19, // =
        Minus: 20, // -
        Colon: 21, // :

        // Keyword
        Class: 30,

        Comment: 40
    };

    $l.Keywords = {
        "class": $l.Token.Class
    };

    $l.State = {
        Error: -1, // Error
        Init: 0, // Initial state before token

        Int: 1, // Integer
        Float: 2, // Float
        ID: 3, // Identifier
        String: 4, // First "
        FirstQuote: 5, //
        SecondQuote: 6,
        Exponent: 7,
        CommentBegin: 8,
        SingleLineComment: 9,
        MultiLineComment: 10,
        MultiLineCommentEnd: 11
    };

    $l.ErrorCode = {
        UNEXPECTED_CHAR: 0,
        EXPECTED_DECIMALS_OR_EXPONENT: 1,
        EXPECTED_EXPONENT: 2,
        EXPECTED_COMMENT: 3
    };

    var input = "";
    var index = 0;
    var lineNumber = 0;
    var columnNumber = 0;
    var state = $l.State.Init;
    var tokenFirstIndex = 0;
    var errorCode = -1;

    $l.init = function (inp) {
        state = $l.State.Init;
        index = 0;
        lineNumber = 0;
        columnNumber = 0;
        input = inp;
        tokenFirstIndex = 0;
        errorCode = -1;
    };

    $l.getNextToken = function () {
        var dummy = { "lexeme": "<END OF FILE>", "type": $l.Token.End, "line": lineNumber, "column": columnNumber};
        while (index < input.length) {
            switch (state) {
                case $l.State.Init:
                    if (isWhiteSpace(input[index])) {
                        nextChar();
                        resetState();
                    }
                    else if (isDigit(input[index])) {
                        state = $l.State.Int;
                    }
                    else if (input[index] === '.') {
                        state = $l.State.Dot;
                    }
                    else if (isAlphabet(input[index])) {
                        state = $l.State.ID;
                    }
                    else if (isPunctuation(input[index])) {
                        var type;
                        switch (input[index]) {
                            case '(': type = $l.Token.LB; break;
                            case ')': type = $l.Token.RB; break;
                            case '{': type = $l.Token.LCB; break;
                            case '}': type = $l.Token.RCB; break;
                            case '[': type = $l.Token.LSB; break;
                            case ']': type = $l.Token.RSB; break;
                            case ',': type = $l.Token.Comma; break;
                            case ';': type = $l.Token.SemiColon; break;
                            case '=': type = $l.Token.Equal; break;
                            case ':': type = $l.Token.Colon; break;
                        }
                        nextChar();
                        return createToken(input[tokenFirstIndex], type);
                    }
                    else if (input[index] === '/') {
                        state = $l.State.CommentBegin;
                    }
                    else if (input[index] === '"') {
                        state = $l.State.String;
                    }
                    else if (input[index] === '-') {
                        state = $l.State.Int;
                    }
                    else {
                        state = $l.State.Error;
                        errorCode = $l.ErrorCode.UNEXPECTED_CHAR;
                    }
                    break;
                case $l.State.Int:
                    nextChar();
                    if (isDigit(input[index])) {
                        state = $l.State.Int;
                    }
                    else if (input[index] === '.') {
                        state = $l.State.Float;
                    }
                    else {
                        return createToken(input.substring(tokenFirstIndex, index), $l.Token.Number);
                    }
                    break;

                case $l.State.Dot:
                    nextChar();
                    if (isDigit(input[index])) {
                        state = $l.State.Float;
                    } else if (input[index] === 'e') {
                        state = $l.State.Exponent;
                    }
                    else {
                        state = $l.State.Error;
                        errorCode = $l.ErrorCode.EXPECTED_DECIMALS_OR_EXPONENT;
                    }
                    break;

                case $l.State.Float:
                    nextChar();
                    if (isDigit(input[index])) {
                        state = $l.State.Float;
                    } else if (input[index] === 'e') {
                        state = $l.State.Exponent;
                    }
                    else {
                        return createToken(input.substring(tokenFirstIndex, index), $l.Token.Number);
                    }
                    break;

                case $l.State.Exponent:
                    nextChar();
                    if (isDigit(input[index])) {
                        state = $l.State.Float;
                    } else if (input[index] === '-' || input[index] === '+') {
                        state = $l.State.Float;
                    } else {
                        state = $l.State.Error;
                        errorCode = $l.ErrorCode.EXPECTED_EXPONENT;
                    }
                    break;

                case $l.State.ID:
                    nextChar();
                    if (input[index] === '_' || isAlphabet(input[index]) || isDigit(input[index])) {
                        state = $l.State.ID;
                    }
                    else {
                        var lexeme = input.substring(tokenFirstIndex, index);
                        var token = $l.Token.ID;
                        if ($l.Keywords.hasOwnProperty(lexeme)) {
                            token = $l.Keywords[lexeme];
                        };
                        return createToken(lexeme, token);
                    }
                    break;

                case $l.State.String:
                    nextChar();
                    if (input[index] === '"') {
                        state = $l.State.FirstQuote;
                    }
                    else {
                        state = $l.State.String;
                    }
                    break;

                case $l.State.FirstQuote:
                    nextChar();
                    if (input[index] === '"') {
                        state = $l.State.SecondQuote;
                    }
                    else {
                        return createToken(input.substring(tokenFirstIndex, index), $l.Token.String);
                    }
                    break;

                case $l.State.SecondQuote:
                    nextChar();
                    if (input[index] === '"') {
                        state = $l.State.FirstQuote;
                    }
                    else {
                        state = $l.State.String;
                    }
                    break;

                case $l.State.CommentBegin:
                    nextChar();
                    if (input[index] === '/') {
                        state = $l.State.SingleLineComment;
                    } else if (input[index] === '*') {
                        state = $l.State.MultiLineComment;
                    }
                    else {
                        state = $l.State.Error;
                        errorCode = $l.ErrorCode.EXPECTED_COMMENT;
                    }
                    break;

                case $l.State.SingleLineComment:
                    nextChar();
                    if (input[index] === '\n') {
                        //return createToken(input.substring(tokenFirstIndex, index - 1), $l.Token.Comment);
                        resetState();
                    }
                    break;

                case $l.State.MultiLineComment:
                    nextChar();
                    if (input[index] === '*') {
                        state = $l.State.MultiLineCommentEnd;
                    }
                    break;

                case $l.State.MultiLineCommentEnd:
                    nextChar();
                    if (input[index] === '/') {
                        //return createToken(input.substring(tokenFirstIndex, index), $l.Token.Comment);
                        nextChar();
                        resetState();
                    } else if (input[index] === '*') {
                        state = $l.State.MultiLineCommentEnd;
                    }
                    else {
                        state = $l.State.MultiLineComment;
                    }
                    break;

                case $l.State.Error:
                    var token = createToken(input[index], $l.Token.Error);
                    throw {"errorCode": errorCode, "message": getErrorMessage(token, errorCode), "token": token, "context": getErrorContext(token)};
                    break;
            }
        }
        if (state !== $l.State.Init) {
            dummy.type = $l.Token.Error;
        }
        return dummy;
    }

    var isDigit = function (char) {
        return char <= '9' && char >= '0';
    };

    var isAlphabet = function (char) {
        return char !== undefined && /[a-zA-Z]/.test(char);
    };

    var isWhiteSpace = function (char) {
        return char === ' ' || char === '\n' || char === '\t' || char ==='\r';
    };

    var isPunctuation = function (char) {
        return char === '(' || char === ')' ||
                char === '{' || char === '}' ||
                char === '[' || char === ']' ||
                char === ',' || char === '.' ||
                char === ';' || char === '=' ||
                char === ':';
    };

    var nextChar = function () {
        if (input[index] == '\n') {
            lineNumber++;
            columnNumber = 0;
        }
        else {
            columnNumber++;
        }
        index++;
    };

    var createToken = function (lexeme, type) {
        resetState();
        return {
            "lexeme": lexeme,
            "type": type,
            "line": lineNumber,
            "column": columnNumber
        };
    };

    var resetState = function () {
        state = $l.State.Init;
        tokenFirstIndex = index;
    };

    var getErrorMessage = function (token, errorCode) {
        var message = "",
            position = "" + (token.line + 1) + ":" + (token.column + 1);
        switch (errorCode) {
            case $l.ErrorCode.UNEXPECTED_CHAR:
                message = "Unexpected character '" + token.lexeme + "' at " + position + "!"
                break;
            case $l.ErrorCode.EXPECTED_DECIMALS_OR_EXPONENT:
                message = "Expected decimals or exponent in float '" + token.lexeme + "' at " + position + "!"
                break;
            case $l.ErrorCode.EXPECTED_EXPONENT:
                message = "Expected exponent in float '" + token.lexeme + "' at " + position + "!"
                break;
            case $l.ErrorCode.EXPECTED_COMMENT:
                message = "Expected single or multiline comment ('//' or '/*') in '" + token.lexeme + "' at " + position + "!"
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

}($mp.l));