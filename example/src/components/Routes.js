import React from 'react';
import { SmoothrIcon } from '../components/SmoothrIcon';

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

function Color({ red, green, blue }) {
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
        <div className="smoothie-icon">
          <SmoothrIcon />
        </div>
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
  return <div className="overlay" style={props.style} aria-hidden="true" />;
}

export { Home, Color, Smoothie, NotFound, Overlay };
