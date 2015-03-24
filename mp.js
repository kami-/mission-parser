var FS = require('fs'),
    $mp = require('./mission-parser.js').$mp;

if (process.argv.length > 2) {
    var file = FS.readFileSync(process.argv[2], 'utf8');
    $mp.p.init(file, $mp.l);
    var ast = $mp.p.parse();
    process.stdout.write($mp.pp.pp(ast, '    ') + '\n');
} else {
    process.stderr.write("Provide a file.\n");
}