import React from 'react';
import { SmoothRContext } from './SmoothRContext';

function Link(props) {
  return (
    <SmoothRContext.Consumer>
      {context => {
        let { href, fuzzyDisable, onClick, ...otherProps } = props;
        let isCurrentRoute = href === context.state.currentUrl;
        if (fuzzyDisable) {
          // If the current url and the href of this link match the same route, it's a fuzzy disable
          isCurrentRoute = context.state.routeConsts.some(route => {
            const r = RegExp(route.pathRegexp);
            if (r.test(context.state.currentUrl)) {
              return r.test(href);
            }
          });
        }

        function handleNavigation(e) {
          e.preventDefault();
          if (!props.disabled && !isCurrentRoute) {
            const redirectedRoute = context.handleRouteChange(href);
            window.history.pushState(
              {
                url: redirectedRoute,
                pageNavigated: context.state.pageNavigated + 1
              },
              '',
              `${context.state.originPath}${redirectedRoute}`
            );
            if(onClick) {
              onClick();
            }
          }
        }

        return (
          <a 
            href={`${context.state.originPath}${href}`}
            onClick={handleNavigation}
            disabled={props.disabled || isCurrentRoute}
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
