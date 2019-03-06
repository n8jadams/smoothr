import React, { Component } from 'react';
import { SmoothRContext } from './SmoothRContext';
import { parseCurrentUrl } from './utils/parseCurrentUrl';
import { extractPathVars } from './utils/extractPathVars';
import { getLSArray, pushLSArray } from './utils/lsArray';
import { LS_KEYS } from './consts/LS_KEYS';

class Smoothr extends Component {
  constructor(props) {
    super(props);

    // Use window.location.href to handle hash and set current url
    let originPath = '';
    if (props.originPath && props.originPath !== '/') {
      originPath = props.originPath;
    }
    const currentUrl = parseCurrentUrl({
      fullUrl: window.location.href,
      originPath
    });

    this.state = {
      initialPageload: true,
      originPath,
      currentUrl,
      newUrl: null,
      pageNavigated: 1,
      backNavigation: false,
      routeConsts: [],
      defaultNotFoundPath: true,
      notFoundPath: '/notfound',
      visitedUrls: getLSArray(LS_KEYS.VISITED_URL_LIST),
      visitedRoutes: getLSArray(LS_KEYS.VISITED_ROUTE_LIST)
    };

    this.routeVars = {};
  }

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
      if (state.defaultNotFoundPath) {
        newStateObj.defaultNotFoundPath = false;
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

  componentDidUpdate() {
    // Debounce in order to get refs!
    setTimeout(() => {
      // Handle the route animations for each route group
      Object.keys(this.routeVars).forEach(routeHash => {
        let routeGroup = this.routeVars[routeHash];
        if (this.state.newUrl) {
          let inAnimation = routeGroup.animationIn;
          let outAnimation = routeGroup.animationOut;
          let opts = routeGroup.animationOpts;
          // Determine if we use reverse animations
          if (this.state.backNavigation) {
            inAnimation = routeGroup.reverseAnimationIn || inAnimation;
            outAnimation = routeGroup.reverseAnimationOut || outAnimation;
            opts = routeGroup.reverseAnimationOpts || opts;
          }
          if (typeof inAnimation !== 'string' && routeGroup.newPageRef) {
            routeGroup.newPageRef.animate(inAnimation, opts);
          }
          if (typeof outAnimation !== 'string' && routeGroup.currentPageRef) {
            routeGroup.currentPageRef.animate(outAnimation, opts);
          }
        }
      });
    }, 0);
  }

  handlePopState = e => {
    if (e.state) {
      const backNavigation = e.state.pageNavigated < this.state.pageNavigated;
      this.handleRouteChange(e.state.url, backNavigation);
    }
  };

  handleHashChange = e => {
    const incomingUrl = parseCurrentUrl({
      fullUrl: window.location.href,
      originPath: this.state.originPath
    });
    this.handleRouteChange(incomingUrl);
  };

  handleRouteChange = (
    incomingUrl,
    backNavigation = false,
    linkNavigation = false
  ) => {
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
        // Handle pathMasking
        if (routeObj.pathMask) {
          const keyValObj = extractPathVars(routeObj.path, cleanNewUrl);
          const maskedUrl = routeObj.pathMask(keyValObj);
          if (
            typeof maskedUrl === 'string' &&
            RegExp(routeObj.pathRegexp).test(maskedUrl)
          ) {
            cleanNewUrl = maskedUrl;
            incomingUrl = `${maskedUrl}${queryStringHash}`;
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
        `${this.state.originPath}${incomingUrl}`
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
    this.setState(newStateObj, () => {
      // Handle initial pageload without animating
      if (this.state.initialPageload) {
        window.history.replaceState(
          { url: incomingUrl, pageNavigated: this.state.pageNavigated },
          '',
          `${this.state.originPath}${incomingUrl}`
        );
        this.props.onAnimationStart({
          initialPageload: true
        });
        this.setState({
          initialPageload: false,
          currentUrl: cleanNewUrl
        });
      } else {
        // Configure the animation (or lack thereof)
        let duration = 0;
        new Promise(resolve => {
          duration = this.props.configAnimationSetDuration({
            outgoingUrl,
            incomingUrl,
            outgoingRoute,
            incomingRoute,
            backNavigation
          });
          duration = !newUrlIsFound ? 0 : duration;
          resolve();
        }).then(() => {
          this.props.onAnimationStart({
            initialPageload: false
          });
          if (!duration || duration < 1) {
            this.handleAfterTransition(cleanNewUrl);
          } else {
            // Execute the animation
            let interrupted = false;
            this.setState(
              state => {
                if (state.newUrl) {
                  interrupted = true;
                  return {
                    newUrl: null,
                    currentUrl: cleanNewUrl,
                    pageNavigated: backNavigation
                      ? this.state.pageNavigated - 1
                      : this.state.pageNavigated + 1,
                    backNavigation: false
                  };
                }
                return {
                  newUrl: cleanNewUrl,
                  pageNavigated: backNavigation
                    ? this.state.pageNavigated - 1
                    : this.state.pageNavigated + 1,
                  backNavigation
                };
              },
              () => {
                if (interrupted) {
                  clearTimeout(this.animationTimeout);
                  this.props.onAnimationEnd();
                } else {
                  this.animationTimeout = setTimeout(() => {
                    this.handleAfterTransition(cleanNewUrl);
                  }, duration);
                }
              }
            );
          }
        });
      }
    });
  };

  handleAfterTransition = cleanNewUrl => {
    this.setState(
      {
        currentUrl: cleanNewUrl,
        newUrl: null,
        backNavigation: false
      },
      () => {
        this.props.onAnimationEnd();
      }
    );
  };

  render() {
    return (
      <SmoothRContext.Provider
        value={{
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
