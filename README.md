# renderer

### Installation
```
bower install --save renderer
```

### Usage
```html
<widget>
	<title>Last posts</title>
	<content>
		<div class="posts-list" nd-repeat="post in posts">
			<a nd-href="{{post.href}}">{{post.title}}</a>
		</div>
	</content>
</widget>
```

```js
renderer.register('widget', function() {
	return {
		template: [
			'<div class="widget-title" nd-transclude="titleSlot"></div>',
			'<div class="widget-body" nd-transclude="contentSlot"></div>'
		],
		transclude: {
			title: 'titleSlot',
			content: 'contentSlot'
		}
	};
});
```
