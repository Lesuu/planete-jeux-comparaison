// URL to your published Google Sheets CSV.
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRC8oZQIgec7mCx7vZ540G2RjJYuns3gy3P3p45n8_pm8yqqDCWqHfVON3xswfWfHk3vLgpdP6YhbIO/pub?gid=74008056&single=true&output=csv';

// Global variable to store converted data.
let convertedJvData = null;

// Convert an ARRAY of objects (rows) into a hierarchical tree.
function arrayToTree(rows) {
    // Define the hierarchy levels (treemap, scenario, etage_1, etage_2).
    const levels = ["treemap", "scenario", "etage_1", "etage_2"];
    const tree = [];

    function insertPath(pathArr, row) {
        let currentLevel = tree;
        let currentPath = "";

        pathArr.forEach((levelKey, index) => {
        const segment = row[levelKey];
        if (!segment) return; // Skip empty levels
        currentPath = currentPath ? currentPath + "/" + segment : segment;

        // Look for an existing node.
        let node = currentLevel.find(n => n.name === segment);
        if (!node) {
            node = { name: segment, path: currentPath };
            if (index === pathArr.length - 1) {
            // Use the "case" column as the numeric value.
            node.value = parseFloat(row.case) || 0;
            node.explication = row.explication;
            } else {
            node.children = [];
            }
            currentLevel.push(node);
        } else if (index === pathArr.length - 1) {
            // If leaf exists, sum the value.
            node.value = (node.value || 0) + (parseFloat(row.case) || 0);
        }

        if (node.children) {
            currentLevel = node.children;
        }
        });
    }

    rows.forEach(row => {
        insertPath(levels, row);
    });

    // Optionally, aggregate parent node values.
    function aggregateValues(node) {
        if (node.children && node.children.length > 0) {
        node.value = node.children.reduce((sum, child) => sum + aggregateValues(child), 0);
        }
        return node.value || 0;
    }
    tree.forEach(node => aggregateValues(node));
    return tree;
}

// Load the CSV data.
$.get(csvUrl, function(csvText) {
// Parse CSV using PapaParse.
const parsed = Papa.parse(csvText, { header: true });
const allData = parsed.data;
console.log(allData)

// Filtrer les deux sets de données
const jvData = allData.filter(d => d.treemap === "Jeu vidéo");
const jdsData = allData.filter(d => d.treemap === "Jeu de société");

// Filtrer par 

// Convert filtered data into a hierarchical tree.
convertedJvData = arrayToTree(jvData);

// Initialize the ECharts instance.
const dom = document.getElementById('container');
const myChart = echarts.init(dom);
myChart.showLoading();

// Hide the loading once data is ready.
myChart.hideLoading();

myChart.setOption({
    title: {
    text: 'Treemap Visualization',
    left: 'center'
    },
    tooltip: {
    formatter: function(info) {
        const value = info.value;
        const treePathInfo = info.treePathInfo;
        const treePath = treePathInfo.map(n => n.name).slice(1).join('/');
        const extra = info.data.explication ? ('<br>' + info.data.explication) : '';
        return `<div class="tooltip-title">${echarts.format.encodeHTML(treePath)}</div>
                Case: ${value}${extra}`;
    }
    },
    series: [{
    name: 'Treemap',
    type: 'treemap',
    visibleMin: 0.0001,
    label: {
        show: true,
        formatter: '{b}'
    },
    upperLabel: {
        show: true,
        height: 30
    },
    itemStyle: {
        borderColor: '#fff'
    },
    levels: [
        {
        itemStyle: {
            borderColor: '#777',
            borderWidth: 0,
            gapWidth: 1
        },
        upperLabel: { show: false }
        },
        {
        itemStyle: {
            borderColor: '#555',
            borderWidth: 5,
            gapWidth: 1
        },
        emphasis: { itemStyle: { borderColor: '#ddd' } }
        },
        {
        colorSaturation: [0.35, 0.5],
        itemStyle: { borderWidth: 5, gapWidth: 1, borderColorSaturation: 0.6 }
        }
    ],
    data: convertedJvData
    }]
});

window.addEventListener('resize', myChart.resize);
});

// Download button event listener.
document.getElementById('downloadBtn').addEventListener('click', function() {
if (!convertedJvData) {
    alert("No data available yet!");
    return;
}
const dataStr = JSON.stringify(convertedJvData, null, 2);
const blob = new Blob([dataStr], { type: "application/json" });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = "convertedData.json";
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
});