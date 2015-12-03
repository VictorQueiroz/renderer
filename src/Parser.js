/**
 * @constructor
 */
function Parser (lexer) {
	this.lexer = lexer;
	this.ast = new AST(this.lexer);
	this.astCompiler = new ASTCompiler(this.ast);
}

Parser.prototype = {
	constructor: Parser,

	parse: function(text) {
		return this.astCompiler.compile(text);
	}
};
