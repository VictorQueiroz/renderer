interpolate.startSymbol = '{{',
interpolate.endSymbol = '}}';

function interpolate(text, options) {
  var i = 0,
      ii = text.length,
      expressions = [];

  options = options || {};

  var endSymbol = options.endSymbol || interpolate.endSymbol,
      startSymbol = options.startSymbol || interpolate.startSymbol,

      endSymbolLength = endSymbol.length,
      startSymbolLength = startSymbol.length;

  var exp,
      concat = [],
      endIndex,
      parseFns = [],
      positions = [],
      startIndex;

  while(i < ii) {
    if(((startIndex = text.indexOf(startSymbol, i)) > -1) &&
        ((endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) > -1)) {
      if(i !== startIndex) {
        concat.push(text.substring(i, startIndex));
      }

      exp = text.substring(startIndex + startSymbolLength, endIndex);
      expressions.push(exp.trim());
      parseFns.push(parse(exp));
      i = endIndex + endSymbolLength;
      positions.push(concat.length);
      concat.push('');
    } else {
      // we did not find an interpolation, so we have to add the remainder to the separators array
      if(i !== ii) {
        concat.push(text.substring(i));
      }
      break;
    }
  }

  function compute(values) {
    for(var i = 0, ii = values.length; i < ii; i++) {
      if(typeof values[i] === 'undefined') return;
      concat[positions[i]] = values[i];
    }
    return concat.join('');
  }

  if(expressions.length) {
    return extend(function interpolateFn(context) {
      var i = 0,
          ii = expressions.length,
          values = new Array(ii);

      for(; i < ii; i++) {
        values[i] = parseFns[i](context) || '';
      }

      return compute(values);
    }, {
      exp: text,
      expressions: expressions
    });
  }
}
