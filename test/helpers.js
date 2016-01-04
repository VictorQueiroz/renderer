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
    expect(isEqual({},{array:[],object:{}})).not.toBeTruthy();

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
    expect(isEqual(true, true)).toBeTruthy();
    expect(isEqual(true, false)).toBeFalsy();
	});

  it('should clone a deep array', function() {
    expect(clone([[[[]]]])).toEqual([[[[]]]]);
    expect(clone([[[[]]],[[[],[]]]])).toEqual([[[[]]],[[[],[]]]]);
  });

  it('should clone an object', function() {
    var object = {
      huge: {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],

        object: {
          lots: {
            of: {
              recursive: {
                keys: [1,2,3,4]
              }
            }
          }
        }
      },
      empty: {},
      array1: [],
      array2: [],
      array3: [],
      array4: []
    };

    expect(object).toBe(object);
    expect(clone(object)).toEqual(object);
    expect(clone(object)).toEqual(clone(object));
    expect(clone(object)).not.toBe(object);

    object = {array:[]};
    var clonedObject = clone(object);

    expect(clonedObject).not.toBe(object);

    object.array.push(0);
    expect(clonedObject).toEqual({array:[]});
  });

  it('should clone numbers', function() {
    for(var i = 0; i < 20; i++) {
      expect(clone(i)).toBe(i);
    }
  });

  it('should create custom error message', function() {
    expect(createError('message {0} message {1}!!!', 1, 2)).toEqual(
      new Error('message 1 message 2!!!')
    );
  });
});
