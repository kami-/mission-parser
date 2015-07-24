var $mp = $mp || {};

$mp.l = require('./lexer.js').$l;
$mp.p = require('./parser.js').$p;
$mp.af = require('./ast_functions.js').$af;
$mp.pp = require('./prettyprinter.js').$pp;
$mp.hull = require('./hull_functions.js').$hull;

exports.$mp = $mp;