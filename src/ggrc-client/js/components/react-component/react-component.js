import React from 'react';
import ReactDOM from 'react-dom';
import reactToWebComponent from 'react-to-webcomponent';
import PropTypes from 'prop-types';

const SomeLayout = ({name, hobbies, onClick, clickedNumber}) =>
  <>
    <p>{name}</p>
    <ul>
      {hobbies.map((hobby) => <li>{hobby}</li>)}
    </ul>
    <button onClick={onClick}>Clicked {clickedNumber}</button>
  </>;

class Greeting extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clicked: 0,
    };

    this.onClick = () => this.setState({clicked: this.state.clicked + 1});
  }

  render() {
    const {props, state} = this;

    return <SomeLayout
      onClick={this.onClick}
      clickedNumber={state.clicked}
      name={props.name}
      hobbies={['Hobby 1', 'Hobby 2', 'Hobby 3']} />;
  }
}

Greeting.propTypes = {
  name: PropTypes.string.isRequired,
};

const WebGreeting = reactToWebComponent(Greeting, React, ReactDOM);

window.customElements.define('web-greeting', WebGreeting);
