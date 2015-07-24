var $mp = $mp || {};
$mp.l = $mp.l || {};

// Lexer
(function ($l, undefined) {
    "use strict";

    ///////////////////////////
    // Public members
    ///////////////////////////

    $l.Token = {
        // Special
        Error: -1, // Signals error in lexing
        End: 0, // Signals the end of lexing

        // Basic terms
        Int: 1, // Integer
        Float: 2, // Floating point number 
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

        // Keyword
        Class: 21
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
        Exponent: 7
    };


    ///////////////////////////
    // Private members
    ///////////////////////////

    var input = "";
    var index = 0;
    var lineNumber = 0;
    var columnNumber = 0;
    var state = $l.State.Init;
    var tokenFirstIndex = 0;


    ///////////////////////////
    // Public functions
    ///////////////////////////

    $l.init = function (inp) {
        state = $l.State.Init;
        index = 0;
        lineNumber = 0;
        columnNumber = 0;
        input = inp;
        tokenFirstIndex = 0;
    };

    $l.getNextToken = function () {
        var dummy = { "lexeme": "", "type": $l.Token.End };
        while (index < input.length) {
            switch (state) {
                case $l.State.Init:
                    if (isWhiteSpace(input[index])) {
                        state = $l.State.Init;
                        nextChar();
                        tokenFirstIndex = index;
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
                        var token = { "lexeme": input[index] };
                        switch (input[index]) {
                            case '(': token.type = $l.Token.LB; break;
                            case ')': token.type = $l.Token.RB; break;
                            case '{': token.type = $l.Token.LCB; break;
                            case '}': token.type = $l.Token.RCB; break;
                            case '[': token.type = $l.Token.LSB; break;
                            case ']': token.type = $l.Token.RSB; break;
                            case ',': token.type = $l.Token.Comma; break;
                            case ';': token.type = $l.Token.SemiColon; break;
                            case '=': token.type = $l.Token.Equal; break;
                        }
                        state = $l.State.Init;
                        nextChar();
                        tokenFirstIndex = index;
                        return token;
                    }
                    else if (input[index] === '"') {
                        state = $l.State.String;
                    }
                    else if (input[index] === '-') {
                        state = $l.State.Int;
                    }
                    else {
                        state = $l.State.Error;
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
                        return createToken(input.substring(tokenFirstIndex, index), $l.Token.Int);
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
                        return createToken(input.substring(tokenFirstIndex, index), $l.Token.Float);
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
                    }
                    break;

                case $l.State.ID:
                    nextChar();
                    if (isAlphabet(input[index]) || isDigit(input[index])) {
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

                case $l.State.Error:
                    return { "lexeme": "", type: $l.Token.Error };
                    break;
            }
        }
        if (state !== $l.State.Init) {
            dummy.type = $l.Token.Error;
        }
        return dummy;
    }


    ///////////////////////////
    // Private functions
    ///////////////////////////

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
                char === ';' || char === '=';
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

    var resetState = function() {
        state = $l.State.Init;
        tokenFirstIndex = index;
    };

}($mp.l));

exports.$l = $mp.l;