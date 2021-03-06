import React from 'react';

const animations = {
  'Fade (JS)': {
    in: [
      { opacity: 0 },
      { opacity: 1 }
    ],
    out: [
      { opacity: 1 },
      { opacity: 0 }
    ],
    reverseIn: null,
    reverseOut: null
  },
  'Slide Right (JS)': {
    in: [
      { transform: 'translate3d(100%, 0, 0)' },
      { transform: 'translate3d(0, 0, 0)' }
    ],
    out: [
      { transform: 'translate3d(0, 0, 0)' },
      { transform: 'translate3d(-100%, 0, 0)' }
    ],
    reverseIn: [
      { transform: 'translate3d(-100%, 0, 0)' },
      { transform: 'translate3d(0, 0, 0)' }
    ],
    reverseOut: [
      { transform: 'translate3d(0, 0, 0)' },
      { transform: 'translate3d(100%, 0, 0)' }
    ]
  },
  'Slide Up (CSS)': {
    cssAnimation: true,
    forceDuration: 750,
    forceEasing: 'ease-in-out',
    in: 'slideUpIn',
    out: 'slideUpOut',
    reverseIn: 'slideUpReverseIn',
    reverseOut: 'slideUpReverseOut'
  }
};

const easingOptions = [
  'ease-in-out',
  'ease-in',
  'ease-out',
  'ease',
  'linear',
];

function Options(props) {
  return (
    <div className="options-container">
      <label>
        <span>Show Overlayed Routes: </span>
        <input 
          type="checkbox"
          checked={props.showOverlay}
          onChange={() => {
            if(!props.animating) {
              props.setState({showOverlay: !props.showOverlay})}
            }
          }
          readOnly={props.animating}
        />
      </label>
      <div>
        <label>
          <span>Animation Type: </span>
          <select
            value={props.animation}
            onChange={e => {
              const animation = animations[e.target.value];
              let newState = {
                animation: e.target.value,
                animationIn: animation.in,
                animationOut: animation.out,
                reverseAnimationIn: animation.reverseIn,
                reverseAnimationOut: animation.reverseOut,
                cssAnimation: false
              };
              if(animation.cssAnimation) {
                newState.cssAnimation = true;
                newState.duration = animation.forceDuration;
                newState.easing = animation.forceEasing;
              }
              props.setState(newState);
            }}
            readOnly={props.animating}
          >
            {Object.keys(animations).map((type, i) => (
              <option key={i} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Duration: </span>
          <input
            type="number"
            onChange={e => 
              props.setState({ duration: e.target.value !== '' ? Math.abs(parseInt(e.target.value)) : ''})
            }
            value={props.duration}
            readOnly={props.animating}
            disabled={props.cssAnimation}
          />
        </label>
        <label>
          <span>Easing: </span>
          <select
            value={props.easing}
            onChange={e =>
              props.setState({
                easing: e.target.value
              })
            }
            readOnly={props.animating}
            disabled={props.cssAnimation}
          >
            {easingOptions.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

export { Options };
