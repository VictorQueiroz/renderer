function Lexer() {
}

Lexer.prototype = {
	lex: function(text) {
		this.index = 0;
		this.text = text;
		this.length = this.text.length;
		this._scanning = false;
		this.tokens = [];
		this.curlyStack = [];

		var ch;

		while(!this.eof()) {
			ch = this.text.charCodeAt(this.index);

			if(this.isWhiteSpace(ch)) {
				++this.index;
			} else if(this.isIdentifierStart(ch)) {
				this.scanIdentifier();
			} else if (ch === 0x28 || ch === 0x29 || ch === 0x3B) {
				// Very common: ( and ) and ;
				this.scanPunctuator();
			} else if(ch === 0x27 || ch === 0x22) {
				// String literal starts with single quote (U+0027) or double quote (U+0022).
				this.scanStringLiteral();
			} else if (ch === 0x2E) {
				// Dot (.) U+002E can also start a floating-point number, hence the need
				// to check the next character.
				if(this.isDecimalDigit(this.text.charCodeAt(this.index + 1))) {
					this.scanNumericLiteral();
				} else {
					this.scanPunctuator();
				}
			} else if (this.isDecimalDigit(ch)) {
				this.scanNumericLiteral();
			} else if (ch === 0x60 || (ch === 0x7D && this.curlyStack[this.curlyStack.length - 1] === '${')) {
				// Template literals start with ` (U+0060) for template head
				// or } (U+007D) for template middle or template tail.
				this.scanTemplate();
			} else {
				this.scanPunctuator();
			}
		}

		return this.tokens;
	},

	throwUnexpectedToken: function() {
		throw new Error('Column ' + this.index + ': Unexpected token ' + this.text[this.index]);
	},

	isDecimalDigit: function (ch) {
		return (ch >= 0x30 && ch <= 0x39);   // 0..9
	},

	isIdentifierPart: function(ch) {
		return Character.isIdentifierPart(ch);
	},

	isOctalDigit: function(cp) {
		return (cp >= 0x30 && cp <= 0x37);   // 0..7
	},

	getIdentifier: function() {
		var start = this.index++;
		var ch;

		while(!this.eof()) {
			ch = this.text.charCodeAt(this.index);
			if(ch === 0x5C) {
				// Blackslash (U+005C) marks Unicode escape sequence.
				this.index = start;
				return this.getComplexIdentifier();
			} else if (ch >= 0xD800 && ch < 0xDFFF) {
				// Need to handle surrogate pairs.
				this.index = start;
				return this.getComplexIdentifier();
			}
			if(this.isIdentifierPart(ch)) {
				++this.index;
			} else {
				break;
			}
		}

		return this.text.slice(start, this.index);
	},

	// ECMA-262 11.8.6 Template Literal Lexical Components
	scanTemplate: function() {
		var cooked = '';
		var terminated = false;
		var start = this.index;

		var head = (this.text[start] === '`');
		var tail = false;
		var rawOffset = 2;

		var ch;

		++this.index;

		while(!this.eof()) {
			ch = this.text[this.index++];

			if(ch === '`') {
				rawOffset = 1;
				tail = true;
				terminated = true;
				break;
			} else if (ch === '$') {
				if(this.text[this.index] === '{') {
					this.curlyStack.push('${');
					++this.index;
					terminated = true;
					break;
				}
				cooked += ch;
			} else {
				cooked += ch;
			}
		}

		if(!terminated) {
			this.throwUnexpectedToken();
		}

		if(!head) {
			this.curlyStack.pop();
		}

		this.tokens.push({
			type: Token.Template,
			value: cooked,
			start: start,
			tail: tail,
			head: head,
			end: this.index
		});
	},

	scanNumericLiteral: function() {
		var ch;
		ch = this.text[this.index];

		this.assert(this.isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'), 'Numeric literal must start with a decimal digit or a decimal point');

		var start = this.index;
		var number = '';

		if(ch !== '.') {
			number = this.text[this.index++];
			ch = this.text[this.index];

			// Hex number starts with '0x'.
			// Octal number starts with '0'.
			// Octal number in ES6 starts with '0o'.
			// Binary number in ES6 starts with '0b'.
			if(number === '0') {
				if(ch === 'x' || ch === 'X') {
					++this.index;
					return this.scanHexLiteral(start);
				}
				if(ch === 'b' || ch === 'B') {
					++this.index;
					return this.scanBinaryLiteral(start);
				}
				if(ch === 'o' || ch === 'O') {
					return this.scanOctalLiteral(ch, start);
				}

				if(this.isOctalDigit(ch)) {
					if(this.isImplicitOctalLiteral()) {
						return this.scanOctalLiteral(ch, start);
					}
				}
			}

			while(this.isDecimalDigit(this.text.charCodeAt(this.index))) {
				number += this.text[this.index++];
			}
			ch = this.text[this.index];
		}

		if(ch === '.') {
			number += this.text[this.index++];
			while(this.isDecimalDigit(this.text.charCodeAt(this.index))) {
				number += this.text[this.index++];
			}
			ch = this.text[this.index];
		}

		if(ch === 'e' || ch === 'E') {
			number += this.text[this.index++];

			ch = this.text[this.index];

			if(ch === '+' || ch === '-') {
				number += this.text[this.index++];
			}
			if(this.isDecimalDigit(this.text.charCodeAt(this.index))) {
				while(this.isDecimalDigit(this.text.charCodeAt(this.index))) {
					number += this.text[this.index++];
				}
			} else {
				this.throwUnexpectedToken();
			}
		}

		if(this.isIdentifierPart(this.text.charCodeAt(this.index))) {
			this.throwUnexpectedToken();
		}

		this.tokens.push({
			type: Token.NumericLiteral,
			value: parseFloat(number),
			start: start,
			end: this.index
		});
	},

	scanIdentifier: function() {
		var start = this.index;
		var id,
				type;

		// Backslash (U+005C) starts an escaped character.
		id = (this.text.charCodeAt(this.index) === 0x5C) ? this.getComplexIdentifier() : this.getIdentifier();

		// There is no keyword or literal with only one character.
		// Thus, it must be an identifier.
		if(id.length === 1) {
			type = Token.Identifier;
		} else if (id === 'null') {
			type = Token.NullLiteral;
		} else if (id === 'true' || id === 'false') {
			type = Token.BooleanLiteral;
		} else {
			type = Token.Identifier;
		}

		this.tokens.push({
			type: type,
			value: id,
			start: start,
			end: this.index
		});
	},

	// Ensure the condition is true, otherwise throw an error.
	// This is only to have a better contract semantic, i.e. another safety net
	// to catch a logic error. The condition shall be fulfilled in normal case.
	// Do NOT use this to enforce a certain condition on any user input.

	assert: function (condition, message) {
		/* istanbul ignore if */
		if (!condition) {
			throw new Error('ASSERT: ' + message);
		}
	},

	eof: function() {
		return this.index >= this.length;
	},

	isWhiteSpace: function(ch) {
		return Character.isWhiteSpace(ch);
	},

	isIdentifierStart: function(ch) {
		return Character.isIdentifierStart(ch);
	},

	// ECMA-262 11.7 Punctuators
	scanPunctuator: function() {
		var token = {
			type: Token.Punctuator,
			value: '',
			start: this.index,
			end: this.index
		};

		// Check for most common single-character punctuators.
		var str = this.text[this.index];

		switch(str) {
			case '{':
				if(str === '{') {
					this.curlyStack.push(str);
				}
				++this.index;
				break;
			case '}':
				++this.index;
				this.curlyStack.pop();
				break;
			case '.':
				++this.index;
				if(this.text[this.index] === '.' && this.text[this.index + 1] === '.') {
					// Spread operator: ...
					this.index += 2;
					str = '...';
				}
				break;
			case '(':
			case ')':
			case ';':
			case ',':
			case '[':
			case ']':
			case ':':
			case '?':
			case '~':
				++this.index;
				break;
			default:
				// 4-character punctuator.
				str = this.text.substr(this.index, 4);
				if(str === '>>>=') {
					this.index += 4;
				} else {
					// 3-character punctuators.
					str = str.substr(0, 3);
					if (str === '===' || str === '!==' || str === '>>>' ||
							str === '<<=' || str === '>>=') {
						this.index += 3;
					} else {
						// 2-character punctuators.
						str = str.substr(0, 2);
						if (str === '&&' || str === '||' || str === '==' || str === '!=' ||
								str === '+=' || str === '-=' || str === '*=' || str === '/=' ||
								str === '++' || str === '--' || str === '<<' || str === '>>' ||
								str === '&=' || str === '|=' || str === '^=' || str === '%=' ||
								str === '<=' || str === '>=' || str === '=>') {
							this.index += 2;
						} else {
							// 1-character punctuators.
							str = this.text[this.index];
							if('<>=!+-*%&|^/'.indexOf(str) >= 0) {
								++this.index;
							}
						}
					}
				}
				break;
		}

		if(this.index === token.start) {
			this.throwUnexpectedToken();
		}

		token.end = this.index;
		token.value = str;

		this.tokens.push(token);
	},

	scanStringLiteral: function() {
		const start = this.index;
		var quote = this.text[start];

		this.assert((quote === '\'' || quote === '"'), 'String literal must starts with a quote');

		++this.index;

		var octal = false;
		var str = '';
		var ch;

		while(!this.eof()) {
			ch = this.text[this.index++];

			if(ch === quote) {
				// if we are scanning this, the first quote
				// is just behind the actual index, this will
				// tell the scanner that we have found the final
				// quote, if we don't, throw an error
				quote = '';
				break;
			} else {
				str += ch;
			}
		}

		if(quote !== '') {
			this.throwUnexpectedToken();
		}

		this.tokens.push({
			type: Token.StringLiteral,
			value: str,
			octal: octal,
			start: start,
			end: this.index
		});
	},

	scanning: function(value) {
		this._scanning = (value || !this._scanning);

		return this;
	}
};
