# Smoothr
## Smooth Router
A custom React router that leverages the Web Animations API and CSS animations. 

[Check out the demo!](https://smoothr.netlify.app/)

![Smoothr Logo](assets/big-logo.png)

## Features
- [x] Built with animating route transitions in mind
- [x] Use the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) or CSS classes to animate
- [x] Route and animate multiple sections of the page
- [x] Hash Routing
- [x] Minimal Polyfilling necessary (Just `Object.assign()`, `Promise` and possibly [`Element.animate()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate), for IE11 and newer)

## Backstory
In my experience of using animations with React Router and other Single Page App routing solutions, the work to add animation transitions on changing routes was a lot more complicated than just regular routing. I also was inspired by the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) and decided to create my own flavor of a Router, one that treats animations as first class citizens.

Anyway, thanks for checking this library out. If you end up using Smoothr in production, let me know and I'll add a link here in the README. 

May your single page routing animations be smoother, with Smoothr... (pardon the cheesyness)

## Getting Started

### Prerequisites

* React 16.3.0 or higher
* Support for `Object.assign()` and `Promise` in Javascript
* Any necessary polyfills for the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) [This one gets the job done well.](https://github.com/web-animations/web-animations-js)

### Installation

```
$ npm install --save smoothr
```

or

```
$ yarn add smoothr
```

## Minimal Example Usage

```jsx
import React from 'react';
import ReactDOM from 'react-dom';

// Bring in the Smoothr components
import { Smoothr, SmoothRoutes, Route, Link } from 'smoothr';

const Page = props => <section>{props.message}</section>;

const App = () => (
  <Smoothr>
    <div>
      {/* Link is our wrapper around anchors for Smoothr navigation  */}
      <Link href="/">Home</Link>
      <Link href="/anotherpage">Another Page</Link>
    </div>
    <div>
      <SmoothRoutes>
        <Route
          path="/"
          component={Page}
          // Use the Web Animations API, first argument of Element.animate()
          animationIn={[{ opacity: 0 }, { opacity: 1 }]}
          animationOut={[{ opacity: 1 }, { opacity: 0 }]}
          // and the second argument of Element.animate()
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
```

For a more complete example, check out [the demo](https://smoothr.netlify.com) and its [source code](https://github.com/n8jadams/smoothr/blob/master/example/src/index.js). If you want to play around with this example, see the setup instructions in the [Contributing section](#contributing).

## API Documentation

### `<Smoothr>`

#### Usage: 
The `<Smoothr>` component just needs to be used up the tree of any `<Link>`s or `<SmoothRoutes>`. I recommend having it at the top level of your Single Page App. `<Smoothr>` props are the top-level configuration for all routing.

#### Available props: (* indicates a required prop)
* `beforeAnimation` - _(function)_ - This method is the entry point into knowing what's going on with the Smoothr routing. It is used in a `Promise` which will resolve before starting the animation to ensure the completion of any asynchonous state changes before animating. Use it to change local state in order to conditionally set the upcoming animation. Example:

```javascript
beforeAnimation = ({
  // Url's are the exact urls
  outgoingUrl,
  incomingUrl,
  // Routes are the original matching routes, as set in the <Route /> components
  outgoingRoute,
  incomingRoute,
  // If the user nagivated with the "back" button in the browser (boolean)
  backNavigation
}) => {
  // Set local state in order to configure upcoming <Route> animation props
  // ...
};
```
* `onAnimationStart` - _(function)_ - This function will run right before the animation begins. Use it to imperitively kick off transition animations. If you want to kick off an animation based on incoming or outgoing routes, use `beforeAnimation` to set some state, and then use that state in this method.

* `onAnimationEnd` - _(function)_ - This takes place after the animation is finished. Tell your app that it's done animating, reset some configuration saved in state, or do something else. There are no arguments passed.

* `originPath` - _(string)_ - The path after the domain to the origin of this single page app. This includes the beginning backslash, but not the trailing backslash. This will be set once and cannot be updated. All of the `<Link>` `href` properties will be relative to that origin path. For hash routing, set this to `"/#"` or something else ending with a hash (`#`), and that's it! Example: `"/smoothr-app"`, and `<Link href="/page1" />` will link to `"/smoothr-app/page1"`. This defaults to an empty string, which signifies the document root.

### `<SmoothRoutes>`

#### Usage:
Imagine `<SmoothRoutes>` as a regular DOM element that changes when the url changes. Its children MUST be `<Route>` components. You can use as many of these on the page as you want. Often you'll want to wrap each `<SmoothRoutes>` component in a wrapper DOM element with some CSS rules or a MutationObserver to set its size.

#### Available props:
Each of these props are identical to their `<Route>` counterparts. They will be applied to all routes if set at the `<SmoothRoutes>` level, but if a `<Route>` has an animation prop, the logic will favor the props set on the `<Route>` at transition time.
* `animationIn` - _([Element.animate() `keyframes` argument, or string indicating `className`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#Parameters))_
* `animationOut` - _([Element.animate() `keyframes` argument, or string indicating `className`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#Parameters))_
* `animationOpts` - _([Element.animate() `options` argument](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#Parameters))_
* `reverseAnimationIn` - _([Element.animate() `keyframes` argument, or string indicating `className`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#Parameters))_
* `reverseAnimationOut` - _([Element.animate() `keyframes` argument, or string indicating `className`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#Parameters))_
* `reverseAnimationOpts` - _([Element.animate() `options` argument](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#Parameters))_

### `<Route>`

#### Usage:
Most of the actual animation configuration takes place on the `<Route>` level. Animations are set by the props of the `<Route>` that is being transitioned in. The `reverseAnimation` prop equivalents take precedence when the user nagivates back with the "back" button in their browser, but aren't required.

#### Available props: (* indicates a required prop)
* `component`* - _(React Component)_ - The component that you want to be rendered when the URL matches a given path.
* `path`* - _(string)_ - When the url matches the `path` of your `<Route>`, it will render to the page. Variabled routes are supported, and can be indicated with a colon (`:`). The value of that variable will be passed down as a prop by the name in the path to the rendered `component`. Example of using `path` with variables:

```jsx
<Route path="/users/:id" component={UsersPage} />

// If the url is "/users/12345", the following will be rendered:
<UsersPage id="12345">
```
* `pathResolve` - _(function)_ - Use this function to validate and modify the variables passed when this `<Route>` is navigated to. The return value must match the pattern of the path. If it doesn't, the `notFound` path will be used. This will only work if the `path` component has variables. Example, which can by tested on the [live demo](https://smoothr.netlify.com):

```jsx
<Route
  path="/color/:red/:green/:blue"
  pathResolve={({red, green, blue}) => {
    // Ensure they're all numeric
    if(isNaN(red) || isNaN(green) || isNaN(blue)) {
      // Return anything not matching the `path` pattern to trigger a 404
      return false; 
    }
    // Make sure they're all valid RGB values
    red = Math.min(Math.abs(parseInt(red)), 255);
    green = Math.min(Math.abs(parseInt(green)), 255);
    blue = Math.min(Math.abs(parseInt(blue)), 255);
    // Return the resolved url
    return `/color/${red}/${green}/${blue}`;
  }}
  // ...
/>
```
* `animationIn` - _([Element.animate() `keyframes` argument, or string indicating `className`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#Parameters))_ - The value of this prop corresponds to the first argument of the [`Element.animate()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate) method, or a css class name, which will be applied to the `<Route>` DOM element during the duration of the animation. If this isn't passed, then no animation will occur, but be aware that the incoming `<Route>` won't show up until the duration ends, as set in the `animationOpts` prop of either the `<SmoothRoutes>` or `<Route>` component.
* `animationOut` - _([Element.animate() `keyframes` argument, or string indicating `className`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#Parameters))_ - Similiar to `animationIn`, but is applied to the outgoing `<Route>`
* `animationOpts` - _([Element.animate() `options` argument](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#Parameters))_ - This corresponds to the second argument of the [`Element.animate()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate) method. These options are applied to both the incoming and outgoing `<Route>`s during transition. If using a CSS class transition, then any other options passed to an object besides `duration` will be ignored. If this prop is not set, the animation duration will default to 0.

*NOTE: There are a couple of nuances to how Smoothr uses the `options` argument of `Element.animate()`.*

1. `fill` is always set to `forwards`
2. `iterations` cannot be set to `Infinity`.

* `reverseAnimationIn` - _([Element.animate() `keyframes` argument, or string indicating `className`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#Parameters))_ - Same as the `animationIn` but happens when the user nagivates back with the "back" button in their browser.
* `reverseAnimationOut` - _([Element.animate() `keyframes` argument, or string indicating `className`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#Parameters))_ - Reverse equivalent of the `animationOut` prop.
* `reverseAnimationOpts` - _([Element.animate() `options` argument](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#Parameters))_ - Reverse equivalent of the `animationOpts` prop.
* `notFound` - _(No type, just set the prop)_ - This designates a `path` and `component` to show when the URL doesn't match any of the other paths. If you have multiple `<SmoothRoutes>` sections, the `<Route>`s flagged with this prop must have matching `path`s. (Only one "not found" url path can exist.)
* Any other props that are set will be passed down to the rendered `component`.

### `<Link>`

#### Usage:
Links are wrappers around anchor (`<a>`) tags. The library adds the prop `data-smoothr-current-link="true"` when the `href` matches the current URL, and the `data-smoothr-visited-link` property to simulate the css `:visited` rule. When styling, use these data-attributes in your css rules, like so

```css
a[data-smoothr-current-link="true"] {
  /* some style to show the currently opened link here */
}

a:visited,
a[data-smoothr-visited-link="true"] {
  /* some style to show a visited link here */
}
```

#### Available props: (* indicates a required prop)
* `href`* - _(string)_ - Same as anchor tag
* `onClick` - _(function)_ - This is self-explanatory
* `fuzzyCurrent` - _(No type, just set the prop)_ - If is prop is set, the `data-smoothr-current-link` property will be added to the link if the route matches the current *variabled* route. By default, only exact url matches will have the `data-smoothr-current-link` property added.
* `fuzzyVisited` - _(No type, just set the prop)_ - Similiar to the `fuzzyCurrent` prop, but related to visited links. If the user visits a Route with a matching variable pattern, the `data-smoothr-visited-link` property will be added.
* Any other props that are set will be passed down to the rendered anchor tag.

## To do list before version 1.0.0:
- [x] Release initial build to NPM
- [x] Add ability to validate and mask URL variables on navigation
- [x] Test on Chrome, Firefox, Safari, Edge and IE11.
- [x] Handle visited links and current links better
- [x] Remove glitchiness around interrupted animations
- [x] Add hash routing
- [x] General cleanup
- [ ] Test on Edge and IE11.
- [ ] Add prop checks with `PropTypes`
- [ ] Test app in Preact/add Preact support
- [ ] Remove need to polyfill `Object.assign` and possibly `Promise`
- [ ] Optimization
- [ ] Add more animations to the demo page

## Contributing

I plan on maintaining this library. For bugs and enhancements, just add an issue and/or send pull request my way, and I'll review it! I'm definitely open to improvements. 

### Setup
You can set up your development environment and use the example app as a test app by running the following commands: 

```
$ git clone https://github.com/n8jadams/smoothr.git
$ cd smoothr
$ yarn install
$ yarn build
$ cd example
$ yarn install
$ yarn start
```

and then when you want to reload the package, from the `smoothr` directory
```
$ yarn build
```

It may take a while to download the dev dependencies.

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

