describe('Helpers', function() {
	it('should translate to kebab case', function() {
		expect(kebabCase('rdSomeCoolDirectiveHere')).toEqual(
			'rd-some-cool-directive-here'
		);
	});

	it('should check the deep equality between two values', function() {
		expect(isEqual('A great value here', 'A great value here')).toBeTruthy();
		expect(isEqual('A great value here', 'A_great value here')).not.toBeTruthy();

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
});
