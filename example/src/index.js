import React from 'react';
import ReactDOM from 'react-dom';
import { Home, Color, Smoothie, NotFound, Overlay } from './components/Routes';
import { Options } from './components/Options';
import { generateRandomColor } from './utils/generateRandomColor';
import SmoothrLogo from './assets/images/small-logo.png';

// Import the smoothr packages!
import { Smoothr, SmoothRoutes, Route, Link } from 'smoothr';

// Generate some colors for the overlay Routes
const randomColor1 = generateRandomColor();
const randomColor2 = generateRandomColor();
const randomColor3 = generateRandomColor();
const randomColor4 = generateRandomColor();
const randomColor5 = generateRandomColor();

export default class App extends React.Component {
  state = {
    animating: false,
    showOverlay: false,
    animation: 'Fade',
    animationIn: [{ opacity: 0 }, { opacity: 1 }],
    animationOut: [{ opacity: 1 }, { opacity: 0 }],
    reverseAnimationIn: null,
    reverseAnimationOut: null,
    duration: 750,
    easing: 'ease-in-out'
  };

  /*
    This method allows changing of local state
    in order to conditionally set the upcoming animation.
    It is a Promise, so it will be completed before the animating begins.
  */
  configAnimationSetDuration = ({
    // Url's are the exact urls
    outgoingUrl,
    incomingUrl,
    // Routes are the original matching routes, as set in the <Route /> components
    outgoingRoute,
    incomingRoute,
    // If the user nagivated with the "back" button in the browser
    backNavigation
  }) => {
    // Disable all navigation during animation in this app
    this.setState({animating: true});

    // Have this method return the duration of the animation as an int in milliseconds
    return incomingRoute === '/notfound' ? 0 : this.state.duration;
  };

  /* 
    This method will happen right before the animation begins.
    Use it to imperitively kick off transition animations,
    including on the initial page load, which is passed in as a bool.
  */
  onAnimationStart = ({ initialPageload }) => {};

  /*
    This takes place after the animation is finished.
    Reset your animations, or do something else...
  */
  onAnimationEnd = () => {
    this.setState({animating: false});
  };

  render() {
    return (
      /* 
        The <Smoothr /> component just needs to be used 
        up the tree of any <Link />s or <SmoothRoutes />
      */
      <Smoothr
        /* 
          originPath is the path after the domain to the origin of this single page app.
          Include the beginning backslash, but not the trailing backslash.
          All of the <Link /> href properties will be relative to that origin path.
          For hash routing, set this to "/#" or something else ending with a hash, and that's it!
          Example: "/smoothr-app", and <Link href="/page1" /> will link to "/smoothr-app/page1".
          This defaults to an empty string, which signifies the document root.
        */
        originPath=""
        configAnimationSetDuration={this.configAnimationSetDuration}
        onAnimationStart={this.onAnimationStart}
        onAnimationEnd={this.onAnimationEnd}
      >
        <div className="app-container">
          <header>
            <h1>
              Smoothr
              <img src={SmoothrLogo} className="smoothie-logo" alt="Smoothr Logo" />
              Demo
            </h1>
            <Options
              setState={newState => this.setState(newState)}
              showOverlay={this.state.showOverlay}
              animation={this.state.animation}
              duration={this.state.duration}
              easing={this.state.easing}
              animating={this.state.animating}
            />
            <div className="links-container">
              <div className="links">
                {/* 
                  Links are wrappers around anchor (`<a>`) tags. 
                  The library adds the prop `data-smoothr-current-link="true"` 
                  when the `href` matches the current URL, 
                  and the `data-smoothr-visited-link` property 
                  to simulate the css `:visited` rule.
                */}
                <Link href="/">Home</Link>
                <Link href="/color/255/209/102" className="yellow-link">Yellow</Link>
                <Link href="/color/117/219/205" className="turquoise-link">Turquoise</Link>
                <Link href="/smoothie">Smoothie</Link>
                {/* This will redirect to the set `notFound` url */}
                <Link href="/show404page">Invalid Link</Link>
              </div>
            </div>
          </header>
          <div className="main">
            {/*
              Animations are set by the props of the INCOMING <Route>.
              `animationIn` will be performed on the same, incoming <Route>.
              `animationOut` will be performed on the other, outgoing <Route>.
              `animationOpts` will be applied to both the <Route>s.
            */}
            <SmoothRoutes>
              <Route
                path="/"
                component={Home}
                /*
                  `animationIn` and `animationOut` accept 1 of the following:
                    1. An array of objects - first argument of Element.animate()
                    2. A CSS class name that will be added during the animation
                */
                animationIn={this.state.animationIn}
                animationOut={this.state.animationOut}
                /*
                  `animationOpts` is an optional prop and is only used 
                  if passing an array of objects to `animationIn` or `animationOut`.
                  It corresponds to the second argument of Element.animate()
                */
                animationOpts={{
                  duration: this.state.duration,
                  easing: this.state.easing
                }}
                /*
                  The reverse animations props are called when
                  the user navigates with the back button in the browser.
                  If these are null, the regular animation props will be used.
                */
                reverseAnimationIn={this.state.reverseAnimationIn}
                reverseAnimationOut={this.state.reverseAnimationOut}
                reverseAnimationOpts={{
                  duration: this.state.duration,
                  easing: this.state.easing
                }}
                /*
                  Any other props (including className and style) get
                  passed down to the rendered <Route />
                */
                data-some-other-prop={true}
              />
              <Route
                /* 
                  Variables in routes. 
                  This example will pass props for `red`, `green`, and `blue` to the component. 
                */
                path="/color/:red/:green/:blue"
                /*
                  Validate and modify the variables passed when this <Route> is navigated to. 
                  The return value must match the pattern of the path. If it doesn't, the
                  `notFound` path will be used. This will only work if the `path` component
                  has variables.
                */
                pathMask={({red, green, blue}) => {
                  // Validate that they're all numbers
                  if(isNaN(red) || isNaN(green) || isNaN(blue)) {
                    // Return anything else not matching the `path` pattern to trigger a 404
                    return false; 
                  }
                  // Make sure they're all valid RGB values
                  red = Math.min(Math.abs(parseInt(red)), 255);
                  green = Math.min(Math.abs(parseInt(green)), 255);
                  blue = Math.min(Math.abs(parseInt(blue)), 255);
                  // Return the validated url
                  return `/color/${red}/${green}/${blue}`;
                }}
                component={Color}
                animationIn={this.state.animationIn}
                animationOut={this.state.animationOut}
                animationOpts={{
                  duration: this.state.duration,
                  easing: this.state.easing
                }}
                reverseAnimationIn={this.state.reverseAnimationIn}
                reverseAnimationOut={this.state.reverseAnimationOut}
                reverseAnimationOpts={{
                  duration: this.state.duration,
                  easing: this.state.easing
                }}
              />
              <Route
                path="/smoothie"
                component={Smoothie}
                animationIn={this.state.animationIn}
                animationOut={this.state.animationOut}
                animationOpts={{
                  duration: this.state.duration,
                  easing: this.state.easing
                }}
                reverseAnimationIn={this.state.reverseAnimationIn}
                reverseAnimationOut={this.state.reverseAnimationOut}
                reverseAnimationOpts={{
                  duration: this.state.duration,
                  easing: this.state.easing
                }}
              />
              <Route
                /* notFound prop designates a route, path, and component for 404 page */
                notFound
                path="/notfound"
                component={NotFound}
              />
            </SmoothRoutes>
          </div>
          <footer>
            Smoothr was written by{' '}
            <a href="https://github.com/n8jadams">Nate Adams</a>.{' '}
            <a href="https://github.com/n8jadams/smoothr">
              View The Source Code
            </a>
            .
          </footer>
        </div>
        {/* 
          You can have as many Route groups as you want on the page,
          and they don't have to match up! If the current route doesn't
          match up with any of the SmoothRoutes, then it just won't 
          render anything.
        */
        this.state.showOverlay ? (
          <div className="overlay-container">
            <SmoothRoutes
              /* 
                Instead of passing the same animation props to all the <Route>s,
                you can pass it to the <SmoothRoutes>.
                The animation logic will favor the <Route> animation prop
                over the <SmoothRoute> one.
              */
              animationIn={this.state.animationIn}
              animationOut={this.state.animationOut}
              animationOpts={{
                duration: this.state.duration,
                easing: this.state.easing
              }}
              reverseAnimationIn={this.state.reverseAnimationIn}
              reverseAnimationOut={this.state.reverseAnimationOut}
              reverseAnimationOpts={{
                duration: this.state.duration,
                easing: this.state.easing
              }}
            >
              <Route
                path="/"
                component={Overlay}
                style={{ backgroundColor: randomColor1 }}
              />
              <Route
                path="/color/255/209/102"
                component={Overlay}
                style={{ backgroundColor: randomColor2 }}
              />
              <Route
                path="/color/117/219/205"
                component={Overlay}
                style={{ backgroundColor: randomColor3 }}
              />
              <Route
                path="/smoothie"
                component={Overlay}
                style={{ backgroundColor: randomColor4 }}
              />
              <Route
                notFound
                path="/notfound"
                component={Overlay}
                style={{ backgroundColor: randomColor5 }}
              />
            </SmoothRoutes>
          </div>
        ) : null}
      </Smoothr>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
