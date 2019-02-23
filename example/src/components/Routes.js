import React from 'react';

function Home() {
  return (
    <section>
      <div>
        <span role="img" aria-label="Home">
          🏠
        </span>
      </div>
    </section>
  );
}

function Color(props) {
  let { red, green, blue } = props;
  red = Math.min(red, 255);
  green = Math.min(green, 255);
  blue = Math.min(blue, 255);
  return (
    <section>
      <div style={{ backgroundColor: `rgb(${red}, ${green}, ${blue})` }}>
        <span role="img" aria-label="Color">
          🌈
        </span>
      </div>
    </section>
  );
}

function Smoothie() {
  return (
    <section>
      <div>
        <span role="img" aria-label="Smoothie">
          🥤
        </span>
      </div>
    </section>
  );
}

function NotFound() {
  return (
    <section>
      <div>
        <span role="img" aria-label="NotFound">
          ❓
        </span>
      </div>
    </section>
  );
}

function Overlay(props) {
  return (
    <div className="overlay" style={props.style} aria-hidden="true" />
  );
}

export { Home, Color, Smoothie, NotFound, Overlay };
