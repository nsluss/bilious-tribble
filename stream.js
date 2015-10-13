var child = require('child_process')
  , Rx = require('rx')


var gen = child.spawn('./generator', ['PULL'])

module.exports = function(){
  return Rx.Observable.create(function (observer) {
    gen.on('data', function(data){
      observer.onNext(data);
    })
    gen.write('\n');
    return function () {
      observer.onCompleted()
    }
  })
}
