var MisPars = MisPars || {};
MisPars.Parser = MisPars.Parser || {};
MisPars.AstFunctions = MisPars.AstFunctions || {};

(function(AstFunctions, Parser, undefined) {

    // Triggers are in Missions.Sensors
    AstFunctions.exportTriggers = function(ast) {
        
    };

    AstFunctions.select = function(ast, query) {
        var fields = query.split(".");
        var node = ast;
        var result = [];
        for (var i = 0; i < fields.length; i++) {
            var result = findFieldInNode(node, fields[i]);
            if (result.length == 1) {
                node = result[0];
            } else if (i !== fields.length - 1) {
                return [];
            }
        }
        return result;
    };
    
    var findFieldInNode = function(node, fieldName) {
        var result = [];
        if (node.type === Parser.NodeType.ClassField || node.type === Parser.NodeType.Root) {
            result = findFieldInArray(node.fields, fieldName);
        }
        return result;
    };
    
    var findFieldInArray = function(fields, fieldName) {
        var result = [];
        for(var i = 0; i < fields.length; i++) {
            if (fields[i].value === fieldName || fieldNameStarMatch(fields[i].value, fieldName)) {
                result.push(fields[i]);
            }
        }
        return result;
    };

    var fieldNameStarMatch = function(value, fieldName) {
        return fieldName.indexOf("*") === fieldName.length - 1 &&
            value.indexOf(fieldName.substring(0, fieldName.length - 1)) === 0;
    };


}(MisPars.AstFunctions, MisPars.Parser));
