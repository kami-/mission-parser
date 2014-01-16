var MisPars = MisPars || {};
MisPars.CodeGen = MisPars.CodeGen || {};

(function(CodeGen, Parser, $ast, $simpl, undefined) {

    CodeGen.trigger = function(triggerNode) {
        var trigger = $simpl.simplify(triggerNode);
        var code = trigger.name;
        code += assignment(trigger.name, 'createTrigger ["EmptyDetector", ' + fromArry(trigger.position) + ']') + '\n';
        code += trigger.name + " setTriggerArea " + array(trigger.a, trigger.b, trigger.angle, bool(trigger.rectangular));
        /*code += trigger.name + " setTriggerActivation [" "NONE", "NOT PRESENT", false];
        code += trigger.name + 
        code += trigger.name + 
        bomb2 
        bomb2 setTriggerStatements["this", "", ""];
        bomb2 setTriggerTimeout[10, 0, 0, true];
        bomb2 setTriggerText "cqc";*/
        return code;
    };

    var assignment = function(left, right) {
        return left + " = " + right + ";";
    };

    var array = function() {
        var code = "";
        for(var i = 0; i < arguments.length; i++) {
            if (i !== 0) {
                code += ", ";
            }
            code += arguments[i];
        }
        return code += "]";
    };

    var fromArray = function(elements) {
        var code = "[";
        for(var i = 0; i < elements.length; i++) {
            if (i !== 0) {
                code += ", ";
            }
            code += elements[i];
        }
        return code += "]";
    };

    var bool = function(value) {
        if (value === "1") {
            return "true";
        } else {
            return "false";
        }
    };

}(MisPars.CodeGen, MisPars.Parser, MisPars.AstFunctions, MisPars.SimpleAst));
