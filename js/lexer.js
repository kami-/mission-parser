var MisPars = MisPars || {};
MisPars.Lexer = MisPars.Lexer || {};

// Lexer
(function (Lexer, undefined) {
    ///////////////////////////
    // Public members
    ///////////////////////////

    Lexer.Token = {
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

        // Keyword
        Class: 21
    };

    Lexer.Keywords = {
        "class": Lexer.Token.Class
    };

    Lexer.State = {
        Error: -1, // Error
        Init: 0, // Initial state before token

        Int: 1, // Integer
        Float: 2, // Float
        ID: 3, // Identifier
        String: 4, // First "
        FirstQuote: 5, // 
        SecondQuote: 6 // 
    };


    ///////////////////////////
    // Private members
    ///////////////////////////

    var input = "";
    var index = 0;
    var lineNumber = 0;
    var columnNumber = 0;
    var state = Lexer.State.Init;
    var tokenFirstIndex = 0;


    ///////////////////////////
    // Public functions
    ///////////////////////////

    Lexer.init = function (inp) {
        state = Lexer.State.Init;
        index = 0;
        lineNumber = 0;
        columnNumber = 0;
        input = inp;
        tokenFirstIndex = 0;
    };

    Lexer.getNextToken = function () {
        var dummy = { "lexeme": "", "type": Lexer.Token.End };
        while (index < input.length) {
            switch (state) {
                case Lexer.State.Init:
                    if (isWhiteSpace(input[index])) {
                        state = Lexer.State.Init;
                        nextChar();
                        tokenFirstIndex = index;
                    }
                    else if (isDigit(input[index])) {
                        state = Lexer.State.Int;
                    }
                    else if (input[index] === '.') {
                        state = Lexer.State.Dot;
                    }
                    else if (isAlphabet(input[index])) {
                        state = Lexer.State.ID;
                    }
                    else if (isPunctuation(input[index])) {
                        var token = { "lexeme": input[index] };
                        switch (input[index]) {
                            case '(': token.type = Lexer.Token.LB; break;
                            case ')': token.type = Lexer.Token.RB; break;
                            case '{': token.type = Lexer.Token.LCB; break;
                            case '}': token.type = Lexer.Token.RCB; break;
                            case '[': token.type = Lexer.Token.LSB; break;
                            case ']': token.type = Lexer.Token.RSB; break;
                            case ',': token.type = Lexer.Token.Comma; break;
                            case ';': token.type = Lexer.Token.SemiColon; break;
                            case '=': token.type = Lexer.Token.Equal; break;
                        }
                        state = Lexer.State.Init;
                        nextChar();
                        tokenFirstIndex = index;
                        return token;
                    }
                    else if (input[index] === '"') {
                        state = Lexer.State.String;
                    }
                    else {
                        state = Lexer.State.Error;
                    }
                    break;

                case Lexer.State.Int:
                    nextChar();
                    if (isDigit(input[index])) {
                        state = Lexer.State.Int;
                    }
                    else if (input[index] === '.') {
                        state = Lexer.State.Float;
                    }
                    else {
                        return createToken(input.substring(tokenFirstIndex, index), Lexer.Token.Int);
                    }
                    break;

                case Lexer.State.Dot:
                    nextChar();
                    if (isDigit(input[index])) {
                        state = Lexer.State.Float;
                    }
                    else {
                        state = Lexer.State.Error;
                    }
                    break;

                case Lexer.State.Float:
                    nextChar();
                    if (isDigit(input[index])) {
                        state = Lexer.State.Float;
                    }
                    else {
                        return createToken(input.substring(tokenFirstIndex, index), Lexer.Token.Float);
                    }
                    break;

                case Lexer.State.ID:
                    nextChar();
                    if (isAlphabet(input[index]) || isDigit(input[index])) {
                        state = Lexer.State.ID;
                    }
                    else {
                        var lexeme = input.substring(tokenFirstIndex, index);
                        var token = Lexer.Token.ID;
                        if (Lexer.Keywords.hasOwnProperty(lexeme)) {
                            token = Lexer.Keywords[lexeme];
                        };
                        return createToken(lexeme, token);
                    }
                    break;

                case Lexer.State.String:
                    nextChar();
                    if (input[index] === '"') {
                        state = Lexer.State.FirstQuote;
                    }
                    else {
                        state = Lexer.State.String;
                    }
                    break;

                case Lexer.State.FirstQuote:
                    nextChar();
                    if (input[index] === '"') {
                        state = Lexer.State.SecondQuote;
                    }
                    else {
                        return createToken(input.substring(tokenFirstIndex, index), Lexer.Token.String);
                    }
                    break;

                case Lexer.State.SecondQuote:
                    nextChar();
                    if (input[index] === '"') {
                        state = Lexer.State.FirstQuote;
                    }
                    else {
                        state = Lexer.State.String;
                    }
                    break;

                case Lexer.State.Error:
                    return { "lexeme": "", type: Lexer.Token.Error };
                    break;
            }
        }
        if (state != Lexer.State.Init) {
            dummy.type = Lexer.Token.Error;
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
        return char === ' ' || char === '\n' || char === '\t';
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
        return { "lexeme": lexeme, "type": type };
    };

    var resetState = function() {
        state = Lexer.State.Init;
        tokenFirstIndex = index;
    };

}(MisPars.Lexer));