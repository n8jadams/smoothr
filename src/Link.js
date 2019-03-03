import React from 'react';
import pathToRegexp from 'path-to-regexp';
import { SmoothRContext } from './SmoothRContext';

function Link(props) {
  return (
    <SmoothRContext.Consumer>
      {context => {
        let {
          href,
          fuzzyCurrent,
          fuzzyVisited,
          onClick,
          ...otherProps
        } = props;
        let isCurrentRoute = context.state.newUrl
          ? href === context.state.newUrl
          : href === context.state.currentUrl;
        if (fuzzyCurrent) {
          // If the current url and the href of this link match the same route, it's a fuzzy current
          isCurrentRoute = context.state.routeConsts.some(route => {
            const r = RegExp(route.pathRegexp);
            if(context.state.newUrl) {
              return r.test(context.state.newUrl) && r.test(href);
            }
            return r.test(context.state.currentUrl) && r.test(href);
          });
        }

        function handleNavigation(e) {
          e.preventDefault();
          if (!props.disabled && !isCurrentRoute) {
            context.handleRouteChange(href, false, true);

            if (onClick) {
              onClick();
            }
          }
        }

        // Determine if this link has been visited
        let visited = false;
        if(fuzzyVisited) {
          visited = context.state.visitedRoutes.some(vp => {
            const pathAsRegexp = pathToRegexp(vp);
            return RegExp(pathAsRegexp).test(href);
          });
        } else {
          visited = context.state.visitedUrls.indexOf(href) !== -1;
        }

        return (
          <a
            href={`${context.state.originPath}${href}`}
            onClick={handleNavigation}
            data-smoothr-current-link={isCurrentRoute}
            data-smoothr-visited-link={visited}
            {...otherProps}
          >
            {props.children}
          </a>
        );
      }}
    </SmoothRContext.Consumer>
  );
}

export { Link };
