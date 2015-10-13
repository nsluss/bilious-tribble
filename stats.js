var R = require('ramda')

var numLens = R.lensProp('nums')
var minLens = R.lensProp('min')
var minNumLens = R.compose(minLens, numLens)
var maxLens = R.lensProp('max')
var maxNumLens = R.compose(maxLens, numLens)
var strLens = R.lensProp('strs')
var shortLens = R.lensProp('shortest')
var shortStrLens = R.compose(shortLens, strLens)
var longLens = R.lensProp('longest')
var longStrLens = R.compose(longLens, strLens)

var Str = R.merge(Object.create(null) , {
  empty: {
    isNull: false,
    count: 0,
    nulls: 0,
    longest: {
      name: '',
      length: 0,
      count: 0
    },
    shortest: {
      name: '',
      length: Infinity,
      count: 0
    },
    avgLen: 0
  },
  nullStr: R.assoc('nulls', 1, R.assoc('isNull', true, this.empty)),
  just: function (st) {
    var isNull = (st === '')
    return {
      isNull: isNull,
      count: 1,
      nulls: isNull ? 1 : 0,
      longest: {
        name: st,
        length: st.length,
        count: 1
      },
      shortest: {
        name: st,
        length: isNull ? Infinity : st.length,
        count: 1
      },
      avgLen: st.length
    }
  },
  append: function (acc, cell) {
    return acc.isNull && cell.isNull ?
      Str.nullStr :
      {
        isNull: false,
        count: acc.count + cell.count,
        nulls: acc.nulls + cell.nulls,
        longest: appendLongest(acc.longest, cell.longest),
        shortest: appendShortest(acc.shortest, cell.shortest),
        avgLen: findAvg(acc, cell)
      }
  }
})

function findAvg (s1, s2) {
  return ((s1.count * s1.avgLen) + (s2.count * s2.avgLen)) / (s1.count + s2.count)
}

function appendLongest (s1, s2) {
  return s1.name === s2.name ? R.assoc('count', s1.count + s2.count, s1) :
    s1.length < s2.length ? s2 :
      s1.length > s2.length ? s1 :
        compareabcGreat(s1, s2)
        //s1.name > s2.name ? s1 : s2
}

function compareabcGreat (a, b) {
  var an = a.name
  var bn = b.name
  if (an[0] === bn[0]) {
    return compareabcGreat(R.assoc('name', an.slice(1), a), R.assoc('name', bn.slice(1), b))
  } else {
    return an[0] > bn[0] ? a : b
  }
}


function appendShortest (s1, s2) {
  return s1.name === s2.name ? R.assoc('count', s1.count + s2.count, s1) :
    s1.length > s2.length ? s2 :
      s1.length < s2.length ? s1 :
        compareabcLess(s1, s2)
}

function compareabcLess (a, b) {
  var an = a.name
  var bn = b.name
  if (an[0] === bn[0]) {
    return compareabcLess(R.assoc('name', an.slice(1), a), R.assoc('name', bn.slice(1), b))
  } else {
    return an[0] < bn[0] ? a : b
  }
}



var Num = R.merge(Object.create(null), {
  empty: {
    isNull: false,
    count: 0,
    nulls: 0,
    min: {
      val: Infinity,
      count: 0
    },
    max: {
      val: -Infinity,
      count: 0
    },
    avg: 0
  },
  nullStr: R.assoc('isNull', true, this.empty),
  just: function (n) {
    var isNull = (n === '')
    return {
      isNull: isNull,
      count: 1,
      nulls: isNull ? 1 : 0,
      min: {
        val: isNull ? Infinity : n,
        count: 1
      },
      max: {
        val: isNull ? -Infinity : n,
        count: 1
      },
      avg: n
    }
  },
  append: function (acc, cell) {
    return {
      isNull: acc.isNull && cell.isNull,
      count: acc.count + cell.count,
      nulls: acc.nulls + cell.nulls,
      max: appendMax(acc.max, cell.max),
      min: appendMin(acc.min, cell.min),
      avg: avgCounts(acc, cell)
    }
  }
})

function appendMax (s1, s2) {
  return s1.val < s2.val ? s2 :
    s1.val > s2.val ? s1 :
      R.assoc('count', s1.count + s2.count, s1)
}

function appendMin (s1, s2) {
  return s1.val > s2.val ? s2 :
    s1.val < s2.val ? s1 :
      R.assoc('count', s1.count + s2.count, s1)
}

function avgCounts (c1, c2) {
  return ((c1.count * c1.avg) + (c2.count * c2.avg)) / (c1.count + c2.count)
}

var Stats = R.merge(Object.create(null), {
  empty: {
    strs: Str.empty,
    nums: Num.empty
  },
  append: function (stat1, stat2) {
    return R.set(strLens, Str.append(stat1.strs, stat2.strs),
      R.set(numLens, Num.append(stat1.nums, stat2.nums), Stats.empty))
  }
})

function sFolder (acc, el) {
  return Str.append(acc, Str.just(el))
}

function nFolder (acc, el) {
  return Num.append(acc, Num.just(el))
}


function appendRow (r1, r2) {

  return R.zipWith(function (a, b) {
    return R.apply(a, b);
  }, [Str.append, Str.append, Num.append, Num.append], R.zip(r1, r2))
}

var emptyRow = [Str.empty, Str.empty, Num.empty, Num.empty]

module.exports = {Num:Num, Str:Str, Stats:Stats, sFolder:sFolder, nFolder:nFolder, appendRow:appendRow, emptyRow:emptyRow}
