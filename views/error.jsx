const React = require('react');

const Error = ({message, status}) => (
  <>
  <h1>Error</h1>
  <p>{message}</p>
  <p>{status}</p>
  </>
);

module.exports = Error;