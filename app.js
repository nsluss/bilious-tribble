var child    = require('child_process')
  , readline = require('readline')
  //, stream   = require('./stream.js')
  , Rx       = require('rx')
  , R        = require('ramda')
  , S        = require('./stats.js')


main();



function main () {
  if (process.argv.indexOf('--pull') === -1) {
    spawnChildren(process.argv[2] || 10000).reduce(S.appendRow, S.emptyRow).subscribe(log, log, log);
  } else {
    enterStreamMode();
  }
}

// spawnChildren :: (Observable O) => Int -> [O Row]
function spawnChildren (rows) {
  //fork once for every 5000 rows even.
  //clear the remainder (to avoid decimels), and add an extra fork
  var numForks = ((rows - (rows % 5000)) / 5000)

  return Rx.Observable.range(0, numForks).flatMap(function (_) {
    return Rx.Observable.create(function (observer) {
      child.fork('./worker.js').on('message', function(success) {
        observer.onNext(JSON.parse(success));
        observer.onCompleted();
      })
    })
  })
}

function enterStreamMode () {
  process.stdout.write('Pull Mode \n')
  // var go = true
  // Rx.Observable.fromEvent(readline.createInterface({
  //   input: process.stdin,
  //   output: process.stdout
  // }), 'line').subscribe(function(_){go = log(false)}, log, log)
  // //Rx.Observable.while(R.always(go), stream()).subscribe(log, log, log);
}

function log (x) {
  console.log(x);
  return x;
}
