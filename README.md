# cbmei2product

Transforms CBMEI items to product data standard.

## Usage

    (streamed input) | node index.js | (streamed output)

It is recommended that you use the node option *--max-old-space-size* with a value that is at least equal to the amount of data to be transformed. This script needs to load all streamed data into memory in order to properly unify items that may be ordered arbitrarily.

## Input

This script receives as input a list of JSON objects as strings, one per line.

The data contains items previously generated using [imss-cbm-parser](http://gitlab.rindecuentas.org/equipo-qqw/imss-cbm-parser) and then uploaded to ElasticSearch. The data was then downloaded using [elasticdump](https://www.npmjs.com/package/elasticdump) as JSON lines.

The list of strings is then streamed through a pipe into the script:

    cat file.json | (cbmei2product)

## Output

The script outputs JSON documents, one per line, containing products in a custom format based on the [Schema.org Drug type](https://schema.org/Drug). Items streamed at the input stage are transformed into this format and streamed back out. The number of objects streamed out from the script should be the same as the number of objects streamed in.

### Streaming the output

Use a tool such as http://gitlab.rindecuentas.org/equipo-qqw/stream2db/ to stream the JSON objects back into Mongo or ElasticSearch.
