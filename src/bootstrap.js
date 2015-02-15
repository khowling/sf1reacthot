/**
 * Created by keith on 13/02/15.
 */
'use strict';
require("6to5/polyfill");

var React = require('react'),
    { TileList } = require('./components/tiles');

/* routes COMMENTED OUT - SF1 issue with page reloads because #URLs
    const Router = require('react-router');
    const { Route, DefaultRoute, RouteHandler, Link } = Router;

    var routes = (
        <Route handler={App} path="/">
            <DefaultRoute handler={TileList}/>
            <Route name="top"  path="" handler={TileList}/>
            <Route name="tiles" path="/tiles/:flt" handler={TileList}/>
            <Route name="report" path="/report/:id" handler={Report}/>
        </Route>
    );
    Router.run(routes, function (Handler) {
        console.log ('call1');
        React.render(<Handler/>, document.getElementById('mount'));
    });
 */
React.render(<TileList />, document.getElementById('mount'));