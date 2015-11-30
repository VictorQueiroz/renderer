describe('AST', function() {
	var ast = new AST(new Lexer());

	it('should compile a call expression', function() {
		expect(ast.ast('callThisFunction()')).toEqual({
		  "type": "Program",
		  "body": [
		    {
		      "type": "ExpressionStatement",
		      "expression": {
		        "type": "CallExpression",
		        "callee": {
		          "type": "Identifier",
		          "name": "callThisFunction"
		        },
		        "arguments": []
		      }
		    }
		  ]
		});
	});

	it('should compile a simple expression', function() {
		expect(ast.ast('a.b.c.d')).toEqual({
	    "type": "Program",
	    "body": [{
        "type": "ExpressionStatement",
        "expression": {
          "type": "MemberExpression",
          "computed": false,
          "object": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "MemberExpression",
              "computed": false,
              "object": {
                "type": "Identifier",
                "name": "a"
              },
              "property": {
                "type": "Identifier",
                "name": "b"
              }
            },
            "property": {
              "type": "Identifier",
              "name": "c"
            }
          },
          "property": {
            "type": "Identifier",
            "name": "d"
          }
        }
	    }]
		});
	});
});
