const JSONStream = require('JSONStream');
const es = require('event-stream');
const productObject = require('./lib/product.js');

let items = {};
let metadata = {
    dataSource: 'cbmei',
    dataSourceRun: 'cbmei-' + Date.now()
}

console.time('duration');

process.stdin.setEncoding('utf8');
process.stdin
    .pipe(es.split())
    .pipe(es.parse())
    .pipe(es.mapSync(function (doc) {
        let obj = doc._source;
        let product = productObject(obj, metadata);

        process.stdout.write( JSON.stringify(product) );
        process.stdout.write( "\n" );
    }));


process.stdin.on('end', () => {
    process.exit(0);
});
