extend(Interpolate, {
	startSymbol: '{{',
	endSymbol: '}}'
});

function Interpolate(text, startSymbol, endSymbol) {
	this.text = text;
	this.exps = [];
	this.index = 0;

	this.parseFns = [];
	this.endSymbol = endSymbol || Interpolate.endSymbol;
	this.startSymbol = startSymbol || Interpolate.startSymbol;

	var exp,
			text = this.text,
			index = this.index,
			concat = [],
			endIndex,
			endSymbol = this.endSymbol,
			startIndex,
			startSymbol = this.startSymbol,
			endSymbolLength = endSymbol.length,
			startSymbolLength = startSymbol.length,
			expressionPositions = [];

	while(index < text.length) {
		if(((startIndex = text.indexOf(startSymbol, index)) > -1) &&
			 ((endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) > -1)) {
		 if (index !== startIndex) {
       concat.push(text.substring(index, startIndex));
     }

			exp = text.substring(startIndex + startSymbolLength, endIndex).trim();

			this.exps.push(exp);
			this.parseFns.push(this.parse(exp));
			expressionPositions.push(concat.length);
			concat.push('');

			index = endIndex + endSymbolLength;
		} else {
			// we did not find an interpolation, so we have to add the remainder to the separators array
      if (index !== text.length) {
        concat.push(text.substring(index));
      }
			break;
		}
	}

	this.concat = concat;
	this.expressionPositions = expressionPositions;
}

Interpolate.prototype = {
	parse: function(exp) {
		return renderer.parse(exp);
	},

	compute: function(values) {
		var exps = this.exps,
				concat = this.concat,
				expressionPositions = this.expressionPositions;

    for (var i = 0, ii = exps.length; i < ii; i++) {
      concat[expressionPositions[i]] = values[i];
    }
    return concat.join('');
	},

	compile: function(context) {
		var i = 0,
				ii = this.exps.length;
		var values = new Array(ii);

		for(; i < ii; i++) {
			values[i] = this.parseFns[i](context);
		}

		return this.compute(values);
	}
};
