function Directive(name, options) {
	if(name) {
		this.name = name;
	}

	if(isObject(options)) extend(this, options);
}