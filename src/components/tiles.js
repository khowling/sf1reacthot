const React = require('react/addons');
const csp = require('../lib/csp');
const { go, chan, take, put, ops } = csp;
const t = require('transducers.js');
const { range, seq, compose, map, filter } = t;
const xhr = require('../lib/xhr');

var Report = React.createClass({
    getInitialState: function(){
        console.log ('TileList InitialState : ');
        return { open: false, quickview: []};
    },
    handleCollapse: function (event) {
        console.log ('handleCollapse event');
        //Find the box parent
        var box = $(event.currentTarget).parents(".box").first();
        //Find the body and the footer
        var bf = box.find(".box-body, .box-footer");
        if (!box.hasClass("collapsed-box")) {
            box.addClass("collapsed-box");
            //Convert minus into plus
            $(event.currentTarget).children(".fa-minus").removeClass("fa-minus").addClass("fa-plus");
            bf.slideUp();
        } else {
            box.removeClass("collapsed-box");
            //Convert plus into minus
            $(event.currentTarget).children(".fa-plus").removeClass("fa-plus").addClass("fa-minus");
            bf.slideDown();

            console.log ('handleCollapse event, update state: ');

            // get new data!!!
            var rdata = this.props.data.Report__r;
            console.log ('get Quickview for report : ' + rdata.Id);
            var self = this;
            var qsttr = "select Id, Name, Actual__c, Target__c from QuickView__c where Report__c = '"+rdata.Id+"'",
                xhr_opts = {
                    url: _sfdccreds.sf_host_url + _sfdccreds.sfdc_api_version + '/query.json?q=' + qsttr,
                    headers: {  "Authorization": "OAuth " + _sfdccreds.session_api}
                }

            let ch = xhr(xhr_opts, chan(1, t.map(x => x.json)));
            self.setState({ loading: true });
            csp.takeAsync (ch, function(i) {
                self.setState({open: true, quickview:  i.records});
            });
        }
    },
    componentWillUpdate( nextProps,  nextState) {
        console.log ('Report componentWillUpdate : ');
        //Use this as an opportunity to perform preparation before an update occurs
        // You cannot use this.setState() in this method

    },
    componentDidMount: function(){
        console.log ('Report componentDidMount: ');
    },
    navToReport: function(id) {
        console.log ('navToReport event : ' + id);
        try {
            console.log ('navToReport got sforce');
            sforce.one.navigateToSObject( id);
        }  catch (e) {
            window.location =  '/apex/OVReport?id=' + id;
        }
    },
    render: function() {
        console.log ('Report render : ');
        var rdata = this.props.data.Report__r;

        var divStyleHidden =  this.state.open == false && { display: 'none' } || {};
        var cx = React.addons.classSet,
            boxclass = cx({
                "box": true,
                "collapsed-box": this.state.open == false,
                "box-success": rdata.Actual__c >= rdata.Target__c,
                "box-warning": rdata.Actual__c < rdata.Target__c}),
            buttongoodbad = cx({
                "btn-kh btn-sm ": true,
                "btn-success": rdata.Actual__c >= rdata.Target__c,
                "btn-warning": rdata.Actual__c < rdata.Target__c}),
            styleupdown = cx({
                "fa": true,
                "fa-arrow-up text-green": rdata.Actual__c >= rdata.Target__c,
                "fa-arrow-down text-red": rdata.Actual__c < rdata.Target__c});

        var chatp = {width: "55%"};

        return (
            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">

                <div className={boxclass}>
                    <div className="box-header" data-toggle="tooltip" title="" data-original-title="Header tooltip">
                        <h3 className="box-title">{rdata.Name}<br/>
                            <small>Actual: <code>{rdata.Actual__c}</code></small>
                            <small>Target: <code>{rdata.Target__c}</code></small>
                            <i className={styleupdown}></i></h3>

                        <div className="box-tools pull-right">
                            <button onClick={this.handleCollapse} className={buttongoodbad} data-widget="collapse"><i className="fa fa-plus"></i></button>
                        </div>
                    </div>
                    <div className="box-body" style={divStyleHidden}>
                        <p>{rdata.Summary__c}
                        </p><br/>
                        <div className="box-body no-padding">
                            <table className="table table-striped">
                                <tbody>
                                    <tr>
                                        <th className="wdth-l">QuickView</th>
                                        <th className="wdth-m">Progress</th>
                                        <th className="wdth-s">%</th>
                                    </tr>
                                    {this.state.quickview.map(function(row, i) { return (
                                    <tr>
                                        <td>{row.Name}</td>
                                        <td>
                                            <div className="progress xs">
                                                <div className={React.addons.classSet({"progress-bar": true, "progress-bar-danger": row.Actual__c < row.Target__c, "progress-bar-success":row.Actual__c >= row.Target__c})} style={{width: (row.Actual__c/row.Target__c*100).toFixed(2)+"%"}}></div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-red">{(row.Actual__c/row.Target__c*100).toFixed(2)} %</span></td>
                                    </tr>
                                    );})}
                                </tbody></table>
                        </div><br/>
                    </div>
                    <div className="box-footer" style={divStyleHidden}>

                        <a className="btn-kh  btn-block btn-success" onClick={this.navToReport.bind(this, rdata.Id)}>
                            <i className="fa fa-play"></i> Open
                        </a>
                    </div>
                </div>
            </div>
        );
    }
});



var Tile = React.createClass({

    // This component doesn't hold any state - it simply transforms
    // whatever was passed as attributes into HTML that represents a picture.
    setFilter: function(id){

        // When the component is clicked, trigger the onClick handler that
        // was passed as an attribute when it was constructed:
        this.props.onTileClick(id);
    },

    render: function(){
        var tdata = this.props.data,
            boxclass = "small-box " + tdata.Tile_Colour__c,
            iclass = "ion " + tdata.Tile_Icon__c;

        return (
            <div className="col-xs-12 col-sm-4 col-md-3 col-lg-2">
                <a href="#" onClick={this.setFilter.bind(this, tdata.Id)} className={boxclass}>
                    <div className="inner">
                        <h3>{tdata.tcnt}</h3>
                        <p>{tdata.Name}</p>
                    </div>
                    <div className="icon">
                        <i className={iclass}></i>
                    </div>
                    <div  className="small-box-footer">
                        Search {tdata.Name} <i className="fa fa-arrow-circle-right"></i>
                    </div>
                </a>
            </div>
        );
    }
});

var TileList= React.createClass({
    displayName: 'TileList',
    //mixins: [ State ],
    getInitialState: function(){
        console.log ('TileList InitialState : ');
        return { breadcrumbs: [], tiles: [], loading: false, filter: null };
    },
    componentWillReceiveProps: function () {
        let cbc = this.state.breadcrumbs,
            cflt = this.getParams().flt;
        console.log ('TileList componentWillReceiveProps : ' + cflt);
         if  (cflt == null) {
            this.setState({breadcrumbs: []});
         } else {
             var foundit = false,
                 inhistory = seq(cbc, filter(function(x) {
                 if (foundit == false && x.id == cflt) {
                     foundit = true; return foundit;
                 } else return !foundit}));
             if (foundit) {
                 this.setState({breadcrumbs:inhistory});
                 }
             else {
                 let newname = seq(this.state.tiles,
                     compose(
                         filter(x => x.Id == cflt),
                         map(x => x.Name)
                     ))[0]
                 this.setState({breadcrumbs: this.state.breadcrumbs.concat({id: cflt, name: newname})});
             }
         }
    },
    // The statics object allows you to define static methods that can be called on the component class
    componentDidMount: function(){
        console.log ('TileList componentDidMount : ');
        var self = this;
        var qsttr = "select Id, Name, Tile_Colour__c, Tile_Icon__c, parent__c, (select name, id, report__r.Id, report__r.Name, report__r.summary__c, report__r.actual__c, report__r.target__c, report__r.difference__c, report__r.Source__c, report__r.Status__c from Associated_Reports__r where report__r.Status__c = 'Published' ) from Tiles__c where Status__c = 'Published' order by Order__c asc",
            xhr_opts = {
            url: _sfdccreds.sf_host_url + _sfdccreds.sfdc_api_version + '/query.json?q=' + qsttr,
            headers: {  "Authorization": "OAuth " + _sfdccreds.session_api}
        }

        let ch = xhr(xhr_opts, chan(1, t.map(x => x.json)));
        self.setState({ loading: true });
        csp.takeAsync (ch, function(i) {
            // report count
            var tcounts = {}, tcounts2 = {},tcounts3 = {}, tcounts4 = {};
            for (var tidx in i.records) {
                var tile = i.records[tidx];
                tile.tcnt = tile.Associated_Reports__r && tile.Associated_Reports__r.totalSize || 0
                if (tile.tcnt >0 && tile.Parent__c) {
                    if (tcounts[tile.Parent__c])
                        tcounts[tile.Parent__c] = tile.tcnt + tcounts[tile.Parent__c];
                    else
                        tcounts[tile.Parent__c] = tile.tcnt;
                }
            }
            for (var tidx in i.records) {
                var tile = i.records[tidx];
                if (tcounts[tile.Id] > 0 ) {
                    tile.tcnt = tcounts[tile.Id] + (tile.tcnt || 0);

                    if (tcounts2[tile.Parent__c]>0)
                        tcounts2[tile.Parent__c] = tile.tcnt + tcounts2[tile.Parent__c];
                    else
                        tcounts2[tile.Parent__c] = tile.tcnt;
                }
            }
            for (var tidx in i.records) {
                var tile = i.records[tidx];
                if (tcounts2[tile.Id] > 0 ) {
                    tile.tcnt = tcounts2[tile.Id]  + (tile.tcnt || 0);

                    if (tcounts3[tile.Parent__c]>0)
                        tcounts3[tile.Parent__c] = tile.tcnt + tcounts3[tile.Parent__c];
                    else
                        tcounts3[tile.Parent__c] = tile.tcnt;
                }
            }
            for (var tidx in i.records) {
                var tile = i.records[tidx];
                if (tcounts3[tile.Id] > 0 ) {
                    tile.tcnt = tcounts3[tile.Id]  + (tile.tcnt || 0);

                    if (tcounts4[tile.Parent__c]>0)
                        tcounts4[tile.Parent__c] = tile.tcnt + tcounts4[tile.Parent__c];
                    else
                        tcounts4[tile.Parent__c] = tile.tcnt;
                }
            }
            for (var tidx in i.records) {
                var tile = i.records[tidx];
                if (tcounts4[tile.Id] > 0) {
                    tile.tcnt = tcounts4[tile.Id]  + (tile.tcnt || 0);
                }
            }
            self.setState({  loading: false, tiles: i.records});
        });
    },
    handleNavClick: function (cflt) {
        let cbc = this.state.breadcrumbs,
            new_state = {filter: cflt};

        console.log ('TileList history ['+ cbc +'] handleNavClick : ' + cflt);
        if  (cflt == null) {
            new_state.breadcrumbs = [];
        } else {
            var foundit = false,
                inhistory = seq(cbc, filter(function(x) {
                    if (foundit == false && x.id == cflt) {
                        foundit = true; return foundit;
                    } else return !foundit}));
            if (foundit) {
                new_state.breadcrumbs = inhistory;
            }
            else {
                let newname = seq(this.state.tiles,
                    compose(
                        filter(x => x.Id == cflt),
                        map(x => x.Name)
                    ))[0]
                new_state.breadcrumbs = this.state.breadcrumbs.concat({id: cflt, name: newname});
            }
        }
        console.log ('TileList handleNavClick, setState : ' + new_state);
        this.setState(new_state);
    },
    render: function () {
        var self = this;
        let cflt = this.state.filter; // this.getParams().flt;
        console.log ('TileList render : ' + cflt);
        let tiles = seq(this.state.tiles,
            filter(x =>  x.Parent__c == cflt ));
        let tilereports = seq(this.state.tiles,
            compose(
                filter(x => x.Id == cflt ),
                map (x => x.Associated_Reports__r)
            ))[0],
            reporta = tilereports && tilereports.records || [];


        var optionalElement;
        if (this.state.loading) {
            optionalElement = (<div> loading </div>);
        }
        var padding0 =  { padding: '0px' };
        return (
            <section className="content">
                <div className="page-header">
                    <ol className="breadcrumb" style={padding0}>
                        <li><a href="#" onClick={this.handleNavClick.bind(this, null)}><i className="fa fa-dashboard"></i> Home</a></li>
                        {this.state.breadcrumbs.map(function(rt, i) { return (
                            <li className="active"><a href="#" onClick={self.handleNavClick.bind(self, rt.id)}>{rt.name}</a></li>
                        );})}
                    </ol>
                </div>

                <div className="row">
                    {optionalElement}
                    {tiles.map(function(row, i) { return (
                        <Tile data={row} onTileClick={self.handleNavClick}/>
                    );})}
                    {reporta.map(function(row, i) { return (
                        <Report data={row} />
                    );})}
                </div>
            </section>
        )
    }
});




module.exports = { TileList, Tile, Report};