import React, { Component } from 'react';
import { SmoothRContext } from './SmoothRContext';

class Smoothr extends Component {
  constructor(props) {
    super(props);

    const originPath = props.originPath || '';
    const currentUrl = 
      window.location.pathname === originPath 
        ? `/${window.location.search}${window.location.hash}` 
        : `${window.location.pathname}${window.location.search}${window.location.hash}`.split(originPath).join('');

    this.state = {
      initialPageload: true,
      originPath,
      currentUrl,
      newUrl: null,
      pageNavigated: 1,
      backNavigation: false,
      routeConsts: [],
      defaultNotFoundPath: true,
      notFoundPath: '/notfound'
    };

    this.routeVars = {};
  }

  setRouteConsts = (routeConsts, notFoundPath) => {
    // Add any routes to the routeConsts that aren't already there
    this.setState(state => {
      let newStateObj = { routeConsts: state.routeConsts };
      routeConsts.forEach(proposedRouteConst => {
        let routeIsSet = state.routeConsts.some(
          setRouteConst => proposedRouteConst.path === setRouteConst.path
        );
        if (!routeIsSet) {
          newStateObj.routeConsts.push(proposedRouteConst);
        }
      });
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
    window.addEventListener('popstate', this.handlePopState);

    setTimeout(() => {
      // Run the initial page load after setting all routeGroupVars
      this.handleRouteChange(this.state.currentUrl);
    }, 0);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopState);
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
          if(this.state.backNavigation) {
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
    const backNavigation = e.state.pageNavigated < this.state.pageNavigated;
    this.handleRouteChange(e.state.url, backNavigation);
  };

  handleRouteChange = (newRouteUrl, backNavigation = false) => {
    // Remove query string and hash from new url
    let cleanNewUrl = newRouteUrl.replace(/\?(.*)|\#(.*)/, '');

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
        incomingRoute = routeObj.path;
        newUrlIsFound = true;
      }
    });
    if (!newUrlIsFound) {
      newRouteUrl = this.state.notFoundPath;
      incomingRoute = this.state.notFoundPath;
    }
    // Handle if the previous url was the 404
    if(this.state.currentUrl === this.state.notFoundPath) {
      outgoingRoute = this.state.notFoundPath;
    }

    // Handle initial pageload without animating
    if (this.state.initialPageload) {
      window.history.replaceState(
        { url: newRouteUrl, pageNavigated: this.state.pageNavigated },
        '',
        `${this.state.originPath}${newRouteUrl}`
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
          outgoingUrl: !newUrlIsFound ? this.state.notFoundPath : this.state.currentUrl,
          incomingUrl: newRouteUrl,
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
          this.setState(
            {
              newUrl: cleanNewUrl,
              pageNavigated: backNavigation
                ? this.state.pageNavigated - 1
                : this.state.pageNavigated + 1,
              backNavigation
            },
            () => {
              setTimeout(() => {
                this.handleAfterTransition(cleanNewUrl);
              }, duration);
            }
          );
        }
      });
    }
    return newRouteUrl;
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
