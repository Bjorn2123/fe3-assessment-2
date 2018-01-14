/* global d3 */

// Onderstaande codes heb ik gebruikt van https://bl.ocks.org/mbostock/3885304 en zit bezit van Mike Bostock
// Allereerst maak ik hier de svg aan waarin de grafiek komt te staan
var svg = d3.select("svg"),
    margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

var xAs = d3.scaleBand().rangeRound([10, width]).padding(0.1),
    yAs = d3.scaleLinear().rangeRound([height, 0]);

var groep = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

// Hier laad ik mijn dataset in waarmee ik in function onload ga werken
d3.text('index.csv').get(onload);

function onload(err, doc) {

    if (err) {
        throw err
    }

    /* Met de onderstaande codes schoon ik de dataset zodanig op dat ik nu de regels heb die ik wil laten zien in de grafiek*/
    var header = doc.indexOf('Leeftijd');
    var footer = doc.indexOf('Centraal Bureau voor de Statistiek') - 2;
    var end = doc.indexOf('\n', header);
    doc = doc.substring(end, footer).trim();
    doc = doc.replace(/;+/g, ',');
    doc = doc.replace(/ +/g, ',');
    var data = d3.csvParseRows(doc, map).slice(6, 18) // met de slice pak ik alleen die regels die ik wil laten zien

    function map(d) {
        return {
            Perioden: (d[5]),
            Totaal: (d[6]),
            Mannen: (d[7]),
            Vrouwen: (d[8])
        }

    }

    console.log(data)

    xAs.domain(data.map(function (d) {
        return d.Perioden;
    }));
    yAs.domain([0, 350]);

    groep.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xAs));

    groep.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(yAs).ticks(data.length))
        .append("text")
        .attr("y", 6)
        .attr("dx", "8.4em")
        .attr("dy", "0.80em")
        .attr("text-anchor", "end")
        .text("Aantal werklozen");

    // onderstaand de codes voor de bar voor de mannen


    groep.selectAll(".barMan")
        .data(data)
        .enter().append("rect")
        .attr("class", "barMan")
        .attr("width", (xAs.bandwidth()) / 2)
        .attr("y", function (d) {
            return yAs(d.Mannen);
        })
        .attr("height", function (d) {
            return height - yAs(d.Mannen) - 8;
        })
        .attr("x", function (d) {
            return margin.left + xAs(d.Perioden) - 40;
        }).on('mousemove', function (d) {
            tooltip.transition()
                .duration(150)
                .style('opacity', .9)
            tooltip.html((d.Mannen + ' werklozen'))
                .style('left', (d3.event.pageX) + 'px')
                .style('top', (d3.event.pageY + 20) + 'px')
        })
        .on('mouseout', function (d) {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .attr("fill", "#00a8cf");



    // Onderstaand de codes voor de bar voor de vrouwen 
    groep.selectAll(".barVrouw")
        .data(data)
        .enter().append("rect")
        .attr("class", "barVrouw")
        .attr("width", (xAs.bandwidth()) / 2)
        .attr("y", function (d) {
            return yAs(d.Vrouwen);
        })
        .attr("height", function (d) {
            return height - yAs(d.Vrouwen) - 8;
        })
        .attr("x", function (d) {
            return margin.left + xAs(d.Perioden) - 28 + ((xAs.bandwidth() - 20) / 2);
        }).on('mousemove', function (d) {
            tooltip.transition()
                .duration(150)
                .style('opacity', .9)
            tooltip.html((d.Vrouwen + ' werklozen'))
                .style('left', (d3.event.pageX) + 'px')
                .style('top', (d3.event.pageY - 2) + 'px')
        })
        .on('mouseout', function (d) {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .attr("fill", "#0086a5");


    // Hieronder de codes voor de sorteer interactie.

    d3.select("input").on("change", change);


    d3.select("input").property("unchecked", true).each(change);

    function change() {

        var x0 = xAs.domain(data.sort(this.checked ? function (a, b) {
                    return b.Totaal - a.Totaal;
                } : function (a, b) {
                    return d3.ascending(a.Perioden, b.Perioden);
                })
                .map(function (d) {
                    return d.Perioden;
                }))
            .copy();

        svg.selectAll(".barMan")
            .sort(function (a, b) {
                return x0(a.Perioden) + x0(b.Perioden);
            });

        svg.selectAll(".barVrouw")
            .sort(function (a, b) {
                return x0(a.Perioden) + x0(b.Perioden);
            });


        var transition = svg.transition().duration(750),
            delay = function (d, i) {
                return i * 50;
            };

        transition.selectAll(".barMan")
            .delay(delay)
            .ease(d3.easeBounce)
            .duration(1500)
            .attr("x", function (d) {
                return margin.left + x0(d.Perioden) - 40;
            });


        transition.selectAll(".barVrouw")
            .delay(delay)
            .ease(d3.easeBounce)
            .duration(1500)
            .attr("x", function (d) {
                return margin.left + x0(d.Perioden) - 28 + ((xAs.bandwidth() - 20) / 2);
            });

        transition.select(".axis--x")
            .call(d3.axisBottom(x0))
            .selectAll("g")
            .delay(delay);
    }
};