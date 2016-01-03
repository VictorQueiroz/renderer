describe('Helpers', function() {
	it('should translate to kebab case', function() {
		expect(kebabCase('rdSomeCoolDirectiveHere')).toEqual(
			'rd-some-cool-directive-here'
		);
	});

	it('should check the deep equality between two values', function() {
		expect(isEqual('A great value here', 'A great value here')).toBeTruthy();
		expect(isEqual('A great value here', 'A_great value here')).not.toBeTruthy();

		expect(isEqual(1, [1,2,3,4])).not.toBeTruthy();
		expect(isEqual('1', [1,2,3,4])).not.toBeTruthy();
		expect(isEqual('1', 1)).not.toBeTruthy();
		expect(isEqual(1, 2)).not.toBeTruthy();

		expect(isEqual({ a: 1 }, { a: 1	})).toBeTruthy();
		expect(isEqual({ a: 1 }, { b: 1	})).not.toBeTruthy();

		expect(isEqual({
			someDeepObject: {
				anotherDeepObject: {
					goOn: {
						ohYeah: {
							weAreDone: 1
						}
					}
				}
			}
		}, {
			someDeepObject: {
				anotherDeepObject: {
					goOn: {
						ohYeah: {
							weAreDone: 1
						}
					}
				}
			}
		})).toBeTruthy();
		expect(isEqual({ a: 1 }, { b: 1	})).not.toBeTruthy();
	});

  it('should clone a deep array', function() {
    expect(clone([[[[]]]])).toEqual([[[[]]]]);
  });

  it('should clone an object', function() {
    var object = {
      huge: {
        object: {
          lots: {
            of: {
              recursive: {
                keys: [1,2,3,4]
              }
            }
          }
        }
      }
    };

    expect(object).toBe(object);
    expect(clone(object)).toEqual(object);
    expect(clone(object)).not.toBe(object);
  });

  it('should create custom error message', function() {
    expect(createError('message {0} message {1}!!!', 1, 2)).toEqual(
      new Error('message 1 message 2!!!')
    );
  });
});
