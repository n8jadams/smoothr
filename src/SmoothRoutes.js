import React, { Component } from 'react';
import pathToRegexp from 'path-to-regexp';
import { SmoothRContext } from './SmoothRContext';
import { generateHash } from './utils/generateHash';

function assignUserSetProps(attributes, props) {
  Object.keys(attributes).forEach(propName => {
    if (
      [
        'component',
        'path',
        'animationIn',
        'animationOut',
        'animationOpts',
        'children'
      ].indexOf(propName) === -1
    ) {
      Object.assign(props, { [propName]: attributes[propName] });
    }
  });
}

function assignPathProps(pathRegexp, pathKeys, path, props) {
  const r = pathRegexp.exec(path);
  Object.assign(
    props,
    pathKeys.reduce((acc, key, i) => ({ [key.name]: r[i + 1], ...acc }), {})
  );
}

function SmoothRoutes(props) {
  return (
    <SmoothRContext.Consumer>
      {context => <SmoothRoutesRender {...props} context={context} />}
    </SmoothRContext.Consumer>
  );
}

class SmoothRoutesRender extends Component {
  constructor(props) {
    super(props);

    // Generate a route group hash, for group variables
    this.groupHash = generateHash();

    // Set all of the paths for the route group, as well as the 404 path
    let notFoundPath = '/notfound';
    let routeConsts = [];
    this.props.children.forEach(c => {
      if (c.props.notFound && c.props.path.indexOf(':') === -1) {
        notFoundPath = c.props.path;
        return;
      } else if (c.props.notFound) {
        throw 'Smoothr Error: The `path` on the <Route /> with the `notFound` attribute cannot have any URL variables.';
      }
      const path = c.props.path.replace(/\?(.*)|\#(.*)/, '');
      let routeObj = {
        path: path,
        pathRegexp: pathToRegexp(path)
      };
      // Optionally add the pathResolve prop
      if (c.props.path.indexOf(':') !== -1 && c.props.pathResolve) {
        routeObj.pathResolve = c.props.pathResolve;
      }
      routeConsts.push(routeObj);
    });
    this.props.context.setRouteConsts(routeConsts, notFoundPath);
  }

  render() {
    let {
      context,
      animationIn,
      animationOut,
      animationOpts,
      reverseAnimationIn,
      reverseAnimationOut,
      reverseAnimationOpts
    } = this.props;
    let { newUrl, currentUrl } = context.state;

    let NewPageComponent = () => null;
    let CurrentPageComponent = () => null;
    let NotFoundPageComponent = () => null;
    let newPageClass = null;
    let newPageProps = {};
    let newPageKey = null;
    let currentPageClass = null;
    let currentPageProps = {};
    let currentPageFound = false;
    let currentPageKey = null;
    this.props.children.forEach(route => {
      const pathKeys = [];
      const pathAsRegexp = pathToRegexp(
        route.props.path.replace(/\?(.*)|\#(.*)/, ''),
        pathKeys
      );
      // Set the animation, use the <Route> prop, and the <SmoothRoutes> prop if not set.
      const usedAnimationIn = route.props.animationIn || animationIn;
      const usedAnimationOut = route.props.animationOut || animationOut;
      const usedAnimationOpts = route.props.animationOpts || animationOpts;
      const usedReverseAnimationIn =
        route.props.reverseAnimationIn || reverseAnimationIn;
      const usedReverseAnimationOut =
        route.props.reverseAnimationOut || reverseAnimationOut;
      const usedReverseAnimationOpts =
        route.props.reverseAnimationOpts || reverseAnimationOpts;
      
      // For each applicable <Route>, do the following...
      if (newUrl && RegExp(pathAsRegexp).test(newUrl)) {
        assignUserSetProps(route.props, newPageProps);
        assignPathProps(pathAsRegexp, pathKeys, newUrl, newPageProps);
        NewPageComponent = route.props.component;
        newPageKey = `${this.groupHash}-${newUrl}`;
        context.setRouteGroupVar(
          this.groupHash,
          'animationIn',
          usedAnimationIn
        );
        context.setRouteGroupVar(
          this.groupHash,
          'animationOut',
          usedAnimationOut
        );
        context.setRouteGroupVar(
          this.groupHash,
          'animationOpts',
          usedAnimationOpts
        );
        context.setRouteGroupVar(
          this.groupHash,
          'reverseAnimationIn',
          usedReverseAnimationIn
        );
        context.setRouteGroupVar(
          this.groupHash,
          'reverseAnimationOut',
          usedReverseAnimationOut
        );
        context.setRouteGroupVar(
          this.groupHash,
          'reverseAnimationOpts',
          usedReverseAnimationOpts
        );
        if (
          typeof route.props.animationIn === 'string' ||
          typeof this.props.animationIn === 'string'
        ) {
          newPageClass = !context.state.backNavigation
            ? usedAnimationIn
            : usedReverseAnimationIn;
        }
        if (
          typeof route.props.animationOut === 'string' ||
          typeof this.props.animationOut === 'string'
        ) {
          currentPageClass = !context.state.backNavigation
            ? usedAnimationOut
            : usedReverseAnimationOut;
        }
      }
      if (RegExp(pathAsRegexp).test(currentUrl)) {
        assignUserSetProps(route.props, currentPageProps);
        assignPathProps(pathAsRegexp, pathKeys, currentUrl, currentPageProps);
        currentPageFound = true;
        CurrentPageComponent = route.props.component;
        currentPageKey = `${this.groupHash}-${currentUrl}`;
      }
      if (route.props.notFound) {
        NotFoundPageComponent = route.props.component;
      }
    });

    if (!currentPageFound) {
      CurrentPageComponent = NotFoundPageComponent;
    }

    const containerStyles = {
      height: '100%',
      width: '100%',
      position: 'absolute',
      'animation-fill-mode': 'forwards'
    };

    return newUrl ? (
      <div style={containerStyles}>
        <div
          style={containerStyles}
          className={newPageClass}
          ref={el => context.setRouteGroupVar(this.groupHash, 'newPageRef', el)}
        >
          <NewPageComponent {...newPageProps} key={newPageKey} />
        </div>
        <div
          style={containerStyles}
          className={currentPageClass}
          ref={el =>
            context.setRouteGroupVar(this.groupHash, 'currentPageRef', el)
          }
        >
          <CurrentPageComponent {...currentPageProps} key={currentPageKey} />
        </div>
      </div>
    ) : (
      <CurrentPageComponent {...currentPageProps} key={currentPageKey} />
    );
  }
}

export { SmoothRoutes };
