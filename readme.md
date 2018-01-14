# Assessment 2

Assessment 2 heb ik moeten herkansen en hierbij laat ik het proces daarvan zien. 

## Keuze chart

Voor assessment 2 heb ik gekozen om een grouped bar chart te maken die te sorteren is door middel van een input. Deze bar chart heb ik gebaseerd op de codes van [Basic Bar Chart](https://bl.ocks.org/mbostock/3885304) van Mike Bostock. 

### Stap 1 inladen en opschonen

Allereerst ben ik data gaan zoeken die ik wil visualiseren in een chart. Ik heb gekozen voor de [Werkloosheid in Nederland](http://statline.cbs.nl/Statweb/publication/?DM=SLNL&PA=80590ned&D1=0-2,10-14&D2=0&D3=0&D4=178-180,182-192&VW=T). 


Allereerst maak ik variabelen aan voor de svg waarin de chart komt te staan:

```js
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
```

Omdat het doel van assessment 2 het opschonen van data was heb ik mijn data met onderstaande codes opgeschoond. Ik ben allereerst de header en footer gaan verwijderen. 

```js
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

```

### Stap 2 Chart maken

Vervolgens ben ik de assen gaan maken:

```js
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

```
### Stap 3 Rectangles maken

Omdat ik gekozen heb voor een grouped bar chart heb ik in plaats van 1 rectangles 2 rectangles gemaakt. Namelijk 1 rect voor de mannen en 1 rect voor de vrouwen. Dit heb gedaan met de volgende codes:

```js
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

```

### Stap 4 Sortable maken

Nu ik een grouped bar chart gemaakt heb moet ik deze natuurlijk laten interacteren. Ik heb gekozen om de chart te sorten. Dit heb ik gedaan met onderstaande codes.

```js
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
```
### Stap 5 Legenda

Als laatste stap heb ik een legende gemaakt zodat het voor de gebruiker duidelijk is welke data wat laat zien.




