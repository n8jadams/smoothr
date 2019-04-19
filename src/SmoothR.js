import React, { Component } from 'react';
import { SmoothRContext } from './SmoothRContext';
import { extractPathVars } from './utils/extractPathVars';
import { getLSArray, pushLSArray } from './utils/lsArray';
import { LS_KEYS } from './consts/LS_KEYS';

class Smoothr extends Component {
  constructor(props) {
    super(props);

    // Set some class properties
    this.initialPageload = true;
    this.defaultNotFoundPath = true;
    this.originPath = '';
    if (props.originPath && props.originPath !== '/') {
      this.originPath = props.originPath;
    }
    this.routeVars = {};

    // DOM Animation class properties
    this.domInAnimation = {};
    this.domInAnimation.cancel = () => {};
    this.domOutAnimation = {};
    this.domOutAnimation.cancel = () => {};

    this.state = {
      currentUrl: this.deriveCurrentRoute(),
      newUrl: null,
      pageNavigated: 1,
      backNavigation: false,
      routeConsts: [],
      notFoundPath: '/notfound',
      visitedUrls: getLSArray(LS_KEYS.VISITED_URL_LIST),
      visitedRoutes: getLSArray(LS_KEYS.VISITED_ROUTE_LIST)
    };
  }

  deriveCurrentRoute = () => {
    let suffix = window.location.href.split('/');
    suffix = `/${suffix.slice(3, suffix.length).join('/')}`;
    let preppedUrl = suffix.split(this.originPath).join('') || '/';
    if (`${preppedUrl}#` === this.originPath) {
      preppedUrl = '/';
    }
    return preppedUrl;
  };

  setRouteConsts = (routeConsts, notFoundPath) => {
    function merge(a, b, prop) {
      let reduced = a.filter(
        aitem => !b.find(bitem => aitem[prop] === bitem[prop])
      );
      return reduced.concat(b);
    }

    // Add any routes to the routeConsts that aren't already there
    this.setState(state => {
      let newStateObj = { routeConsts: merge(state.routeConsts, routeConsts) };
      if (this.defaultNotFoundPath) {
        this.defaultNotFoundPath = false;
        newStateObj.notFoundPath = notFoundPath;
      }
      return newStateObj;
    });
  };

  setRouteGroupVar = (groupHash, k, v) => {
    if (!this.routeVars[groupHash]) {
      this.routeVars[groupHash] = {};
    }
    this.routeVars[groupHash][k] = v;
  };

  componentDidMount() {
    // Run the initial page load after setting all routeGroupVars
    setTimeout(() => {
      this.handleRouteChange(this.state.currentUrl);
    }, 0);

    window.addEventListener('popstate', this.handlePopState);
    window.addEventListener('hashchange', this.handleHashChange);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopState);
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  handlePopState = e => {
    if (e.state) {
      const backNavigation = e.state.pageNavigated < this.state.pageNavigated;
      this.handleRouteChange(e.state.url, backNavigation);
    }
  };

  handleHashChange = () => {
    const incomingUrl = this.deriveCurrentRoute();
    this.handleRouteChange(incomingUrl);
  };

  resolveRoutes = incomingUrl => {
    // Remove query string and hash from new url
    let cleanNewUrl = incomingUrl.replace(/\?(.*)|\#(.*)/, '');
    let queryStringHash = incomingUrl.split(cleanNewUrl).join('');

    // Handle 404
    let incomingRoute, outgoingRoute;
    let newUrlIsFound = false;
    this.state.routeConsts.forEach(routeObj => {
      // If it matches the current URL
      if (RegExp(routeObj.pathRegexp).test(this.state.currentUrl)) {
        outgoingRoute = routeObj.path;
      }
      // If it matches the new URL
      if (RegExp(routeObj.pathRegexp).test(cleanNewUrl)) {
        // Handle pathResolving
        if (routeObj.pathResolve) {
          const keyValObj = extractPathVars(routeObj.path, cleanNewUrl);
          const resolvedUrl = routeObj.pathResolve(keyValObj);
          if (
            typeof resolvedUrl === 'string' &&
            RegExp(routeObj.pathRegexp).test(resolvedUrl)
          ) {
            cleanNewUrl = resolvedUrl;
            incomingUrl = `${resolvedUrl}${queryStringHash}`;
            incomingRoute = routeObj.path;
            newUrlIsFound = true;
          }
        } else {
          incomingRoute = routeObj.path;
          newUrlIsFound = true;
        }
      }
    });
    if (!newUrlIsFound) {
      incomingUrl = this.state.notFoundPath;
      incomingRoute = this.state.notFoundPath;
    }
    // Handle if the previous url was the 404
    if (this.state.currentUrl === this.state.notFoundPath) {
      outgoingRoute = this.state.notFoundPath;
    }
    const outgoingUrl = !newUrlIsFound
      ? this.state.notFoundPath
      : this.state.currentUrl;

    return {
      incomingRoute,
      incomingUrl,
      outgoingRoute,
      outgoingUrl
    };
  };

  handleRouteChange = (
    newRoute,
    backNavigation = false,
    linkNavigation = false
  ) => {
    let {
      outgoingUrl,
      incomingUrl,
      outgoingRoute,
      incomingRoute
    } = this.resolveRoutes(newRoute);

    // All incoming routes and URLs are set
    let newStateObj = {};
    if (linkNavigation) {
      // Change url in browser
      window.history.pushState(
        {
          url: incomingUrl,
          pageNavigated: this.state.pageNavigated + 1
        },
        '',
        `${this.originPath}${incomingUrl}`
      );
      // Push visited links to state and local storage
      if (this.state.visitedUrls.indexOf(outgoingUrl) === -1) {
        newStateObj.visitedUrls = [...this.state.visitedUrls, outgoingUrl];
        pushLSArray(LS_KEYS.VISITED_URL_LIST, outgoingUrl, true);
      }
      if (this.state.visitedRoutes.indexOf(outgoingRoute) === -1) {
        newStateObj.visitedRoutes = [
          ...this.state.visitedRoutes,
          outgoingRoute
        ];
        pushLSArray(LS_KEYS.VISITED_ROUTE_LIST, outgoingRoute, true);
      }
    }
    // Handle initial pageload without animating
    if (this.initialPageload) {
      this.initialPageload = false;
      window.history.replaceState(
        { url: incomingUrl, pageNavigated: this.state.pageNavigated },
        '',
        `${this.originPath}${incomingUrl}`
      );
      this.setState({
        ...newStateObj,
        currentUrl: incomingUrl,
      });
    } else {
      // Kick off the animation
      new Promise(resolve => {
        if(this.props.beforeAnimation) {
          this.props.beforeAnimation({
            outgoingUrl,
            incomingUrl,
            outgoingRoute,
            incomingRoute,
            backNavigation
          });
        }
        resolve();
      }).then(() => {
        this.props.onAnimationStart({
          initialPageload: false
        });
        // Execute the animation in state
        let interrupted = false;
        this.setState(state => {
          const pageNavigated = backNavigation
            ? state.pageNavigated - 1
            : state.pageNavigated + 1;
          if (state.newUrl) {
            // Interupted animation. End animation.
            interrupted = true;
            clearTimeout(this.animationTimeout);
            this.domInAnimation.cancel();
            this.domOutAnimation.cancel();
            return {
              ...newStateObj,
              newUrl: null,
              currentUrl: incomingUrl,
              pageNavigated,
              backNavigation: false
            };
          }
          // Start animation
          return {
            ...newStateObj,
            newUrl: incomingUrl,
            pageNavigated,
            backNavigation
          };
        }, () => {
          if(interrupted) {
            this.domInAnimation.cancel = () => {};
            this.domOutAnimation.cancel = () => {};
            this.props.onAnimationEnd();
          }
        });
      });
    }
  };

  componentDidUpdate() {
    const endRouteChange = () => {
      this.setState(
        state => {
          if(state.newUrl) {
            return {
              newUrl: null,
              currentUrl: state.newUrl,
              pageNavigated: state.backNavigation
                ? state.pageNavigated - 1
                : state.pageNavigated + 1,
              backNavigation: false
            };
          }
          return null;
        },
        () => {
          this.domInAnimation.cancel = () => {};
          this.domOutAnimation.cancel = () => {};
          this.props.onAnimationEnd();
        }
      );
    };

    // If an animation just started, execute animation in the DOM
    if (this.state.newUrl) {
      // Clear out any timeout that may have been interrupted
      clearTimeout(this.animationTimeout);
      this.domInAnimation.cancel();
      this.domOutAnimation.cancel();

      // Execute the route animations for each route group
      Object.keys(this.routeVars).forEach(routeHash => {
        let routeGroup = this.routeVars[routeHash];

        let inAnimation = routeGroup.animationIn;
        let outAnimation = routeGroup.animationOut;
        let opts = routeGroup.animationOpts;
        let duration = 0;
        if(opts) {
          let tempDur = 0;
          if(typeof opts === 'number') {
            tempDur = opts;
          } else if(typeof opts === 'object' && opts.duration) {
            tempDur = opts.duration;
          }
          duration = Math.max(0, tempDur);
        }
        // Determine if we use reverse animations
        if (this.state.backNavigation) {
          inAnimation = routeGroup.reverseAnimationIn || inAnimation;
          outAnimation = routeGroup.reverseAnimationOut || outAnimation;
          opts = routeGroup.reverseAnimationOpts || opts;
        }
        if (typeof inAnimation !== 'string' && routeGroup.newPageRef) {
          this.domInAnimation = routeGroup.newPageRef.animate(
            inAnimation,
            opts
          );
          this.domInAnimation.onfinish = endRouteChange;
          this.domInAnimation.oncancel = endRouteChange;
          this.domInAnimation.play();
        }
        if (typeof outAnimation !== 'string' && routeGroup.currentPageRef) {
          this.domOutAnimation = routeGroup.currentPageRef.animate(
            outAnimation,
            opts
          );
          this.domOutAnimation.onfinish = endRouteChange;
          this.domOutAnimation.oncancel = endRouteChange;
          this.domOutAnimation.play();
        }
        // If both of the animations are classNames, use a timeout
        if (
          typeof inAnimation === 'string' &&
          typeof outAnimation === 'string'
        ) {
          this.animationTimeout = setTimeout(endRouteChange, duration + 1);
        }
      });
    }
  }

  render() {
    return (
      <SmoothRContext.Provider
        value={{
          originPath: this.originPath,
          state: this.state,
          handleRouteChange: this.handleRouteChange,
          setRouteConsts: this.setRouteConsts,
          setRouteGroupVar: this.setRouteGroupVar
        }}
      >
        {this.props.children}
      </SmoothRContext.Provider>
    );
  }
}

export { Smoothr };
