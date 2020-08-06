function create_LineChart(labels, data_y1_label, data_y1, data_y2_label, data_y2) {
    const lineChartData = {
        labels: labels,
        datasets: [{
            label: data_y1_label,
            borderColor: window.chartColors.red,
            backgroundColor: window.chartColors.red,
            fill: false,
            data: data_y1,
            yAxisID: 'y-axis-1',
        }, {
            label: data_y2_label,
            borderColor: window.chartColors.blue,
            backgroundColor: window.chartColors.blue,
            fill: false,
            data: data_y2,
            yAxisID: 'y-axis-2'
        }]
    };
    return lineChartData;
}

function set_LineChart(canvas, data, title) {
    var ctx = document.getElementById(canvas).getContext('2d');
    window.myLine = Chart.Line(ctx, {
        data: data,
        options: {
            responsive: true,
            hoverMode: 'index',
            stacked: false,
            title: {
                display: true,
                text: title
            },
            scales: {
                yAxes: [{
                    type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: 'left',
                    id: 'y-axis-1',
                }, {
                    type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: 'right',
                    id: 'y-axis-2',

                    // grid line settings
                    gridLines: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                }],
            }
        }
    });
    return window.myLine

}

function create_Pie(labels, data) {
    const config = {
        type: 'pie',
        data: {
            datasets: [{
                data: data,
                backgroundColor: [
                    window.chartColors.red,
                    window.chartColors.orange,
                    window.chartColors.yellow,
                    window.chartColors.green,
                    window.chartColors.blue,
                ],
                label: 'Dataset 1'
            }],
            labels: labels,
        },
        options: {
            responsive: true
        }
    };
    return config;
}

function set_Pie(canvas, config) {
    var ctx = document.getElementById(canvas).getContext('2d');
    window.myPie = new Chart(ctx, config);
    return window.myPie
}

function randomize(button_id, chart_data, chart, chart_type) {
    document.getElementById(button_id).addEventListener('click', function() {
        if (chart_type == 'line') {
            chart_data.datasets.forEach(function(dataset) {
                dataset.data = dataset.data.map(function() {
                    return randomScalingFactor();
                });
            });
            chart.update();
        } else if (chart_type == 'pie') {
            chart_data.data.datasets.forEach(function(dataset) {
                dataset.data = dataset.data.map(function() {
                    return randomScalingFactor();
                });
            });
            chart.update();
        }

    });
}
var colorNames = Object.keys(window.chartColors);

window.onload = function() {
    // set line charts
    let lineChartData1 = create_LineChart(['January', 'February', 'March', 'April', 'May', 'June', 'July'], 'line 1', [
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor()
    ], 'line 2', [
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor()
    ]);
    let lineChartData2 = create_LineChart(['January', 'February', 'March', 'April', 'May', 'June', 'July'], 'line 1', [
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor()
    ], 'line 2', [
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor()
    ]);
    let line_chart1 = set_LineChart('canvas1', lineChartData1, 'First Line Chart');
    let line_chart2 = set_LineChart('canvas2', lineChartData2, 'Second Line Chart');
    randomize('randomizeData1', lineChartData1, line_chart1, 'line');
    randomize('randomizeData2', lineChartData2, line_chart2, 'line');
    // set Pies
    let pie_data1 = create_Pie(['Red', 'Orange', 'Yellow', 'Green', 'Blue'], [
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
    ]);
    let pie_data2 = create_Pie(['Label1', 'Label2', 'Label3', 'Label4', 'Label5'], [
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
    ]);

    let pie1 = set_Pie('chart-area', pie_data1);
    let pie2 = set_Pie('chart-area2', pie_data2);
    randomize('randomizeData3', pie_data1, pie1, 'pie');
    randomize('randomizeData4', pie_data2, pie2, 'pie');
};