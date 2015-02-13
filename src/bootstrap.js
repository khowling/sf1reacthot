/**
 * Created by keith on 13/02/15.
 */
'use strict';
require("6to5/polyfill");

var React = require('react'),
    { TileList } = require('./components/tiles');

React.render(<TileList />, document.getElementById('mount'));