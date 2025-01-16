// Test de treemap

// Test data
let height = 800, width = 500, legend = 100;

const data = await d3.csv("data.csv", d => {
    return {
        name: d.name,
        size: +d.size
    }
})
console.log(data)


// let data = {
//     "name": "Dorfromantik carbon_footprint",
//     "children" : [{
//         "name": "Assemblage",
//         "children": [{
//                 "name": "printed paper",
//                 "carbon_footprint" : 42.6
//             }, {
//                 "name": "thermoforming sheet",
//                 "carbon_footprint" : 14.25
//             }, {
//                 "name": "laminating linerboard",
//                 "carbon_footprint" : 13.01
//             }, {
//                 "name": "laminating box",
//                 "carbon_footprint" : 7.62
//             }, {
//                 "name": "wood minifigure",
//                 "carbon_footprint" : 0
//             },{
//                 "name": "shrink wrapping",
//                 "carbon_footprint" : 0.93
//             }],
//         }, {
//         "name": "transport",
//         "children":[{
//             "name": "transport, freight, lorry",
//             "carbon_footprint": 6.42
//             }, {
//             "name": "transport, freight, sea",
//             "carbon_footprint": 6.05
//             }, {
//             "name" : "transport, freight, lorry",
//             "carbon_footprint": 4.97
//             }],
//         }, {
//         "name": "eol",
//         "children" : [{
//             "name": "eol",
//             "carbon_footprint": 4.14
//         }]
//     }]
// };

d3.select('body').append('p').text('hellooo')

let svg = d3.select("#tree").attr("width", width).attr("height", height);
const color = d3.scaleOrdinal(d3.schemeSet2);

let hierarchy = d3.hierarchy(data).sum(d=>d.carbon_footprint);

let treemap = d3.treemap().size([width, height - legend]).paddingInner(5)(hierarchy)

let childArray = treemap.descendants().filter(d=>d.depth==2)
let parentArray = treemap.descendants().filter(d=>d.depth==1)
let matchParent = (category) => {
    return parentArray.findIndex(x=> x.data.name==category)
}

let cells = svg.selectAll(".cells")
.data(childArray)
.enter()
.append('rect')
.attr('x', d=>d.x0)
.attr('y', d=>d.y0)
.attr('width', d=>(d.x1-d.x0))
.attr('height', d=>(d.y1-d.y0))
.style('stroke','white')
.style('fill', d=>color(matchParent(d.parent.data.name)))

svg.selectAll('text')
.data(childArray)
.enter()
.append('text')
.attr('x', d=>(d.x0+(d.x1-d.x0)/2))
.attr('y', d=>(d.y0+(d.y1-d.y0)/2))
.attr("text-anchor", "middle")
.attr("fill","black")
.text(d=>d.data.name)

let gBottom = svg.append('g')
.attr('transform', `translate(50, ${height-legend/2})`)
let xLegend = -120

gBottom.selectAll('#legend')
.data(parentArray)
.enter()
.append('rect')
.attr('x', d=>d.x0)
.attr('y', d=>d.y0)
.attr('width', d=>(d.x1-d.x0))
.attr('height', d=>(d.y1-d.y0))
.style('stroke','white')
.style('fill', d=>color(matchParent(d.parent.data.name)))

xLegend = -90

gBottom.selectAll('text')
.data(parentArray)
.enter()
.append('rect')
.attr('x', d=>d.x0)
.attr('y', d=>d.y0)
.attr('width', d=>(d.x1-d.x0))
.attr('height', d=>(d.y1-d.y0))
.style('stroke','white')
.style('fill', d=>color(matchParent(d.parent.data.name)))