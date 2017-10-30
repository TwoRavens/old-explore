//////////
// Globals

// hostname default - the app will use it to obtain the variable metadata
// (ddi) and pre-processed data info if the file id is supplied as an
// argument (for ex., gui.html?dfId=17), but hostname isn't.
// Edit it to suit your installation.
// (NOTE that if the file id isn't supplied, the app will default to the
// local files specified below!)
// NEW: it is also possible now to supply complete urls for the ddi and
// the tab-delimited data file; the parameters are ddiurl and dataurl.
// These new parameters are optional. If they are not supplied, the app
// will go the old route - will try to cook standard dataverse urls
// for both the data and metadata, if the file id is supplied; or the
// local files if nothing is supplied.
// -- L.A.


// Kripanshu testing.
// index.js

var production = false;
var private = false;

if (production && fileid == "") {
    alert("Error: No fileid has been provided.");
    throw new Error("Error: No fileid has been provided.");
}

var dataverseurl = "";

if (hostname) {
    dataverseurl = "https://" + hostname;
} else {
    if (production) {
        dataverseurl = "%PRODUCTION_DATAVERSE_URL%";
    } else {
        dataverseurl = "http://localhost:8080";
    }
}

if (fileid && !dataurl) {
    // file id supplied; we are going to assume that we are dealing with
    // a dataverse and cook a standard dataverse data access url,
    // with the fileid supplied and the hostname we have
    // either supplied or configured:
    dataurl = dataverseurl + "/api/access/datafile/" + fileid;
    dataurl = dataurl + "?key=" + apikey;
    // (it is also possible to supply dataurl to the script directly,
    // as an argument -- L.A.)
}

if (!production) {
    // base URL for the R apps:
    var rappURL = "http://0.0.0.0:8000/custom/";
} else {
    var rappURL = "https://beta.dataverse.org/custom/"; //this will change when/if the production host changes
}

// space index
var myspace = 0;
var svg = d3.select("#main.left div.carousel-inner").attr('id', 'innercarousel')
    .append('div').attr('class', 'item active').attr('id', 'm0').append('svg').attr('id', 'whitespace');

var logArray = [];


//.attr('width', width)
//.attr('height', height);
var tempWidth = d3.select("#main.left").style("width")
var width = tempWidth.substring(0, (tempWidth.length - 2));

/*var tempHeight = d3.select("#main.left").style("height")
 var height = tempHeight.substring(0,(tempHeight.length-2));*/

var height = $(window).height() - 120;  // Hard coding for header and footer and bottom margin.


var forcetoggle = ["true"];
var estimated = false;
var estimateLadda = Ladda.create(document.getElementById("btnEstimate"));
var selectLadda = Ladda.create(document.getElementById("btnSelect"));
var rightClickLast = false;


// this is the initial color scale that is used to establish the initial colors of the nodes.  allNodes.push() below establishes a field for the master node array allNodes called "nodeCol" and assigns a color from this scale to that field.  everything there after should refer to the nodeCol and not the color scale, this enables us to update colors and pass the variable type to R based on its coloring
var colors = d3.scale.category20();

var colorTime = false;
var timeColor = '#2d6ca2';

var colorCS = false;
var csColor = '#419641';

var depVar = false;
var dvColor = '#28a4c9';

var nomColor = '#ff6600';

var subsetdiv = false;
var setxdiv = false;


var varColor = '#f0f8ff';   //d3.rgb("aliceblue");
var selVarColor = '#fa8072';    //d3.rgb("salmon");
var taggedColor = '#f5f5f5';    //d3.rgb("whitesmoke");
var d3Color = '#1f77b4';  // d3's default blue
var grayColor = '#c0c0c0';

var lefttab = "tab1"; //global for current tab in left panel
var righttab = "btnUnivariate"; // global for current tab in right panel

var zparams = {
    zdata: [],
    zedges: [],
    ztime: [],
    znom: [],
    zcross: [],
    zmodel: "",
    zvars: [],
    zdv: [],
    zdataurl: "",
    zsubset: [],
    zsetx: [],
    zmodelcount: 0,
    zplot: [],
    zsessionid: "",
    zdatacite: "",
    zmetadataurl: "",
    zusername: "",
    zcrosstab:[]
};
//var myjson;
var json_data_explore = "empty";
// Radius of circle
var allR = 40;

//Width and height for histgrams
var barwidth = 1.3 * allR;
var barheight = 0.5 * allR;
var barPadding = 0.35;
var barnumber = 7;


var arc0 = d3.svg.arc()
    .innerRadius(allR + 5)
    .outerRadius(allR + 20)
    .startAngle(0)
    .endAngle(3.2);

var arc1 = d3.svg.arc()
    .innerRadius(allR + 5)
    .outerRadius(allR + 20)
    .startAngle(0)
    .endAngle(1);

var arc2 = d3.svg.arc()
    .innerRadius(allR + 5)
    .outerRadius(allR + 20)
    .startAngle(1.1)
    .endAngle(2.2);

var arc3 = d3.svg.arc()
    .innerRadius(allR + 5)
    .outerRadius(allR + 20)
    .startAngle(2.3)
    .endAngle(3.3);

var arc4 = d3.svg.arc()
    .innerRadius(allR + 5)
    .outerRadius(allR + 20)
    .startAngle(4.3)
    .endAngle(5.3);

// to draw circle on the ends of the link:path
var circledata = [
    {id: 0, name: 'circle', path: 'M 0, 0  m -5, 0  a 5,5 0 1,0 10,0  a 5,5 0 1,0 -10,0', viewbox: '-6 -6 12 12'}
]
// From .csv
var dataset2 = [];
var valueKey = [];
var lablArray = [];
var hold = [];
var allNodes = [];
var newallNodes = [];
var allResults = [];
var subsetNodes = [];
var links = [];
var nodes = [];
var transformVar = "";
var summaryHold = false;
var selInteract = false;
var modelCount = 0;
var callHistory = []; // unique to the space. saves transform and subset calls.
var citetoggle = false;
var connect_nodes = [];

// transformation toolbar options
var transformList = ["log(d)", "exp(d)", "d^2", "sqrt(d)", "interact(d,e)"];

// arry of objects containing allNode, zparams, transform vars
var spaces = [];
var trans = []; //var list for each space contain variables in original data plus trans in that space

// end of (most) global declarations (minus functions)


// collapsable user log
$('#collapseLog').on('shown.bs.collapse', function () {
    d3.select("#collapseLog div.panel-body").selectAll("p")
        .data(logArray)
        .enter()
        .append("p")
        .text(function (d) {
            return d;
        });
    //$("#logicon").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
});

$('#collapseLog').on('hidden.bs.collapse', function () {
    d3.select("#collapseLog div.panel-body").selectAll("p")
        .remove();
    //$("#logicon").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
});


// text for the about box
// note that .textContent is the new way to write text to a div
$('#about div.panel-body').text('TwoRavens v0.1 "Dallas" --  The Norse god Odin had two talking ravens as advisors, who would fly out into the world and report back all they observed.  In the Norse, their names were "Thought" and "Memory".  In our coming release, our thought-raven automatically advises on statistical model selection, while our memory-raven accumulates previous statistical univariate from Dataverse, to provide cummulative guidance and meta-analysis.'); //This is the first public release of a new, interactive Web application to explore data, view descriptive statistics, and estimate statistical models.";


//
// read DDI metadata with d3:
var metadataurl = "";
if (ddiurl) {
    // a complete ddiurl is supplied:
    metadataurl = ddiurl;
} else if (fileid) {
    // file id supplied; we're going to cook a standard dataverse
    // metadata url, with the file id provided and the hostname
    // supplied or configured:
    metadataurl = dataverseurl + "/api/meta/datafile/" + fileid;
} else {
    // neither a full ddi url, nor file id supplied; use one of the sample DDIs that come with
    // the app, in the data directory:
    // metadataurl="data/qog137.xml"; // quality of government
    metadataurl = "~/TwoRavens/data/fearonLaitin.xml"; // This is Fearon Laitin
    //metadataurl="data/PUMS5small-ddi.xml"; // This is California PUMS subset
    //metadataurl="data/BP.formatted-ddi.xml";
    //metadataurl="data/FL_insurance_sample-ddi.xml";
    //metadataurl="data/strezhnev_voeten_2013.xml";   // This is Strezhnev Voeten
    //metadataurl="data/19.xml"; // Fearon from DVN Demo
    //metadataurl="data/76.xml"; // Collier from DVN Demo
    //metadataurl="data/79.xml"; // two vars from DVN Demo
    //metadataurl="data/000.xml"; // one var in metadata
    //metadataurl="data/0000.xml"; // zero vars in metadata
}

// Reading the pre-processed metadata:
// Pre-processed data:
var pURL = "";
if (dataurl) {
    // data url is supplied
    pURL = dataurl + "&format=prep";
} else {
    // no dataurl/file id supplied; use one of the sample data files distributed with the
    // app in the "data" directory:
    //pURL = "data/preprocess2429360.txt";   // This is the Strezhnev Voeten JSON data
     pURL = "data/fearonLaitin.json";     // This is the Fearon Laitin JSON data
    //pURL = "data/fearonLaitinNewPreprocess3long.json";     // This is the revised (May 29, 2015) Fearon Laitin JSON data
   
   /*
     purltest = "users/" + username + "/fearonLaitinDatapreprocess.json"
    //This is testing whether a newer json file exists or not. if yes, we will use that file, else use the default file
    var test = UrlExists(purltest);
    if (test == true) {
        pURL = purltest;
         console.log("test is true");
    }
    else
        console.log("loading fearonLaitin.json");
    pURL = "data/fearonLaitin.json";
    */

    // console.log("yo value of test",test);
    /*$.ajax({
     url:purltest,
     type:'HEAD',
     error: function()
     {
     console.log("error");
     pURL = "data/fearonLaitinPreprocess4.json";
     //file not exists
     },
     success: function()
     {
     console.log("success");
     pURL = purltest;
     //file exists
     }
     });*/



    function UrlExists(url) {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, false);
        http.send();
        return http.status != 404;
    }

    //pURL = "data/fearonLaitinPreprocess4.json";

    //console.log(purltest);
    // console.log(pURL);
    //pURL = "data/preprocessPUMS5small.json";   // This is California PUMS subset
    //pURL = "data/FL_insurance_sample.tab.json";

    // pURL = "data/qog_pp.json";   // This is Qual of Gov
}

var preprocess = {};
var mods = new Object;
console.log("Value of username: ", username);

//This function finds whether a key is present in the json file, and sends the key's value if present.
function findValue(json, key) {
    if (key in json) return json[key];
    else {
        var otherValue;
        for (var otherKey in json) {
            if (json[otherKey] && json[otherKey].constructor === Object) {
                otherValue = findValue(json[otherKey], key);
                if (otherValue !== undefined) return otherValue;
            }
        }
    }
}

//KRIPANSHU BHARGAVA : disconnect all the nodes
function disconnectAll() {
    console.log("DisConnect function called");


    /*
     // removing the existing paths
     d3.selectAll('path').style('marker-start', 0)
     .style('marker-end', 0)
     .style('stroke-width',0);
     links=[];//to empty the links
     */

//setting all the links to invisible
    path = path.data(links);

    // update existing links
    // VJD: dashed links between pebbles are "selected". this is disabled for now
    path.classed('selected', function (d) {
        return;
    })//return d === selected_link; })
        .style('marker-start', 0)
        .style('marker-end', 0)
        .style('stroke-width', 0);


    // add new links
    path.enter().append('svg:path')
        .attr('class', 'link')
        .style('stroke-width', 0)
        .classed('selected', function (d) {
            return;
        })//return d === selected_link; })
        .style('marker-start', 0)
        .style('marker-end', 0)
        .on('mousedown', function (d) { // do we ever need to select a link? make it delete..
            var obj1 = JSON.stringify(d);
            for (var j = 0; j < links.length; j++) {
                if (obj1 === JSON.stringify(links[j])) {
                    links.splice(j, 1);
                }
            }
        })

        .on('mouseover', function (d) {
            //     if(!mousedown_node || d === mousedown_node) return;
            d3.select(this)
                .style('stroke', 'red')
                .style("cursor", "not-allowed")
                // Un-sets the "explicit" fill (might need to be null instead of '')
                .classed("active", true);

            /*  div.transition()
             .duration(200)
             .style("opacity", .9);
             div	.html("<span style='background-color: #d9534f ; padding:2px ; font-style: oblique' >Delete this link</span>")
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 28) + "px");
             //d3.select('#start-circle').style('fill','red');
             */


            // console.log("color is red")


        })

        .on('mouseout', function (d) {
            //    if(!mousedown_node || d === mousedown_node) return;
            // unenlarge target node
            //tooltip.style("visibility", "hidden");
            //    d3.select(this).attr('transform', '');
            d3.select(this)
                .style('stroke', '#000')
                .style("cursor", "pointer")
                // Un-sets the "explicit" fill (might need to be null instead of '')
                .classed("active", false);
            //  div.transition()
            //    .duration(500)
            //  .style("opacity", 0);
            // console.log("color was red")


        });
    //removing all the links
    links = [];


}

//KRIPANSHU BHARGAVA : connect all the nodes
function connectAll() {
    console.log("Connect All function called");

    var connect_nodes = nodes.slice();
    for (var i = 0; i < connect_nodes.length; i++) {
        console.log("All connect nodes: " + connect_nodes[i].name);
    }


    var string_check = [];

//function to check the duplicate node
    function nodesCheck(value1, value2) {
        var pair1 = value1 + value2;
        var pair2 = value2 + value1;
        var count = 0;
       // console.log("pair1 : " + pair1);
       // console.log("pair2 : " + pair2);
        for (var k = 0; k < string_check.length; k++) {
            if (string_check[k] == pair1) {
                count++;
            }
            if (string_check[k] == pair2) {
                count++;
            }
        }
        if (count == 2) {
            return false;
        }
        else {
            return true;
        }
    }

    links = [];

    // loops to add the all possible nodes to the links array
    for (var i = 0; i < nodes.length; i++) {
        for (var j = nodes.length - 1; j > 0; j--) {
            string_check.push(i.toString() + j.toString());

            var val1 = i.toString();
            var val2 = j.toString();

            if (nodesCheck(val1, val2) && i != j) {
                // console.log("PAssed value : " + i.toString() + j.toString());
                links.push({source: nodes[i], target: nodes[j], left: false, right: true});
            }


        }
    }
    path = path.data(links);

    // update existing links
    // VJD: dashed links between pebbles are "selected". this is disabled for now
    path.classed('selected', function (d) {
        return;
    })//return d === selected_link; })
        .style('marker-start', function (d) {
            return d ? 'url(#start-circle)' : '';
        })
        .style('marker-end', function (d) {
            return d ? 'url(#end-circle)' : '';
        })
        .style('stroke-width', 2.5);


    // add new links
    path.enter().append('svg:path')
        .attr('class', 'link')
        .style('stroke-width', 2.5)
        .classed('selected', function (d) {
            return;
        })//return d === selected_link; })
        .style('marker-start', function (d) {
            return d ? 'url(#start-circle)' : '';
        })
        .style('marker-end', function (d) {
            return d ? 'url(#end-circle)' : '';
        })
        .on('mousedown', function (d) { // do we ever need to select a link? make it delete..
            var obj1 = JSON.stringify(d);
            for (var j = 0; j < links.length; j++) {
                if (obj1 === JSON.stringify(links[j])) {
                    links.splice(j, 1);
                }
            }
        })

        .on('mouseover', function (d) {
            //     if(!mousedown_node || d === mousedown_node) return;
            d3.select(this)
                .style('stroke', 'red')
                .style("cursor", "not-allowed")
                // Un-sets the "explicit" fill (might need to be null instead of '')
                .classed("active", true);

            /*  div.transition()
             .duration(200)
             .style("opacity", .9);
             div	.html("<span style='background-color: #d9534f ; padding:2px ; font-style: oblique' >Delete this link</span>")
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 28) + "px");
             //d3.select('#start-circle').style('fill','red');
             */


            // console.log("color is red")


        })

        .on('mouseout', function (d) {
            //    if(!mousedown_node || d === mousedown_node) return;
            // unenlarge target node
            //tooltip.style("visibility", "hidden");
            //    d3.select(this).attr('transform', '');
            d3.select(this)
                .style('stroke', '#000')
                .style("cursor", "pointer")
                // Un-sets the "explicit" fill (might need to be null instead of '')
                .classed("active", false);
            //  div.transition()
            //    .duration(500)
            //  .style("opacity", 0);
            // console.log("color was red")


        });


}

// this is the function and callback routine that loads all external data: metadata (DVN's ddi), preprocessed (for plotting distributions), and zeligmodels (produced by Zelig) and initiates the data download to the server
//+++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++
readPreprocess(url = pURL, p = preprocess, v = null, callback = function () {
    //console.log(UrlExists(metadataurl));


    //if(UrlExists(metadataurl)){
    //d3.xml(metadataurl, "application/xml", function(xml) {

    //				  d3.json(url, function(error, json) {
    d3.json(url, function (json) {


        var jsondata = json;
        // console.log(jsondata);
        //console.log("Findvalue: ",findValue(jsondata,"fileName"));
        //  var vars = xml.documentElement.getElementsByTagName("var");
        var vars = jsondata.variables;
        //console.log("value of vars");
        //        console.log(vars);
        // var temp = xml.documentElement.getElementsByTagName("fileName");
        var temp = findValue(jsondata, "fileName");
        //      console.log("value of temp");
        //    console.log(temp);
        //
        zparams.zdata = temp;//[0].childNodes[0].nodeValue;
        //  console.log("value of zdata: ",zparams.zdata);
        // function to clean the citation so that the POST is valid json
        function cleanstring(s) {
            s = s.replace(/\&/g, "and");
            s = s.replace(/\;/g, ",");
            s = s.replace(/\%/g, "-");
            return s;
        }

        // var cite = xml.documentElement.getElementsByTagName("biblCit");
      //  var cite = findValue(jsondata, "biblCit");
       // zparams.zdatacite = cite;//[0].childNodes[0].nodeValue;
        // console.log("value of zdatacite: ",zparams.zdatacite);
        if (zparams.zdatacite !== undefined) {
            zparams.zdatacite = cleanstring(zparams.zdatacite);
        }
        //console.log("value of zdatacite: ",zparams.zdatacite);
        //

        // dataset name trimmed to 12 chars
        var dataname = zparams.zdata.replace(/\.(.*)/, "");  // regular expression to drop any file extension
        // Put dataset name, from meta-data, into top panel
        d3.select("#dataName")
            .html(dataname);

      //  $('#cite div.panel-body').text(zparams.zdatacite);

        // Put dataset name, from meta-data, into page title
        d3.select("title").html("TwoRavens " + dataname)
        //d3.select("#title").html("blah");

        // temporary values for hold that correspond to histogram bins
        hold = [.6, .2, .9, .8, .1, .3, .4];
        var myvalues = [0, 0, 0, 0, 0];
        //console.log("length: ",vars.length);
        // console.log(vars);

        //var tmp=vars.ccode;
        //console.log("tmp= ",tmp);
        var i = 0;
        for (var key in vars) {
            //	console.log(vars[key]);
            //p[key] = jsondata["variables"][key];
            valueKey[i] = key;

            if (vars[key].labl.length === 0) {
                lablArray[i] = "no label";
            }
            else {
                lablArray[i] = vars[key].labl;
            }


            i++;

        }
        //console.log("test=",ccode.labl.);
        //console.log("lablArray=",lablArray);


        for (i = 0; i < valueKey.length; i++) {


            //valueKey[i] = vars[i].attributes.name.nodeValue;

            //if(vars[i].getElementsByTagName("labl").length === 0) {lablArray[i]="no label";}
            //else {lablArray[i] = vars[i].getElementsByTagName("labl")[0].childNodes[0].nodeValue;}

            var datasetcount = d3.layout.histogram()
                .bins(barnumber).frequency(false)
                (myvalues);

            // this creates an object to be pushed to allNodes. this contains all the preprocessed data we have for the variable, as well as UI data pertinent to that variable, such as setx values (if the user has selected them) and pebble coordinates
            var obj1 = {
                id: i,
                reflexive: false,
                "name": valueKey[i],
                "labl": lablArray[i],
                data: [5, 15, 20, 0, 5, 15, 20],
                count: hold,
                "nodeCol": colors(i),
                "baseCol": colors(i),
                "strokeColor": selVarColor,
                "strokeWidth": "1",
                "subsetplot": false,
                "subsetrange": ["", ""],
                "setxplot": false,
                "setxvals": ["", ""],
                "grayout": false
            };

            jQuery.extend(true, obj1, preprocess[valueKey[i]]);
            allNodesColors(obj1);

            // console.log(vars[i].childNodes[4].attributes.type.ownerElement.firstChild.data);
            allNodes.push(obj1);

        }
        ;

          console.log("allNodes: ", allNodes);
        // Reading the zelig models and populating the model list in the right panel.
        d3.json("data/explore.json", function (error, json) {
            if (error) return console.warn(error);
            var jsondata = json;

            console.log("explore DATA json: ", jsondata);
            for (var key in jsondata.explore) {
                if (jsondata.explore.hasOwnProperty(key)) {
                    mods[jsondata.explore[key].name[0]] = jsondata.explore[key].description[0];
                }
            }

            d3.json("data/zelig5choicemodels.json", function (error, json) {
                if (error) return console.warn(error);
                var jsondata = json;
                //console.log("zelig choice models json: ", jsondata);
                for (var key in jsondata.zelig5choicemodels) {
                    if (jsondata.zelig5choicemodels.hasOwnProperty(key)) {
                        mods[jsondata.zelig5choicemodels[key].name[0]] = jsondata.zelig5choicemodels[key].description[0];
                    }
                }

                scaffolding(callback = layout);
                dataDownload();
            });
        });
    });

});

//Kripanshu Bhargava  plot for cross tab

function crossTabPlots(PlotNameA, PlotNameB,json_obj) {
    var mydiv = "#plotA";
    var mydiv1 = "#plotB";
    var mydiv2 = "#SelectionData";
    var count_c=0;
    var count_b=0;
    var plotA_size,plotB_size,plotA_sizem,plotB_sizem;
    //d3.select("#resultsView_tabular").html("");
console.log("break json object:",json_obj);
   // document.getElementById('plotA').style.display = "block";
    //document.getElementById('plotB').style.display = "block";

    $("#input1").attr("placeholder", PlotNameA).blur();
    $("#input2").attr("placeholder", PlotNameB).blur();

    var plot_nodes = nodes.slice();

 /*   for(var i=0;i<plot_nodes.length;i++) {
        console.log("plot values yo:"+plot_nodes[i].plotvalues.length)
        for(var j=0; j<plot_nodes[i].plotvalues.length;j++)
        {

            console.log("plot values : " + plot_nodes[i].plotvalues[j]);
        }
    }
    */


    for (var i = 0; i < plot_nodes.length; i++) {
        if (plot_nodes[i].name === PlotNameA) {
            if (plot_nodes[i].plottype === "continuous") {
              count_c++;
            }
            else if (plot_nodes[i].plottype === "bar") {
              count_b++;
            }
        } else if (plot_nodes[i].name === PlotNameB) {
            if (plot_nodes[i].plottype === "continuous") {
                count_c++;
            }
            else if (plot_nodes[i].plottype === "bar") {
                count_b++;
            }
        }


    }

    d3.select("#input1").on("mouseover", function() {
        //console.log("mouseover function called");
        d3.select("#tooltipPlotA")
            .style("visibility", "visible")
            .style("opacity","1")
            .text(PlotNameA);
    })
        .on("mouseout",function(){
            d3.select("#tooltipPlotA")
                .style("visibility", "hidden")
                .style("opacity","0")



        })
    ;
    d3.select("#input2").on("mouseover", function() {
       // console.log("mouseover function called B");
        d3.select("#tooltipPlotB")
            .style("visibility", "visible")
            .style("opacity","1")
            .text(PlotNameB);
    })
        .on("mouseout",function(){
            d3.select("#tooltipPlotB")
                .style("visibility", "hidden")
                .style("opacity","0")



        })
    ;

    if(count_c===2)
    {
        document.getElementById("plotA").style.width = "100%";
        document.getElementById("plotB").style.width = "0";
    }else if (count_b===2)
    {
        document.getElementById("plotB").style.width = "100%";
        document.getElementById("plotA").style.width = "0";
    }else if(count_b===1 && count_c===1)
        {
            document.getElementById("plotB").style.width = "50%";
            document.getElementById("plotA").style.width = "50";
        }

    var margin_cross = {top: 30, right: 35, bottom: 40, left: 40},
        width_cross = 300 - margin_cross.left - margin_cross.right,
        height_cross = 160 - margin_cross.top - margin_cross.bottom;

    var padding_cross = 100;

    for (var i = 0; i < plot_nodes.length; i++) {
        if (plot_nodes[i].name === PlotNameA) {
            if (plot_nodes[i].plottype === "continuous") {
                density_cross(plot_nodes[i]);
            }
            else if (plot_nodes[i].plottype === "bar") {
                bar_cross(plot_nodes[i]);
            }
        } else if (plot_nodes[i].name === PlotNameB) {
            if (plot_nodes[i].plottype === "continuous") {
                density_cross(plot_nodes[i]);
            }
            else if (plot_nodes[i].plottype === "bar") {
                bar_cross(plot_nodes[i]);
            }
        }


    }
  /*
    d3.select(mydiv2).append("g")
        .attr("id", "btnDiv")
        .style('font-size', '75%')
        .style("width", "280px")
        .style("position","relative")
        .style("left", "120px")
        .style("top", "0px");


    d3.select("#btnDiv")[0][0].innerHTML =[
        '<h5>Data Selection</h5>',
        '<p>Enter the numbers for both plots respectively to specify the distribution of the cross-tabs.</p>',
        '<p id="boldstuff" style="color: #2a6496">Select between Equidistant and Equimass.</p>'

    ].join('\n')

    d3.select("#btnDiv")
        .append("input")
        .attr({
            "id": "a",
            "placeholder": PlotNameA,

            "size": 20
        })




    // style both of the inputs at once
    // more on HTML5 <input> at https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
    d3.selectAll("input")
        .attr({
            "type": "text",
            "size": 3,
            "autofocus": "true",
            "inputmode": "numeric"
        })
        .style({
            "text-align": "center",
            "display": "inline-block",
            "margin-right": "10px"
        });


    var btns = d3.select("#btnDiv").selectAll("button").data(["EQUIDISTANCE", "EQUIMASS"])
    btns = btns.enter().append("button").style("display", "inline-block")

    // fill the buttons with the year from the data assigned to them
    btns.each(function (d) {
        this.innerText = d;
    });

    btns.on("click", getData);




    d3.select(mydiv2).append("g")
        .attr("id", "btnDiv1")
        .style('font-size', '75%')
        .style("width", "280px")
        .style("position","relative")
        .style("left", "-102px")
        .style("top", "40px")




    d3.select("#btnDiv1")
        .append("input")
        .attr({
            "id": "b",
            "placeholder": PlotNameB,
            "size": 20
        })



    // style both of the inputs at once
    // more on HTML5 <input> at https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
    d3.selectAll("input")
        .attr({
            "type": "text",
            "size": 3,
            "autofocus": "true",
            "inputmode": "numeric"
        })
        .style({
            "text-align": "center",
            "display": "inline-block",
            "margin-right": "10px"
        });


    var btns1 = d3.select("#btnDiv1").selectAll("button").data(["EQUIDISTANCE", "EQUIMASS"])
    btns1 = btns1.enter().append("button").style("display", "inline-block")

    // fill the buttons with the year from the data assigned to them
    btns1.each(function (d) {
        this.innerText = d;
    });

    btns1.on("click", getData1);
var varn1,varn2 , varsize1,varsize2;
    function getData() {

        if (this.innerText === "EQUIDISTANCE")
        {
varn1="equidistance";
             plotA_size= parseInt(d3.select("input#a")[0][0].value);
varsize1=plotA_size;
            equidistance(PlotNameA,plotA_size);

        }
        else if (this.innerText === "EQUIMASS") {
             plotA_sizem= parseInt(d3.select("input#a")[0][0].value);
varsize1=plotA_sizem
            equimass(PlotNameA,plotA_sizem);
varn1="equimass";

        }

    }
    function getData1() {

        if (this.innerText === "EQUIDISTANCE")
        {

            varn2="equidistance";
             plotB_size= parseInt(d3.select("input#b")[0][0].value);
            equidistance(PlotNameB,plotB_size);
            varsize2=plotB_size;
        }
        else if (this.innerText === "EQUIMASS") {
            varn2="equimass";
             plotB_sizem= parseInt(d3.select("input#b")[0][0].value);
            equimass(PlotNameB,plotB_sizem);
        varsize2=plotB_sizem;
        }

    }

    */
    var varn1,varn2 , varsize1,varsize2;


    //console.log("json_obj undefined");

    $("#Equidistance1").click(function () {

       // console.log("equiD1 clicked")
        varn1 = "equidistance";
        plotA_size = parseInt(d3.select("#input1")[0][0].value);
        varsize1 = plotA_size;
        equidistance(PlotNameA, plotA_size);

        // console.log(" the varn1 : " + varn1);
        // console.log("plotAsize:" + plotA_size);

    });
    $("#Equimass1").click(function () {
       // console.log("equiM1 clicked")
        plotA_sizem = parseInt(d3.select("#input1")[0][0].value);
        varsize1 = plotA_sizem
        equimass(PlotNameA, plotA_sizem);
        varn1 = "equimass";
        // console.log(" the varn1 : " + varn1);
        // console.log("plotAsize:" + plotA_sizem);
    });
    $("#Equidistance2").click(function () {
        //console.log("equiD2 clicked")
        varn2 = "equidistance";
        plotB_size = parseInt(d3.select("#input2")[0][0].value);
        equidistance(PlotNameB, plotB_size);
        varsize2 = plotB_size;
        // console.log(" the varn2 : " + varn2);
        // console.log("plotBsize:" + plotB_size);
    });
    $("#Equimass2").click(function () {
       // console.log("equiM2 clicked")
        varn2 = "equimass";
        plotB_sizem = parseInt(d3.select("#input2")[0][0].value);
        equimass(PlotNameB, plotB_sizem);
        varsize2 = plotB_sizem;
        // console.log(" the varn2 : " + varn2);
        // console.log("plotBsize:" + plotB_sizem);
    });



// this is the function to add  the density plot if any
    function density_cross(density_env,a,method_name) {



// setup the x_cord according to the size given by user


        console.log("welcome to : " + density_env.name);
        //var mydiv = "#resultsView_tabular";
        var yVals = density_env.ploty;
        var xVals = density_env.plotx;

        // an array of objects

        var data2 = [];
        for (var i = 0; i < density_env.plotx.length; i++) {
            data2.push({x: density_env.plotx[i], y: density_env.ploty[i]});
        }

        data2.forEach(function (d) {
            d.x = +d.x;
            d.y = +d.y;
        });
        //  console.log(data2);

        var min_x = d3.min(data2, function (d, i) {
            return data2[i].x;
        });
        var max_x = d3.max(data2, function (d, i) {
            return data2[i].x;
        });
        var avg_x = (max_x - min_x) / 10;
        var min_y = d3.min(data2, function (d, i) {
            return data2[i].y;
        });
        var max_y = d3.max(data2, function (d, i) {
            return data2[i].y;
        });
        var avg_y = (max_y - min_y) / 10;
        var x = d3.scale.linear()
            .domain([d3.min(xVals), d3.max(xVals)])
            .range([0, width_cross]);

        var invx = d3.scale.linear()
            .range([d3.min(data2.map(function (d) {
                return d.x;
            })), d3.max(data2.map(function (d) {
                return d.x;
            }))])
            .domain([0, width_cross]);

        var y = d3.scale.linear()
            .domain([d3.min(data2.map(function (d) {
                return d.y;
            })), d3.max(data2.map(function (d) {
                return d.y;
            }))])
            .range([height_cross, 0]);


        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(5)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var area = d3.svg.area()
            .interpolate("monotone")
            .x(function (d) {
                return x(d.x);
            })
            .y0(height_cross - avg_y)
            .y1(function (d) {
                return y(d.y);
            });

        var line = d3.svg.line()
            .x(function (d) {
                return x(d.x);
            })
            .y(function (d) {
                return y(d.y);
            })
            .interpolate("monotone");

        var plotsvg = d3.select(mydiv)
            .append("svg")
            .attr("id", "plotsvg_id")
            .style("width", width_cross + margin_cross.left + margin_cross.right) //setting height to the height of #main.left
            .style("height", height_cross + margin_cross.top + margin_cross.bottom)
            .style("margin-left","20px")
            .append("g")
            .attr("transform", "translate(0," + margin_cross.top + ")");


        plotsvg.append("path")
            .attr("id", "path1")
            .datum(data2)
            .attr("class", "area")
            .attr("d", area);
        plotsvg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height_cross  ) + ")")
            .call(xAxis);

        plotsvg.append("text")
            .attr("x", (width_cross / 2))
            .attr("y", (margin_cross.top + padding_cross -10))
            .attr("text-anchor", "middle")
            .text(density_env.name)
            .style("text-indent","20px")
            .style("font-size","12px")
            .style("font-weight","bold");

        if (isNaN(a) || a === 0) {
         //   console.log("do nothing #bar")
            var upper_limit = d3.max(xVals);
            var lower_limit = d3.min(xVals);

            var z = 10;
            //console.log(upper_limit +" and " + lower_limit);
            var diff = upper_limit - lower_limit;
            var buffer = diff / z;
            var x_cord = [];
            // console.log("diff : " + diff);
            // console.log("buffer : " + buffer);
            var push_data = lower_limit;
            for (var i = 0; i < z - 1; i++) {
                push_data = push_data + buffer;
                x_cord.push(push_data);
                //console.log("x_cord : " + x_cord);


                plotsvg.append("line")
                    .attr("id", "line1")
                    .attr("x1", x(x_cord[i]))
                    .attr("x2", x(x_cord[i]))
                    .attr("y1", y(d3.min(yVals)))
                    .attr("y2", y(d3.max(yVals)))
                    .style("stroke", "#212121")
                    .style("stroke-dasharray", "3");
            }
        }
        else {
            if (method_name === "equidistance") {

                var upper_limit = d3.max(xVals);
                var lower_limit = d3.min(xVals);


                //console.log(upper_limit +" and " + lower_limit);
                var diff = upper_limit - lower_limit;
                var buffer = diff / a;
                var x_cord = [];
                // console.log("diff : " + diff);
                // console.log("buffer : " + buffer);
                var push_data = lower_limit;
                for (var i = 0; i < a - 1; i++) {
                    push_data = push_data + buffer;
                    x_cord.push(push_data);
                    // console.log("x_cord : " + x_cord);


                    plotsvg.append("line")
                        .attr("id", "line1")
                        .attr("x1", x(x_cord[i]))
                        .attr("x2", x(x_cord[i]))
                        .attr("y1", y(d3.min(yVals)))
                        .attr("y2", y(d3.max(yVals)))
                        .style("stroke", "#0D47A1")
                        .style("stroke-dasharray", "4");
                }

            }

            else if (method_name === "equimass") // here we use the data from equimassCalculation to draw lines
            {
             //   console.log(" density equimass called ");
                var temp = [];

                temp = equimassCalculation(density_env, a);
            //    console.log("temp for density : " + temp);
                for (var i = 1; i < a; i++) {
                    plotsvg.append("line")
                        .attr("id", "line1")
                        .attr("x1", x(temp[i]))
                        .attr("x2", x(temp[i]))
                        .attr("y1", y(d3.min(yVals)))
                        .attr("y2", y(d3.max(yVals)))
                        .style("stroke", "#0D47A1")
                        .style("stroke-dasharray", "4");
                }
            }

        }

    }


// this is the function to add the bar plot if any
    function bar_cross(bar_env,a,method_name) {
        console.log("welcome to : " + bar_env.name);




        var barPadding = .015;  // Space between bars
        var topScale = 1.2;      // Multiplicative factor to assign space at top within graph - currently removed from implementation
        var plotXaxis = true;

        // Data
        var keys = Object.keys(bar_env.plotvalues);
        var yVals = new Array;
        var ciUpperVals = new Array;
        var ciLowerVals = new Array;
        var ciSize;

        var xVals = new Array;
        var yValKey = new Array;

       // console.log(keys);


//    var mydiv = "#resultsView_tabular";


        if (bar_env.nature === "nominal") {
            var xi = 0;
            for (var i = 0; i < keys.length; i++) {
                if (bar_env.plotvalues[keys[i]] == 0) {
                    continue;
                }
                yVals[xi] = bar_env.plotvalues[keys[i]];
                xVals[xi] = xi;
                if (private) {
                    if (bar_env.plotvaluesCI) {
                        ciLowerVals[xi] = bar_env.plotValuesCI.lowerBound[keys[i]];
                        ciUpperVals[xi] = bar_env.plotValuesCI.upperBound[keys[i]];
                    }
                    ciSize = ciUpperVals[xi] - ciLowerVals[xi];
                }
                ;

                yValKey.push({y: yVals[xi], x: keys[i]});
                xi = xi + 1;
            }
            yValKey.sort(function (a, b) {
                return b.y - a.y
            }); // array of objects, each object has y, the same as yVals, and x, the category
            yVals.sort(function (a, b) {
                return b - a
            }); // array of y values, the height of the bars
            ciUpperVals.sort(function (a, b) {
                return b.y - a.y
            }); // ?
            ciLowerVals.sort(function (a, b) {
                return b.y - a.y
            }); // ?
        }
        else {
            for (var i = 0; i < keys.length; i++) {
                // console.log("plotvalues in bars");
                //console.log(node);
                yVals[i] = bar_env.plotvalues[keys[i]];
                xVals[i] = Number(keys[i]);
                if (private) {
                    if (bar_env.plotvaluesCI) {
                        ciLowerVals[i] = bar_env.plotvaluesCI.lowerBound[keys[i]];
                        ciUpperVals[i] = bar_env.plotvaluesCI.upperBound[keys[i]];
                    }
                    ciSize = ciUpperVals[i] - ciLowerVals[i];
                }
            }
        }

        if ((yVals.length > 15 & bar_env.numchar === "numeric") | (yVals.length > 5 & bar_env.numchar === "character")) {
            plotXaxis = false;
        }
       var minY=d3.min(yVals);
       var  maxY = d3.max(yVals); // in the future, set maxY to the value of the maximum confidence limit
       var  minX = d3.min(xVals);
       var  maxX = d3.max(xVals);
      var   x_1 = d3.scale.linear()
            .domain([minX - 0.5, maxX + 0.5])
            .range([0, width_cross]);

        var invx = d3.scale.linear()
            .range([minX - 0.5, maxX + 0.5])
            .domain([0, width_cross]);

       var  y_1 = d3.scale.linear()
        // .domain([0, maxY])
            .domain([0, maxY])
            .range([0, height_cross]);

        var xAxis = d3.svg.axis()
            .scale(x_1)
            .ticks(yVals.length)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y_1)
            .orient("left");

      var    plotsvg1 = d3.select(mydiv1)
            .append("svg")
            .attr("id","plotsvg1_id")
            .style("width", width_cross + margin_cross.left + margin_cross.right) //setting height to the height of #main.left
            .style("height", height_cross + margin_cross.top + margin_cross.bottom)
          .style("margin-left","20px")
            .append("g")
            .attr("transform", "translate(0," + margin_cross.top + ")");

        var rectWidth = x_1(minX + 0.5 - 2 * barPadding); //the "width" is the coordinate of the end of the first bar

        plotsvg1.selectAll("rect")

            .data(yVals)
            .enter()
            .append("rect")
            .attr("id","path2")
            .attr("x", function (d, i) {
                return x_1(xVals[i] - 0.5 + barPadding);
            })
            .attr("y", function (d) {
                return y_1(maxY - d);
            })
            .attr("width", rectWidth)
            .attr("height", function (d) {
                return y_1(d);
            })
            .attr("fill", "#fa8072");

        if (plotXaxis) {
            plotsvg1.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height_cross + ")")
                .call(xAxis);
        }

        plotsvg1.append("text")
            .attr("x", (width_cross / 2))
            .attr("y", margin_cross.top + padding_cross-10)
            .attr("text-anchor", "middle")
            .text(bar_env.name)
            .style("text-indent","20px")
            .style("font-size","12px")
            .style("font-weight","bold");



    if (isNaN(a) || a === 0) {
       // console.log("do nothing #bar");
        x_cord2 = equimass_bar(bar_env, keys.length);
        //console.log("x_cord2 equidis : " + x_cord2);

       // console.log(" bar equimass called ");
        for (var i = 0; i < keys.length - 1; i++) {
            // console.log("x_cord1 actual: " + x_1(x_cord2[i]));
            plotsvg1.append("line")
                .attr("id", "line2")
                .attr("x1", x_1(x_cord2[i]))
                .attr("x2", x_1(x_cord2[i]))
                .attr("y1", y_1(0))
                .attr("y2", y_1(maxY))
                .style("stroke", "#212121")
                .style("stroke-dasharray", "4");


        }
    }
    else {
        if (method_name === "equidistance") {

            var upper_limit1 = maxX;
            var lower_limit1 = minX;
            var diff1 = upper_limit1 - lower_limit1;
            var buffer1 = diff1 / a;
            var x_cord1 = [];
            // console.log("diff1 : " + diff1);
            // console.log("buffer1 : " + buffer1);
            var push_data1 = lower_limit1;
            for (var i = 0; i < a - 1; i++) {
                push_data1 = push_data1 + buffer1;
                x_cord1.push(push_data1);
//console.log("x_cord1 equidis : "+ x_cord1);
                // console.log("x_cord1 actual: " + x_1(x_cord1[i]));
//console.log("maxY : "+ maxY);
                plotsvg1.append("line")
                    .attr("id", "line2")
                    .attr("x1", x_1(x_cord1[i]))
                    .attr("x2", x_1(x_cord1[i]))
                    .attr("y1", y_1(0))
                    .attr("y2", y_1(maxY))
                    .style("stroke", "#0D47A1")
                    .style("stroke-dasharray", "4");
            }
        }
        else if (method_name === "equimass") {
            var x_cord2 = [];
            x_cord2 = equimass_bar(bar_env, a);
            //console.log("x_cord2 equidis : " + x_cord2);

            console.log(" bar equimass called ");
            for (var i = 0; i < a - 1; i++) {
                // console.log("x_cord1 actual: " + x_1(x_cord2[i]));
                plotsvg1.append("line")
                    .attr("id", "line2")
                    .attr("x1", x_1(x_cord2[i]))
                    .attr("x2", x_1(x_cord2[i]))
                    .attr("y1", y_1(0))
                    .attr("y2", y_1(maxY))
                    .style("stroke", "#0D47A1")
                    .style("stroke-dasharray", "4");

            }
        }


}

    }

    function equidistance(A,a)
    {
        var method_name= "equidistance";

        // json object to be sent to r server
        var obj = new Object();
        obj.plotNameA = A;
        obj.equidistance = a;




//convert object to json string
        var string = JSON.stringify(obj);

//convert string to Json Object
       // console.log(JSON.parse(string)); // this is your requirement.



        for (var i = 0; i < plot_nodes.length; i++) {
            if (plot_nodes[i].name === A) {
                if (plot_nodes[i].plottype === "continuous") {
                    $("#plotsvg_id").remove();
                    //d3.select("#line1").remove();

                    density_cross(plot_nodes[i],a,method_name);
                }
                else if (plot_nodes[i].plottype === "bar") {
                    $("#plotsvg1_id").remove();
                   // d3.select("#line2").remove();
                    bar_cross(plot_nodes[i],a,method_name);
                }
            } else {
                /*
                if (plot_nodes[i].plottype === "continuous") {
                    density_cross(plot_nodes[i],b);
                }
                else if (plot_nodes[i].plottype === "bar") {
                    bar_cross(plot_nodes[i],b);
                }
                */
                console.log("not found")
            }


        }
    }
function equimass(A,a) //equimass function to call the plot function
{

    var method_name= "equimass";

    // json object to be sent to r server
    var obj = new Object();
    obj.plotNameA = A;
    obj.equidistance = a;




//convert object to json string
    var string = JSON.stringify(obj);

//convert string to Json Object
   // console.log(JSON.parse(string)); // this is your requirement.



    for (var i = 0; i < plot_nodes.length; i++) {
        if (plot_nodes[i].name === A) {
            if (plot_nodes[i].plottype === "continuous") {
              $("#plotsvg_id").remove();
                //d3.select("#line1").remove();

                density_cross(plot_nodes[i],a,method_name);
            }
            else if (plot_nodes[i].plottype === "bar") {
               $("#plotsvg1_id").remove();
               // d3.select("#line2").remove();
                bar_cross(plot_nodes[i],a,method_name);
            }
        } else {
            /*
            if (plot_nodes[i].plottype === "continuous") {
                density_cross(plot_nodes[i],b);
            }
            else if (plot_nodes[i].plottype === "bar") {
                bar_cross(plot_nodes[i],b);
            }
            */
            console.log("not found")
        }


    }

}

function equimassCalculation(plot_ev,n) // here we find the coordinates using CDF values
{
    //var n =v-1;
    var arr_y=[];
    var arr_x=[];

        arr_y=plot_ev.cdfploty;// cdfploty data stored
        arr_x=plot_ev.cdfplotx;// cdfplotx data stored



//console.log("The value of arr_y is "+ arr_y);
  //  console.log("The value of arr_x is "+ arr_x);

    var Upper_limitY= d3.max(arr_y);
    var Lower_limitY=d3.min(arr_y);
var diffy=Upper_limitY-Lower_limitY;
    var e=(diffy)/n; // e is the variable to store the average distance between the points in the cdfy in order to divide the cdfy

    // console.log("Upper_limitY ;"+Upper_limitY);
    // console.log("Lower_limitX :"+Lower_limitY);
    // console.log("e "+e );

    var arr_c=[]; //array to store the cdfy divided coordinates data
    var push_data=arr_y[0];
    for(var i=0;i<n;i++)
    {
       push_data=push_data+e;
       arr_c.push(push_data);

    }

    //console.log("arr_c : "+ arr_c);
/*
    var temp=[]; // to store the distance percentage of each division point from the first point in cdfy
    var val_temp=0;
    for(var i=0; i<n;i++)
    {
        val_temp=((arr_c[i]-arr_y[0])*100)/diffy;
        temp.push(val_temp);
    }
    console.log("temp : "+ temp);


    var temp_2=[]; // in order to store the corresponding cdfy points in cdfx
    var Upper_limitX=d3.max(arr_x);
    var Lower_limitX=d3.min(arr_x);

    var diffx=Upper_limitX-Lower_limitX;
    var val_temp2=0;
    for (var i=0; i<n;i++)
    {
        val_temp2= (temp[i]*diffx) + arr_x[0]; //equation to calculate the cdfx required points
        temp_2.push(val_temp2);

    }
    console.log(" arr_x[0] : "+ arr_x[0]);
console.log("diffx: "+ diffx);
    console.log("temp_2 : "+ temp_2);

    return temp_2; // the required array to plot in pdf

    */

var temp_cdfx=[];
var temp=[];
var store=[];

for (var i=0; i<n; i++)//to get through each arr_c
{

   // console.log("test arcc_c" + arr_c[i]);
    for (var j = 0; j < 50; j++)// to compare with cdfy or arr_y
    {
        if (arr_c[i] === arr_y[j]) {

            store.push({val: i, coor1: j, coor2: j, diff1: 0.34, diff2: 0});// for testing purpose


        }
    }
}
    for(var i=0; i<n;i++)
    {
        var diff_val1, diff_val2;// here the diff is not actual difference, it is the fraction of the distance from the two points
        var x1, x2, x3,x4;
        for (var j = 0; j < 50; j++) {
          //  console.log(" j out"+ j );

            if (arr_y[j] < arr_c[i] && arr_c[i] < arr_y[j + 1]) {

                x1 = arr_c[i];
                x2 = arr_c[i]-arr_y[j];
                x3 = arr_y[j+1]-arr_c[i];
                x4=arr_y[j+1]-arr_y[j];
                // console.log(" val1 : " +x1 + " val2 : " + arr_y[j] + " val3: " + arr_y[j+1]);
                // console.log(" x1-x2 : " +x2 + " x3-x1 : " + x3 + " x3-x2: " + x4);

            // console.log(" j in"+ j );

                diff_val1 = x2/ x4;
                diff_val2 = x3 / x4;
//console.log("diff_val1: "+ diff_val1 +  " diff_val2: "+ diff_val2);
                store.push({val: i, coor1: j, coor2: j + 1, diff1: diff_val1, diff2: diff_val2});

            }

        }
    }


for(var i=0; i<n; i++) {
   // console.log(" store : " + store[i].val + " " + store[i].coor1 + " "+ store[i].coor2 + " diff1 " + store[i].diff1 + " diff2 "+ store[i].diff2);
}

for(var i=0; i<n; i++)
{
var y1,y2,y3,diffy1,diffy2;
y1=store[i].val;
y2= store[i].coor1;
y3= store[i].coor2;
diffy1=store[i].diff1;
diffy2=store[i].diff2;

var x_coor1= arr_x[y2];
var x_coor2=arr_x[y3];

var x_diff=x_coor2-x_coor1;

var distance1= x_diff*diffy1;

var val_x=x_coor1+distance1;

temp.push(val_x);
//console.log(" val_x"+ val_x);
}
return temp;
}




function equimass_bar(plot_ev,n) {
    var keys = Object.keys(plot_ev.plotvalues);
    var k = keys.length;
    var temp = [];
    var count = 0;

    if (k < n) {
        alert("error enter vaild size");
        // console.log("error enter vaild size")
    }

    else {
        while (k > 0) {

            temp.push({pos: count, val: k});
//console.log("k:"+ k+ " and n: "+count );
            count++;
            k--;
            if (count >= n) {
                count = 0;
            }

        }

        var temp2 = new Array(n);

        for (var i = 0; i < temp2.length; i++) {
            temp2[i] = 0;
            //

        }
        for (var i = 0; i < keys.length; i++) {
            keys[i] = (keys[i] + 5) / 10;// to get the increase in the actual values by 0.5 according to the xaxis in plot
            //

        }
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < temp.length; j++) {

                if (temp[j].pos === i) {
                    temp2[i] = temp2[i] + 1;
                }

            }

        }

        for (var i = 0; i < temp.length; i++) {
            // // console.log("temp2 : "+temp2[i] );
            // console.log("n : " + temp[i].pos + " and k: " + temp[i].val);
            // //console.log("keys : " + keys[i]);

        }
       // console.log(" the divison of the bar plot : " + temp2);

        var j = 0, k = 0;
        var temp_final = new Array(n);
        for (var i = 0; i < keys.length; i++) {
            temp2[j] = temp2[j] - 1;

            if (temp2[j] === 0) {
                j++;
                temp_final[k] = keys[i];
                k++;

            }


        }
     //   console.log("temp_final: " + temp_final);
        return temp_final;
    }
}
    function writeCrossTabsJson()
    {
//
// console.log(" buttontype A : "+ varn1)
//         console.log(" buttontype B : "+ varn2)
//

        var plotAval=varsize1,plotBval=varsize2;
        if(isNaN(plotAval))
        {
            plotAval=10;
        }
        if(isNaN(plotBval)){plotBval=10;}


        var jsondata=
            {
                var1:
                    {
                        name: PlotNameA,
                        value: plotAval,
                            buttonType:varn1


                    },
                var2:
                    {
                        name: PlotNameB,
                        value:plotBval,
                        buttonType:varn2


                    }

            };

//console.log("The JsonData to be sent is : ");
var jsonoutput= JSON.stringify(jsondata);



//console.log(jsonoutput);

return jsondata;
    }
/*
    function equidistance(a)
    {
        d3.selectAll("#line1").remove();
        d3.selectAll("#line2").remove();

        console.log("equidistance size : "+ a);
// setup the x_cord according to the size given by user

        var upper_limit=d3.max(xVals);
        var lower_limit=d3.min(xVals);

        var upper_limit1=maxX;
        var lower_limit1=minX;

        //console.log(upper_limit +" and " + lower_limit);
        var diff=upper_limit-lower_limit;
        var buffer= diff/a;
        var x_cord=[];
        console.log("diff : "+ diff);
        console.log("buffer : "+buffer);
        var push_data=lower_limit;


        for(var i=0; i<a;i++)
        {
            push_data=push_data+buffer;
    x_cord.push(push_data);
   console.log("x_cord : "+ x(x_cord[i]));
            plotsvg.append("line")
                .attr("id","line1")
                .attr("x1",  x(x_cord[i]))
                .attr("x2",x(x_cord[i]) )
                .attr("y1", y(d3.min(yVals)))
                .attr("y2", y(d3.max(yVals)))
                .style("stroke", "red")
                .style("stroke-dasharray", "3");
        }
        console.log(x_cord);

        //the line division for the 2nd plot
        var diff1=upper_limit1-lower_limit1;
        var buffer1= diff1/a;
        var x_cord1=[];
        console.log("diff1 : "+ diff1);
        console.log("buffer1 : "+buffer1);
        var push_data1=lower_limit1;

        for(var i=0; i<a;i++)
        {
            push_data1=push_data1+buffer1;
            x_cord1.push(push_data1);

               console.log("x_cord1 : "+ x_1(x_cord1[i]));
//console.log("maxY : "+ maxY);
            plotsvg1.append("line")
                .attr("id","line2")
                .attr("x1",  x_1(x_cord1[i]))
                .attr("x2",x_1(x_cord1[i]) )
                .attr("y1", y_1(0))
                .attr("y2", y_1(maxY))
                .style("stroke", "red")
                .style("stroke-dasharray", "3");
        }




    }
    */
    crossTabPlots.writeCrossTabsJson=writeCrossTabsJson;
    crossTabPlots.equidistance=equidistance;
    crossTabPlots.equimass=equimass;

}


//Kripanshu Bhargava bivariatePlot(Scatter plot)

var data_plot = [];
var heatxaxis,heatyaxis;
function bivariatePlot(x_Axis, y_Axis, x_Axis_name, y_Axis_name) {
heatxaxis=x_Axis_name;
heatyaxis=y_Axis_name;

    document.getElementById('scatterplot').style.display = "block";
  //  document.getElementById('NAcount').style.display = "block";
    d3.select("#scatterplot").html("");
    d3.select("#scatterplot").select("svg").remove();

    // document.getElementById('linechart').style.display = "none";
    // d3.select("#heatchart").select("svg").remove();
    // d3.select("#linechart").select("svg").remove();
    // d3.select("#linechart").html("");
    //d3.select("#heatchart").html("");
    // $("#NAcount").html("");


    /*
     for(var i=0; i<1000; i++)
     {
     x_Axis.push(i);
     y_Axis.push(Math.random()*i*100);
     }
     */


    console.log("bivariate plot called");
    // scatter plot

    data_plot = [];
    var nanCount = 0;
    for (var i = 0; i < 1000; i++) {
        if (isNaN(x_Axis[i]) || isNaN(y_Axis[i])) {
            nanCount++;
        } else {
            var newNumber1 = x_Axis[i];
            var newNumber2 = y_Axis[i];
            data_plot.push({xaxis: newNumber1, yaxis: newNumber2, score: Math.random() * 100});

        }


    }


    var margin = {top: 20, right: 15, bottom: 40, left: 60}
        , width = 500 - margin.left - margin.right
        , height = 280 - margin.top - margin.bottom;
    var padding = 100;

    var min_x = d3.min(data_plot, function (d, i) {
        return data_plot[i].xaxis;
    });
    var max_x = d3.max(data_plot, function (d, i) {
        return data_plot[i].xaxis;
    });
    var avg_x = (max_x - min_x) / 10;
    var min_y = d3.min(data_plot, function (d, i) {
        return data_plot[i].yaxis;
    });
    var max_y = d3.max(data_plot, function (d, i) {
        return data_plot[i].yaxis;
    });
    var avg_y = (max_y - min_y) / 10;

    var xScale = d3.scale.linear()
        .domain([min_x - avg_x, max_x + avg_x])
        .range([0, width]);

    var yScale = d3.scale.linear()
        .domain([min_y - avg_y, max_y + avg_y])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickSize(-height);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .ticks(5)
        .tickSize(-width);

    var zoom = d3.behavior.zoom()
        .x(xScale)
        .y(yScale)
        .scaleExtent([1, 10])
        .on("zoom", zoomed);

    var chart_scatter = d3.select('#scatterplot')
        .append('svg:svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .call(zoom);

    var main1 = chart_scatter.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('width', width+ margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .attr('class', 'main');

    main1.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'x axis')
        .call(xAxis);

    main1.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'y axis')
        .call(yAxis);

    var clip = main1.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("id", "clip-rect")
        .attr("x", "0")
        .attr("y", "0")
        .attr('width', width)
        .attr('height', height);

    main1.append("g").attr("clip-path", "url(#clip)")
        .selectAll("circle")
        .data(data_plot)
        .enter()
        .append("circle")
        .attr("cx", function (d, i) {
            return xScale(data_plot[i].xaxis);
        })
        .attr("cy", function (d, i) {
            return yScale(data_plot[i].yaxis);
        })
        .attr("r", 2)
        .style("fill", "#B71C1C")
    ;
    chart_scatter.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + padding / 5 + "," + (height / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text(y_Axis_name)
        .style("fill", "#424242")
        .style("text-indent","20px")
        .style("font-size","12px")
        .style("font-weight","bold");

    chart_scatter.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + (width / 2) + "," + (height + (padding / 2)) + ")")  // centre below axis
        .text(x_Axis_name)
        .style("fill", "#424242")
        .style("text-indent","20px")
        .style("font-size","12px")
        .style("font-weight","bold");

    function zoomed() {
        var panX = d3.event.translate[0];
        var panY = d3.event.translate[1];
        var scale = d3.event.scale;

        panX = panX > 10 ? 10 : panX;
        var maxX = -(scale - 1) * width - 10;
        panX = panX < maxX ? maxX : panX;

        panY = panY > 10 ? 10 : panY;
        var maxY = -(scale - 1) * height - 10;
        panY = panY < maxY ? maxY : panY;

        zoom.translate([panX, panY]);


        main1.select(".x.axis").call(xAxis);
        main1.select(".y.axis").call(yAxis);
        main1.selectAll("circle")
            .attr("cx", function (d, i) {
                return xScale(data_plot[i].xaxis);
            })
            .attr("cy", function (d, i) {
                return yScale(data_plot[i].yaxis);
            })
            .attr("r", 2.5)
            .style("fill", "#B71C1C")
        ;
    }

    /*
    data_plot=[];
        var nanCount = 0;
        for (var i = 0; i < 1000; i++) {
            if (isNaN(x_Axis[i]) || isNaN(y_Axis[i])) {
                nanCount++;
            } else {
                var newNumber1 = Math.floor(x_Axis[i]);
                var newNumber2 = Math.floor(y_Axis[i]);
                data_plot.push({xaxis: newNumber1, yaxis: newNumber2, score:i/100});

            }


        }



        var margin = {top: 20, right: 10, bottom: 20, left: 60},
            width = 460 - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;

        var xMax = d3.max(data_plot, function (d, i) {
                return data_plot[i].xaxis
            }),
            xMin = 0,
            yMax = d3.max(data_plot, function (d, i) {
                return data_plot[i].yaxis
            }),
            yMin = 0;




    //Define scales
    var x = d3.scale.linear()
        .domain([xMin, xMax])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([yMin, yMax])
        .range([height, 0]);


    //Define X axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(-height, 0, 0)

    ;

    //Define Y axis
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)
        .tickSize(-width, 0, 0)

    ;

    var svg = d3.select("#scatterplot")  // This is where we put our vis
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("background-color", "#fff")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.behavior.zoom().x(x).y(y).scaleExtent([1, 20]).on("zoom", zoom))
    ;


    svg.append("rect")
        .attr("width", width)
        .attr("height", height)

        .attr("stroke-color", "#E0E0E0");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)


    ;
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)


    ;




    var circle = svg.selectAll("circle")
        .data(data_plot)
        .enter()
        .append("circle")
        .attr("class", "hex")
        .attr("transform", function (d, i) {
            return "translate(" + x(data_plot[i].xaxis) + "," + y(data_plot[i].yaxis) + ")";
        })
        .attr('r', 3)
        .attr("opacity", "1.0")
        .attr("fill", "#1A237E");


    function zoom(d) {
        //svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);
        svg.selectAll("circle")
            .attr("transform", function (d, i) {
                return "translate(" + x(Math.max(data_plot[i].xaxis)) + "," + y(Math.max(data_plot[i].yaxis)) + ")";
            })
            .attr('r', 6);
    }
     */
//heatmap

    document.getElementById('NAcount').style.display = "block";
    d3.select("#NAcount").text("There are " + nanCount + " number of NA values in the relation.");

  //  heatmap(x_Axis_name, y_Axis_name);

}



//Kripanshu Bhargava bivariatePlot(Heatmap)
function heatmap(x_Axis_name,y_Axis_name) {
// var x_Axis_name=heatxaxis;
// var y_Axis_name=heatyaxis;
    document.getElementById('heatchart').style.display = "block";
    d3.select("#heatChart").select("svg").remove();
    $('#heatchart').html("");

    /*
    var gridSize = 25,
        h_heat = gridSize,
        w_heat = gridSize,
        rectPadding = 60;

    var colorLow = '#E1F5FE', colorMed = '#29B6F6', colorHigh = '#01579B';

    var margin_heat = {top: 20, right: 80, bottom: 30, left: 50},
        width_heat = 500 - margin_heat.left - margin_heat.right,
        height_heat = 200 - margin_heat.top - margin_heat.bottom;

    var colorScale = d3.scale.linear()
        .domain([-1, 0, 1])
        .range([colorLow, colorMed, colorHigh]);

    var svg = d3.select("#heatchart").append("svg")
        .attr("class","heatmap_svg")
        .attr("background-color","#EFEBE9")
        .attr("width", width_heat + margin_heat.left + margin_heat.right)
        .attr("height", height_heat + margin_heat.top + margin_heat.bottom)
        .append("g")
        .attr("transform", "translate(" + margin_heat.left + "," + margin_heat.top + ")");

    var heatMap = svg.selectAll(".heatchart")
        .data(data_plot, function(d) {
            if(d.xaxis>1000 || d.yaxis>1000){
                return d.xaxis/100 + ':' + d.yaxis/100;
            }
            else {
                return d.xaxis + ':' + d.yaxis;
            }
        })
        .enter().append("svg:rect")
        .attr("x", function(d) {
            if(d.xaxis>1000 || d.yaxis>1000){
                return d.yaxis/100 * w_heat;
            }
            else {
                return d.yaxis * w_heat;
            }

        })
        .attr("y", function(d) {
            if(d.xaxis>1000 || d.yaxis>1000){
                return d.xaxis/100 * w_heat;
            }
            else {
                return d.xaxis * w_heat;
            }

        })
        .attr("width", function(d) { return w_heat; })
        .attr("height", function(d) { return h_heat; })
        .style("fill", function(d) {
            console.log("the color for this : "+ d.score);
            if(d.score>1) {
                return colorScale(d.score/10);
            }else{
                return colorScale(d.score);
            }
        });

*/

    var margin_heat = {top: 30, right: 10, bottom: 60, left: 60},
        width_heat = 500 - margin_heat.left - margin_heat.right,
        height_heat = 300 - margin_heat.top - margin_heat.bottom;
    var padding = 100;

    var min_x = d3.min(data_plot, function (d, i) {
        return data_plot[i].xaxis;
    });
    var max_x = d3.max(data_plot, function (d, i) {
        return data_plot[i].xaxis;
    });
    var avg_x = (max_x - min_x) / 100;
    var min_y = d3.min(data_plot, function (d, i) {
        return data_plot[i].yaxis;
    });
    var max_y = d3.max(data_plot, function (d, i) {
        return data_plot[i].yaxis;
    });
    var avg_y = (max_y - min_y) / 100;

    var x = d3.scale.linear()
        .domain([min_x - avg_x, max_x + avg_x])
        .range([0, width_heat]);

    var y = d3.scale.linear()
        .domain([min_y - avg_y, max_y + avg_y])
        .range([height_heat, 0]);

    var z = d3.scale.linear().range(["#EF9A9A", "#EF5350"]);


// This could be inferred from the data if it weren't sparse.
    var xStep = avg_x+ 0.1,
        yStep = avg_y + 0.2;
    var svg_heat = d3.select("#heatchart").append("svg")
        .attr("width", width_heat + margin_heat.left + margin_heat.right)
        .attr("height", height_heat + margin_heat.top + margin_heat.bottom)
        .append("g")
        .attr("transform", "translate(" + margin_heat.left + "," + margin_heat.top+ ")")
        .style("background-color", "#FFEBEE");


    // Compute the scale domains.
    x.domain(d3.extent(data_plot, function (d, i) {
        return data_plot[i].xaxis;
    }));
    y.domain(d3.extent(data_plot, function (d, i) {
        return data_plot[i].yaxis;
    }));
    z.domain([0, d3.max(data_plot, function (d, i) {
        return data_plot[i].score;
    })]);

    // Extend the x- and y-domain to fit the last bucket.
    // For example, the y-bucket 3200 corresponds to values [3200, 3300].
    x.domain([x.domain()[0], +x.domain()[1] + xStep]);
    y.domain([y.domain()[0], y.domain()[1] + yStep]);

    // Display the tiles for each non-zero bucket.
    // See http://bl.ocks.org/3074470 for an alternative implementation.
    svg_heat.selectAll(".tile")
        .data(data_plot)
        .enter().append("rect")
        .attr("class", "tile")
        .attr("x", function (d, i) {
            return x(data_plot[i].xaxis);
        })
        .attr("y", function (d, i) {
            return y(data_plot[i].yaxis + yStep );
        })
        .attr("width", 15)
        .attr("height", 15)
        .attr("dx", ".35em")
        .attr("dy", ".35em")
        .style("fill", function (d, i) {
            return z(data_plot[i].score);
        });


    svg_heat.append("text")
        .attr("class", "label")
        .attr("x", width_heat + 20)
        .attr("y", 10)
        .attr("dy", ".35em")
        .text("Count");

    // Add an x-axis with label.
    svg_heat.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height_heat + ")")
        .call(d3.svg.axis().scale(x).ticks(5).tickSize(-height_heat).orient("bottom"))
        .append("text")
        .attr("class", "label")
        .attr("x", width_heat)
        .attr("y", -6)
        .attr("text-anchor", "end")
        .text("");

    // Add a y-axis with label.
    svg_heat.append("g")
        .attr("class", "y axis")
        .call(d3.svg.axis().scale(y).tickSize(-width_heat).orient("left"))
        .append("text")
        .attr("class", "label")
        .attr("y", 6)
        .attr("dy", ".71em")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .text("");

    svg_heat.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(-40," + (height_heat / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text(y_Axis_name)
        .style("fill", "#424242")
        .style("text-indent","20px")
        .style("font-size","12px")
        .style("font-weight","bold");

    svg_heat.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + (width_heat / 2) + "," + (height_heat + padding / 4) + ")")  // centre below axis
        .text(x_Axis_name)
        .style("fill", "#424242")
        .style("text-indent","20px")
        .style("font-size","12px")
        .style("font-weight","bold");


}


//Kripanshu Bhargava bivariatePlot(linechart)
function linechart(x_Axis_name,y_Axis_name) {
    document.getElementById('linechart').style.display = "block";
    d3.select("#lineChart").select("svg").remove();
    $('#linechart').html("");
var padding = 10;
    var w_linechart = 480;
    var h_linechart = 300;
    var margin_linechart = {top: 20, right: 80, bottom: 30, left: 50};
    var width_linechart = w_linechart - margin_linechart.left - margin_linechart.right;
    var height_linechart = h_linechart - margin_linechart.top - margin_linechart.bottom;

    var svg = d3.select("#linechart").append("svg")
        .attr("id", "chart")
        .attr("width", w_linechart)
        .attr("height", h_linechart);
    var chart = svg.append("g")
        .classed("display", true)
        .attr("transform", "translate(" + margin_linechart.left + "," + margin_linechart.top + ")");
    // var dateParser = d3.time.format("%Y/%m/%d").parse;
    var x = d3.scale.linear()
        .domain(d3.extent(data_plot, function (d) {

            return d.xaxis;
        }))
        .range([0, width_linechart]);
    var y = d3.scale.linear()
        .domain([d3.min(data_plot, function (d) {
            return d.yaxis;
        }), d3.max(data_plot, function (d) {
            return d.yaxis;
        })])
        .range([height_linechart, 0]);
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5)
    ;
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5);
    var line = d3.svg.line()
        .x(function (d) {

            return x(d.xaxis);
        })
        .y(function (d) {
            return y(d.yaxis);
        });

    function plot(params) {
        this.append("g")
            .classed("x axis", true)
            .attr("transform", "translate(0," + height_linechart + ")")
            .call(params.axis.x);
        this.append("g")
            .classed("y axis", true)
            .attr("transform", "translate(0,0)")
            .call(params.axis.y);
        //enter()
        this.selectAll(".trendline")
            .data([params.data])
            .enter()
            .append("path")
            .classed("trendline", true);
        this.selectAll(".point")
            .data(params.data)
            .enter()
            .append("circle")
            .classed("point", true)
            .attr("r", 2);
        //update
        this.selectAll(".trendline")
            .attr("d", function (d) {
                return line(d);
            });
        this.selectAll(".point")
            .attr("cx", function (d) {
                var date = d.xaxis;
                return x(date);
            })
            .attr("cy", function (d) {
                return y(d.yaxis);
            })
            .style("color", "#EF5350");
        //exit()
        this.selectAll(".trendline")
            .data([params.data])
            .exit()
            .remove();
        this.selectAll(".point")
            .data(params.data)
            .exit()
            .remove();



    }
    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + padding  + "," + (height / 3) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text(y_Axis_name)
        .style("fill", "#424242")
        .style("text-indent","20px")
        .style("font-size","12px")
        .style("font-weight","bold");

    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + (width / 5) + "," + (height - padding - 128 ) + ")")  // centre below axis
        .text(x_Axis_name)
        .style("fill", "#424242")
        .style("text-indent","20px")
        .style("font-size","12px")
        .style("font-weight","bold");
    plot.call(chart, {
        data: data_plot,
        axis: {
            x: xAxis,
            y: yAxis
        }
    });
}


////////////////////////////////////////////
// everything below this point is a function
//+++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++


//searching a variable

//scaffolding(callback=layout);
/*
 d3.select("#tab1").selectAll("p")
 //do something with this..

 .data(vkey)
 .enter()
 .append("p")
 .attr("id",function(d){
 return d.replace(/\W/g, "_"); // replace non-alphanumerics for selection purposes
 }) // perhapse ensure this id is unique by adding '_' to the front?
 .text(function(d){return d;})
 .style('background-color',function(d) {
 if(findNodeIndex(d) > 2) {return varColor;}
 else {return hexToRgba(selVarColor);}
 })
 .attr("data-container", "body")
 .attr("data-toggle", "popover")
 .attr("data-trigger", "hover")
 .attr("data-placement", "right")
 .attr("data-html", "true")
 .attr("onmouseover", "$(this).popover('toggle');")
 .attr("onmouseout", "$(this).popover('toggle');")
 .attr("data-original-title", "Summary Statistics");
 */


// scaffolding is called after all external data are guaranteed to have been read to completion. this populates the left panel with variable names, the right panel with model names, the transformation tool, an the associated mouseovers. its callback is layout(), which initializes the modeling space
function scaffolding(callback) {
    //console.log("scaffolding called");
    //console.log(valueKey);
    // establishing the transformation element
    d3.select("#transformations")
        .append("input")
        .attr("id", "tInput")
        .attr("class", "form-control")
        .attr("type", "text")
        .attr("value", "Variable transformation");

    // the variable dropdown
    d3.select("#transformations")
        .append("ul")
        .attr("id", "transSel")
        .style("display", "none")
        .style("background-color", varColor)
        .selectAll('li')
        .data(["a", "b"]) //set to variables in model space as they're added
        .enter()
        .append("li")
        .text(function (d) {
            return d;
        });

    // the function dropdown
    d3.select("#transformations")
        .append("ul")
        .attr("id", "transList")
        .style("display", "none")
        .style("background-color", varColor)
        .selectAll('li')
        .data(transformList)
        .enter()
        .append("li")
        .text(function (d) {
            return d;
        });

    //jquery does this well
    $('#tInput').click(function () {
        var t = document.getElementById('transSel').style.display;
        if (t !== "none") { // if variable list is displayed when input is clicked...
            $('#transSel').fadeOut(100);
            return false;
        }
        var t1 = document.getElementById('transList').style.display;
        if (t1 !== "none") { // if function list is displayed when input is clicked...
            $('#transList').fadeOut(100);
            return false;
        }

        // highlight the text
        $(this).select();

        var pos = $('#tInput').offset();
        pos.top += $('#tInput').width();
        $('#transSel').fadeIn(100);
        return false;
    });

    $('#tInput').keyup(function (event) {
        var t = document.getElementById('transSel').style.display;
        var t1 = document.getElementById('transList').style.display;

        if (t !== "none") {
            $('#transSel').fadeOut(100);
        } else if (t1 !== "none") {
            $('#transList').fadeOut(100);
        }

        if (event.keyCode == 13) { // keyup on "Enter"
            var n = $('#tInput').val();
            var t = transParse(n = n);
            if (t === null) {
                return;
            }
            //        console.log(t);
            //      console.log(t.slice(0, t.length-1));
            //    console.log(t[t.length-1]);
            transform(n = t.slice(0, t.length - 1), t = t[t.length - 1], typeTransform = false);
        }
    });

    $('#transList li').click(function (event) {
        var tvar = $('#tInput').val();

        // if interact is selected, show variable list again
        if ($(this).text() === "interact(d,e)") {
            $('#tInput').val(tvar.concat('*'));
            selInteract = true;
            $(this).parent().fadeOut(100);
            $('#transSel').fadeIn(100);
            event.stopPropagation();
            return;
        }

        var tfunc = $(this).text().replace("d", "_transvar0");
        var tcall = $(this).text().replace("d", tvar);
        $('#tInput').val(tcall);
        $(this).parent().fadeOut(100);
        event.stopPropagation();
        transform(n = tvar, t = tfunc, typeTransform = false);
    });


//alert("scaffoldingflag"+flag);


    // populating the variable list in the left panel

    d3.select("#tab1").selectAll("p") 			//do something with this..
        .data(valueKey)
        .enter()
        .append("p")
        .attr("id", function (d) {
            return d.replace(/\W/g, "_"); // replace non-alphanumerics for selection purposes
        }) // perhapse ensure this id is unique by adding '_' to the front?
        .text(function (d) {
            return d;
        })
        .style('background-color', function (d) {
            if (findNodeIndex(d) > 2) {
                return varColor;
            }
            else {
                return hexToRgba(allNodes[findNodeIndex(d)].strokeColor);
            }
        })
        .attr("data-container", "body")
        .attr("data-toggle", "popover")
        .attr("data-trigger", "hover")
        .attr("data-placement", "right")
        .attr("data-html", "true")
        .attr("onmouseover", "$(this).popover('toggle');")
        .attr("onmouseout", "$(this).popover('toggle');")
        .attr("data-original-title", "Summary Statistics");


// populating the right panel in explore

    d3.select("#univariate")
        .style('height', 2000)
        .style('overfill', 'scroll');

    var modellist = Object.keys(mods);
//console.log("This data would be written "+  modellist);
    d3.select("#univariate").selectAll("p")
        .data(modellist)
        .enter()
        .append("p")
        .attr("id", function (d) {
            return "_model_".concat(d);
        })
        .text(function (d) {
            return d;
        })
        .style('background-color', function (d) {
            return varColor;
        })
        .attr("data-container", "body")
        .attr("data-toggle", "popover")
        .attr("data-trigger", "hover")
        .attr("data-placement", "top")
        .attr("data-html", "true")
        .attr("onmouseover", "$(this).popover('toggle');")
        .attr("onmouseout", "$(this).popover('toggle');")
        .attr("data-original-title", "Model Description")
        .attr("data-content", function (d) {
            return mods[d];
        });

    if (typeof callback === "function") {
        callback(); // this calls layout() because at this point all scaffolding is up and ready
    }
}

/*
 $("#clearbtn").click(function() {
 $("#searchvar").val('').focus();
 restart();
 updatedata(valueKey);
 //scaffolding(callback);
 });
 */
$("#searchvar").ready(function () {
    $("#searchvar").val('');

});
//Rohit Bhattacharjee
//to add a clear button in the search barS

function tog(v) {
    return v ? 'addClass' : 'removeClass';
}

$(document).on('input', '#searchvar', function () {
    $(this)[tog(this.value)]('x');
}).on('mousemove', '.x', function (e) {
    $(this)[tog(this.offsetWidth - 18 < e.clientX - this.getBoundingClientRect().left)]('onX');
}).on('click', '.onX', function () {
    $(this).removeClass('x onX').val('').focus();
    updatedata(valueKey, 0);
});


var srchid = [];
var vkey = [];
$("#searchvar").on("keyup", function search(e) {
    //if(e.keyCode == 8 ) {
    //d3.select("#tab1").selectAll("p")

    $("#tab1").children().popover('hide');
    //}
    var flag = 0;
    var k = 0;
    vkey = [];
    srchid = [];

    if ($(this).val() === '') {
        srchid = [];
        flag = 0;
        updatedata(valueKey, flag);
        return;
    }

    for (var i = 0; i < allNodes.length; i++) {
        if ((allNodes[i]["name"].indexOf($(this).val()) != -1)) {
            srchid[k] = i;

            k = k + 1;
        }
    }
    for (var i = 0; i < allNodes.length; i++) {
        if ((allNodes[i]["labl"].indexOf($(this).val()) != -1) && ($.inArray(i, srchid) == -1)) {

            srchid[k] = i;

            k = k + 1;
        }
    }

    //console.log(srchid);
    lngth = srchid.length;
    if (k == 0) {
        vkey = valueKey;

    }
    else {

        flag = 1;
        vkey = [];

        k = 0;
        var i = 0;
        for (i = 0; i < srchid.length; i++) {
            vkey[i] = valueKey[srchid[i]];

        }

        for (var j = 0; j < valueKey.length; j++) {

            if ($.inArray(valueKey[j], vkey) == -1) {
                vkey[i] = valueKey[j];
                i++;
            }

        }
    }


    updatedata(vkey, flag);

});

function updatedata(value, flag) {
    var clr = '#000000';

    var nodename = [];
    var bordercol = '#000000';
    var borderstyle = 'solid';
    for (var i = 0; i < nodes.length; i++) {
        nodename[i] = nodes[i].name;
    }

    d3.select("#tab1").selectAll("p").data(valueKey).remove();


    d3.select("#tab1").selectAll("p")
    //do something with this..

        .data(value)
        .enter()
        .append("p")
        .attr("id", function (d) {
            return d.replace(/\W/g, "_"); // replace non-alphanumerics for selection purposes
        }) // perhapse ensure this id is unique by adding '_' to the front?
        .text(function (d) {
            return d;
        })
        .style('background-color', function (d) {
            if ($.inArray(findNode(d).name, nodename) == -1) {
                return varColor;
            }

            else {
                return hexToRgba(selVarColor);
            }
        }).style('border-style', function (d) {
        if ($.inArray(findNodeIndex(d), srchid) != -1 && flag == 1) {
            return borderstyle;
        }
    })
        .style('border-color', function (d) {
            if ($.inArray(findNodeIndex(d), srchid) != -1 && flag == 1) {
                return bordercol;
            }
        })
        .attr("data-container", "body")
        .attr("data-toggle", "popover")
        .attr("data-trigger", "hover")
        .attr("data-placement", "right")
        .attr("data-html", "true")
        .attr("onmouseover", "$(this).popover('toggle');")
        .attr("onmouseout", "$(this).popover('toggle');")
        .attr("data-original-title", "Summary Statistics");


    fakeClick();

    $("#tab1").children().popover('hide');
    populatePopover();

    addlistener(nodes);


}


var circle = svg.append('svg:g').selectAll('g');
var path = svg.append('svg:g').selectAll('path');


// line displayed when dragging new nodes


//ROHIT BHATTACHARJEE
// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;
var force;


//kripanshu's explore work code
function layout(v) {


    var myValues = [];
    nodes = [];
    links = [];

    if (v === "add" | v === "move") {
        d3.select("#tab1").selectAll("p").style('background-color', varColor);

        for (var j = 0; j < zparams.zvars.length; j++) {
            var ii = findNodeIndex(zparams.zvars[j]);
            if (allNodes[ii].grayout) {
                continue;
            }
            nodes.push(allNodes[ii]);
            var selectMe = zparams.zvars[j].replace(/\W/g, "_");
            selectMe = "#".concat(selectMe);
            //console.log("select Me" + selectMe);
            d3.select(selectMe).style('background-color', function () {
                return hexToRgba(nodes[j].strokeColor);
            });

        }
//console.log("All nodes : "+ allNodes.name);
        for (var j = 0; j < zparams.zedges.length; j++) {
            var mysrc = nodeIndex(zparams.zedges[j][0]);
            var mytgt = nodeIndex(zparams.zedges[j][1]);
            links.push({source: nodes[mysrc], target: nodes[mytgt], left: false, right: true});
        }
        console.log("inside if,value of links:", links);
        //  tagColors(nodes, false);
        //  addlistener(nodes);
        //restart();
    }


    /*
     else if(v=="connect")
     {

     var string_check=[];

     //function to check the duplicate node
     function  nodesCheck(value1,value2)
     {
     var pair1=value1+value2;
     var pair2=value2+value1;
     var count=0;
     console.log("pair1 : "+ pair1);
     console.log("pair2 : "+ pair2);
     for(var k=0; k<string_check.length;k++)
     {
     if(string_check[k]==pair1){count++;}
     if(string_check[k]==pair2){count++;}
     }
     if(count==2 ){return false;}
     else {return true;}
     }
     links=[];

     // loops to add the all possible nodes to the links array
     for(var i=0;i<connect_nodes.length;i++)
     {
     for(var j=connect_nodes.length-1;j>0;j--)
     {
     string_check.push(i.toString()+j.toString());

     var val1=i.toString();
     var val2=j.toString();

     if(nodesCheck(val1,val2) && i!=j)
     {
     console.log("PAssed value : "+i.toString()+j.toString());
     links.push({source: connect_nodes[i], target: connect_nodes[j], left: false, right: true});
     }


     }
     }

     }
     else if(v=="disconnect")
     {}

     */
    else {
        if (allNodes.length > 2) {
            nodes = [allNodes[0], allNodes[1], allNodes[2]];
            links = [
                {source: nodes[1], target: nodes[0], left: false, right: true},
                {source: nodes[0], target: nodes[2], left: false, right: true}
            ];
        }
        else if (allNodes.length === 2) {
            nodes = [allNodes[0], allNodes[1]];
            links = [{source: nodes[1], target: nodes[0], left: false, right: true}];
        }
        else if (allNodes.length === 1) {
            nodes = [allNodes[0]];
        }
        else {
            alert("There are zero variables in the metadata.");
            return;
        }
        tagColors(nodes, false);
    }

    panelPlots(); // after nodes is populated, add subset and setx panels
    populatePopover(); // pipes in the summary stats shown on mouseovers
    // restart();


    //Rohit Bhattacharjee FORCE D3
    // init D3 force layout

    //var
    force = forced3layout(nodes, links, width, height, tick);
    // init D3 force layout
    //function forced3layout(var nodes, var links, var width, var height)
    //var force = d3.layout.force()
    //.nodes(nodes)
    //.links(links)
    //.size([width, height])
    //.linkDistance(150)
    //.charge(-800)
    //.on('tick',tick);  // .start() is important to initialize the layout


    //Rohit Bhattacharjee SVG
    //function svgappend()
    // define arrow markers for graph links
    svg.append('svg:defs').append('svg:marker')
        .attr('id', 'end-circle')
        .classed('circle_end', true)
        .attr('viewBox', '-6 -6 12 12')
        .attr('refX', 1)
        .attr('refY', 1)
        .attr('markerWidth', 4)
        .attr('markerHeight', 4)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M 0, 0  m -5, 0  a 5,5 0 1,0 10,0  a 5,5 0 1,0 -10,0')
        .style('fill', '#000');


    svg.append('svg:defs').append('svg:marker')
        .attr('id', 'start-circle')
        .classed('circle_start', true)
        .attr('viewBox', '-6 -6 12 12')
        .attr('refX', 1)
        .attr('refY', 1)
        .attr('markerWidth', 4)
        .attr('markerHeight', 4)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M 0, 0  m -5, 0  a 5,5 0 1,0 10,0  a 5,5 0 1,0 -10,0')
        .style('fill', '#000');

    // line displayed when dragging new nodes
    //   var
    drag_line = svg.append('svg:path')
        .attr('class', 'link dragline hidden')
        .attr('d', 'M0,0L0,0');

    // handles to link and node element groups
    // var
    path = svg.append('svg:g').selectAll('path');
    circle = svg.append('svg:g').selectAll('g');

    // mouse event vars
    //var
    selected_node = null,
        selected_link = null,
        mousedown_link = null,
        mousedown_node = null,
        mouseup_node = null;

    //ROHIT BHATTACHARJEE reset mouse
    //function
    resetMouseVars(); //{
    //    mousedown_node = null;
    //    mouseup_node = null;
    //    mousedown_link = null;
    //}

    //ROHIT BHATTACHARJEE TICK
    // update force layout (called automatically each iteration)
    //function tick() {
    //    // draw directed edges with proper padding from node centers
    //    path.attr('d', function(d) {
    //              var deltaX = d.target.x - d.source.x,
    //              deltaY = d.target.y - d.source.y,
    //              dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
    //              normX = deltaX / dist,
    //              normY = deltaY / dist,
    //              sourcePadding = d.left ? allR+5 : allR,
    //              targetPadding = d.right ? allR+5 : allR,
    //              sourceX = d.source.x + (sourcePadding * normX),
    //              sourceY = d.source.y + (sourcePadding * normY),
    //              targetX = d.target.x - (targetPadding * normX),
    //              targetY = d.target.y - (targetPadding * normY);
    //              return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
    //              });
    //
    //    //  if(forcetoggle){
    circle.attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
    });


    //
    //}
    //

    //  add listeners to leftpanel.left.  every time a variable is clicked, nodes updates and background color changes.  mouseover shows summary stats or model description.
    //Rohit BHATTACHARJEE add listener
    addlistener(nodes);
    //unction addlistener(){
    //d3.select("#tab1").selectAll("p")
    //.on("mouseover", function(d) {
    //    // REMOVED THIS TOOLTIP CODE AND MADE A BOOTSTRAP POPOVER COMPONENT
    //    $("body div.popover")
    //    .addClass("variables");
    //    $("body div.popover div.popover-content")
    //    .addClass("form-horizontal");
    //     })
    //.on("mouseout", function() {
    //    //Remove the tooltip
    //    //d3.select("#tooltip").style("display", "none");
    //    })
    //.on("click", function varClick(){
    //    if(allNodes[findNodeIndex(this.id)].grayout) {return null;}
    //
    //    d3.select(this)
    //    .style('background-color',function(d) {
    //           var myText = d3.select(this).text();
    //           var myColor = d3.select(this).style('background-color');
    //           var mySC = allNodes[findNodeIndex(myText)].strokeColor;
    //
    //           zparams.zvars = []; //empty the zvars array
    //           if(d3.rgb(myColor).toString() === varColor.toString()) { // we are adding a var
    //            if(nodes.length==0) {
    //                nodes.push(findNode(myText));
    //                nodes[0].reflexive=true;
    //            }
    //            else {nodes.push(findNode(myText));}
    //            return hexToRgba(selVarColor);
    //           }
    //           else { // dropping a variable
    //
    //                nodes.splice(findNode(myText)["index"], 1);
    //                spliceLinksForNode(findNode(myText));
    //
    //            if(mySC==dvColor) {
    //                var dvIndex = zparams.zdv.indexOf(myText);
    //                if (dvIndex > -1) { zparams.zdv.splice(dvIndex, 1); }
    //                //zparams.zdv="";
    //            }
    //            else if(mySC==csColor) {
    //                var csIndex = zparams.zcross.indexOf(myText);
    //                if (csIndex > -1) { zparams.zcross.splice(csIndex, 1); }
    //            }
    //            else if(mySC==timeColor) {
    //                var timeIndex = zparams.ztime.indexOf(myText);
    //                if (timeIndex > -1) { zparams.ztime.splice(timeIndex, 1); }
    //            }
    //           else if(mySC==nomColor) {
    //                var nomIndex = zparams.znom.indexOf(myText);
    //                if (nomIndex > -1) { zparams.znom.splice(dvIndex, 1); }
    //           }
    //
    //            nodeReset(allNodes[findNodeIndex(myText)]);
    //            borderState();
    //           legend();
    //            return varColor;
    //           }
    //           });
    //    panelPlots();
    //    restart();
    //    });
    //}
    //

    //var
    drag_line = svg.append('svg:path')
        .attr('class', 'link dragline hidden')
        .attr('d', 'M0,0L0,0')
    ;


    //
    d3.select("#univariate").selectAll("p") // univariate tab
        .on("mouseover", function (d) {
            // REMOVED THIS TOOLTIP CODE AND MADE A BOOTSTRAP POPOVER COMPONENT
            console.log("This model is selected")
        })
        .on("mouseout", function () {
            //Remove the tooltip
            //d3.select("#tooltip").style("display", "none");
        })
        //  d3.select("#Display_content")
        .on("click", function () {
            var myColor = d3.select(this).style('background-color');
            d3.select("#univariate").selectAll("p")
                .style('background-color', varColor);
            d3.select(this)
                .style('background-color', function (d) {
                    if (d3.rgb(myColor).toString() === varColor.toString()) {
                        zparams.zmodel = d.toString();
                        return hexToRgba(selVarColor);
                    }
                    else {
                        zparams.zmodel = "";
                        return varColor;
                    }
                });
            restart();
        });


    // update graph (called when needed)
    //restart();
    //ROHIT BHATTACHARJEE RESTART FUNCTION
    //end restart function

    //ROHIT BHATTACHARJEE MOUSE FUNCTIONS
    // function mousedown(d) {
    //     // prevent I-bar on drag
    //     d3.event.preventDefault();
    //
    //     // because :active only works in WebKit?
    //     svg.classed('active', true);
    //
    //     if(d3.event.ctrlKey || mousedown_node || mousedown_link) {
    //         return;
    //     }
    //
    //     restart();
    // }
    //
    // function mousemove(d) {
    //     if(!mousedown_node) return;
    //
    //     // update drag line
    //     drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
    // }
    //
    // function mouseup(d) {
    //     if(mousedown_node) {
    //         // hide drag line
    //         drag_line
    //         .classed('hidden', true)
    //         .style('marker-end', '');
    //     }
    //     // because :active only works in WebKit?
    //     svg.classed('active', false);
    //
    //     // clear mouse event vars
    //     resetMouseVars();
    // }


    // app starts here

    svg.attr('id', function () {
        return "whitespace".concat(myspace);
    })
        .attr('height', height)
        .on('mousedown', function () {
            mousedown(this);
        })
        .on('mouseup', function () {
            mouseup(this);
        });

    d3.select(window)
        .on('click', function () {  //NOTE: all clicks will bubble here unless event.stopPropagation()
            $('#transList').fadeOut(100);
            $('#transSel').fadeOut(100);
        });

    restart(); // this is the call the restart that initializes the force.layout()
    fakeClick();
} 		// end layout
//nodes
//console.log("nodes: "+nodes);


$(document).ready(function () {

    $("#btnSave").hide();
});

//Rohit BHATTACHARJEE circle
//KRIPANSHU BHARGAVA  code updated for circular ends and mouseover action on link
//circle = svg.append('svg:g').selectAll('g');
function restart() {
    // nodes.id is pegged to allNodes, i.e. the order in which variables are read in
    // nodes.index is floating and depends on updates to nodes.  a variables index changes when new variables are added.
    //var force=forced3layout(nodes, links,  width,  height, tick);

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    circle.call(force.drag);
    if (forcetoggle[0] === "true") {
        force.gravity(0.1);
        force.charge(-800);
        force.linkStrength(1);
        //  force.resume();

        //  circle
        //  .on('mousedown.drag', null)
        //  .on('touchstart.drag', null);
    }
    else {
        force.gravity(0);
        force.charge(0);
        force.linkStrength(0);
        //force.stop();
        //  force.resume();
    }
    force.resume();

    // path (link) group
    path = path.data(links);

    // update existing links
    // VJD: dashed links between pebbles are "selected". this is disabled for now
    path.classed('selected', function (d) {
        return;
    })//return d === selected_link; })
        .style('marker-start', function (d) {
            return d ? 'url(#start-circle)' : '';
        })
        .style('marker-end', function (d) {
            return d ? 'url(#end-circle)' : '';
        })
        .style('stroke-width', 2.5);


    // add new links
    path.enter().append('svg:path')
        .attr('class', 'link')
        .style('stroke-width', 2.5)
        .classed('selected', function (d) {
            return;
        })//return d === selected_link; })
        .style('marker-start', function (d) {
            return d ? 'url(#start-circle)' : '';
        })
        .style('marker-end', function (d) {
            return d ? 'url(#end-circle)' : '';
        })
        .on('mousedown', function (d) { // do we ever need to select a link? make it delete..
            var obj1 = JSON.stringify(d);
            for (var j = 0; j < links.length; j++) {
                if (obj1 === JSON.stringify(links[j])) {
                    links.splice(j, 1);
                }
            }
        })

        .on('mouseover', function (d) {
            //     if(!mousedown_node || d === mousedown_node) return;
            d3.select(this)
                .style('stroke', 'red')
                .style("cursor", "not-allowed")
                // Un-sets the "explicit" fill (might need to be null instead of '')
                .classed("active", true);

            /*  div.transition()
             .duration(200)
             .style("opacity", .9);
             div	.html("<span style='background-color: #d9534f ; padding:2px ; font-style: oblique' >Delete this link</span>")
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 28) + "px");
             //d3.select('#start-circle').style('fill','red');
             */


            // console.log("color is red")


        })

        .on('mouseout', function (d) {
            //    if(!mousedown_node || d === mousedown_node) return;
            // unenlarge target node
            //tooltip.style("visibility", "hidden");
            //    d3.select(this).attr('transform', '');
            d3.select(this)
                .style('stroke', '#000')
                .style("cursor", "pointer")
                // Un-sets the "explicit" fill (might need to be null instead of '')
                .classed("active", false);
            //  div.transition()
            //    .duration(500)
            //  .style("opacity", 0);
            // console.log("color was red")


        });

    d3.select('#start-circle')
        .on('mouseover', function (d) {
            //     if(!mousedown_node || d === mousedown_node) return;
            d3.select(this)
                .style('stroke', 'red')
                // Un-sets the "explicit" fill (might need to be null instead of '')
                .classed("active", true).style('cursor', 'wait')
            console.log("circle color is red");


        })
        .on('mouseout', function (d) {
            //    if(!mousedown_node || d === mousedown_node) return;
            // unenlarge target node
            //tooltip.style("visibility", "hidden");
            //    d3.select(this).attr('transform', '');
            d3.select(this)
                .style('stroke', '#000')
                // Un-sets the "explicit" fill (might need to be null instead of '')
                .classed("active", true)
            console.log("circle color was red")
        });

    // remove old links
    path.exit().remove();

    // circle (node) group
    circle = circle.data(nodes, function (d) {
        return d.id;
    });


    // update existing nodes (reflexive & selected visual states)
    //d3.rgb is the function adjusting the color here.
    circle.selectAll('circle')
        .classed('reflexive', function (d) {
            return d.reflexive;
        })
        .style('fill', function (d) {
            return d3.rgb(d.nodeCol);
            //return (d === selected_node) ? d3.rgb(d.nodeCol).brighter() : d3.rgb(d.nodeCol); // IF d is equal to selected_node return brighter color ELSE return normal color
        })
        .style('stroke', function (d) {
            return (d3.rgb(d.strokeColor));
        })
        .style('stroke-width', function (d) {
            return (d.strokeWidth);
        });

    // add new nodes

    var g = circle.enter()
        .append('svg:g')
        .attr("id", function (d) {
            var myname = d.name + "biggroup";
            return (myname);
        });

    // add plot
    g.each(function (d) {
        d3.select(this);
        if (d.plottype === "continuous") {
            densityNode(d, obj = this);
        }
        else if (d.plottype === "bar") {
            barsNode(d, obj = this);
        }
    });

    // add arc tags
    // NOTE: this block of code has been commented out to remove the "cross section" and "time series" arc tags. These tags are functioning as intended, but they do not, at present, do anything to change the statistical model or variables. To avoid confusion when using TwoRavens, they have been dropped. To add them back in, simply uncomment the block below.

    g.append("path")
        .attr("d", arc1)
        .attr("id", function (d) {
            return "timeArc".concat(d.id);
        })
        .style("fill", "yellow")
        .attr("fill-opacity", 0)
        .on('mouseover', function (d) {
            d3.select(this).transition().attr("fill-opacity", .3)
                .delay(0)
                .duration(100);   //.attr('transform', 'scale(2)');
            d3.select("#timeText".concat(d.id)).transition()
                .attr("fill-opacity", .9)
                .delay(0)
                .duration(100);
        })
        .on('mouseout', function (d) {
            d3.select(this).transition()
                .attr("fill-opacity", 0)
                .delay(100)
                .duration(500);
            d3.select("#timeText".concat(d.id)).transition()
                .attr("fill-opacity", 0)
                .delay(100)
                .duration(500);
        })
        .on('click', function (d) { //this event changes the all nodes time value

            setColors(d, timeColor);

            legend(timeColor);
            if (allNodes[findNodeIndex(d.name)].time === "no") {
                if (confirm("Do you want to tag this variable as a time variable?") == true) {
                    newallNodes = allNodes;


                    allNodes[findNodeIndex(d.name)].time = "yes";


                    if (allNodes === newallNodes) {

                        $("#btnSave").show();
                    }
                    else
                        console.log("False");

                }
                else ("dont tag it");
            }
            else {

                if (confirm("This Variable is tagged as a time variable. Do you want to untag it?") == true) {
                    newallNodes = allNodes;


                    allNodes[findNodeIndex(d.name)].time = "no";


                    if (allNodes === newallNodes) {

                        $("#btnSave").show();
                    }
                    else
                        console.log("False");

                }
                else ("dont tag it");

            }

            restart();

        });
    g.append("text")
        .attr("id", function (d) {
            return "timeText".concat(d.id);
        })
        .attr("x", 6)
        .attr("dy", 11.5)
        .attr("fill-opacity", 0)
        .append("textPath")
        .attr("xlink:href", function (d) {
            return "#timeArc".concat(d.id);
        })
        .text("Time");


    /*
     g.append("path")
     .attr("id", function(d){
     return "csArc".concat(d.id);
     })
     .attr("d", arc2)
     .style("fill", csColor)
     .attr("fill-opacity", 0)
     .on('mouseover', function(d){
     d3.select(this).transition()
     .attr("fill-opacity", .3)
     .delay(0)
     .duration(100);
     d3.select("#csText".concat(d.id)).transition()
     .attr("fill-opacity", .9)
     .delay(0)
     .duration(100);
     })
     .on('mouseout', function(d){
     d3.select(this).transition()
     .attr("fill-opacity", 0)
     .delay(100)
     .duration(500);
     d3.select("#csText".concat(d.id)).transition()
     .attr("fill-opacity", 0)
     .delay(100)
     .duration(500);
     })
     .on('click', function(d){
     setColors(d, csColor);
     legend(csColor);
     restart();
     });
     g.append("text")
     .attr("id", function(d){
     return "csText".concat(d.id);
     })
     .attr("x", 6)
     .attr("dy", 11.5)
     .attr("fill-opacity", 0)
     .append("textPath")
     .attr("xlink:href", function(d){
     return "#csArc".concat(d.id);
     })
     .text("Cross Sec");
     */

    g.append("path")
        .attr("id", function (d) {
            return "dvArc".concat(d.id);
        })
        .attr("d", arc3)
        .style("fill", dvColor)
        .attr("fill-opacity", 0)
        .on('mouseover', function (d) {
            d3.select(this).transition().attr("fill-opacity", .3)
                .delay(0)
                .duration(100);
            d3.select("#dvText".concat(d.id)).transition().attr("fill-opacity", .9)
                .delay(0)
                .duration(100);
        })
        .on('mouseout', function (d) {
            d3.select(this).transition().attr("fill-opacity", 0)
                .delay(100)
                .duration(500);
            d3.select("#dvText".concat(d.id)).transition().attr("fill-opacity", 0)
                .delay(100)
                .duration(500);
        })
        .on('click', function (d) {
            setColors(d, dvColor);
            legend(dvColor);
            restart();
        });
    g.append("text")
        .attr("id", function (d) {
            return "dvText".concat(d.id);
        })
        .attr("x", 6)
        .attr("dy", 11.5)
        .attr("fill-opacity", 0)
        .append("textPath")
        .attr("xlink:href", function (d) {
            return "#dvArc".concat(d.id);
        })
        .text("Dep Var");

    g.append("path")
        .attr("id", function (d) {
            return "nomArc".concat(d.id);
        })
        .attr("d", arc4)
        .style("fill", nomColor)
        .attr("fill-opacity", 0)
        .on('mouseover', function (d) {
            if (d.defaultNumchar == "character") {
                return;
            }
            d3.select(this).transition().attr("fill-opacity", .3)
                .delay(0)
                .duration(100);
            d3.select("#nomText".concat(d.id)).transition().attr("fill-opacity", .9)
                .delay(0)
                .duration(100);
        })
        .on('mouseout', function (d) {
            if (d.defaultNumchar == "character") {
                return;
            }
            d3.select(this).transition().attr("fill-opacity", 0)
                .delay(100)
                .duration(500);
            d3.select("#nomText".concat(d.id)).transition().attr("fill-opacity", 0)
                .delay(100)
                .duration(500);
        })
        .on('click', function (d) {
            if (d.defaultNumchar == "character") {
                return;
            }
            else if (d.defaultNumchar == "numeric" && d.nature != "nominal") {
                if (confirm("Do you want to tag this variable as a nominal?") == true) {
                    setColors(d, nomColor);
                    allNodes[findNodeIndex(d.name)].nature = "nominal";
                    $("#btnSave").show();


                }
                else ("dont tag it");

            }
            else if (d.defaultNumchar == "numeric" && d.nature == "nominal") {
                if (confirm("This variable is tagged as a nominal variable. Do you want to untag it?") == true) {
                    setColors(d, nomColor);
                    allNodes[findNodeIndex(d.name)].nature = "ordinal";
                    $("#btnSave").show();


                }
                else ("dont tag it")

            }

            legend(nomColor);
            restart();
        });
    g.append("text")
        .attr("id", function (d) {
            return "nomText".concat(d.id);
        })
        .attr("x", 6)
        .attr("dy", 11.5)
        .attr("fill-opacity", 0)
        .append("textPath")
        .attr("xlink:href", function (d) {
            return "#nomArc".concat(d.id);
        })
        .text("Nominal");

    g.append('svg:circle')
        .attr('class', 'node')
        .attr('r', allR)
        .style('pointer-events', 'inherit')
        .style('fill', function (d) {
            //      return (d === selected_node) ? d3.rgb(d.nodeCol).brighter().toString() : d.nodeCol; })
            return d.nodeCol;
        })
        .style('opacity', "0.5")
        .style('stroke', function (d) {
            return d3.rgb(d.strokeColor).toString();
        })
        .classed('reflexive', function (d) {
            return d.reflexive;
        })
        .on('mouseover', function (d) {
            //     if(!mousedown_node || d === mousedown_node) return;
        })
        .on('mouseout', function (d) {
            //    if(!mousedown_node || d === mousedown_node) return;
            // unenlarge target node
            //tooltip.style("visibility", "hidden");
            //    d3.select(this).attr('transform', '');
        })
        //      .on('mousedown', function(d) {
        //         })
        .on('dblclick', function (d) {
            d3.event.stopPropagation(); // stop click from bubbling
            summaryHold = true;
//            document.getElementById('transformations').setAttribute("style", "display:block");
        })
        .on('contextmenu', function (d) { // right click on node
            d3.event.preventDefault();
            d3.event.stopPropagation(); // stop right click from bubbling
            rightClickLast = true;

            mousedown_node = d;
            if (mousedown_node === selected_node) selected_node = null;
            else selected_node = mousedown_node;
            selected_link = null;

            // reposition drag line
            drag_line
                .style('marker-end', 'url(#end-circle)')
                .classed('hidden', false)
                .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

            svg.on('mousemove', mousemove);
            restart();
        })
        .on('mouseup', function (d) {
            d3.event.stopPropagation(); // stop mouseup from bubbling

            if (rightClickLast) {
                rightClickLast = false;
                return;
            }

            if (!mousedown_node) return;

            // needed by FF
            drag_line
                .classed('hidden', true)
                .style('marker-end', '');

            // check for drag-to-self
            mouseup_node = d;
            if (mouseup_node === mousedown_node) {
                resetMouseVars();
                return;
            }

            // unenlarge target node
            d3.select(this).attr('transform', '');

            // add link to graph (update if exists)
            // NB: links are strictly source < target; arrows separately specified by booleans
            var source, target, direction;
            if (mousedown_node.id < mouseup_node.id) {
                source = mousedown_node;
                target = mouseup_node;
                direction = 'right';
            } else {
                source = mouseup_node;
                target = mousedown_node;
                direction = 'left';
            }

            var link;
            link = links.filter(function (l) {
                return (l.source === source && l.target === target);
            })[0];
            if (link) {
                link[direction] = true;
            } else {
                link = {source: source, target: target, left: false, right: false};
                link[direction] = true;
                links.push(link);
            }

            // select new link
            selected_link = link;
            selected_node = null;
            svg.on('mousemove', null);

            resetMouseVars();
            restart();
            //forced3layout(nodes, links,  width,  height, tick);

        });


    // show node Names
    g.append('svg:text')
        .attr('x', 0)
        .attr('y', 15)
        .attr('class', 'id')
        .text(function (d) {
            return d.name;
        });


    // show summary stats on mouseover
    // SVG doesn't support text wrapping, use html instead
    g.selectAll("circle.node")
        .on("mouseover", function (d) {
            tabLeft("tab3");
            varSummary(d);
            document.getElementById('transformations').setAttribute("style", "display:block");
            var select = document.getElementById("transSel");
            select.selectedIndex = d.id;
            transformVar = valueKey[d.id];

            d3.select("#dvArc".concat(d.id)).transition().attr("fill-opacity", .1)
                .delay(0)
                .duration(100);
            d3.select("#dvText".concat(d.id)).transition().attr("fill-opacity", .5)
                .delay(0)
                .duration(100);
            if (d.defaultNumchar == "numeric") {
                d3.select("#nomArc".concat(d.id)).transition().attr("fill-opacity", .1)
                    .delay(0)
                    .duration(100);
                d3.select("#nomText".concat(d.id)).transition().attr("fill-opacity", .5)
                    .delay(0)
                    .duration(100);
            }
            d3.select("#csArc".concat(d.id)).transition().attr("fill-opacity", .1)
                .delay(0)
                .duration(100);
            d3.select("#csText".concat(d.id)).transition().attr("fill-opacity", .5)
                .delay(0)
                .duration(100);
            d3.select("#timeArc".concat(d.id)).transition().attr("fill-opacity", .1)
                .delay(0)
                .duration(100);
            d3.select("#timeText".concat(d.id)).transition().attr("fill-opacity", .5)
                .delay(0)
                .duration(100);
        })
        // popup(d, xPos, yPos);

        .on("mouseout", function (d) {
            if (summaryHold === false) {
                tabLeft(lefttab);
            }

            d3.select("#csArc".concat(d.id)).transition()
                .attr("fill-opacity", 0)
                .delay(100)
                .duration(500);
            d3.select("#csText".concat(d.id)).transition()
                .attr("fill-opacity", 0)
                .delay(100)
                .duration(500);
            d3.select("#timeArc".concat(d.id)).transition()
                .attr("fill-opacity", 0)
                .delay(100)
                .duration(500);
            d3.select("#timeText".concat(d.id)).transition()
                .attr("fill-opacity", 0)
                .delay(100)
                .duration(500);
            d3.select("#dvArc".concat(d.id)).transition()
                .attr("fill-opacity", 0)
                .delay(100)
                .duration(500);
            d3.select("#dvText".concat(d.id)).transition()
                .attr("fill-opacity", 0)
                .delay(100)
                .duration(500);
            d3.select("#nomArc".concat(d.id)).transition()
                .attr("fill-opacity", 0)
                .delay(100)
                .duration(500);
            d3.select("#nomText".concat(d.id)).transition()
                .attr("fill-opacity", 0)
                .delay(100)
                .duration(500);


        });

    // populating transformation dropdown
    var t = [];
    for (var j = 0; j < nodes.length; j++) {
        t.push(nodes[j].name);
    }

    // the transformation variable list is silently updated as pebbles are added/removed
    d3.select("#transSel")
        .selectAll('li')
        .remove();

    d3.select("#transSel")
        .selectAll('li')
        .data(t) //set to variables in model space as they're added
        .enter()
        .append("li")
        .text(function (d) {
            return d;
        });

    $('#transSel li').click(function (event) {

        // if 'interaction' is the selected function, don't show the function list again
        if (selInteract === true) {
            var n = $('#tInput').val().concat($(this).text());
            $('#tInput').val(n);
            event.stopPropagation();
            var t = transParse(n = n);
            if (t === null) {
                return;
            }
            $(this).parent().fadeOut(100);
            transform(n = t.slice(0, t.length - 1), t = t[t.length - 1], typeTransform = false);
            return;
        }

        $('#tInput').val($(this).text());
        $(this).parent().fadeOut(100);
        $('#transList').fadeIn(100);
        event.stopPropagation();
    });

    // remove old nodes
    circle.exit().remove();
    force.start();
}


//Rohit BHATTACHARJEE TICK
//KRIPANSHU BHARGAVA NODE'S END CHANGES(EXPLORE APP)
// update force layout (called automatically each iteration)
function tick() {
    // get mouse pointer coordinates

    var Xs = 0, Xt = 0, Ys = 0, Yt = 0;
    // draw directed edges with proper padding from node centers
    path.attr('d', function (d) {
        var deltaX = d.target.x - d.source.x,
            deltaY = d.target.y - d.source.y,
            dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
            normX = deltaX / dist,
            normY = deltaY / dist,
            sourcePadding = d ? allR + 5 : allR,
            targetPadding = d ? allR + 5 : allR,
            sourceX = d.source.x + (sourcePadding * normX) + 1,
            sourceY = d.source.y + (sourcePadding * normY) + 1,
            targetX = d.target.x - (targetPadding * normX) + 2,
            targetY = d.target.y - (targetPadding * normY) + 2;
        return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
    })
        .on('mouseover', function (d) {
            Xs = d.source.x;
            Xt = d.target.x;
            Ys = d.source.y;
            Yt = d.target.y;


            d3.select(this)
                .style('stroke', 'red')
                .style("cursor", "not-allowed")
                // Un-sets the "explicit" fill (might need to be null instead of '')
                .classed("active", true);

            /*  div.transition()
             .duration(200)
             .style("opacity", .9);
             div	.html("<span style='background-color: #d9534f ; padding:2px ; font-style: oblique' >Delete this link</span>")
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 28) + "px");
             //d3.select('#start-circle').style('fill','red');
             */


            console.log("color is red, main function")


        })

        .on('mouseout', function (d) {
            //    if(!mousedown_node || d === mousedown_node) return;
            // unenlarge target node
            //tooltip.style("visibility", "hidden");
            //    d3.select(this).attr('transform', '');
            d3.select(this)
                .style('stroke', '#000')
                .style("cursor", "pointer")
                // Un-sets the "explicit" fill (might need to be null instead of '')
                .classed("active", false);
            //  div.transition()
            //    .duration(500)
            //  .style("opacity", 0);
            console.log("color was red")


        });


    //  if(forcetoggle){
    circle.attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
    });
    //  };


}


//ROHIT BHATTACHARJEE Write to JSON Function, to write new metadata file after the user has tagged a variable as a time variable
function writetojson(btn) {

    //var jsonallnodes=JSON.stringify(allNodes);

    var outtypes = [];
    for (var j = 0; j < allNodes.length; j++) {
        outtypes.push({
            varnamesTypes: allNodes[j].name,
            nature: allNodes[j].nature,
            numchar: allNodes[j].numchar,
            binary: allNodes[j].binary,
            interval: allNodes[j].interval,
            time: allNodes[j].time
        });
    }

    // console.log("Outtypes:"+outtypes);
    writeout = {outtypes: outtypes}
    writeoutjson = JSON.stringify(writeout);
    //console.log(jsonallnodes);
    urlcall = rappURL + "writeapp";

    //base.concat(jsonout);
    function cleanstring(s) {
        s = s.replace(/\&/g, "and");
        s = s.replace(/\;/g, ",");
        s = s.replace(/\%/g, "-");
        return s;
    }

    var properjson = cleanstring(writeoutjson);

    var solajsonout = "solaJSON=" + properjson;

//console.log(properjson);

    function writesuccess(btn, json) {

        selectLadda.stop();
        // $("#btnVariables").trigger("click"); // programmatic clicks
        //  $("#btnUnivariate").trigger("click");
        $('#btnSave').hide();


    }

    function writefail(btn) {
        selectLadda.stop();

    }

    selectLadda.start();

//console.log("inside write json length:"+solajsonout.length);
    makeCorsRequest(urlcall, btn, writesuccess, writefail, solajsonout);


}

//end of write to json

var drag_line = svg.append('svg:path')
    .attr('class', 'link dragline hidden')
    .attr('d', 'M0,0L0,0');

function mousedown(d) {
    // prevent I-bar on drag
    d3.event.preventDefault();

    // because :active only works in WebKit?
    svg.classed('active', true);

    if (d3.event.ctrlKey || mousedown_node || mousedown_link) {
        return;
    }

    restart();
}

function mousemove(d) {
    if (!mousedown_node) return;

    // update drag line
    drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
}

function mouseup(d) {
    if (mousedown_node) {
        // hide drag line
        drag_line
            .classed('hidden', true)
            .style('marker-end', '');
    }
    // because :active only works in WebKit?
    //svg.classed('active', false);

    // clear mouse event vars
    resetMouseVars();
}


//ROHIT Bhattacharjee
// init D3 force layout
function forced3layout(nodes, links, width, height, tick) {
    var force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .size([width, height])
        .linkDistance(150)
        .charge(-800)
        .on('tick', tick);  // .start() is important to initialize the layout

    return force;
}

function resetMouseVars() {
    mousedown_node = null;
    mouseup_node = null;
    mousedown_link = null;
}

//ROHIT BHATTACHARJEE ad listener function
function addlistener(nodes) {
    d3.select("#tab1").selectAll("p")
        .on("mouseover", function (d) {

            // REMOVED THIS TOOLTIP CODE AND MADE A BOOTSTRAP POPOVER COMPONENT
            $("body div.popover")
                .addClass("variables");
            $("body div.popover div.popover-content")
                .addClass("form-horizontal");
        })
        .on("mouseout", function () {

            //Remove the tooltip
            //d3.select("#tooltip").style("display", "none");
        })


        .on("click", function varClick() {
            if (allNodes[findNodeIndex(this.id)].grayout) {
                return null;
            }

            d3.select(this)
                .style('background-color', function (d) {
                    var myText = d3.select(this).text();
                    var myColor = d3.select(this).style('background-color');
                    var mySC = allNodes[findNodeIndex(myText)].strokeColor;
                    var myNode = allNodes[findNodeIndex(this.id)];

                    //console.log("inside SC wala if");
                    //	SC=timeColor;

                    zparams.zvars = []; //empty the zvars array
                    if (d3.rgb(myColor).toString() === varColor.toString()) {	// we are adding a var

                        if (nodes.length == 0) {
                            nodes.push(findNode(myText));
                            nodes[0].reflexive = true;
                        }

                        else {
                            nodes.push(findNode(myText));
                        }

                        if (myNode.time === "yes") {
                            tagColors(myNode, timeColor);
                            return hexToRgba(timeColor);
                        }
                        else if (myNode.nature === "nominal") {
                            tagColors(myNode, nomColor);
                            return hexToRgba(nomColor);
                        }
                        else {
                            return hexToRgba(selVarColor);
                        }

                    }
                    else { // dropping a variable

                        nodes.splice(findNode(myText)["index"], 1);
                        spliceLinksForNode(findNode(myText));

                        if (mySC == dvColor) {
                            var dvIndex = zparams.zdv.indexOf(myText);
                            if (dvIndex > -1) {
                                zparams.zdv.splice(dvIndex, 1);
                            }
                            //zparams.zdv="";
                        }
                        else if (mySC == csColor) {
                            var csIndex = zparams.zcross.indexOf(myText);
                            if (csIndex > -1) {
                                zparams.zcross.splice(csIndex, 1);
                            }
                        }
                        else if (mySC == timeColor) {
                            //console.log("entering some if");
                            var timeIndex = zparams.ztime.indexOf(myText);
                            //console.log("Timeindex=",timeIndex);
                            if (timeIndex > -1) {
                                zparams.ztime.splice(timeIndex, 1);
                            }
                        }
                        else if (mySC == nomColor) {
                            var nomIndex = zparams.znom.indexOf(myText);
                            if (nomIndex > -1) {
                                zparams.znom.splice(dvIndex, 1);
                            }
                        }

                        // nodeReset(allNodes[findNodeIndex(myText)]);
                        borderState();
                        legend();
                        return varColor;
                    }
                });

            panelPlots();
            restart();
        });
}

//console.log("Search ID at start: "+srchid);


// returns id
var findNodeIndex = function (nodeName) {
    for (var i in allNodes) {
        if (allNodes[i]["name"] === nodeName) {
            return allNodes[i]["id"];
        }

    }
    ;
}

var nodeIndex = function (nodeName) {
    for (var i in nodes) {
        if (nodes[i]["name"] === nodeName) {
            return i;
        }
    }
}

var findNode = function (nodeName) {
    for (var i in allNodes) {
        if (allNodes[i]["name"] === nodeName) return allNodes[i]
    }
    ;
}


// function called by force button
function forceSwitch() {
    if (forcetoggle[0] === "true") {
        forcetoggle = ["false"];
    }
    else {
        forcetoggle = ["true"]
    }

    if (forcetoggle[0] === "false") {
        document.getElementById('btnForce').setAttribute("class", "btn active");
    }
    else {
        document.getElementById('btnForce').setAttribute("class", "btn btn-default");
        fakeClick();
    }
}


function spliceLinksForNode(node) {
    var toSplice = links.filter(function (l) {
        return (l.source === node || l.target === node);
    });
    toSplice.map(function (l) {
        links.splice(links.indexOf(l), 1);
    });
}

function zPop() {
    if (dataurl) {
        zparams.zdataurl = dataurl;
    }

    zparams.zmodelcount = modelCount;

    zparams.zedges = [];
    zparams.zvars = [];
    zparams.znature = [];

    for (var j = 0; j < nodes.length; j++) { //populate zvars array
        zparams.zvars.push(nodes[j].name);
        zparams.znature.push(nodes[j].nature);
        var temp = nodes[j].id;
        //var temp = findNodeIndex(nodes[j].name);
        //  console.log("node ",nodes[j].name);
        // console.log("temp ", temp);

        zparams.zsetx[j] = allNodes[temp].setxvals;
        zparams.zsubset[j] = allNodes[temp].subsetrange;
    }

    for (var j = 0; j < links.length; j++) { //populate zedges array
        var srctgt = [];
        //correct the source target ordering for Zelig
        if (links[j].left === false) {
            srctgt = [links[j].source.name, links[j].target.name];
        }
        else {
            srctgt = [links[j].target.name, links[j].source.name];
        }
        zparams.zedges.push(srctgt);
    }
}

function estimate(btn) {
    console.log("Estimate method called");
    if (production && zparams.zsessionid == "") {
        alert("Warning: Data download is not complete. Try again soon.");
        return;
    }

    zPop();
    // write links to file & run R CMD

    //package the output as JSON
    // add call history and package the zparams object as JSON
    zparams.callHistory = callHistory;
    var jsonout = JSON.stringify(zparams);

    //var base = rappURL+"zeligapp?solaJSON="
    urlcall = rappURL + "zeligapp"; //base.concat(jsonout);
    var solajsonout = "solaJSON=" + jsonout;
    //console.log("urlcall out: ", urlcall);
    //console.log("POST out: ", solajsonout);


    zparams.allVars = valueKey.slice(10, 25); // this is because the URL is too long...
    var jsonout = JSON.stringify(zparams);
    //var selectorBase = rappURL+"selectorapp?solaJSON=";
    var selectorurlcall = rappURL + "selectorapp"; //.concat(jsonout);


    function estimateSuccess(btn, json) {
        console.log("EstimateSuccess method called");
        estimateLadda.stop();  // stop spinner
        allResults.push(json);
        json_data_explore = json;
        console.log("all results" + allResults);
        //console.log("json in: ", json);
        console.log("json explore", json_data_explore);

        var myparent = document.getElementById("rightContentArea");
        if (estimated == false) {
            myparent.removeChild(document.getElementById("resultsHolder"));
        }

        estimated = true;
         d3.select("#left_thumbnail")
         .style("display", "block");
        d3.select("#result_left")
            .style("display", "block");
        d3.select("#result_left1")
            .style("display", "block");
        d3.select("#result_right")
            .style("display", "block");

        /* d3.select("#resultsView")
         .style("display", "block");
         */
        // d3.select("#scatterplot")
        //     .style("display", "block");
        // d3.select("#heatchart")
        //     .style("display", "block");
        d3.select("#modelView")
            .style("display", "block");

        d3.select("#resultsView_tabular")
            .style("display", "block");

        d3.select("#plotA")
            .style("display", "block");

        d3.select("#plotB")
            .style("display", "block");
        d3.select("#SelectionData")
            .style("display", "block");
        d3.select("#resultsView_statistics")
            .style("display", "block");


        // programmatic click on Results button
        $("#btnBivariate").trigger("click");


        modelCount = modelCount + 1;
        var model = "Model".concat(modelCount);

        function modCol() {
            d3.select("#modelView")
                .selectAll("p")
                .style('background-color', hexToRgba(varColor));
        }

        modCol();

        d3.select("#modelView")
            .insert("p", ":first-child") // top stack for results
            .attr("id", model)
            .text(model)
            .style('background-color', hexToRgba(selVarColor))
            .on("click", function () {
                var a = this.style.backgroundColor.replace(/\s*/g, "");
                var b = hexToRgba(selVarColor).replace(/\s*/g, "");
                if (a.substr(0, 17) === b.substr(0, 17)) {
                    return; //escapes the function early if the displayed model is clicked
                }
                modCol();
                d3.select(this)
                    .style('background-color', hexToRgba(selVarColor));
                viz(this.id);
            });

        var rCall = [];
        rCall[0] = json.call;
        logArray.push("estimate: ".concat(rCall[0]));
        showLog();

        viz(model);
    }

    function estimateFail(btn) {
        estimateLadda.stop();  // stop spinner
        estimated = true;
    }

    function selectorSuccess(btn, json) {
        d3.select("#ticker")
            .text("Suggested variables and percent improvement on RMSE: " + json.vars);
        // console.log("selectorSuccess: ", json);
    }

    function selectorFail(btn) {
        alert("Selector Fail");
    }

    estimateLadda.start();  // start spinner
    makeCorsRequest(urlcall, btn, estimateSuccess, estimateFail, solajsonout);
    //makeCorsRequest(selectorurlcall, btn, selectorSuccess, selectorFail, solajsonout);


}

// This is the main function for explore app
function explore(btn) {
    console.log("Explore method called");
    if (production && zparams.zsessionid == "") {
        alert("Warning: Data download is not complete. Try again soon.");
        return;
    }
    //  console.log("Explore method called");
    zPop();
    console.log("zpop: ", zparams);
    // write links to file & run R CMD

    //package the output as JSON
    // add call history and package the zparams object as JSON
    zparams.callHistory = callHistory;
    var jsonout = JSON.stringify(zparams);

    //var base = rappURL+"zeligapp?solaJSON="
    urlcall = rappURL + "exploreapp"; //base.concat(jsonout);
    var solajsonout = "solaJSON=" + jsonout;
    //console.log("urlcall out: ", urlcall);
    console.log("POST out: ", solajsonout);

   // var jsonout = JSON.stringify(zparams);
//console.log("This is the url call");
//console.log(urlcall);
    // explore success method
    function exploreSuccess(btn, json) {
        console.log("ExploreSuccess method called");
        estimateLadda.stop();  // stop spinner
        allResults.push(json);
        var json_explore = json;
        //     console.log("the allResults is : " +allResults);
        console.log("json in for explore: ", json);


        var myparent = document.getElementById("rightContentArea");
        if (estimated == false) {
            myparent.removeChild(document.getElementById("resultsHolder"));
        }
        d3.select("#modelView").html("");
        //   d3.select("#resultsView_tabular").html("");
        d3.select("#resultsView_statistics").html("");

        estimated = true;
        //  d3.select("#results")
        // .style("display", "block");
        d3.select("#left_thumbnail")
            .style("display", "block");
        d3.select("#result_left")
            .style("display", "block");
        d3.select("#result_left1")
            .style("display", "block");
        d3.select("#result_right")
            .style("display", "block");
        /*
         d3.select("#resultsView")
         .style("display", "block");
         */
        // d3.select("#scatterplot")
        //     .style("display", "block");
        // d3.select("#heatchart")
        //     .style("display", "block");
        d3.select("#modelView_Container")
            .style("display", "block");

        d3.select("#modelView")

            .style("display", "block");

        d3.select("#resultsView_tabular")
            .style("display", "block");

        d3.select("#plotA")
            .style("display", "block");

        d3.select("#plotB")
            .style("display", "block");
        d3.select("#SelectionData")
            .style("display", "block");

        d3.select("#resultsView_statistics")
            .style("display", "block");

        d3.select("#modelView")
            .style('background-color', hexToRgba(varColor))
            .style("overflow-y", "hidden")
            .style("overflow-x", "scroll")
            .append("span")
            .style("white-space", "pre")
            .style("margin-top", 0)
            .style("float", "left")
            .style("position", "relative")
            .style("color", "#757575")
            .text("MODEL SELECTION :  ");


        // programmatic click on Results button
        $("#btnBivariate").trigger("click");
        var count = 0;
        var count1 = -1;
        for (var i in json_explore.images) {
            count1++;
        }
        for (var i in json_explore.images) {
            // console.log("this is data : " + i)
            var value = i;
            //    console.log("This is the model name : " + value);

            model_selection(value, count); // for entering all the variables
            count++;
        }
        modelCount = modelCount + 1;
        var model = "Model".concat(modelCount);
        var model_name = value;
        console.log(" and our value is  : " + count1);

        function modCol() {
            d3.select("#modelView")
                .selectAll("button")
                .style('background-color', "#FFD54F");
        }


        //    modCol();
        function model_selection(model_selection_name, count_value) {

            if (count_value % 2 == 0 && count_value != 0) {
                d3.select("#modelView")
                    .append("span")
                    .text("\u00A0 \u00A0 \u00A0 \u00A0   \u00A0 ")
                    .style("margin-top", 0)
                    .style("white-space", "pre")
                    .style("display", "inline-block")
                    .style("float", "left")
                    .append("span")
                    .text("|")
                    .style("margin-top", 0)
                    .style("white-space", "pre")
                    .style("display", "inline-block")
                    .style("float", "left")
                    .append("span")
                    .text("\u00A0 \u00A0 \u00A0 \u00A0   \u00A0 ")
                    .style("margin-top", 0)
                    .style("white-space", "pre")
                    .style("display", "inline-block")
                    .style("float", "left")

            }
            d3.select("#modelView")
                .append("span")
                .text(" \u00A0")
                .style("margin-top", 0)
                .style("float", "left")

                .style("display", "inline-block")
                .style("white-space", "pre")
                .style("overflow-y", "hidden")
                .style("overflow-x", "scroll")
                .append("button")// top stack for results
              //      .append("xhtml:button")
                .attr("class","btn btn-outline-success")
                .style("padding","4px")
                .attr("id", model)
                .text(model_selection_name)
                .style('background-color', function () {
                    var color1 = "#FFD54F";
//console.log(" the count values are : "+ count + " and "+ count1);
                    if (count == count1) {
                        //console.log("Color has changed epppiii");
                        return selVarColor;
                    }
                    else {
                        // console.log("Color has changed as epppiii");
                        return color1;
                    }
                })
                .style("display", "inline-block")
                .style("white-space", "pre")
                .style("margin-top", 0)
                .style("float", "left")
                .on("click", function () {

                    var a = this.style.backgroundColor.replace(/\s*/g, "");
                    var b = hexToRgba(selVarColor).replace(/\s*/g, "");
                    if (a.substr(0, 17) === b.substr(0, 17)) {
                        return; //escapes the function early if the displayed model is clicked
                    }
                    viz_explore(this.id, json_explore, model_selection_name);
                    modCol();
                    d3.select(this)
                        .style('background-color', selVarColor);
                    // console.log("json explore viz first",json_explore );
                })
            ;
        }

        var rCall = [];
        rCall[0] = json.call;
        logArray.push("explore: ".concat(rCall[0]));
        showLog();
        //   console.log("json explore viz second",json_explore );
        viz_explore(model, json_explore, model_name);
    }

    function exploreFail(btn) {
        estimateLadda.stop();  // stop spinner
        estimated = true;
    }


    estimateLadda.start();  // start spinner
    makeCorsRequest(urlcall, btn, exploreSuccess, exploreFail, solajsonout);

}


function dataDownload() {
    console.log("dataDownload method called");
    zPop();
    // write links to file & run R CMD

    //package the output as JSON
    // add call history and package the zparams object as JSON
    //console.log("inside datadownload, zparams= ",zparams);
    zparams.zmetadataurl = metadataurl;
   // zparams.zusername = username;
    var jsonout = JSON.stringify(zparams);
    var btn = "nobutton";

    //var base = rappURL+"zeligapp?solaJSON="
    urlcall = rappURL + "dataapp"; //base.concat(jsonout);
    var solajsonout = "solaJSON=" + jsonout;
    //console.log("urlcall out: ", urlcall);
    // console.log("POST out: ", solajsonout);

    function downloadSuccess(btn, json) {
        console.log("DownloadSuccess method called");
        //  json_data_explore.push(json);
        //console.log("dataDownload json in: ", json);
        // console.log("json explore",json_data_explore );
        zparams.zsessionid = json.sessionid[0];

        // set the link URL
        if (production) {
            var logURL = rappURL + "log_dir/log_" + zparams.zsessionid + ".txt";
            document.getElementById("logID").href = logURL;
        }
        else {
            var logURL = "rook/log_" + zparams.zsessionid + ".txt";
            document.getElementById("logID").href = logURL;
        }

    }

    function downloadFail(btn) {
        console.log("Data have not been downloaded");
    }

    makeCorsRequest(urlcall, btn, downloadSuccess, downloadFail, solajsonout);
}


function viz(m) {
    console.log("Viz method called");
    var mym = +m.substr(5, 5) - 1;

    function removeKids(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    var myparent = document.getElementById("resultsView");
    removeKids(myparent);

    var json = allResults[mym];

    // pipe in figures to right panel
    var filelist = new Array;

    /*  var resultsView_content=d3.select("#resultsView").append("svg");
     var g = resultsView_content.append("g");
     var img1=  g.append("svg:image")
     .attr("xlink:href",json.images[i])
     .attr("width", 200)
     .attr("height", 200)
     ;
     */
    for (var i in json.images) {


        var zfig = document.createElement("img");
        zfig.setAttribute("src", json.images[i]);
        zfig.setAttribute('width', 200);
        zfig.setAttribute('height', 200);


        document.getElementById("resultsView").appendChild(zfig);

        d3.select("#resultView").style("background-color", "#F3E5F5").style("z-index", 16).style("box-shadow", " 10px 10px grey;");
    }
    // var rCall = [];
    // rCall[0] = json.call;
    // logArray.push("estimate: ".concat(rCall[0]));
    // showLog();


    for (var i = 0; i < zparams.zvars.length; i++)


        // write the results table
         var resultsArray = [];
    for (var key in json.sumInfo) {
        if (key == "colnames") {
            continue;
        }

        var obj = json.sumInfo[key];
        resultsArray.push(obj);
        /* SO says this is important check, but I don't see how it helps here...
         for (var prop in obj) {
         // important check that this is objects own property
         // not from prototype prop inherited
         if(obj.hasOwnProperty(prop)){
         alert(prop + " = " + obj[prop]);
         }
         }  */
    }


    var table = d3.select("#resultsView_tabular")
        .append("p")
        //    .html("<center><b>Results</b></center>")
        .append("table");

    var thead = table.append("thead");
    thead.append("tr")
        .selectAll("th")
        .data(json.sumInfo.colnames)
        .enter()
        .append("th")
        .text(function (d) {
            return d;
        });

    var tbody = table.append("tbody");
    tbody.selectAll("tr")
        .data(resultsArray)
        .enter().append("tr")
        .selectAll("td")
        .data(function (d) {
            return d;
        })
        .enter().append("td")
        .text(function (d) {
            var myNum = Number(d);
            if (isNaN(myNum)) {
                return d;
            }
            return myNum.toPrecision(3);
        })
        .on("mouseover", function () {
            d3.select(this).style("background-color", "aliceblue")
        }) // for no discernable reason
        .on("mouseout", function () {
            d3.select(this).style("background-color", "#F9F9F9")
        });  //(but maybe we'll think of one)

    d3.select("#resultsView_statistics")
        .append("p")
        .html(function () {
            return "<b>Formula: </b>".concat(json.call[0]);
        });
}






var zbreaks=[];

//KRIPANSHU BHARGAVA, this is viz for explore
function viz_explore(m, json_vizexplore, model_name_set) {

    zbreaks=[];
   // d3.select("#resultsView_tabular").html("");
    d3.select("#plotA").html("");
    d3.select("#plotB").html("");
    d3.select("#tabular_2").style("display", "block");
    d3.select("#tabular_1").style("display", "block");
    console.log("Viz explore method called: " + model_name_set);

    var get_data = [];
    get_data = model_name_set.split("-");

    //  console.log(get_data[0]+" and "+get_data[1]);

    var model_name1 = get_data[0] + "-" + get_data[1];
    var model_name2 = get_data[1] + "-" + get_data[0];


    var mym = +m.substr(5, 5) - 1;

//console.log("mym is : "+ mym);
    function removeKids(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }


    var json = json_vizexplore;
    //   console.log("json explore viz:"+json.toString());
    // pipe in figures to right panel
    var filelist = new Array;

    /*  var resultsView_content=d3.select("#resultsView").append("svg");
     var g = resultsView_content.append("g");
     var img1=  g.append("svg:image")
     .attr("xlink:href",json.images[i])
     .attr("width", 200)
     .attr("height", 200)
     ;
     */


    // image added to the div


    var x_axis = [];
    var y_axis = [];
    for (var i in json.plotdata) {

        for (var j in json.plotdata[i].varname) {

            //console.log(" the var name is : " + json.plotdata[i].varname[j]);

            if (json.plotdata[i].varname[j] === get_data[0]) {
                for (var k in json.plotdata[i].data) {


                    // console.log(json.plotdata[i].varname[j] + "data is : " + json.plotdata[i].data[k]);
                    x_axis[k] = json.plotdata[i].data[k];

                }
            }
            if (json.plotdata[i].varname[j] === get_data[1]) {
                for (var k in json.plotdata[i].data) {


                    // console.log(json.plotdata[i].varname[j] + "data is : " + json.plotdata[i].data[k]);
                    y_axis[k] = json.plotdata[i].data[k];

                }
            }

        }
    }




//console.log(" the x length is : "+ x_axis.length);
    //  console.log(" the x length is : "+ y_axis.length);
    //document.getElementById('tabular_chart1').style.display = "block";
    //document.getElementById('tabular_chart2').style.display = "block";
  //  document.getElementById('scatterplot').style.display = "none";
    bivariatePlot(x_axis, y_axis, get_data[0], get_data[1]);
    $('#scatterplot_img').on('click', function(){
        $("#scatterplot_img").fadeOut("fast").fadeIn().fadeTo("fast",1.0);
    });
    $('#heatmap_img').on('click', function(){
        $("#heatmap_img").fadeOut("fast").fadeIn().fadeTo("fast",1.0);
    });
    $('#linechart_img').on('click', function(){
        $("#linechart_img").fadeOut("fast").fadeIn().fadeTo("fast",1.0);
    });
    $('#scatterplot_img').click(function() {
        //document.getElementById('scatterplot_img').style.display = "block";
        document.getElementById('heatchart').style.display = "none";
        document.getElementById('linechart').style.display = "none";
        bivariatePlot(x_axis, y_axis, get_data[0], get_data[1]);
    });


    $('#heatmap_img').click(function() {
        document.getElementById('scatterplot').style.display = "none";
        document.getElementById('linechart').style.display = "none";
        heatmap(get_data[0],get_data[1]);
    });
    $('#linechart_img').click(function() {
        document.getElementById('heatchart').style.display = "none";
        document.getElementById('scatterplot').style.display = "none";
       linechart(get_data[0],get_data[1]);
    });
    //  crossTabDensityPlot(x_axis,y_axis,get_data[0],get_data[1]);
var empty=[];
   crossTabPlots(get_data[0], get_data[1],empty);


    /*
     for(var t=0; t<x_axis.length; t++){
     console.log(" the x axis is :"+x_axis[t] );
     console.log(" ");
     console.log(" the y axis is :"+y_axis[t] );
     }

     */

    /*
     if(i==model_name_set) {
     var zfig = document.createElement("img");
     zfig.setAttribute("src", json.images[i]);
     zfig.setAttribute('width', 500);
     zfig.setAttribute('height', 500);
     zfig.setAttribute('padding',5);


     document.getElementById("resultsView").appendChild(zfig);

     d3.select("#resultsView").style("box-shadow","1px 1px 3px grey").style("background-color","#F5F5F5");
     */
    var cork = [];
    var corp = [];
    var cors = [];
    var var1 = [];
    var var2 = [];
    var table_obj = [];
    var colnames = [];
    var colvar = [];
    var table_data = [];
    var rowvar = [];
    var rownames = [];
    function crossTab_Table(json_my) {
        colnames=[];
        rownames=[];
        table_data=[];
        table_obj=[];
        console.log("test json:",json_my)
        var json1 = json_my;




        // data for statistics


        for (var i in json1.tabular) {
            //console.log("this is data : " + i)
            if (i == model_name1 || i == model_name2) {
                for (var j in json1.tabular[i].colnames) {


                    //   console.log("colnames: ");
                    //  console.log(json.tabular[i].colnames[j]);
                    colnames.push(json1.tabular[i].colnames[j]);

                }
            }
        }


        for (var i in json1.tabular) {
            //   console.log("rownames: ");
            if (i == model_name1 || i == model_name2) {
                for (var k in json1.tabular[i].rownames) {

                    //   console.log(json.tabular[i].rownames[k]);
                    rownames.push(json1.tabular[i].rownames[k]);
                }
            }
        }
        for (var i in json1.tabular) {
            if (i == model_name1 || i == model_name2) {
                for (var l in json1.tabular[i].rowvar) {
                    //  console.log("rowvar: ");
                    // console.log(json.tabular[i].rowvar[l]);
                    rowvar.push(json1.tabular[i].rowvar[l]);
                }
            }
        }
        for (var i in json1.tabular) {
            if (i == model_name1 || i == model_name2) {
                for (var m in json1.tabular[i].colvar) {
                    // console.log("colavar: ");
                    //  console.log(json.tabular[i].colvar[m]);
                    colvar.push(json1.tabular[i].colvar[m]);
                }
            }
        }
        for (var i in json1.tabular) {
            if (i == model_name1 || i == model_name2) {
                // console.log("This is data : ");
                for (var n in json1.tabular[i].data) {
                    table_data[n] = [];
                    //  console.log(json.tabular[i].data[n]);
                    //  console.log("this is data for : " + json.tabular[i].data[n]);
                    for (var a = 0; a < colnames.length; a++) {
                        // console.log("data : ");
                        // console.log(json.tabular[i].data[n][a]);
                        table_data[n].push(json1.tabular[i].data[n][a]);
                    }

                }

            }
        }

        for (var p = 0; p < rownames.length; p++) {// console.log(" row data : "+ p);
            for (var l = 0; l < colnames.length; l++) {
                // console.log("col data : ");
                //  console.log(table_data[p][l]);
                table_obj.push({rowname: rownames[p], colname: colnames[l], value: table_data[p][l]});
                // console.log(" the dynamic object data : rowname = "+ table_obj[i].rowname + " colname :  "+ table_obj[i].colname + " value : "+ table_obj[i].value );
            }
        }
// crosstab_table ends
        /*for(var i=0; i<table_obj.length; i++)
        {
            console.log(" the dynamic object data : rowname = "+ table_obj[i].rowname + " colname :  "+ table_obj[i].colname + " value : "+ table_obj[i].value );
            // console.log(" the dynamic object data : rowname = "+ table_obj.rowname + " colname :  "+ table_obj.colname + " value : "+ table_obj.value );
        }
        */
        d3table1(table_obj);
    }

    // for the statistics]
    // console.log("The data for the statistical"+ json.statistical)
    for (var key in json.statistical) {
        //   console.log(key);
        if (key == model_name1 || key == model_name2) {
            for (var a in json.statistical[key].cork) {
                //    console.log("cork: ");
                //   console.log(json.statistical[key].cork[a]);
                cork.push(json.statistical[key].cork[a]);
            }
        }
    }
    for (var key1 in json.statistical) {
        if (key1 == model_name1 || key1 == model_name2) {
            for (var b in json.statistical[key1].corp) {
                //  console.log("corp: ");
                //   console.log(json.statistical[key1].corp[b]);
                corp.push(json.statistical[key1].corp[b]);
            }
        }
    }
    for (var key in json.statistical) {
        if (key == model_name1 || key == model_name2) {
            for (var c in json.statistical[key].cors) {
                //  console.log("cors: ");
                //  console.log(json.statistical[key].cors[c]);
                cors.push(json.statistical[key].cors[c]);
            }
        }
    }

    for (var key in json.statistical) {
        if (key == model_name1 || key == model_name2) {
            for (var d in json.statistical[key].var1) {
                //     console.log("var1: ");
                //     console.log(json.statistical[key].var1[d]);
                var1.push(json.statistical[key].var1[d]);
            }
        }
    }
    for (var key4 in json.statistical) {
        if (key == model_name1 || key == model_name2) {
            for (var e in json.statistical[key].var2) {
                //   console.log("var2: ");
                //   console.log(json.statistical[key].var2[e]);
                var2.push(json.statistical[key].var2[e]);
            }
        }
    }

    // var rCall = [];
    // rCall[0] = json.call;
    // logArray.push("estimate: ".concat(rCall[0]));
    // showLog();

    for (var i = 0; i < zparams.zvars.length; i++)


        // write the results table
         var resultsArray = [];
    for (var key in json.tabular) {
        if (key == "colnames") {
            console.log("colnames found");
            continue;
        }

        var obj = json.tabular[key];
        resultsArray.push(obj);
        //console.log("This is the JSON obj : "+ obj);
        /* SO says this is important check, but I don't see how it helps here...
         for (var prop in obj) {
         // important check that this is objects own property
         // not from prototype prop inherited
         if(obj.hasOwnProperty(prop)){
         alert(prop + " = " + obj[prop]);
         }
         }  */
    }


    // d3.select("#resultsView_tabular").html("");

     function d3table1(data) {

         var width = 120,   // width of svg
             height = 160,  // height of svg
             padding = 22; // space around the chart, not including labels


         d3.select("#tabular_2")
             .html("")
             .style("background-color", "#fff")
             .append("h5")
             .text("CROSS-TABS ")
             .style("color", "#424242")
             .style("overflow","auto")
         ;

         var sv = d3.select("#tabular_2").append("svg").attr("width", "100%").attr("height", "100%").style("overflow", "visible");
         var fo = sv.append('foreignObject').attr("width", "100%").attr("height", "100%").style("padding", 10).attr("overflow", "visible");
         var table = fo.append("xhtml:table").attr("class", "table").style("border-collapse", " collapse"),
             th = table.append("tr").style("border", 1).text("_").style("color", "#fff");

         for (var i = 0; i < colnames.length; i++) {

             th.append("td").style("border-bottom", 1).style("text-align", "center").style("background-color", selVarColor).append("b").text(colnames[i]);

         }


         for (var k = 0; k < rownames.length; k++) {
             var pos = 0;
             var tr = table.append("tr").style("margin-left", 20).style("background-color", "#BDBDBD").style("border", 1).style("text-align", "center").text(rownames[k]);
             for (var m = 0; m < colnames.length; m++) {
                 for (var z = 0; z < data.length; z++) {


                     if (rownames[k] === data[z].rowname && colnames[m] === data[z].colname) {
                         tr.append("td").style("border", 1).style("text-align", "center").style("position", "relative").style("background-color", varColor).text(data[z].value);
                         console.log("data for table: "+ data[z].value);
                     }
                 }

             }
         }
         // sv.append("text")
         //     .style("padding","10px")
         //     .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
         //     .attr("transform", "translate(" + (padding / 2) + "," + (height / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
         //     .text(get_data[0]);
         //
         // sv.append("text")
         //     .style("padding","10px")
         //     .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
         //     .attr("transform", "translate(" + (width) + "," + (padding / 2) + ")")  // centre below axis
         //     .text(get_data[1]);

     }
/*
//Toggle buttons function
    $('.btn-toggle').click(function() {
        var expression="";
        $(this).find('.btn').toggleClass('active');

        if ($(this).find('.btn-primary').size()>0) {
           // console.log($(this).find('.btn-primary')[0].innerText);



            $(this).find('.btn').toggleClass('btn-primary');


        }
        //console.log(this.innerHTML);
        if($(this).find('.btn-primary')[0].innerText==="Cross-Tabs"){
            console.log($(this).find('.btn-primary')[0].innerText);
            d3.select("#plotA").html("");
            d3.select("#plotB").html("");
            d3.select("#SelectionData").html("");
            //d3.select("#tabular_2").html("");
            d3.select("#tabular_2").html("");
            d3table1(table_obj);
            }

        else if($(this).find('.btn-primary')[0].innerText==="Selection"){
            console.log($(this).find('.btn-primary')[0].innerText);
            d3.select("#tabular_2").html("");
            d3.select("#tabular_2").style("display","none");
            d3.select("#tabular_1").style("display","block");
            d3.select("#plotA").html("");
            d3.select("#plotB").html("");
            d3.select("#SelectionData").html("");
           crossTabPlots(get_data[0], get_data[1]);
                 }
        $(this).find('.btn').toggleClass('btn-default');

    });

*/
//console.log(" The table data check: ", json);
    crossTab_Table(json);

    function removeData()
    {
        for (var key in zparams) {
            if (zparams.hasOwnProperty(key)) {
                // do something with `key'
                if(key==="zcrosstab" && key.length>0)
                {
                    zparams[key]=[];
                }

            }
        }
    }
var breakcount=1;
   // crossTabPlots(get_data[0], get_data[1]);
    $('#SelectionData1').click(function(){
       // alert("The paragraph was clicked.");
        d3.select("#tabular_2").html("");
        removeData();
        zparams.zcrosstab.push(crossTabPlots.writeCrossTabsJson());
        explore_crosstab(json);

        estimateLadda.stop();  // stop spinner
        estimated = true;
        zbreaks.push(crossTabPlots.writeCrossTabsJson());

        d3.select("#breakspace")
            .append("span")
            .text("\u00A0 \u00A0 \u00A0 \u00A0   ")
            .style("margin-top", 0)
            .style("white-space", "pre")
            .style("display", "inline-block")
            .style("float", "left")
            .append("span")
            .append("button")// top stack for results
            .attr("class","btn btn-default btn-xs")
            .attr("id", breakcount-1)
            .text("break "+breakcount) .on("click", function () {
            d3.select("#tabular_2").html("");
            removeData();
            zparams.zcrosstab.push(zbreaks[this.id]);
            explore_crosstab(json);

            var inputvalue1,inputvalue2;
            inputvalue1=zbreaks[this.id].var1.value;
            inputvalue2=zbreaks[this.id].var2.value;
            
            // console.log("val1:",inputvalue1);
            // console.log("val2:",inputvalue2);

            document.getElementById("input1").value = inputvalue1;
            document.getElementById("input2").value = inputvalue2;

            var json_obj=zbreaks[this.id];
            var varn1,varn2,varsize1,varsize2;

            if(json_obj.length===0)
            {
                console.log("break not called")
            }else{
               // console.log("break button called in crosstab")
                varn1=json_obj.var1.buttonType;
                varn2=json_obj.var2.buttonType;
                varsize1=json_obj.var1.value;
                varsize2=json_obj.var2.value;
                // console.log("parameters break crosstab:",varn1);
                // console.log("parameters break crosstab:",varn2);
                // console.log("paramters break crosstab:",varsize1);
                // console.log("parameters break crosstab:",varsize2);
                if(varn1==="equidistance")
                {
                    crossTabPlots.equidistance(get_data[0], varsize1);
                }
                else if (varn1==="equimass")
                {
                    crossTabPlots.equimass(get_data[0],varsize1);
                }

                if(varn2==="equidistance")
                {
                    crossTabPlots.equidistance(get_data[1], varsize2);
                } else if (varn2==="equimass")
                {
                    crossTabPlots.equimass(get_data[1], varsize2);
                }


            }
          //  crossTabPlots(get_data[0], get_data[1],zbreaks[this.id]);
           // console.log("break called :" + this.id);

           // console.log("zparams for breaks now: "+zbreaks[this.id]);
        });


breakcount++;

    });



for(var i=0; i<zbreaks.length; i++)
{
    console.log("zbreaks are : "+ zbreaks[i]);
}

    function explore_crosstab(btn) {



        //console.log("new JSONOUT : ", zparams)



        if (production && zparams.zsessionid == "") {
            alert("Warning: Data download is not complete. Try again soon.");
            return;
        }
        zPop();
      //  console.log("zpop: ", zparams);
        // write links to file & run R CMD

        //package the output as JSON
        // add call history and package the zparams object as JSON
        zparams.callHistory = callHistory;
        var jsonout = JSON.stringify(zparams);

        //var base = rappURL+"zeligapp?solaJSON="
        urlcall = rappURL + "exploreapp"; //base.concat(jsonout);
        var solajsonout = "solaJSON=" + jsonout;
        //console.log("urlcall out: ", urlcall);
       // console.log("POST out this: ", solajsonout);

     function explore_crosstabSuccess(json) {
    console.log("crossTabSuccess");
   // readPreprocess(url,p,v,callback);
         d3.json("rook/myresult2.json", function (error, json) {
             if (error) return console.warn(error);
             var jsondata = json;

             //console.log("explore DATA json test: ", jsondata);


        crossTab_Table(jsondata);
   // var jsonget=json.tabular;
    //console.log("json :"+ jsonget);
        // d3table1(d);
             estimateLadda.stop();  // stop spinner
             estimated = true;
     });
     }
        function explore_crosstabFail() {
            estimateLadda.stop();  // stop spinner
            estimated = true;
        }
        estimateLadda.start();  // start spinner
        makeCorsRequest(urlcall, btn, explore_crosstabSuccess, explore_crosstabFail, solajsonout);

    }

    // data for the statistical div
    var string1 = cork.toString();
    var string3 = string1.substring(string1.indexOf(":"), string1.length);
    //  console.log(string3);
    var string2 = string1.substring(0, string1.indexOf("c"));
    //  console.log(string2);
    var string4 = corp.toString();
    var string6 = string4.substring(string4.indexOf(":"), string4.length);
    //  console.log(string3);
    var string5 = string4.substring(0, string4.indexOf("c"));
    //  console.log(string2);
    var string7 = cors.toString();
    var string9 = string7.substring(string7.indexOf(":"), string7.length);
    //  console.log(string3);
    var string8 = string7.substring(0, string7.indexOf("c"));
    //  console.log(string2);
    var statistical_data = [
        {correlation: string2, value: string3},
        {correlation: string5, value: string6},
        {correlation: string8, value: string9}
    ];

    function d3table(data) {
        d3.select("#resultsView_statistics")
            .html("")
            .style("background-color", "#fff")
            .append("h5")
            .text("CORRELATION STATISTICS ")
            .style("color", "#424242");
        var table = d3.select("#resultsView_statistics").append("table").attr("class", "table").style("border-collapse", " collapse"),
            th = table.append("tr").style("border", 1);

        for (var i in Object.keys(data[0])) {
            th.append("td").style("border-bottom", 1).style("text-align", "left").style("background-color", selVarColor).append("b").text(Object.keys(data[0])[i]);
        }

        for (var row in data) {
            var tr = table.append("tr").style("margin-left", 40).style("border", 1).style("text-align", "left");
            for (var td in data[row])
                tr.append("td").style("border", 1).style("text-align", "left").style("position", "relative").style("background-color", varColor).text(data[row][td]);
        }
    }

    d3table(statistical_data);


}


// this function parses the transformation input. variable names are often nested inside one another, e.g., ethwar, war, wars, and so this is handled
function transParse(n) {

    var out2 = [];
    var t2 = n;
    var k2 = 0;
    var subMe2 = "_transvar".concat(k2);
    var indexed = [];

    // out2 is all matched variables, indexed is an array, each element is an object that contains the matched variables starting index and finishing index.  e.g., n="wars+2", out2=[war, wars], indexed=[{0,2},{0,3}]
    for (var i in valueKey) {
        var m2 = n.match(valueKey[i]);
        if (m2 !== null) {
            out2.push(m2[0]);
        }

        var re = new RegExp(valueKey[i], "g")
        var s = n.search(re);
        if (s != -1) {
            indexed.push({from: s, to: s + valueKey[i].length});
        }
    }

    // nested loop not good, but indexed is not likely to be very large.
    // if a variable is nested, it is removed from out2
    // notice, loop is backwards so that index changes don't affect the splice
    //console.log("indexed ", indexed);
    for (var i = indexed.length - 1; i > -1; i--) {
        for (var j = indexed.length - 1; j > -1; j--) {
            if (i === j) {
                continue;
            }
            if ((indexed[i].from >= indexed[j].from) & (indexed[i].to <= indexed[j].to)) {
                //console.log(i, " is nested in ", j);
                out2.splice(i, 1);
            }
        }
    }

    for (var i in out2) {
        t2 = t2.replace(out2[i], subMe2); //something that'll never be a variable name
        k2 = k2 + 1;
        subMe2 = "_transvar".concat(k2);
    }

    if (out2.length > 0) {
        out2.push(t2);
        //console.log("new out ", out2);
        return (out2);
    }
    else {
        alert("No variable name found. Perhaps check your spelling?");
        return null;
    }
}

function transform(n, t, typeTransform) {

    if (production && zparams.zsessionid == "") {
        alert("Warning: Data download is not complete. Try again soon.");
        return;
    }

    if (!typeTransform) {
        t = t.replace("+", "_plus_"); // can't send the plus operator
    }

    //console.log(n);
    //console.log(t);

    var btn = document.getElementById('btnEstimate');


    var myn = allNodes[findNodeIndex(n[0])];
    if (typeof myn === "undefined") {
        var myn = allNodes[findNodeIndex(n)];
    }

    var outtypes = {
        varnamesTypes: n,
        interval: myn.interval,
        numchar: myn.numchar,
        nature: myn.nature,
        binary: myn.binary,
        time: myn.time
    };

    //console.log(myn);
    // if typeTransform but we already have the metadata
    if (typeTransform) {
        if (myn.nature == "nominal" & typeof myn.plotvalues !== "undefined") {
            myn.plottype = "bar";
            barsNode(myn);
            populatePopover();
            panelPlots();
            return;
        }
        else if (myn.nature != "nominal" & typeof myn.plotx !== "undefined") {
            myn.plottype = "continuous";
            densityNode(myn);
            populatePopover();
            panelPlots();
            return;
        }
    }


    //package the output as JSON
    var transformstuff = {
        zdataurl: dataurl,
        zvars: n,
        zsessionid: zparams.zsessionid,
        transform: t,
        callHistory: callHistory,
        typeTransform: typeTransform,
        typeStuff: outtypes
    };
    var jsonout = JSON.stringify(transformstuff);
    //var base = rappURL+"transformapp?solaJSON="

    urlcall = rappURL + "transformapp"; //base.concat(jsonout);
    var solajsonout = "solaJSON=" + jsonout;
    //console.log("urlcall out: ", urlcall);
    //console.log("POST out: ", solajsonout);


    function transformSuccess(btn, json) {
        estimateLadda.stop();
        json_data_explore = json;
        console.log("json explore", json_data_explore);
        //console.log("json in: ", json);

        if (json.typeTransform[0]) {

            d3.json(json.url, function (error, json) {
                if (error) return console.warn(error);
                var jsondata = json;
                var vars = jsondata["variables"];

                for (var key in vars) {
                    var myIndex = findNodeIndex(key);
                    jQuery.extend(true, allNodes[myIndex], jsondata.variables[key]);

                    if (allNodes[myIndex].plottype === "continuous") {
                        densityNode(allNodes[myIndex]);
                    }
                    else if (allNodes[myIndex].plottype === "bar") {
                        barsNode(allNodes[myIndex]);
                    }
                }

                fakeClick();
                populatePopover();
                panelPlots();
                //console.log(allNodes[myIndex]);
            });
        }
        else {

            callHistory.push({func: "transform", zvars: n, transform: t});

            var subseted = false;
            var rCall = [];
            rCall[0] = json.call;
            var newVar = rCall[0][0];
            trans.push(newVar);

            d3.json(json.url, function (error, json) {
                if (error) return console.warn(error);
                var jsondata = json;
                //var jsondata = json;
                var vars = jsondata["variables"];
                for (var key in vars) {
                    var myIndex = findNodeIndex(key);
                    if (typeof myIndex !== "undefined") {
                        alert("Invalid transformation: this variable name already exists.");
                        return;
                    }
                    // add transformed variable to the current space
                    var i = allNodes.length;
                    var obj1 = {
                        id: i,
                        reflexive: false,
                        "name": key,
                        "labl": "transformlabel",
                        data: [5, 15, 20, 0, 5, 15, 20],
                        count: [.6, .2, .9, .8, .1, .3, .4],
                        "nodeCol": colors(i),
                        "baseCol": colors(i),
                        "strokeColor": selVarColor,
                        "strokeWidth": "1",
                        "subsetplot": false,
                        "subsetrange": ["", ""],
                        "setxplot": false,
                        "setxvals": ["", ""],
                        "grayout": false,
                        "defaultInterval": jsondata.variables[key]["interval"],
                        "defaultNumchar": jsondata.variables[key]["numchar"],
                        "defaultNature": jsondata.variables[key]["nature"],
                        "defaultBinary": jsondata.variables[key]["binary"]
                    };

                    jQuery.extend(true, obj1, jsondata.variables[key]);
                    allNodes.push(obj1);

                    scaffoldingPush(rCall[0]);
                    valueKey.push(newVar);
                    nodes.push(allNodes[i]);
                    fakeClick();
                    panelPlots();

                    if (allNodes[i].plottype === "continuous") {
                        densityNode(allNodes[i]);
                    }
                    else if (allNodes[i].plottype === "bar") {
                        barsNode(allNodes[i]);
                    }
                }//for


            });

            // update the log
            logArray.push("transform: ".concat(rCall[0]));
            showLog();

            /*
             // NOTE: below is the carousel portion that needs to be revised as of May 29 2015

             // add transformed variable to all spaces
             // check if myspace callHistory contains a subset
             for(var k0=0; k0<callHistory.length; k0++) {
             if(callHistory[k0].func==="subset") {
             var subseted = true;
             }
             }

             loopJ:
             for(var j in spaces) {
             if(j===myspace) {continue;}
             var i = spaces[j].allNodes.length;
             if(subseted===true) { // myspace has been subseted
             offspaceTransform(j);
             continue loopJ;
             }
             loopK:
             for(var k=0; k<spaces[j].callHistory.length; k++) { // gets here if myspace has not been subseted
             if(spaces[j].callHistory[k].func==="subset") { // check if space j has been subseted
             offspaceTransform(j);
             continue loopJ;
             }
             }
             // if there is a subset in the callHistory of the current space, transformation is different
             function offspaceTransform(j) {
             transformstuff = {zdataurl:dataurl, zvars:n, zsessionid:zparams.zsessionid, transform:t, callHistory:spaces[j].callHistory};
             var jsonout = JSON.stringify(transformstuff);
             //var base = rappURL+"transformapp?solaJSON="
             urlcall = rappURL+"transformapp"; //base.concat(jsonout);
             var solajsonout = "solaJSON="+jsonout;
             console.log("urlcall out: ", urlcall);
             console.log("POST out: ", solajsonout);


             function offspaceSuccess(btn, json) {
             spaces[j].callHistory.push({func:"transform", zvars:n, transform:t});
             spaces[j].logArray.push("transform: ".concat(rCall[0]));
             readPreprocess(json.url, p=spaces[j].preprocess, v=newVar, callback=null);

             spaces[j].allNodes.push({id:i, reflexive: false, "name": rCall[0][0], "labl": "transformlabel", data: [5,15,20,0,5,15,20], count: hold, "nodeCol":colors(i), "baseCol":colors(i), "strokeColor":selVarColor, "strokeWidth":"1", "interval":json.types.interval[0], "numchar":json.types.numchar[0], "nature":json.types.nature[0], "binary":json.types.binary[0], "defaultInterval":json.types.interval[0], "defaultNumchar":json.types.numchar[0], "defaultNature":json.types.nature[0], "defaultBinary":json.types.binary[0], "min":json.sumStats.min[0], "median":json.sumStats.median[0], "sd":json.sumStats.sd[0], "mode":(json.sumStats.mode[0]).toString(), "freqmode":json.sumStats.freqmode[0],"fewest":(json.sumStats.fewest[0]).toString(), "freqfewest":json.sumStats.freqfewest[0], "mid":(json.sumStats.mid[0]).toString(), "freqmid":json.sumStats.freqmid[0], "uniques":json.sumStats.uniques[0], "herfindahl":json.sumStats.herfindahl[0],
             "valid":json.sumStats.valid[0], "mean":json.sumStats.mean[0], "max":json.sumStats.max[0], "invalid":json.sumStats.invalid[0], "subsetplot":false, "subsetrange":["", ""],"setxplot":false, "setxvals":["", ""], "grayout":false});
             }
             function offspaceFail(btn) {
             alert("transform fail");
             }
             makeCorsRequest(urlcall,btn, offspaceSuccess, offspaceFail, solajsonout);
             }

             // if myspace and space j have not been subseted, append the same transformation
             spaces[j].callHistory.push({func:"transform", zvars:n, transform:t});
             spaces[j].logArray.push("transform: ".concat(rCall[0]));

             spaces[j].allNodes.push({id:i, reflexive: false, "name": rCall[0][0], "labl": "transformlabel", data: [5,15,20,0,5,15,20], count: hold, "nodeCol":colors(i), "baseCol":colors(i), "strokeColor":selVarColor, "strokeWidth":"1", "interval":json.types.interval[0], "numchar":json.types.numchar[0], "nature":json.types.nature[0], "binary":json.types.binary[0], "defaultInterval":json.types.interval[0], "defaultNumchar":json.types.numchar[0], "defaultNature":json.types.nature[0], "defaultBinary":json.types.binary[0], "min":json.sumStats.min[0], "median":json.sumStats.median[0], "sd":json.sumStats.sd[0], "mode":(json.sumStats.mode[0]).toString(), "freqmode":json.sumStats.freqmode[0],"fewest":(json.sumStats.fewest[0]).toString(), "freqfewest":json.sumStats.freqfewest[0], "mid":(json.sumStats.mid[0]).toString(), "freqmid":json.sumStats.freqmid[0], "uniques":json.sumStats.uniques[0], "herfindahl":json.sumStats.herfindahl[0],
             "valid":json.sumStats.valid[0], "mean":json.sumStats.mean[0], "max":json.sumStats.max[0], "invalid":json.sumStats.invalid[0], "subsetplot":false, "subsetrange":["", ""],"setxplot":false, "setxvals":["", ""], "grayout":false});

             readPreprocess(json.url, p=spaces[j].preprocess, v=newVar, callback=null);
             }   */
        }
    }

    function transformFail(btn) {
        alert("transform fail");
        estimateLadda.stop();
    }

    estimateLadda.start();  // start spinner
    makeCorsRequest(urlcall, btn, transformSuccess, transformFail, solajsonout);

}

function scaffoldingPush(v) { // adding a variable to the variable list after a transformation

    d3.select("#tab1")
        .data(v)
        .append("p")
        .attr("id", function () {
            return v[0].replace(/\W/g, "_");
        })
        .text(v[0])
        .style('background-color', hexToRgba(selVarColor))
        .attr("data-container", "body")
        .attr("data-toggle", "popover")
        .attr("data-trigger", "hover")
        .attr("data-placement", "right")
        .attr("data-html", "true")
        .attr("onmouseover", "$(this).popover('toggle');")
        .attr("onmouseout", "$(this).popover('toggle');")
        .attr("data-original-title", "Summary Statistics")
        .on("click", function varClick() { // we've added a new variable, so we need to add the listener
            d3.select(this)
                .style('background-color', function (d) {
                    var myText = d3.select(this).text();
                    var myColor = d3.select(this).style('background-color');
                    var mySC = allNodes[findNodeIndex(myText)].strokeColor;

                    zparams.zvars = []; //empty the zvars array
                    if (d3.rgb(myColor).toString() === varColor.toString()) { // we are adding a var
                        if (nodes.length == 0) {
                            nodes.push(findNode(myText));
                            nodes[0].reflexive = true;
                        }
                        else {
                            nodes.push(findNode(myText));
                        }
                        return hexToRgba(selVarColor);
                    }
                    else { // dropping a variable

                        nodes.splice(findNode(myText)["index"], 1);
                        spliceLinksForNode(findNode(myText));

                        if (mySC == dvColor) {
                            var dvIndex = zparams.zdv.indexOf(myText);
                            if (dvIndex > -1) {
                                zparams.zdv.splice(dvIndex, 1);
                            }
                        }
                        else if (mySC == csColor) {
                            var csIndex = zparams.zcross.indexOf(myText);
                            if (csIndex > -1) {
                                zparams.zcross.splice(csIndex, 1);
                            }
                        }
                        else if (mySC == timeColor) {
                            var timeIndex = zparams.ztime.indexOf(myText);
                            if (timeIndex > -1) {
                                zparams.ztime.splice(dvIndex, 1);
                            }
                        }
                        else if (mySC == nomColor) {
                            var nomIndex = zparams.znom.indexOf(myText);
                            if (nomIndex > -1) {
                                zparams.znom.splice(dvIndex, 1);
                            }
                        }

                        nodeReset(allNodes[findNodeIndex(myText)]);
                        borderState();
                        return varColor;
                    }
                });
            fakeClick();
            panelPlots();
        });
    populatePopover(); // pipes in the summary stats

    // drop down menu for tranformation toolbar
    d3.select("#transSel")
        .data(v)
        .append("option")
        .text(function (d) {
            return d;
        });
}

// below from http://www.html5rocks.com/en/tutorials/cors/ for cross-origin resource sharing
// Create the XHR object.
function createCORSRequest(method, url, callback) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest !== "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
    }
    // xhr.setRequestHeader('Content-Type', 'text/json');
//xhr.setRequestHeader('Content-Type', 'multipart/form-data');


    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    return xhr;

}


// Make the actual CORS request.
function makeCorsRequest(url, btn, callback, warningcallback, jsonstring) {
    var xhr = createCORSRequest('POST', url);
    //console.log("inside cors json size:"+jsonstring.length);
    if (!xhr) {
        alert('CORS not supported');
        return;
    }
    // Response handlers for asynchronous load
    // onload or onreadystatechange?

    xhr.onload = function () {

        var text = xhr.responseText;
        //console.log("text ", text);

        try {
            var json = JSON.parse(text);   // should wrap in try / catch
            var names = Object.keys(json);
        }
        catch (err) {
            estimateLadda.stop();
            selectLadda.stop();
            //console.log(err);
            alert('Error: Could not parse incoming JSON.');
        }

        if (names[0] == "warning") {
            warningcallback(btn);
            alert("Warning: " + json.warning);
        } else {
            callback(btn, json);
        }
    };
    xhr.onerror = function () {
        // note: xhr.readystate should be 4, and status should be 200.  a status of 0 occurs when the url becomes too large
        if (xhr.status == 0) {
            alert('There was an error making the request. xmlhttprequest status is 0.');
        }
        else if (xhr.readyState != 4) {
            alert('There was an error making the request. xmlhttprequest readystate is not 4.');
        }
        else {
            alert('Woops, there was an error making the request.');
        }
        //console.log(xhr);
        estimateLadda.stop();
        selectLadda.stop();
    };
    xhr.send(jsonstring);
}


function legend(c) { // this could be made smarter
    if (zparams.ztime.length != 0 | zparams.zcross.length != 0 | zparams.zdv.length != 0 | zparams.znom.length != 0) {
        document.getElementById("legend").setAttribute("style", "display:block");
    }
    else {
        document.getElementById("legend").setAttribute("style", "display:none");
    }


    if (zparams.ztime.length == 0) {
        document.getElementById("timeButton").setAttribute("class", "clearfix hide");
    }
    else {
        document.getElementById("timeButton").setAttribute("class", "clearfix show");
    }
    if (zparams.zcross.length == 0) {
        document.getElementById("csButton").setAttribute("class", "clearfix hide");
    }
    else {
        document.getElementById("csButton").setAttribute("class", "clearfix show");
    }
    if (zparams.zdv.length == 0) {
        document.getElementById("dvButton").setAttribute("class", "clearfix hide");
    }
    else {
        document.getElementById("dvButton").setAttribute("class", "clearfix show");
    }
    if (zparams.znom.length == 0) {
        document.getElementById("nomButton").setAttribute("class", "clearfix hide");
    }
    else {
        document.getElementById("nomButton").setAttribute("class", "clearfix show");
    }

    borderState();
}


function reset() {
    location.reload();
}

// programmatically deselecting every selected variable...
function erase() {
    leftpanelMedium();
    rightpanelMedium();
    document.getElementById("legend").setAttribute("style", "display:none");

    tabLeft('tab1');

    jQuery.fn.d3Click = function () {
        this.children().each(function (i, e) {
            var mycol = d3.rgb(this.style.backgroundColor);
            if (mycol.toString() === varColor.toString()) {
                return;
            }
            var evt = document.createEvent("MouseEvents");
            evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

            e.dispatchEvent(evt);
        });
    };
    $("#tab1").d3Click();
}


function deselect(d) {
    //console.log(d);
}

// http://www.tutorials2learn.com/tutorials/scripts/javascript/xml-parser-javascript.html
function loadXMLDoc(XMLname) {
    var xmlDoc;
    if (window.XMLHttpRequest) {
        xmlDoc = new window.XMLHttpRequest();
        xmlDoc.open("GET", XMLname, false);
        xmlDoc.send("");
        return xmlDoc.responseXML;
    }
    // IE 5 and IE 6
    else if (ActiveXObject("Microsoft.XMLDOM")) {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.load(XMLname);
        return xmlDoc;
    }
    alert("Error loading document!");
    return null;
}


function tabLeft(tab) {

    if (tab != "tab3") {
        lefttab = tab;
    }
    var tabi = tab.substring(3);

    document.getElementById('tab1').style.display = 'none';
    document.getElementById('tab2').style.display = 'none';
    document.getElementById('tab3').style.display = 'none';
    document.getElementById('modelView_Container').style.display = 'none';

    if (tab === "tab1") {
        summaryHold = false;
        document.getElementById('btnSubset').setAttribute("class", "btn btn-default");
        document.getElementById('btnVariables').setAttribute("class", "btn active");
        document.getElementById("btnSelect").style.display = 'none';

        d3.select("#leftpanel")
            .attr("class", "sidepanel container clearfix");
    }
    else if (tab === "tab2") {
        summaryHold = false;
        document.getElementById('btnVariables').setAttribute("class", "btn btn-default");
        document.getElementById('btnSubset').setAttribute("class", "btn active");

        d3.select("#leftpanel")
            .attr("class", function (d) {
                if (this.getAttribute("class") === "sidepanel container clearfix expandpanel") {
                    document.getElementById("btnSelect").style.display = 'none';
                    return "sidepanel container clearfix";
                }
                else {
                    document.getElementById("btnSelect").style.display = 'block';
                    return "sidepanel container clearfix expandpanel";
                }
            });
    }
    else {
        document.getElementById('btnSubset').setAttribute("class", "btn btn-default");
        document.getElementById('btnVariables').setAttribute("class", "btn btn-default");

        d3.select("#leftpanel")
            .attr("class", "sidepanel container clearfix");
    }

    document.getElementById(tab).style.display = 'block';
}

function tabRight(tabid) {

    document.getElementById('univariate').style.display = 'none';
    document.getElementById('setx').style.display = 'none';
    document.getElementById('left_thumbnail').style.display = 'none';
    document.getElementById('result_left').style.display = 'none';
    document.getElementById('result_left1').style.display = 'none';
    document.getElementById('result_right').style.display = 'none';
    document.getElementById('modelView_Container').style.display = 'none';

    if (tabid == "btnUnivariate") {
        //  document.getElementById('btnBivariate').setAttribute("class", "btn btn-default");
        document.getElementById('btnBivariate').setAttribute("class", "btn btn-default");
        document.getElementById('btnUnivariate').setAttribute("class", "btn active");
        document.getElementById('univariate').style.display = 'block';

        d3.select("#rightpanel")
            .attr("class", "sidepanel container clearfix");
    }

    else if (tabid == "btnBivariate") {
        document.getElementById('btnUnivariate').setAttribute("class", "btn btn-default");
        // document.getElementById('btnBivariate').setAttribute("class", "btn btn-default");
        document.getElementById('btnBivariate').setAttribute("class", "btn active");
        //  document.getElementById('results').style.display = 'block';
        document.getElementById('modelView_Container').style.display = 'block';
        document.getElementById('left_thumbnail').style.display = 'block';
        document.getElementById('result_left').style.display = 'block';
        document.getElementById('result_left1').style.display = 'block';
        document.getElementById('result_right').style.display = 'block';

        if (estimated === false) {
            d3.select("#rightpanel")
                .attr("class", "sidepanel container clearfix");
        }
        else if (righttab == "btnBivariate" | d3.select("#rightpanel").attr("class") == "sidepanel container clearfix") {
            toggleR()
        }
        ;
    }

    righttab = tabid; // a global that may be of use

    function toggleR() {
        d3.select("#rightpanel")
            .attr("class", function (d) {
                if (this.getAttribute("class") === "sidepanel container clearfix expandpanel") {
                    return "sidepanel container clearfix expandpanel";
                }
                else {
                    return "sidepanel container clearfix expandpanel";
                }
            });
    }
}


function varSummary(d) {

    var rint = d3.format("r");

    var summarydata = [],
        tmpDataset = [],
        t1 = ["Mean:", "Median:", "Most Freq:", "Occurrences:", "Median Freq:", "Occurrences:", "Least Freq:", "Occurrences:", "Stand.Dev:", "Minimum:", "Maximum:", "Invalid:", "Valid:", "Uniques:", "Herfindahl:"],
        t2 = [(+d.mean).toPrecision(4).toString(), (+d.median).toPrecision(4).toString(), d.mode, rint(d.freqmode), d.mid, rint(d.freqmid), d.fewest, rint(d.freqfewest), (+d.sd).toPrecision(4).toString(), (+d.min).toPrecision(4).toString(), (+d.max).toPrecision(4).toString(), rint(d.invalid), rint(d.valid), rint(d.uniques), (+d.herfindahl).toPrecision(4).toString()],
        i, j;
    if (private) {
        if (d.meanCI) {
            t1 = ["Mean:", "Median:", "Most Freq:", "Occurrences:", "Median Freq:", "Occurrences:", "Least Freq:", "Occurrences:", "Stand.Dev:", "Minimum:", "Maximum:", "Invalid:", "Valid:", "Uniques:", "Herfindahl:"],
                t2 = [(+d.mean).toPrecision(2).toString() + " (" + (+d.meanCI.lowerBound).toPrecision(2).toString() + " - " + (+d.meanCI.upperBound).toPrecision(2).toString() + ")", (+d.median).toPrecision(4).toString(), d.mode, rint(d.freqmode), d.mid, rint(d.freqmid), d.fewest, rint(d.freqfewest), (+d.sd).toPrecision(4).toString(), (+d.min).toPrecision(4).toString(), (+d.max).toPrecision(4).toString(), rint(d.invalid), rint(d.valid), rint(d.uniques), (+d.herfindahl).toPrecision(4).toString()],
                i, j;
        }
    }

    for (i = 0; i < t1.length; i++) {
        if (t2[i].indexOf("NaN") > -1 | t2[i] == "NA" | t2[i] == "") continue;
        tmpDataset = [];
        tmpDataset.push(t1[i]);
        tmpDataset.push(t2[i]);
        summarydata.push(tmpDataset);
    }
    ;

    //  //console.log(summarydata);
    d3.select("#tab3") //tab when you mouseover a pebble
        .select("p")
        .html("<center><b>" + d.name + "</b><br><i>" + d.labl + "</i></center>")
        .append("table")
        .selectAll("tr")
        .data(summarydata)
        .enter().append("tr")
        .selectAll("td")
        .data(function (d) {
            return d;
        })
        .enter().append("td")
        .text(function (d) {
            return d;
        })
        .on("mouseover", function () {
            d3.select(this).style("background-color", "aliceblue")
        }) // for no discernable reason
        .on("mouseout", function () {
            d3.select(this).style("background-color", "#F9F9F9")
        });  //(but maybe we'll think of one)
//    .style("font-size", "12px");


    var plotsvg = d3.select("#tab3")
        .selectAll("svg")
        .remove();

    if (typeof d.plottype === "undefined") { // .properties is undefined for some vars
        return;
    }
    else if (d.plottype === "continuous") {
        density(d, div = "varSummary", private);
    }
    else if (d.plottype === "bar") {
        bars(d, div = "varSummary", private);
    }
    else {
        var plotsvg = d3.select("#tab3")      // no graph to draw, but still need to remove previous graph
            .selectAll("svg")
            .remove();
    }
    ;

}

function populatePopover() {

    d3.select("#tab1").selectAll("p")
        .attr("data-content", function (d) {

            var onNode = findNodeIndex(d);

            return popoverContent(allNodes[onNode]);
        });
}

function popoverContent(d) {

    var rint = d3.format("r");

    var outtext = "";

    if (d.labl != "") {
        outtext = outtext + "<div class='form-group'><label class='col-sm-4 control-label'>Label</label><div class='col-sm-6'><p class='form-control-static'><i>" + d.labl + "</i></p></div></div>";
    }

    if (d.mean != "NA") {
        outtext = outtext + "<div class='form-group'><label class='col-sm-4 control-label'>Mean</label><div class='col-sm-6'><p class='form-control-static'>"
        if (private && d.meanCI) {
            outtext += (+d.mean).toPrecision(2).toString() + " (" + (+d.meanCI.lowerBound).toPrecision(2).toString() + " - " + (+d.meanCI.upperBound).toPrecision(2).toString() + ")"
        } else {
            outtext += (+d.mean).toPrecision(4).toString()
        }
        outtext += "</p></div></div>";
    }

    if (d.median != "NA") {
        outtext = outtext + "<div class='form-group'><label class='col-sm-4 control-label'>Median</label><div class='col-sm-6'><p class='form-control-static'>" + (+d.median).toPrecision(4).toString() + "</p></div></div>";
    }

    if (d.mode != "NA") {
        outtext = outtext + "<div class='form-group'><label class='col-sm-4 control-label'>Most Freq</label><div class='col-sm-6'><p class='form-control-static'>" + d.mode + "</p></div></div>";
    }

    if (d.freqmode != "NA") {
        outtext = outtext + "<div class='form-group'><label class='col-sm-4 control-label'>Occurrences</label><div class='col-sm-6'><p class='form-control-static'>" + rint(d.freqmode) + "</p></div></div>";
    }

    if (d.mid != "NA") {
        outtext = outtext + "<div class='form-group'><label class='col-sm-4 control-label'>Median Freq</label><div class='col-sm-6'><p class='form-control-static'>" + d.mid + "</p></div></div>";
    }

    if (d.freqmid != "NA") {
        outtext = outtext + "<div class='form-group'><label class='col-sm-4 control-label'>Occurrences</label><div class='col-sm-6'><p class='form-control-static'>" + rint(d.freqmid) + "</p></div></div>";
    }
    if (d.fewest != "NA") {
        outtext = outtext + "<div class='form-group'><label class='col-sm-4 control-label'>Least Freq</label><div class='col-sm-6'><p class='form-control-static'>" + d.fewest + "</p></div></div>";
    }

    if (d.freqfewest != "NA") {
        outtext = outtext + "<div class='form-group'><label class='col-sm-4 control-label'>Occurrences</label><div class='col-sm-6'><p class='form-control-static'>" + rint(d.freqfewest) + "</p></div></div>";
    }

    if (d.sd != "NA") {
        outtext = outtext + "<div class='form-group'><label class='col-sm-4 control-label'>Stand Dev</label><div class='col-sm-6'><p class='form-control-static'>" + (+d.sd).toPrecision(4).toString() + "</p></div></div>";
    }

    if (d.max != "NA") {
        outtext = outtext + "<div class='form-group'><label class='col-sm-4 control-label'>Maximum</label><div class='col-sm-6'><p class='form-control-static'>" + (+d.max).toPrecision(4).toString() + "</p></div></div>";
    }

    if (d.min != "NA") {
        outtext = outtext + "<div class='form-group'><label class='col-sm-4 control-label'>Minimum</label><div class='col-sm-6'><p class='form-control-static'>" + (+d.min).toPrecision(4).toString() + "</p></div></div>";
    }
    if (d.invalid != "NA") {
        outtext = outtext + "<div class='form-group'><label class='col-sm-4 control-label'>Invalid</label><div class='col-sm-6'><p class='form-control-static'>" + rint(d.invalid) + "</p></div></div>";
    }
    if (d.valid != "NA") {
        outtext = outtext + "<div class='form-group'><label class='col-sm-4 control-label'>Valid</label><div class='col-sm-6'><p class='form-control-static'>" + rint(d.valid) + "</p></div></div>";
    }

    if (d.uniques != "NA") {
        outtext = outtext + "<div class='form-group'><label class='col-sm-4 control-label'>Uniques</label><div class='col-sm-6'><p class='form-control-static'>" + rint(d.uniques) + "</p></div></div>";
    }
    if (d.herfindahl != "NA") {
        outtext = outtext + "<div class='form-group'><label class='col-sm-4 control-label'>Herfindahl</label><div class='col-sm-6'><p class='form-control-static'>" + (+d.herfindahl).toPrecision(4).toString() + "</p></div></div>";
    }

    return outtext;
}

function popupX(d) {

    var tsf = d3.format(".4r");
    var rint = d3.format("r");

    //Create the tooltip label
    d3.select("#tooltip")
        .style("left", tempX + "px")
        .style("top", tempY + "px")
        .select("#tooltiptext")
        .html("<div class='form-group'><label class='col-sm-4 control-label'>Mean</label><div class='col-sm-6'><p class='form-control-static'>" + tsf(d.mean) + "</p></div></div>" +

            "<div class='form-group'><label class='col-sm-4 control-label'>Median</label><div class='col-sm-6'><p class='form-control-static'>" + tsf(d.median) + "</p></div></div>" +

            "<div class='form-group'><label class='col-sm-4 control-label'>Mode</label><div class='col-sm-6'><p class='form-control-static'>" + d.mode + "</p></div></div>" +

            "<div class='form-group'><label class='col-sm-4 control-label'>Stand Dev</label><div class='col-sm-6'><p class='form-control-static'>" + tsf(d.sd) + "</p></div></div>" +

            "<div class='form-group'><label class='col-sm-4 control-label'>Maximum</label><div class='col-sm-6'><p class='form-control-static'>" + tsf(d.max) + "</p></div></div>" +

            "<div class='form-group'><label class='col-sm-4 control-label'>Minimum</label><div class='col-sm-6'><p class='form-control-static'>" + tsf(d.min) + "</p></div></div>" +

            "<div class='form-group'><label class='col-sm-4 control-label'>Valid</label><div class='col-sm-6'><p class='form-control-static'>" + rint(d.valid) + "</p></div></div>" +

            "<div class='form-group'><label class='col-sm-4 control-label'>Invalid</label><div class='col-sm-6'><p class='form-control-static'>" + rint(d.invalid) + "</p></div></div>"
        );

    /*.html("Median: " + d.median + "<br>Mode: " + d.mode + "<br>Maximum: " + d.max + "<br>Minimum: " + d.min + "<br>Mean: " + d.mean + "<br>Invalid: " + d.invalid + "<br>Valid: " + d.valid + "<br>Stand Dev: " + d.sd);*/

    //d3.select("#tooltip")
    //.style("display", "inline")
    //.select("#tooltip h3.popover-title")
    //.html("Summary Statistics");

}


function panelPlots() {

    // build arrays from nodes in main
    var varArray = [];
    var idArray = [];

    for (var j = 0; j < nodes.length; j++) {
        varArray.push(nodes[j].name.replace(/\(|\)/g, ""));
        idArray.push(nodes[j].id);
    }

    //remove all plots, could be smarter here
    d3.select("#setx").selectAll("svg").remove();
    d3.select("#tab2").selectAll("svg").remove();

    for (var i = 0; i < varArray.length; i++) {
        allNodes[idArray[i]].setxplot = false;
        allNodes[idArray[i]].subsetplot = false;
        if (allNodes[idArray[i]].plottype === "continuous" & allNodes[idArray[i]].setxplot == false) {
            allNodes[idArray[i]].setxplot = true;
            //console.log(private);
            density(allNodes[idArray[i]], div = "setx", private);
            allNodes[idArray[i]].subsetplot = true;
            density(allNodes[idArray[i]], div = "subset", private);
        }
        else if (allNodes[idArray[i]].plottype === "bar" & allNodes[idArray[i]].setxplot == false) {
            allNodes[idArray[i]].setxplot = true;
            bars(allNodes[idArray[i]], div = "setx", private);
            allNodes[idArray[i]].subsetplot = true;
            barsSubset(allNodes[idArray[i]]);
        }
    }


    d3.select("#setx").selectAll("svg")
        .each(function () {
            d3.select(this);
            var regstr = /(.+)_setx_(\d+)/;
            var myname = regstr.exec(this.id);
            var nodeid = myname[2];
            myname = myname[1];
            var j = varArray.indexOf(myname);

            if (j == -1) {
                allNodes[nodeid].setxplot = false;
                var temp = "#".concat(myname, "_setx_", nodeid);
                d3.select(temp)
                    .remove();

                allNodes[nodeid].subsetplot = false;
                var temp = "#".concat(myname, "_tab2_", nodeid);
                d3.select(temp)
                    .remove();
            }
        });
}

// easy functions to collapse panels to base
function rightpanelMedium() {
    d3.select("#rightpanel")
        .attr("class", "sidepanel container clearfix");
}

function leftpanelMedium() {
    d3.select("#leftpanel")
        .attr("class", "sidepanel container clearfix");
}

// function to convert color codes
function hexToRgba(hex) {
    var h = hex.replace('#', '');

    var bigint = parseInt(h, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    var a = '0.5';

    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

// function takes a node and a color and updates zparams
function setColors(n, c) {
    //console.log("inside setColor: n=",n);
    //if(c==timeColor){

    if (n.strokeWidth == '1') { // adding time, cs, dv, nom to a node with no stroke
        //console.log("inside strokewidth if");
        n.strokeWidth = '4';
        n.strokeColor = c;
        n.nodeCol = taggedColor;
        if (dvColor == c) {
            // check if array, if not, make it an array
            //  console.log(Object.prototype.toString.call(zparams.zdv));
            zparams.zdv = Object.prototype.toString.call(zparams.zdv) == "[object Array]" ? zparams.zdv : [];
            zparams.zdv.push(n.name);
        }
        else if (csColor == c) {
            zparams.zcross = Object.prototype.toString.call(zparams.zcross) == "[object Array]" ? zparams.zcross : [];
            zparams.zcross.push(n.name);
        }
        else if (timeColor == c) {

            zparams.ztime = Object.prototype.toString.call(zparams.ztime) == "[object Array]" ? zparams.ztime : [];
            zparams.ztime.push(n.name);
        }
        else if (nomColor == c) {
            zparams.znom = Object.prototype.toString.call(zparams.znom) == "[object Array]" ? zparams.znom : [];
            zparams.znom.push(n.name);
            allNodes[findNodeIndex(n.name)].nature = "nominal";
            transform(n.name, t = null, typeTransform = true);
        }

        d3.select("#tab1").select("p#".concat(n.name))
            .style('background-color', hexToRgba(c));
    }
    else if (n.strokeWidth == '4') {
        if (c == n.strokeColor) { // deselecting time, cs, dv, nom
            n.strokeWidth = '1';
            n.strokeColor = selVarColor;
            n.nodeCol = colors(n.id);
            d3.select("#tab1").select("p#".concat(n.name))
                .style('background-color', hexToRgba(selVarColor));

            if (dvColor == c) {
                var dvIndex = zparams.zdv.indexOf(n.name);
                if (dvIndex > -1) {
                    zparams.zdv.splice(dvIndex, 1);
                }
            }
            else if (csColor == c) {
                var csIndex = zparams.zcross.indexOf(n.name);
                if (csIndex > -1) {
                    zparams.zcross.splice(csIndex, 1);
                }
            }
            else if (timeColor == c) {
                var timeIndex = zparams.ztime.indexOf(n.name);
                if (timeIndex > -1) {
                    zparams.ztime.splice(timeIndex, 1);
                }
            }
            else if (nomColor == c) {
                var nomIndex = zparams.znom.indexOf(n.name);
                if (nomIndex > -1) {
                    zparams.znom.splice(nomIndex, 1);
                    allNodes[findNodeIndex(n.name)].nature = allNodes[findNodeIndex(n.name)].defaultNature;
                    transform(n.name, t = null, typeTransform = true);
                }
            }
        }
        else { // deselecting time, cs, dv, nom AND changing it to time, cs, dv, nom
            if (dvColor == n.strokeColor) {
                var dvIndex = zparams.zdv.indexOf(n.name);
                if (dvIndex > -1) {
                    zparams.zdv.splice(dvIndex, 1);
                }
            }
            else if (csColor == n.strokeColor) {
                var csIndex = zparams.zcross.indexOf(n.name);
                if (csIndex > -1) {
                    zparams.zcross.splice(csIndex, 1);
                }
            }
            else if (timeColor == n.strokeColor) {
                var timeIndex = zparams.ztime.indexOf(n.name);
                if (timeIndex > -1) {
                    zparams.ztime.splice(timeIndex, 1);
                }
            }
            else if (nomColor == n.strokeColor) {
                var nomIndex = zparams.znom.indexOf(n.name);
                if (nomIndex > -1) {
                    zparams.znom.splice(nomIndex, 1);
                    allNodes[findNodeIndex(n.name)].nature = allNodes[findNodeIndex(n.name)].defaultNature;
                    transform(n.name, t = null, typeTransform = true);
                }
            }
            n.strokeColor = c;
            d3.select("#tab1").select("p#".concat(n.name))
                .style('background-color', hexToRgba(c));

            if (dvColor == c) {
                zparams.zdv.push(n.name);
            }
            else if (csColor == c) {
                zparams.zcross.push(n.name);
            }
            else if (timeColor == c) {
                zparams.ztime.push(n.name);
            }
            else if (nomColor == c) {
                zparams.znom.push(n.name);
                allNodes[findNodeIndex(n.name)].nature = "nominal";
                transform(n.name, t = null, typeTransform = true);
            }
        }
    }
}

//function tagColors is called when a variable is added to the modeling space AND that variable contains a 'tag-able' property that will change the appears of the pebble--examples include 'time', 'nominal', and 'dv'. Set c to false if passing more than one node in n, as would be done  through scaffolding when initially called.
function tagColors(n, c) {

    function baseSet(n, c) {
        n.strokeWidth = '4';
        n.strokeColor = c;
        n.nodeCol = taggedColor;
        fakeClick();
        if (dvColor == c) {
            // check if array, if not, make it an array
            //  console.log(Object.prototype.toString.call(zparams.zdv));
            zparams.zdv = Object.prototype.toString.call(zparams.zdv) == "[object Array]" ? zparams.zdv : [];
            zparams.zdv.push(n.name);
        }
        else if (csColor == c) {
            zparams.zcross = Object.prototype.toString.call(zparams.zcross) == "[object Array]" ? zparams.zcross : [];
            zparams.zcross.push(n.name);
        }
        else if (timeColor == c) {
            zparams.ztime = Object.prototype.toString.call(zparams.ztime) == "[object Array]" ? zparams.ztime : [];
            zparams.ztime.push(n.name);
        }
        else if (nomColor == c) {
            zparams.znom = Object.prototype.toString.call(zparams.znom) == "[object Array]" ? zparams.znom : [];
            zparams.znom.push(n.name);
        }
    }

    if (c === false) {
        for (i = 0; i < n.length; i++) {
            myNode = n[i];
            if (myNode.time === "yes") {
                baseSet(myNode, timeColor);
            }
            else if (myNode.nature === "nominal") {
                baseSet(myNode, nomColor);
            }
        }
    }
    else {
        baseSet(n, c);
    }
}

// function that takes a node and rewrites strokeColor to match the property
function allNodesColors(n) {
    if (n.nature == "nominal") {
        n.strokeColor = nomColor;
    }
    if (n.time == "yes") {
        n.strokeColor = timeColor;
    }
}

function borderState() {
    if (zparams.zdv.length > 0) {
        $('#dvButton .rectColor svg circle').attr('stroke', dvColor);
    }
    else {
        $('#dvButton').css('border-color', '#ccc');
    }
    if (zparams.zcross.length > 0) {
        $('#csButton .rectColor svg circle').attr('stroke', csColor);
    }
    else {
        $('#csButton').css('border-color', '#ccc');
    }
    if (zparams.ztime.length > 0) {
        $('#timeButton .rectColor svg circle').attr('stroke', timeColor);
    }
    else {
        $('#timeButton').css('border-color', '#ccc');
    }
    if (zparams.znom.length > 0) {
        $('#nomButton .rectColor svg circle').attr('stroke', nomColor);
    }
    else {
        $('#nomButton').css('border-color', '#ccc');
    }
}

// small appearance resets, but perhaps this will become a hard reset back to all original allNode values?
function nodeReset(n) {
    n.strokeColor = selVarColor;
    n.strokeWidth = "1";
    n.nodeCol = n.baseCol;
}

function subsetSelect(btn) {

    if (dataurl) {
        zparams.zdataurl = dataurl;
    }

    if (production && zparams.zsessionid == "") {
        alert("Warning: Data download is not complete. Try again soon.");
        return;
    }

    zparams.zvars = [];
    zparams.zplot = [];

    var subsetEmpty = true;

    // is this the same as zPop()?
    for (var j = 0; j < nodes.length; j++) { //populate zvars and zsubset arrays
        zparams.zvars.push(nodes[j].name);
        var temp = nodes[j].id;
        zparams.zsubset[j] = allNodes[temp].subsetrange;
        if (zparams.zsubset[j].length > 0) {
            if (zparams.zsubset[j][0] != "") {
                zparams.zsubset[j][0] = Number(zparams.zsubset[j][0]);
            }
            if (zparams.zsubset[j][1] != "") {
                zparams.zsubset[j][1] = Number(zparams.zsubset[j][1]);
            }
        }
        zparams.zplot.push(allNodes[temp].plottype);
        if (zparams.zsubset[j][1] != "") {
            subsetEmpty = false;
        } //only need to check one
    }

    if (subsetEmpty == true) {
        alert("Warning: No new subset selected.");
        return;
    }

    var outtypes = [];
    for (var j = 0; j < allNodes.length; j++) {
        outtypes.push({
            varnamesTypes: allNodes[j].name,
            nature: allNodes[j].nature,
            numchar: allNodes[j].numchar,
            binary: allNodes[j].binary,
            interval: allNodes[j].interval,
            time: allNodes[j].time
        });
    }

    var subsetstuff = {
        zdataurl: zparams.zdataurl,
        zvars: zparams.zvars,
        zsubset: zparams.zsubset,
        zsessionid: zparams.zsessionid,
        zplot: zparams.zplot,
        callHistory: callHistory,
        typeStuff: outtypes
    };

    var jsonout = JSON.stringify(subsetstuff);
    //var base = rappURL+"subsetapp?solaJSON="
    urlcall = rappURL + "subsetapp"; //base.concat(jsonout);
    var solajsonout = "solaJSON=" + jsonout;

    console.log("POST out: ", solajsonout);


    function subsetSelectSuccess(btn, json) {
        console.log(json);
        selectLadda.stop(); // stop motion
        $("#btnVariables").trigger("click"); // programmatic clicks
        $("#btnUnivariate").trigger("click");

        var grayOuts = [];

        var rCall = [];
        rCall[0] = json.call;


        // store contents of the pre-subset space
        zPop();
        var myNodes = jQuery.extend(true, [], allNodes);
        var myParams = jQuery.extend(true, {}, zparams);
        var myTrans = jQuery.extend(true, [], trans);
        var myForce = jQuery.extend(true, [], forcetoggle);
        var myPreprocess = jQuery.extend(true, {}, preprocess);
        var myLog = jQuery.extend(true, [], logArray);
        var myHistory = jQuery.extend(true, [], callHistory);

        spaces[myspace] = {
            "allNodes": myNodes,
            "zparams": myParams,
            "trans": myTrans,
            "force": myForce,
            "preprocess": myPreprocess,
            "logArray": myLog,
            "callHistory": myHistory
        };

        // remove pre-subset svg
        var selectMe = "#m".concat(myspace);
        d3.select(selectMe).attr('class', 'item');
        selectMe = "#whitespace".concat(myspace);
        d3.select(selectMe).remove();

        // selectMe = "navdot".concat(myspace);
        // var mynavdot = document.getElementById(selectMe);
        // mynavdot.removeAttribute("class");

        myspace = spaces.length;
        callHistory.push({
            func: "subset",
            zvars: jQuery.extend(true, [], zparams.zvars),
            zsubset: jQuery.extend(true, [], zparams.zsubset),
            zplot: jQuery.extend(true, [], zparams.zplot)
        });


        //  selectMe = "navdot".concat(myspace-1);
        //  mynavdot = document.getElementById(selectMe);

        //   var newnavdot = document.createElement("li");
        //   newnavdot.setAttribute("class", "active");
        //    selectMe = "navdot".concat(myspace);
        //    newnavdot.setAttribute("id", selectMe);
        //    mynavdot.parentNode.insertBefore(newnavdot, mynavdot.nextSibling);


        // this is to be used to gray out and remove listeners for variables that have been subsetted out of the data
        function varOut(v) {
            // if in nodes, remove
            // gray out in left panel
            // make unclickable in left panel
            for (var i = 0; i < v.length; i++) {
                var selectMe = v[i].replace(/\W/g, "_");
                document.getElementById(selectMe).style.color = hexToRgba(grayColor);
                selectMe = "p#".concat(selectMe);
                d3.select(selectMe)
                    .on("click", null);
            }
        }

        logArray.push("subset: ".concat(rCall[0]));
        showLog();
        reWriteLog();

        d3.select("#innercarousel")
            .append('div')
            .attr('class', 'item active')
            .attr('id', function () {
                return "m".concat(myspace.toString());
            })
            .append('svg')
            .attr('id', 'whitespace');
        svg = d3.select("#whitespace");


        d3.json(json.url, function (error, json) {
            if (error) return console.warn(error);
            var jsondata = json;
            var vars = jsondata["variables"];

            // console.log(jsondata);
            for (var key in jsondata["variables"]) {

                var myIndex = findNodeIndex(key);
                //console.log("Key Value:"+key);
                //console.log("My index:"+myIndex);
                //console.log("Node Index"+findNodeIndex(key));
                allNodes[myIndex].plotx = undefined;
                allNodes[myIndex].ploty = undefined;
                allNodes[myIndex].plotvalues = undefined;
                allNodes[myIndex].plottype = "";
                //allNodes[myIndex].plotx=null;
                //allNodes[myIndex].ploty=null;
                //allNodes[myIndex].plotvalues=null;
                //allNodes[myIndex].plottype="";

                jQuery.extend(true, allNodes[myIndex], jsondata.variables[key]);
                allNodes[myIndex].subsetplot = false;
                allNodes[myIndex].subsetrange = ["", ""];
                allNodes[myIndex].setxplot = false;
                allNodes[myIndex].setxvals = ["", ""];

                if (allNodes[myIndex].valid == 0) {
                    grayOuts.push(allNodes[myIndex].name);
                    allNodes[myIndex].grayout = true;
                }
            }

            rePlot();
            populatePopover();
            layout(v = "add");

        });
        //  console.log("vaalue of all nodes after subset:",allNodes);
        varOut(grayOuts);
    }


    function subsetSelectFail(btn) {
        selectLadda.stop(); //stop motion
    }

    selectLadda.start(); //start button motion
    makeCorsRequest(urlcall, btn, subsetSelectSuccess, subsetSelectFail, solajsonout);

}

function readPreprocess(url, p, v, callback) {
    //console.log(url);
    //console.log("purl:",url);
    d3.json(url, function (error, json) {
        if (error) return console.warn(error);
        var jsondata = json;

        //console.log("inside readPreprocess function");
        //console.log(jsondata);
        //console.log(jsondata["variables"]);

        if (jsondata.dataset.private) {
            private = jsondata["dataset"]["private"];
        }
        ;

        //copying the object
        for (var key in jsondata["variables"]) {
            p[key] = jsondata["variables"][key];
        }
        // console.log("we're here")
        // console.log(p);

        if (typeof callback === "function") {
            callback();
        }
    });
}

/*
 function delSpace() {
 if (spaces.length===0 | (spaces.length===1 & myspace===0)) {return;}
 var lastSpace = false;
 if(myspace >= spaces.length-1) { lastSpace=true; }
 spaces.splice(myspace, 1);

 // remove current whitespace
 var selectMe = "#m".concat(myspace);
 d3.select(selectMe).attr('class', 'item');
 selectMe = "#whitespace".concat(myspace);
 d3.select(selectMe).remove();

 // remove last navdot
 selectMe = "navdot".concat(spaces.length);
 var mynavdot = document.getElementById(selectMe);
 mynavdot.parentElement.removeChild(mynavdot); // remove from parent to remove the pointer to the child

 // remove last inner carousel m
 selectMe = "m".concat(spaces.length);
 var mynavdot = document.getElementById(selectMe);
 mynavdot.parentElement.removeChild(mynavdot);

 if(lastSpace) { myspace = myspace-1; }

 selectMe = "navdot".concat(myspace);
 newnavdot = document.getElementById(selectMe);
 newnavdot.setAttribute("class", "active");

 // add whitespace back in to current inner carousel m
 selectMe = "#m".concat(myspace);
 d3.select(selectMe).attr('class', 'item active')
 .append('svg').attr('id', function(){
 return "whitespace".concat(myspace);
 });

 allNodes = jQuery.extend(true, [], spaces[myspace].allNodes);
 zparams = jQuery.extend(true, {}, spaces[myspace].zparams);
 trans = jQuery.extend(true, [], spaces[myspace].trans);
 forcetoggle = jQuery.extend(true, [], spaces[myspace].force);
 preprocess = jQuery.extend(true, {}, spaces[myspace].preprocess);

 selectMe = "#whitespace".concat(myspace);
 svg = d3.select(selectMe);

 layout(v="move");
 }


 // for the following three functions, the general idea is to store the new information for the current space, and then move myspace according (right: +1, left: -1, addSpace: spaces.length)
 function addSpace() {

 zPop();

 // everything we need to save the image of the current space.
 var myNodes = jQuery.extend(true, [], allNodes); // very important. this clones the allNodes object, and may slow us down in the future.  if user hits plus 4 times, we'll have four copies of the same space in memory.  certainly a way to optimize this
 var myParams = jQuery.extend(true, {}, zparams);
 var myTrans = jQuery.extend(true, [], trans);
 var myForce = jQuery.extend(true, [], forcetoggle);
 var myPreprocess = jQuery.extend(true, {}, preprocess);
 var myLog = jQuery.extend(true, [], logArray);
 var myHistory = jQuery.extend(true, [], callHistory);


 spaces[myspace] = {"allNodes":myNodes, "zparams":myParams, "trans":myTrans, "force":myForce, "preprocess":myPreprocess, "logArray":myLog, "callHistory":myHistory};

 var selectMe = "#m".concat(myspace);
 d3.select(selectMe).attr('class', 'item');
 selectMe = "#whitespace".concat(myspace);
 d3.select(selectMe).remove();

 selectMe = "navdot".concat(myspace);
 var mynavdot = document.getElementById(selectMe);
 mynavdot.removeAttribute("class");

 myspace = spaces.length;

 selectMe = "navdot".concat(myspace-1);
 mynavdot = document.getElementById(selectMe);

 var newnavdot = document.createElement("li");
 newnavdot.setAttribute("class", "active");
 selectMe = "navdot".concat(myspace);
 newnavdot.setAttribute("id", selectMe);
 mynavdot.parentNode.insertBefore(newnavdot, mynavdot.nextSibling);

 d3.select("#innercarousel")
 .append('div')
 .attr('class', 'item active')
 .attr('id', function(){
 return "m".concat(myspace.toString());
 })
 .append('svg')
 .attr('id', 'whitespace');
 svg = d3.select("#whitespace");

 layout(v="add");

 }

 function left() {

 zPop();

 var myNodes = jQuery.extend(true, [], allNodes); // very important. this clones the allNodes object, and may slow us down in the future.  if user hits plus 4 times, we'll have four copies of the same space in memory.  certainly a way to optimize this
 var myParams = jQuery.extend(true, {}, zparams);
 var myTrans = jQuery.extend(true, [], trans);
 var myForce = jQuery.extend(true, [], forcetoggle);
 var myPreprocess = jQuery.extend(true, {}, preprocess);
 var myLog = jQuery.extend(true, [], logArray);
 var myHistory = jQuery.extend(true, [], callHistory);

 if(typeof spaces[myspace] === "undefined") {
 spaces.push({"allNodes":myNodes, "zparams":myParams, "trans":myTrans, "force":myForce, "preprocess":myPreprocess, "logArray":myLog, "callHistory":myHistory});
 }
 else {
 spaces[myspace] = {"allNodes":myNodes, "zparams":myParams, "trans":myTrans, "force":myForce, "preprocess":myPreprocess, "logArray":myLog, "callHistory":myHistory};
 }

 if(myspace===0) {
 myspace=spaces.length-1; // move to last when left is click at 0
 }
 else {
 myspace = myspace-1;
 }

 selectMe = "#m".concat(myspace);
 d3.select(selectMe)
 .append('svg').attr('id', function(){
 return "whitespace".concat(myspace);
 });

 allNodes = jQuery.extend(true, [], spaces[myspace].allNodes);
 zparams = jQuery.extend(true, {}, spaces[myspace].zparams);
 trans = jQuery.extend(true, [], spaces[myspace].trans);
 forcetoggle = jQuery.extend(true, [], spaces[myspace].force);
 preprocess = jQuery.extend(true, {}, spaces[myspace].preprocess);
 logArray = jQuery.extend(true, [], spaces[myspace].logArray);
 callHistory = jQuery.extend(true, [], spaces[myspace].callHistory);

 selectMe = "#whitespace".concat(myspace);
 svg = d3.select(selectMe);

 rePlot();
 layout(v="move");

 selectMe = "navdot".concat(myspace);
 newnavdot = document.getElementById(selectMe);
 newnavdot.setAttribute("class", "active");

 if(myspace===spaces.length-1) {
 myspace=0;
 }
 else {
 myspace = myspace+1;
 }

 selectMe = "navdot".concat(myspace);
 var mynavdot = document.getElementById(selectMe);
 mynavdot.removeAttribute("class", "active");

 selectMe = "#whitespace".concat(myspace);
 d3.select(selectMe).remove();

 if(myspace===0) {
 myspace=spaces.length-1; // move to last when left is click at 0
 }
 else {
 myspace = myspace-1;
 }


 if(forcetoggle[0]==="false") {
 document.getElementById('btnForce').setAttribute("class", "btn active");
 }
 else {
 document.getElementById('btnForce').setAttribute("class", "btn btn-default");
 }

 d3.select("#univariate").selectAll("p").style("background-color", varColor);
 selectMe = "#_model_".concat(zparams.zmodel);
 d3.select(selectMe).style("background-color", hexToRgba(selVarColor));

 selectMe = "#whitespace".concat(myspace);
 svg = d3.select(selectMe);

 legend();
 showLog();
 reWriteLog();

 //   event.preventDefault();

 }

 function right() {
 zPop();
 var myNodes = jQuery.extend(true, [], allNodes);
 var myParams = jQuery.extend(true, {}, zparams);
 var myTrans = jQuery.extend(true, [], trans);
 var myForce = jQuery.extend(true, [], forcetoggle);
 var myPreprocess = jQuery.extend(true, {}, preprocess);
 var myLog = jQuery.extend(true, [], logArray);
 var myHistory = jQuery.extend(true, [], callHistory);

 spaces[myspace] = {"allNodes":myNodes, "zparams":myParams, "trans":myTrans, "force":myForce, "preprocess":myPreprocess, "logArray":myLog,"callHistory":myHistory};


 if(myspace===spaces.length-1) {
 myspace=0; // move to last when left is click at 0
 }
 else {
 myspace = myspace+1;
 }

 selectMe = "#m".concat(myspace);
 d3.select(selectMe)
 .append('svg').attr('id', function(){
 return "whitespace".concat(myspace);
 });

 allNodes = jQuery.extend(true, [], spaces[myspace].allNodes);
 zparams = jQuery.extend(true, {}, spaces[myspace].zparams);
 trans = jQuery.extend(true, [], spaces[myspace].trans);
 forcetoggle = jQuery.extend(true, [], spaces[myspace].force);
 preprocess = jQuery.extend(true, {}, spaces[myspace].preprocess);
 logArray = jQuery.extend(true, [], spaces[myspace].logArray);
 callHistory = jQuery.extend(true, [], spaces[myspace].callHistory);

 selectMe = "#whitespace".concat(myspace);
 svg = d3.select(selectMe);

 rePlot();
 layout(v="move");

 if(myspace===0) {
 myspace=spaces.length-1;
 }
 else {
 myspace = myspace-1;
 }

 selectMe = "navdot".concat(myspace);
 var mynavdot = document.getElementById(selectMe);
 mynavdot.removeAttribute("class", "active");

 selectMe = "#whitespace".concat(myspace);
 d3.select(selectMe).remove();

 if(myspace===spaces.length-1) {
 myspace=0; // move to last when left is click at 0
 }
 else {
 myspace = myspace+1;
 }

 selectMe = "navdot".concat(myspace);
 var newnavdot = document.getElementById(selectMe);
 newnavdot.setAttribute("class", "active");

 if(forcetoggle[0]==="false") {
 document.getElementById('btnForce').setAttribute("class", "btn active");
 }
 else {
 document.getElementById('btnForce').setAttribute("class", "btn btn-default");
 }

 d3.select("#univariate").selectAll("p").style("background-color", varColor);
 selectMe = "#_model_".concat(zparams.zmodel);
 d3.select(selectMe).style("background-color", hexToRgba(selVarColor));

 selectMe = "#whitespace".concat(myspace);
 svg = d3.select(selectMe);

 legend();
 showLog();
 reWriteLog();

 //  event.preventDefault();
 }

 */

function about() {
    $('#about').show();
}

function closeabout() {
    $('#about').hide();
}

function opencite() {
    $('#cite').show();
}

function closecite(toggle) {
    if (toggle == false) {
        $('#cite').hide();
    }
}

function clickcite(toggle) {
    if (toggle == false) {
        $('#cite').show();
        return true;
    } else {
        $('#cite').hide();
        return false;
    }
}

// function to remove all the children svgs inside subset and setx divs
function rePlot() {

    d3.select("#tab2")
        .selectAll("svg")
        .remove();

    d3.select("#setx")
        .selectAll("svg")
        .remove();

    // make this smarter
    for (var i = 0; i < allNodes.length; i++) {
        allNodes[i].setxplot = false;
        allNodes[i].subsetplot = false;
    }
}

function showLog() {
    if (logArray.length > 0) {
        document.getElementById('logdiv').setAttribute("style", "display:block");
        d3.select("#collapseLog div.panel-body").selectAll("p")
            .data(logArray)
            .enter()
            .append("p")
            .text(function (d) {
                return d;
            });
    }
    else {
        document.getElementById('logdiv').setAttribute("style", "display:none");
    }
}

function reWriteLog() {
    d3.select("#collapseLog div.panel-body").selectAll("p")
        .remove();
    d3.select("#collapseLog div.panel-body").selectAll("p")
        .data(logArray)
        .enter()
        .append("p")
        .text(function (d) {
            return d;
        });
}


// acts as if the user clicked in whitespace. useful when restart() is outside of scope
function fakeClick() {
    var myws = "#whitespace".concat(myspace);
    // d3 and programmatic events don't mesh well, here's a SO workaround that looks good but uses jquery...
    jQuery.fn.d3Click = function () {
        this.each(function (i, e) {
            var evt = document.createEvent("MouseEvents");
            evt.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

            e.dispatchEvent(evt);
        });
    };
    $(myws).d3Click();

    d3.select(myws)
        .classed('active', false); // remove active class
}
