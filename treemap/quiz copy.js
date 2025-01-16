


// Stratify.
const data = d3.stratify().path(d => d.name.replace(/\./g, "/"))(flare);

// Specify the chart’s dimensions.
const width = 1154;
const height = 1154;

// Specify the color scale.
const color = d3.scaleOrdinal(data.children.map(d => d.id.split("/").at(-1)), d3.schemeTableau10);

// Compute the layout.
const root = d3.treemap()
    .tile(tile) // e.g., d3.treemapSquarify
    .size([width, height])
    .padding(1)
    .round(true)
(d3.hierarchy(data)
    .sum(d => d.data.size)
    .sort((a, b) => b.value - a.value));

// Create the SVG container.
const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

// Add a cell for each leaf of the hierarchy, with a link to the corresponding GitHub page.
const leaf = svg.selectAll("g")
    .data(root.leaves())
    .join("a")
    .attr("transform", d => translate(`${d.x0},${d.y0}`))
    .attr("href", d => `https://github.com/prefuse/Flare/blob/master/flare/src${d.data.id}.as`)
    .attr("target", "_blank");

// Append a tooltip.
const format = d3.format(",d");
leaf.append("title")
    .text(d => `${d.data.id.slice(1).replace(/\//g, ".")}\n${format(d.value)}`);

// Append a color rectangle. 
leaf.append("rect")
    .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
    .attr("fill", d => color(d.data.id.split("/").at(2)))
    .attr("fill-opacity", 0.6)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0);

// Append a clipPath to ensure text does not overflow.
leaf.append("clipPath")
    .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
    .append("use")
    .attr("xlink:href", d => d.leafUid.href);

// Append multiline text. The last line shows the value and has a specific formatting.
leaf.append("text")
    .attr("clip-path", d => d.clipUid)
    .selectAll("tspan")
    .data(d => d.data.id.split("/").at(-1).split(/(?=[A-Z][a-z])|\s+/g).concat(format(d.value)))
    .join("tspan")
    .attr("x", 3)
    .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
    .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
    .text(d => d);

return Object.assign(svg.node(), {scales: {color}});