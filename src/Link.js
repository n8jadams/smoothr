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
          children,
          ...otherProps
        } = props;
        let {
          newUrl,
          currentUrl,
          visitedRoutes,
          visitedUrls,
          originPath
        } = context.state;
        
        let isCurrentRoute = newUrl
          ? href === newUrl
          : href === currentUrl;
        if (fuzzyCurrent) {
          // If the current url and the href of this link match the same route, it's a fuzzy current
          isCurrentRoute = routeConsts.some(route => {
            const r = RegExp(route.pathRegexp);
            if(newUrl) {
              return r.test(newUrl) && r.test(href);
            }
            return r.test(currentUrl) && r.test(href);
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
          visited = visitedRoutes.some(vp => {
            const pathAsRegexp = pathToRegexp(vp);
            return RegExp(pathAsRegexp).test(href);
          });
        } else {
          visited = visitedUrls.indexOf(href) !== -1;
        }

        return (
          <a
            href={`${originPath}${href}`}
            onClick={handleNavigation}
            data-smoothr-current-link={isCurrentRoute}
            data-smoothr-visited-link={visited}
            {...otherProps}
          >
            {children}
          </a>
        );
      }}
    </SmoothRContext.Consumer>
  );
}

export { Link };
