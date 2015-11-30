/**
 * @constructor
 */
function Parser (lexer, options) {
  this.lexer = lexer;
  this.options = options;
  this.ast = new AST(this.lexer);
  this.astCompiler = new ASTCompiler(this.ast);
}

Parser.prototype = {
  constructor: Parser,

  parse: function(text) {
    return this.astCompiler.compile(text);
  }
};
