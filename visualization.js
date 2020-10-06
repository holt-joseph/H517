/*
    Joseph Holt
    H517 Data Visualization
    Project 01

    File: visualization.js
    Description: Uses D3 to draw and interact with two main modules - the map and the graphs.
 */

// Constants for all data filepaths.
const data_baseURL = "data/";
const streets_URL = data_baseURL + "streets.json";
const pumps_URL = data_baseURL + "pumps.csv";
const deathDays_URL = data_baseURL + "deathdays.csv";
const deathAgeSex_URL = data_baseURL + "deaths_age_sex.csv";

// SVG elements for map and graphs.
const map = d3.select("#map");
const timeline = d3.select("#timeline");
const legend = d3.select("#legend");

// Scalar used to quickly adjust map dimensions.
var map_scale = 30;

// Adjusts the dimensions the map is drawn on the SVG element.
var map_panX = map_scale * 3;
var map_panY = map_panX;

// Dimensions used for timeline graph.
const timeline_height = 400;
const timeline_width = 700;



function drawMap(streets) {

    for (let i in streets) {
        let segment = streets[i];

        let points_X = [];
        let points_Y = [];
        for (let j in segment) {
            let point = segment[j];
            points_X.push(point["x"]);
            points_Y.push(point["y"]);
        }

        for (let j in points_X) {
            if (j > 0) {
                map.append("line")
                    .attr("x1", points_X[j-1] * map_scale - map_panX)
                    .attr("y1", -points_Y[j-1] * map_scale + map_panY)
                    .attr("x2", points_X[j] * map_scale - map_panX)
                    .attr("y2", -points_Y[j] * map_scale + map_panY)
                    .attr("stroke-width", map_scale / 20)
                    .attr("transform", "translate(0," + (map_scale * 17.5) + ")");
            }
        }
    }

    map.append("text")
        .attr("x", 11.125 * map_scale - map_panX)
        .attr("y", -11.5 * map_scale + map_panY)
        .attr("transform", "translate(0," + (map_scale * 17.5) + ")")
        .attr("font-size", (map_scale / 5) + "px")
        .text("Broad St");

    map.append("text")
        .attr("x", 10 * map_scale - map_panX)
        .attr("y", -13.5 * map_scale + map_panY)
        .attr("transform", "translate(0," + (map_scale * 17.5) + ")")
        .attr("font-size", (map_scale / 4) + "px")
        .text("Work House");

    map.append("text")
        .attr("x", 13.5 * map_scale - map_panX)
        .attr("y", -11.75 * map_scale + map_panY)
        .attr("transform", "translate(0," + (map_scale * 17.5) + ")")
        .attr("font-size", (map_scale / 5) + "px")
        .text("Brewery");

}

function clearMap(){
    d3.selectAll("#map > *").remove();
}

function changeScale(value) {
    if (value == 0){
        map_scale = 30;
    } else {
        map_scale += value;
    }

    clearMap();

    d3.json(streets_URL, function(streets) {
        //console.log(data);
        drawMap(streets);
    });

    d3.csv(pumps_URL, function(pumps) {
        //console.log(pumps);
        plotPumps(pumps);
    });

    d3.csv(deathAgeSex_URL, function(deaths) {
        //console.log(deaths);
        plotDeathLocations(deaths);
    });

}

function changePan(value, axis) {

    switch(axis){
        case "X":
            map_panX += value;
            break;
        case "Y":
            map_panY += value;
            break;
        case "C":
            map_panX = map_scale * 3;
            map_panY = map_panX;
    }

    clearMap();

    d3.json(streets_URL, function(streets) {
        //console.log(data);
        drawMap(streets);
    });

    d3.csv(pumps_URL, function(pumps) {
        //console.log(pumps);
        plotPumps(pumps);
    });

    d3.csv(deathAgeSex_URL, function(deaths) {
        //console.log(deaths);
        plotDeathLocations(deaths);
    });

}

function plotPumps(pumps) {

    for (let i in pumps){
        let point = pumps[i];

        map.append("circle")
            .attr("cx", point["x"] * map_scale - map_panX)
            .attr("cy", -point["y"] * map_scale + map_panY)
            .attr("stroke-width", map_scale / 200)
            .attr("r", map_scale / 10)
            .attr("transform", "translate(0," + (map_scale * 17.5) + ")");
    }

    legend.append("circle")
        .attr("cx", 6)
        .attr("cy", 6)
        .attr("r", 5)
        .attr("transform", "translate(0,35)");

}

function plotDeathLocations(deaths) {

    for (let i in deaths){
        let point = deaths[i];

        map.append("rect")
            .attr("x", point["x"] * map_scale - map_panX)
            .attr("y", -point["y"] * map_scale + map_panY)
            .attr("stroke-width", map_scale / 200)
            .attr("width", map_scale / 15)
            .attr("height", map_scale / 15)
            .attr("transform", "translate(0," + (map_scale * 17.5) + ")");
    }

    legend.append("rect")
        .attr("x", 1.25)
        .attr("y", 5)
        .attr("width", 10)
        .attr("height", 10)
        .attr("transform", "translate(0,60)")

}

function plotTimelineGraph(deaths) {

    // The scale of numbers for the X and Y axis.
    var scale_X = d3.scale.linear();
    var scale_Y = d3.scale.linear();

    scale_X.domain([19, 60]).range(0, timeline_width);
    scale_Y.domain([0, 150]).range(timeline_height, 0);

    var deathsByDay = [];

    for (let i in deaths) {
        let toll = deaths[i]["deaths"];

        let date = deaths[i]["date"];
        if (date.includes("Aug")){
            date = date.replace("-Aug", "");
        } else if (date.includes("Sep")) {
            date = date.replace("-Sep", "");
            date = Number(date) + 31;
        }

        var object = {
            date: +date,
            toll: +toll
        };

        deathsByDay.push(object);
    }

    console.log(deathsByDay);

    // Generate a line given each date/toll value pair.
    var pathGenerator = d3.svg.line()
        .x(function(d) { return scale_X(d.date); })
        .y(function(d) { return scale_Y(d.toll)});

    var g = d3.select('#timeline').select('g');


    var axis_x = d3.svg.axis()
        .scale(scale_X)
        .orient('bottom')
        .tickFormat(function(d) { return "" + d; });

    var axis_y = d3.svg.axis()
        .scale(scale_Y)
        .orient('left');


    g.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + timeline_height + ')')
        .call(axis_x);

    g.append('g')
        .attr('class', 'axis')
        .call(axis_y);

    g.append('path')
        .style('fill', 'none')
        .style('stroke', 'steelblue')
        .style('stroke-width', '3px')
        .attr('d', pathGenerator(deathsByDay));

}



d3.json(streets_URL, function(streets) {
    //console.log(data);
    drawMap(streets);
});

d3.csv(pumps_URL, function(pumps) {
    //console.log(pumps);
    plotPumps(pumps);
});

d3.csv(deathAgeSex_URL, function(deaths) {
    //console.log(deaths);
    plotDeathLocations(deaths);
});

d3.csv(deathDays_URL, function(deaths) {
    //console.log(deaths);
    //plotTimelineGraph(deaths);
});