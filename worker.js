var child = require('child_process')
  , R     = require('ramda')
  , S     = require('./stats.js')


main()

function main () {
  getData(function(x){
    process.send(JSON.stringify(processData(x)));
  }, 5000)
}



function processData (x) {
  var rows = x.split('\r\n').map(function(r){return r.split(',')})
  var headers = rows.slice(0, 1);
  var data    = rows.slice(1, rows.length - 1);


  return foldRows(
    [S.sFolder, S.sFolder, S.nFolder, S.nFolder],
    data,
    [S.Str.empty, S.Str.empty, S.Num.empty, S.Num.empty]);
}

function sFolder (acc, el) {
  return S.Str.append(acc, S.Str.just(el))
}

function nFolder (acc, el) {
  return S.Num.append(acc, S.Num.just(el))
}

function foldRows (fns, rows, accs) {
  var accums = accs
  for (var j = 0; j < rows.length; j++) {
    for (var i = 0; i < fns.length; i++) {
      accums[i] = fns[i](accs[i], rows[j][i])
    }
  }
  return accums;
}

function getData (fn, num) {
  child.exec('./generator ' + num, function (err, stdout, stderr) {
    fn(stdout);
  });
}

function log (x) {
  console.log(x);
  return x;
}
