# Smoothr
## Smooth Router
A custom React router that leverages the Web Animations API and CSS animations. 

[Check out the demo!](https://n8jadams.github.io/smoothr-demo/)

![Smoothr Logo](assets/big-logo.png)

## Background
In my experience from using animations with React Router and other Single Page App routing solutions, the work to add animation transitions on changing routes was a lot more complicated than just regular routing. I also was inspired by the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) and decided to create my own flavor of a Router, that treats animations as first class citizens.

Anyway, thanks for checking this library out. If you end up using Smoothr in production, let me know and I'll add a link here in the README. 

May your single page routing animations be smoother, with Smoothr... (pardon the cheesyness)

## Getting Started

### Prerequisites

* React 16.3.0 or higher
* Support for `Object.assign` and `Promise` in Javascript
* Any necessary polyfills for the [Web Animations API](https://github.com/web-animations/web-animations-js)

### Installation

```
npm install smoothr
```

## Minimal Example Usage

```jsx
import React from 'react';
import ReactDOM from 'react-dom';

// Bring in the Smoothr components
import { Smoothr, SmoothRoutes, Route, Link } from 'smoothr';

const Page = props => <section>{props.message}</section>;

const App = () => (
  <Smoothr
    // Required prop! Return animation duration in milliseconds
    configAnimationSetDuration={() => 750}
  >
    <div>
      {/* Link is our wrapper around anchors for Smoothr navigation  */}
      <Link href="/">Home</Link>
      <Link href="/page1">Page 1</Link>
    </div>
    <div>
      <SmoothRoutes>
        <Route
          path="/"
          component={Page}
          // Use the Web Animations API
          animationIn={[{ opacity: 0 }, { opacity: 1 }]}
          animationOut={[{ opacity: 1 }, { opacity: 0 }]}
          animationOpts={{
            duration: 750,
            easing: 'ease-in-out'
          }}
          // Any other props will be passed to `component`
          message="Welcome to the homepage!"
        />
        <Route
          path="/anotherpage"
          component={Page}
          // Use CSS classes for animating
          animationIn={'fadeInCSSClassName'}
          animationOut={'fadeOutCSSClassName'}
          message="Welcome to the other page!"
        />
        <Route
          // The `notFound` prop designates a route, path, and component for 404 page
          notFound
          path="/notfound"
          component={Page}
          message="404 Error!"
        />
      </SmoothRoutes>
    </div>
  </Smoothr>
);

ReactDOM.render(<App />, document.getElementById('root'));
```

For a more complete example, check out [the demo](http://n8jadams.github.io/smoothr-demo) and its [source code](https://github.com/n8jadams/smoothr/blob/master/example/src/index.js) If you want to play around with this example, run the following:

```
git clone https://github.com/n8jadams/smoothr.git

# Set up a local version of the library
cd smoothr

npm install

npm run build

# Start the hot-reload server (like create-react-app)
cd example

yarn install

yarn run start
```

## API Documentation

### `<Smoothr>`

#### Usage: 
The `<Smoothr>` component just needs to be used up the tree of any `<Link>`s or `<SmoothRoutes>`. I just recommend having it at the top level of your Single Page App.

#### Available props: (* indicates a required prop)
* `configAnimationSetDuration`* - _(function)_ - This method allows changing of local state in order to conditionally set the upcoming animation. It is a `Promise`, to ensure any asynchonous state changes to be completed before the animating begins. Example:

```javascript
configAnimationSetDuration = ({
  // Url's are the exact urls
  outgoingUrl,
  incomingUrl,
  // Routes are the original matching routes, as set in the <Route /> components
  outgoingRoute,
  incomingRoute,
  // If the user nagivated with the "back" button in the browser (boolean)
  backNavigation
}) => {
  // Have this method return the duration of the animation as an int in milliseconds
  return 750;
};
```

* `onAnimationStart` - _(function)_ - This function will run right before the animation begins. Use it to imperitively kick off transition animations. If you want to kick off an animation based on incoming or outgoing routes, use `configAnimationSet` to set some state, and then use that state in this method. Example:

```javascript
onAnimationStart = ({ initialPageload }) => {
  // Do stuff...
};
```

* `onAnimationEnd` - _(function)_ - This takes place after the animation is finished. Reset your animations if they're saved in state, or do something else. There are no arguments passed.

* `originPath` - _(string)_ - The path after the domain to the origin of this single page app.
Include the beginning backslash, but not the trailing backslash.
All of the `<Link />` `href` properties will be relative to that origin path.
Example: `"/smoothr-app"`, and `<Link href="/page1" />` will link to `"/smoothr-app/page1"`.
This defaults to an empty string, which signifies the document root.

### `<SmoothRoutes>`

#### Usage:
Imagine `<SmoothRoutes>` as a regular DOM element that changes when the url changes. Its children MUST be `<Route>` components. You can use as many of these on the page as you want. Often you'll want to wrap each `<SmoothRoutes>` component in a wrapper DOM element with some CSS rules to set its size.

#### Available props:
Each of these props are identical to their `<Route>` counterparts. They will be applied to all routes if set at the `<SmoothRoutes>` level, but if a `<Route>` has an animation prop, the logic will favor the props set on the `<Route>` at transition.
* `animationIn` - _(array of objects/string indicating class name)_
* `animationOut` - _(array of objects/string indicating class name)_
* `animationOpts` - _(object with keys for `duration` and `easing`)_
* `reverseAnimationIn` - _(array of objects/string indicating class name)_
* `reverseAnimationOut` - _(array of objects/string indicating class name)_
* `reverseAnimationOpts` - _(object with keys for `duration` and `easing`)_

### `<Route>`

#### Usage:
Most of the actual animation configuration takes place on the `<Route>` level. Animations are set by the props of the `<Route>` that is being transitioned in. The `reverseAnimation` prop equivalents take precedence when the user nagivates back with the "back" button in their browser, but aren't required.

#### Available props: (* indicates a required prop)
* `component`* - _(React Component)_ - The component that you want to be rendered when the URL matches a given path.
* `path`* - _(string)_ - When the url matches the `path` of your `<Route>`, it will render to the page. Variabled routes are supported, and can be indicated with a `:`. The value of that variable will be passed down as a prop by the name in the path to the rendered `component`. Example of using `path` with variables:

```jsx
<Route path="/users/:id" component={UsersPage} />

// If the url is "/users/12345", the following will be rendered:
<UsersPage id="12345">
```
* `animationIn` - _(array of objects/string indicating class name)_ - The value of this prop corresponds to the first argument of the [`Element.animate()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate) method, or a css class name, which will be applied to the `<Route>` DOM element during the duration of the animation. If this isn't passed, then no animation will occur, but be aware that the incoming `<Route>` won't show up until the duration ends, as set in the `configAnimationSetDuration` prop of the top level `<Smoothr>` component.
* `animationOut` - _(array of objects/string indicating class name)_ - Similiar to `animationIn`, but is applied to the outgoing `<Route>`
* `animationOpts` - _(object with keys for `duration` and `easing`)_ - This corresponds to the second argument of the [`Element.animate()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate) method. These options are applied to both the incoming and outgoing `<Route>`s during transition. If using a CSS class transition, then this is optional.
* `reverseAnimationIn` - _(array of objects/string indicating class name)_ - Same as the `animationIn` but happens when the user nagivates back with the "back" button in their browser.
* `reverseAnimationOut` - _(array of objects/string indicating class name)_ - Reverse equivalent of the `animationOut` prop.
* `reverseAnimationOpts` - _(object with keys for `duration` and `easing`)_ - Reverse equivalent of the `animationOpts` prop.
* `notFound` - _(No type, just add the prop)_ - This designates a `path` and `component` to show when the URL doesn't match any of the other paths.
* Any other props that are set will be passed down to the rendered `component`.

### `<Link>`

#### Usage:
Links are wrappers around anchor (`<a>`) tags, except it adds the `disabled` property when the `href` matches the current URL (unless you manually pass a `disabled` property)

#### Available props: (* indicates a required prop)
* `href`* - _(string)_ - Same as anchor tag
* `onClick` - _(function)_ - This is self-explanatory
* `fuzzyDisable` - _(No type, just add the prop)_ - If is prop is set, it will disable the link if the route matches the current variabled route. By default, only exact url matches will be disabled.
* Any other props that are set will be passed down to the rendered anchor tag.

## To do list:
- [x] Release initial build to NPM
- [ ] Test callback functions as `<Route>` `component` prop
- [ ] Test app in Preact/add Preact support
- [ ] Add prop checks with `PropTypes`
- [ ] Remove need to polyfill `Object.assign` and possibly `Promise`
- [ ] General cleanup and optimizations
- [ ] Add more animations to the demo page

## Contributing

I plan on maintaining this library. For bugs and enhancements, just add an issue and/or send pull request my way, and I'll review it! I'm definitely open to improvements.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars1.githubusercontent.com/u/24380612?v=4" width="100px;"/><br /><sub><b>Nate Adams</b></sub>](https://github.com/n8jadams)<br />[💻](https://github.com/n8jadams/smoothr/commits?author=n8jadams "Code") [🎨](#design-n8jadams "Design") [📖](https://github.com/n8jadams/smoothr/commits?author=n8jadams "Documentation") [💡](#example-n8jadams "Examples") [🤔](#ideas-n8jadams "Ideas, Planning, & Feedback") [📦](#platform-n8jadams "Packaging/porting to new platform") | [<img src="https://avatars2.githubusercontent.com/u/3399907?v=4" width="100px;"/><br /><sub><b>Morgan Kartchner</b></sub>](https://github.com/mkartchner994)<br />[🤔](#ideas-mkartchner994 "Ideas, Planning, & Feedback") [🚇](#infra-mkartchner994 "Infrastructure (Hosting, Build-Tools, etc)") |
| :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Big thanks to [Morgan Kartchner](https://github.com/mkartchner994) for the mentoring and contributions to the [Dayzed](https://github.com/deseretdigital/dayzed/) library, which I used as a guide in setting up this lib.
* The folks at MDN for writing up the Web Animations API documentation
* You, for checking out this library! Thanks!

