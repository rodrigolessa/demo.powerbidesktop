/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var Gantt1448688115699;
        (function (Gantt1448688115699) {
            var SelectionManager = visuals.utility.SelectionManager;
            var PixelConverter = jsCommon.PixelConverter;
            var PercentFormat = "0.00 %;-0.00 %;0.00 %";
            var MillisecondsInADay = 86400000;
            var MillisecondsInWeek = 604800000;
            var MillisecondsInAMonth = 2629746000;
            var MillisecondsInAYear = 31556952000;
            Gantt1448688115699.DefaultDateType = "Week";
            var ChartLineHeight = 40;
            var PaddingTasks = 5;
            var dateTypeSelector;
            (function (dateTypeSelector) {
                dateTypeSelector.day = 'Day';
                dateTypeSelector.week = 'Week';
                dateTypeSelector.month = 'Month';
                dateTypeSelector.year = 'Year';
                dateTypeSelector.type = powerbi.createEnumType([
                    { value: dateTypeSelector.day, displayName: 'Day' },
                    { value: dateTypeSelector.week, displayName: 'Week' },
                    { value: dateTypeSelector.month, displayName: 'Month' },
                    { value: dateTypeSelector.year, displayName: 'Year' }
                ]);
            })(dateTypeSelector = Gantt1448688115699.dateTypeSelector || (Gantt1448688115699.dateTypeSelector = {}));
            ;
            Gantt1448688115699.GanttChartProps = {
                legend: {
                    show: { objectName: 'legend', propertyName: 'show' },
                    position: { objectName: 'legend', propertyName: 'position' },
                    showTitle: { objectName: 'legend', propertyName: 'showTitle' },
                    titleText: { objectName: 'legend', propertyName: 'titleText' },
                    labelColor: { objectName: 'legend', propertyName: 'labelColor' },
                    fontSize: { objectName: 'legend', propertyName: 'fontSize' },
                },
                taskCompletion: {
                    fill: { objectName: 'taskCompletion', propertyName: 'fill' },
                },
                dataPoint: {
                    fill: { objectName: 'dataPoint', propertyName: 'fill' },
                },
                taskLabels: {
                    show: { objectName: 'taskLabels', propertyName: 'show' },
                    fill: { objectName: 'taskLabels', propertyName: 'fill' },
                    fontSize: { objectName: 'taskLabels', propertyName: 'fontSize' },
                    width: { objectName: 'taskLabels', propertyName: 'width' },
                },
                taskResource: {
                    show: { objectName: 'taskResource', propertyName: 'show' },
                    fill: { objectName: 'taskResource', propertyName: 'fill' },
                    fontSize: { objectName: 'taskResource', propertyName: 'fontSize' },
                },
                ganttDateType: {
                    type: { objectName: 'ganttDateType', propertyName: 'type' },
                }
            };
            var Selectors;
            (function (Selectors) {
                var CreateClassAndSelector = jsCommon.CssConstants.createClassAndSelector;
                Selectors.ClassName = CreateClassAndSelector("gantt");
                Selectors.Chart = CreateClassAndSelector("chart");
                Selectors.ChartLine = CreateClassAndSelector("chart-line");
                Selectors.Body = CreateClassAndSelector("gantt-body");
                Selectors.AxisGroup = CreateClassAndSelector("axis");
                Selectors.Domain = CreateClassAndSelector("domain");
                Selectors.AxisTick = CreateClassAndSelector("tick");
                Selectors.Tasks = CreateClassAndSelector("tasks");
                Selectors.SingleTask = CreateClassAndSelector("task");
                Selectors.TaskRect = CreateClassAndSelector("task-rect");
                Selectors.TaskProgress = CreateClassAndSelector("task-progress");
                Selectors.TaskResource = CreateClassAndSelector("task-resource");
                Selectors.SingleMilestone = CreateClassAndSelector("milestone");
                Selectors.TaskLabels = CreateClassAndSelector("task-labels");
                Selectors.TaskLines = CreateClassAndSelector("task-lines");
                Selectors.SingleTaskLine = CreateClassAndSelector("task-line");
                Selectors.Label = CreateClassAndSelector("label");
                Selectors.LegendItems = CreateClassAndSelector("legendItem");
                Selectors.LegendTitle = CreateClassAndSelector("legendTitle");
            })(Selectors || (Selectors = {}));
            var Gantt = (function () {
                function Gantt() {
                    this.textProperties = {
                        fontFamily: 'wf_segoe-ui_normal',
                        fontSize: jsCommon.PixelConverter.toString(9),
                    };
                    this.margin = {
                        top: 50,
                        right: 40,
                        bottom: 40,
                        left: 10
                    };
                }
                Gantt.getMaxTaskOpacity = function () {
                    return Gantt.DefaultValues.MaxTaskOpacity;
                };
                Gantt.getMinTaskOpacity = function () {
                    return Gantt.DefaultValues.MinTaskOpacity;
                };
                Gantt.prototype.init = function (options) {
                    var element = options.element;
                    this.style = options.style;
                    this.body = d3.select(element.get(0));
                    this.hostServices = options.host;
                    this.selectionManager = new SelectionManager({ hostServices: options.host });
                    this.isInteractiveChart = options.interactivity && options.interactivity.isInteractiveLegend;
                    this.interactivityService = visuals.createInteractivityService(this.hostServices);
                    this.createViewport(element);
                    this.updateChartSize(options.viewport);
                    this.behavior = new GanttChartBehavior();
                    this.colors = options.style.colorPalette.dataColors;
                    this.data = {
                        legendData: null,
                        series: null,
                        showLegend: null
                    };
                };
                /**
                 * Create the vieport area of the gantt chart
                 */
                Gantt.prototype.createViewport = function (element) {
                    //create div container to the whole viewport area
                    this.ganttDiv = this.body.append("div")
                        .classed(Selectors.Body.class, true);
                    //create container to the svg area
                    this.ganttSvg = this.ganttDiv
                        .append("svg")
                        .classed(Selectors.ClassName.class, true);
                    //create clear catcher
                    this.clearCatcher = visuals.appendClearCatcher(this.ganttSvg);
                    //create axis container
                    this.axisGroup = this.ganttSvg
                        .append("g")
                        .classed(Selectors.AxisGroup.class, true);
                    //create task lines container
                    this.lineGroup = this.ganttSvg
                        .append("g")
                        .classed(Selectors.TaskLines.class, true);
                    //create chart container
                    this.chartGroup = this.ganttSvg
                        .append("g")
                        .classed(Selectors.Chart.class, true);
                    //create tasks container
                    this.taskGroup = this.chartGroup
                        .append("g")
                        .classed(Selectors.Tasks.class, true);
                    //create legend container
                    this.legend = visuals.createLegend(element.children(Selectors.Body.selector), this.isInteractiveChart, this.interactivityService, true, visuals.LegendPosition.Top);
                };
                /**
                 * Clear the viewport area
                 */
                Gantt.prototype.clearViewport = function () {
                    this.body.selectAll(Selectors.LegendItems.selector).remove();
                    this.body.selectAll(Selectors.LegendTitle.selector).remove();
                    this.axisGroup.selectAll(Selectors.AxisTick.selector).remove();
                    this.axisGroup.selectAll(Selectors.Domain.selector).remove();
                    this.lineGroup.selectAll("*").remove();
                    this.chartGroup.selectAll(Selectors.ChartLine.selector).remove();
                    this.chartGroup.selectAll(Selectors.SingleTask.selector).remove();
                };
                /**
                 * Update div container size to the whole viewport area
                 * @param viewport The vieport to change it size
                 */
                Gantt.prototype.updateChartSize = function (viewport) {
                    this.ganttDiv.style({
                        height: PixelConverter.toString(viewport.height),
                        width: PixelConverter.toString(viewport.width)
                    });
                };
                /**
               * Create the gantt tasks series based on all task types
               * @param taskTypes All unique types from the tasks array.
               */
                Gantt.prototype.createSeries = function (objects, tasks) {
                    var colorHelper = new visuals.ColorHelper(this.colors, Gantt1448688115699.GanttChartProps.dataPoint.fill);
                    var taskGroup = _.groupBy(tasks, function (t) { return t.taskType; });
                    var taskTypes = Gantt.getAllTasksTypes(this.dataView);
                    var series = _.map(taskTypes.types, function (type) {
                        return {
                            tasks: taskGroup[type],
                            fill: colorHelper.getColorForMeasure(objects, type),
                            name: type,
                            identity: visuals.SelectionId.createWithMeasure(type),
                            selected: false
                        };
                    });
                    return series;
                };
                /**
                * Convert the dataView to view model
                * @param dataView The data Model
                */
                Gantt.converter = function (dataView, colorPalette) {
                    var taskLabelsShow = powerbi.DataViewObjects.getValue(dataView.metadata.objects, Gantt1448688115699.GanttChartProps.taskLabels.show, true);
                    var taskLabelsColor = powerbi.DataViewObjects.getFillColor(dataView.metadata.objects, Gantt1448688115699.GanttChartProps.taskLabels.fill, Gantt.DefaultValues.TaskLabelColor);
                    var taskLabelsFontSize = powerbi.DataViewObjects.getValue(dataView.metadata.objects, Gantt1448688115699.GanttChartProps.taskLabels.fontSize, Gantt.DefaultValues.LabelFontSize);
                    var taskLabelsWidth = powerbi.DataViewObjects.getValue(dataView.metadata.objects, Gantt1448688115699.GanttChartProps.taskLabels.width, taskLabelsShow ? Gantt.DefaultValues.TaskLabelWidth : 0);
                    var taskProgressColor = powerbi.DataViewObjects.getFillColor(dataView.metadata.objects, Gantt1448688115699.GanttChartProps.taskCompletion.fill, Gantt.DefaultValues.ProgressColor);
                    var taskResourceColor = powerbi.DataViewObjects.getFillColor(dataView.metadata.objects, Gantt1448688115699.GanttChartProps.taskResource.fill, Gantt.DefaultValues.TaskResourceColor);
                    var taskResourceFontSize = powerbi.DataViewObjects.getValue(dataView.metadata.objects, Gantt1448688115699.GanttChartProps.taskResource.fontSize, Gantt.DefaultValues.ResourceFontSize);
                    var taskResourceShow = powerbi.DataViewObjects.getValue(dataView.metadata.objects, Gantt1448688115699.GanttChartProps.taskResource.show, true);
                    var dateType = powerbi.DataViewObjects.getValue(dataView.metadata.objects, Gantt1448688115699.GanttChartProps.ganttDateType.type, Gantt1448688115699.DefaultDateType);
                    var taskTypes = Gantt.getAllTasksTypes(dataView);
                    var colorHelper = new visuals.ColorHelper(colorPalette, Gantt1448688115699.GanttChartProps.dataPoint.fill);
                    var legendData = {
                        fontSize: Gantt.DefaultValues.LegendFontSize,
                        dataPoints: [],
                        title: taskTypes.typeName
                    };
                    legendData.dataPoints = _.map(taskTypes.types, function (type) {
                        return {
                            label: type,
                            color: colorHelper.getColorForMeasure(dataView.metadata.objects, type),
                            icon: visuals.LegendIcon.Circle,
                            selected: false,
                            identity: visuals.SelectionId.createWithMeasure(type)
                        };
                    });
                    var settings = {
                        taskLabelsShow: taskLabelsShow,
                        taskLabelsColor: taskLabelsColor,
                        taskLabelsFontSize: taskLabelsFontSize,
                        taskLabelsWidth: taskLabelsWidth,
                        taskProgressColor: taskProgressColor,
                        taskResourceShow: taskResourceShow,
                        taskResourceColor: taskResourceColor,
                        taskResourceFontSize: taskResourceFontSize,
                        legendData: legendData,
                        taskTypes: taskTypes,
                        dateType: dateType
                    };
                    return settings;
                };
                /**
                 * Returns the chart formatters
                 * @param dataView The data Model
                 */
                Gantt.prototype.parseSettings = function (dataView) {
                    if (!dataView ||
                        !dataView.metadata ||
                        !dataView.metadata.columns)
                        return null;
                    var dateFormat = "d";
                    var numberFormat = "#";
                    for (var _i = 0, _a = dataView.metadata.columns; _i < _a.length; _i++) {
                        var dvColumn = _a[_i];
                        if (!!dataView.categorical.categories) {
                            for (var _b = 0, _c = dataView.categorical.categories; _b < _c.length; _b++) {
                                var dvCategory = _c[_b];
                                if (this.hasRole(dvCategory.source, "StartDate"))
                                    dateFormat = dvColumn.format;
                            }
                        }
                    }
                    return {
                        startDateFormatter: visuals.valueFormatter.create({ format: dateFormat }),
                        durationFormatter: visuals.valueFormatter.create({ format: numberFormat }),
                        completionFormatter: visuals.valueFormatter.create({ format: PercentFormat, value: 1, allowFormatBeautification: true })
                    };
                };
                Gantt.prototype.isValidDate = function (date) {
                    if (Object.prototype.toString.call(date) !== "[object Date]")
                        return false;
                    return !isNaN(date.getTime());
                };
                Gantt.prototype.convertToDecimal = function (number) {
                    if (!(number >= 0 && number <= 1))
                        return (number / 100);
                    return number;
                };
                /**
                * Create task objects dataView
                * @param dataView The data Model.
                * @param formatters task attributes represented format.
                * @param series An array that holds the color data of different task groups.
                */
                Gantt.prototype.createTasks = function (dataView, formatters) {
                    var _this = this;
                    var columnSource = dataView.table.columns;
                    var data = dataView.table.rows;
                    var categories = dataView.categorical.categories[0];
                    var colorHelper = new visuals.ColorHelper(this.colors, Gantt1448688115699.GanttChartProps.dataPoint.fill);
                    return data.map(function (child, index) {
                        var dateString = _this.getTaskProperty(columnSource, child, "StartDate");
                        //let startDate = new Date(dateString);
                        dateString = _this.isValidDate(dateString) ? dateString : new Date(Date.now());
                        var duration = _this.getTaskProperty(columnSource, child, "Duration");
                        var completionValue = _this.getTaskProperty(columnSource, child, "Completion");
                        var completion = _this.convertToDecimal(completionValue);
                        completion = completion <= 1 ? completion : 1;
                        var taskType = _this.getTaskProperty(columnSource, child, "Legend");
                        var tasksTypeColor = colorHelper.getColorForMeasure(dataView.metadata.objects, taskType);
                        var task = {
                            id: index,
                            name: _this.getTaskProperty(columnSource, child, "Task"),
                            start: dateString ? dateString : new Date(Date.now()),
                            duration: duration > 0 ? duration : 1,
                            end: null,
                            completion: completion > 0 ? completion : 0,
                            resource: _this.getTaskProperty(columnSource, child, "Resource"),
                            taskType: taskType,
                            color: tasksTypeColor ? tasksTypeColor : Gantt.DefaultValues.TaskColor,
                            tooltipInfo: null,
                            description: "",
                            identity: visuals.SelectionId.createWithIdAndMeasure(categories.identity[index], taskType),
                            selected: false
                        };
                        task.end = d3.time.day.offset(task.start, task.duration);
                        task.tooltipInfo = _this.getTooltipInfo(task, formatters);
                        return task;
                    });
                };
                /**
                * Gets all unique types from the tasks array
                * @param dataView The data model.
                */
                Gantt.getAllTasksTypes = function (dataView) {
                    var types = [];
                    var groupName = "";
                    var taskTypes;
                    var data = dataView.table.rows;
                    var index = _.findIndex(dataView.table.columns, function (col) { return col.roles.hasOwnProperty("Legend"); });
                    if (index !== -1) {
                        groupName = dataView.table.columns[index].displayName;
                        types = _.unique(data, function (d) { return d[index]; }).map(function (d) { return d[index]; });
                    }
                    taskTypes = {
                        typeName: groupName,
                        types: types
                    };
                    return taskTypes;
                };
                /**
                * Get the tooltip info (data display names & formated values)
                * @param task All task attributes.
                * @param formatters Formatting options for gantt attributes.
                */
                Gantt.prototype.getTooltipInfo = function (task, formatters, timeInterval) {
                    if (timeInterval === void 0) { timeInterval = "Days"; }
                    var tooltipDataArray = [];
                    if (task.taskType)
                        tooltipDataArray.push({ displayName: Gantt.capabilities.dataRoles[0].name, value: task.taskType });
                    tooltipDataArray.push({ displayName: Gantt.capabilities.dataRoles[1].name, value: task.name });
                    if (!isNaN(task.start.getDate()))
                        tooltipDataArray.push({ displayName: Gantt.capabilities.dataRoles[2].name, value: formatters.startDateFormatter.format(task.start.toLocaleDateString()) });
                    tooltipDataArray.push({ displayName: Gantt.capabilities.dataRoles[3].name, value: formatters.durationFormatter.format(task.duration) + " " + timeInterval });
                    tooltipDataArray.push({ displayName: Gantt.capabilities.dataRoles[4].name, value: formatters.completionFormatter.format(task.completion) });
                    if (task.resource)
                        tooltipDataArray.push({ displayName: Gantt.capabilities.dataRoles[5].name, value: task.resource });
                    return tooltipDataArray;
                };
                /**
                 * Get task property from the data view
                 * @param columnSource
                 * @param child
                 * @param propertyName The property to get
                 */
                Gantt.prototype.getTaskProperty = function (columnSource, child, propertyName) {
                    if (!child ||
                        !columnSource ||
                        !(columnSource.length > 0) ||
                        !columnSource[0].roles)
                        return null;
                    var index = columnSource.indexOf(columnSource.filter(function (x) { return x.roles[propertyName]; })[0]);
                    return index !== -1 ? child[index] : null;
                };
                /**
                 * Check if dataView has a given role
                 * @param column The dataView headers
                 * @param name The role to find
                 */
                Gantt.prototype.hasRole = function (column, name) {
                    var roles = column.roles;
                    return roles && roles[name];
                };
                /**
                 * Check if task has data for task
                 * @param dataView
                 */
                Gantt.prototype.isChartHasTask = function (dataView) {
                    if (dataView.table &&
                        dataView.table.columns) {
                        for (var _i = 0, _a = dataView.table.columns; _i < _a.length; _i++) {
                            var column = _a[_i];
                            if (this.hasRole(column, "Task")) {
                                return true;
                            }
                        }
                    }
                    return false;
                };
                /**
                 * Get legend data, calculate position and draw it
                 * @param ganttChartData Data for series and legend
                 */
                Gantt.prototype.renderLegend = function (legendData) {
                    if (!legendData)
                        return;
                    if (this.legendObjectProperties) {
                        visuals.LegendData.update(legendData, this.legendObjectProperties);
                        var position;
                        position = this.legendObjectProperties[visuals.legendProps.position];
                        if (position)
                            this.legend.changeOrientation(visuals.LegendPosition[position]);
                    }
                    var viewport = this.viewport;
                    this.legend.drawLegend(legendData, { height: viewport.height, width: viewport.width });
                    visuals.Legend.positionChartArea(this.ganttSvg, this.legend);
                };
                Gantt.prototype.parseLegendProperties = function (dataView) {
                    if (!dataView || !dataView.metadata) {
                        this.legendObjectProperties = {};
                        return;
                    }
                    this.legendObjectProperties = powerbi.DataViewObjects.getObject(dataView.metadata.objects, 'legend', {});
                };
                /**
                * Called on data change or resizing
                * @param options The visual option that contains the dataview and the viewport
                */
                Gantt.prototype.update = function (options) {
                    if (!options.dataViews || !options.dataViews[0])
                        return;
                    var dataView = options.dataViews[0];
                    if (!this.isChartHasTask(dataView) || options.dataViews[0].table.rows.length === 0) {
                        this.clearViewport();
                        return;
                    }
                    this.dataView = dataView;
                    var viewport = options.viewport;
                    this.viewport = viewport;
                    this.updateChartSize(viewport);
                    var viewModel = Gantt.converter(dataView, this.colors), formatters = this.parseSettings(dataView), tasks = this.createTasks(dataView, formatters);
                    this.parseLegendProperties(dataView);
                    this.renderLegend(viewModel.legendData);
                    this.data.series = this.createSeries(dataView.metadata.objects, tasks);
                    this.viewModel = viewModel;
                    if (this.interactivityService) {
                        this.interactivityService.applySelectionStateToData(tasks);
                        this.interactivityService.applySelectionStateToData(this.data.series);
                    }
                    if (tasks.length > 0) {
                        var tasksSortedByStartDate = _.sortBy(tasks, function (t) { return t.start; });
                        var tasksSortedByEndDate = _.sortBy(tasks, function (t) { return t.end; });
                        var dateTypeMilliseconds = this.getDateType();
                        var startDate = tasksSortedByStartDate[0].start, endDate = tasksSortedByEndDate[tasks.length - 1].end, ticks = Math.ceil(Math.round(endDate.valueOf() - startDate.valueOf()) / dateTypeMilliseconds);
                        ticks = ticks === 0 || ticks === 1 ? 2 : ticks;
                        var axisLength = ticks * 50;
                        this.ganttSvg
                            .attr({
                            height: PixelConverter.toString(tasks.length * ChartLineHeight + this.margin.top),
                            width: PixelConverter.toString(this.margin.left + this.viewModel.taskLabelsWidth + axisLength + Gantt.DefaultValues.ResourceWidth)
                        });
                        var viewportIn = {
                            height: viewport.height,
                            width: axisLength
                        };
                        var xAxisProperties = this.calculateAxes(viewportIn, this.textProperties, startDate, endDate, axisLength, ticks, false);
                        this.timeScale = xAxisProperties.scale;
                        this.renderAxis(xAxisProperties, 200);
                        this.renderTasks(tasks);
                        this.createMilestoneLine(tasks);
                        this.updateTaskLabels(tasks, viewModel.taskLabelsWidth);
                        this.updateElementsPositions(viewport, this.margin);
                        if (this.interactivityService) {
                            var behaviorOptions = {
                                clearCatcher: this.clearCatcher,
                                taskSelection: this.taskGroup.selectAll(Selectors.SingleTask.selector),
                                legendSelection: this.body.selectAll(Selectors.LegendItems.selector),
                                interactivityService: this.interactivityService
                            };
                            this.interactivityService.bind(tasks, this.behavior, behaviorOptions);
                        }
                    }
                };
                Gantt.prototype.getDateType = function () {
                    var milliSeconds = MillisecondsInWeek;
                    switch (this.viewModel.dateType) {
                        case "Day":
                            milliSeconds = MillisecondsInADay;
                            break;
                        case "Week":
                            milliSeconds = MillisecondsInWeek;
                            break;
                        case "Month":
                            milliSeconds = MillisecondsInAMonth;
                            break;
                        case "Year":
                            milliSeconds = MillisecondsInAYear;
                            break;
                    }
                    return milliSeconds;
                };
                Gantt.prototype.calculateAxes = function (viewportIn, textProperties, startDate, endDate, axisLength, ticksCount, scrollbarVisible) {
                    var dataTypeDatetime = powerbi.ValueType.fromPrimitiveTypeAndCategory(powerbi.PrimitiveType.Date);
                    var category = { displayName: "StartDate", queryName: "StartDate", type: dataTypeDatetime, index: 0 };
                    var visualOptions = {
                        viewport: viewportIn,
                        margin: this.margin,
                        forcedXDomain: [startDate, endDate],
                        forceMerge: false,
                        showCategoryAxisLabel: false,
                        showValueAxisLabel: false,
                        categoryAxisScaleType: powerbi.visuals.axisScale.linear,
                        valueAxisScaleType: null,
                        valueAxisDisplayUnits: 0,
                        categoryAxisDisplayUnits: 0,
                        trimOrdinalDataOnOverflow: false,
                        forcedTickCount: ticksCount
                    };
                    var width = viewportIn.width;
                    var axes = this.calculateAxesProperties(viewportIn, visualOptions, axisLength, category);
                    axes.willLabelsFit = visuals.AxisHelper.LabelLayoutStrategy.willLabelsFit(axes, width, powerbi.TextMeasurementService.measureSvgTextWidth, textProperties);
                    // If labels do not fit and we are not scrolling, try word breaking
                    axes.willLabelsWordBreak = (!axes.willLabelsFit && !scrollbarVisible) && visuals.AxisHelper.LabelLayoutStrategy.willLabelsWordBreak(axes, this.margin, width, powerbi.TextMeasurementService.measureSvgTextWidth, powerbi.TextMeasurementService.estimateSvgTextHeight, powerbi.TextMeasurementService.getTailoredTextOrDefault, textProperties);
                    return axes;
                };
                Gantt.prototype.calculateAxesProperties = function (viewportIn, options, axisLength, metaDataColumn) {
                    var xAxisProperties = visuals.AxisHelper.createAxis({
                        pixelSpan: viewportIn.width,
                        dataDomain: options.forcedXDomain,
                        metaDataColumn: metaDataColumn,
                        formatString: Gantt.DefaultValues.ganttFormatString,
                        outerPadding: 0,
                        isScalar: true,
                        isVertical: false,
                        forcedTickCount: options.forcedTickCount,
                        useTickIntervalForDisplayUnits: true,
                        isCategoryAxis: true,
                        getValueFn: function (index, type) {
                            return visuals.valueFormatter.format(new Date(index), Gantt.DefaultValues.ganttFormatString);
                        },
                        scaleType: options.categoryAxisScaleType,
                        axisDisplayUnits: options.categoryAxisDisplayUnits,
                    });
                    xAxisProperties.axisLabel = metaDataColumn.displayName;
                    return xAxisProperties;
                };
                Gantt.prototype.renderAxis = function (xAxisProperties, duration) {
                    var xAxis = xAxisProperties.axis;
                    xAxis.orient('bottom');
                    this.axisGroup.transition().duration(duration).call(xAxis);
                };
                /**
                * Update task labels and add its tooltips
                * @param tasks All tasks array
                * @param width The task label width
                */
                Gantt.prototype.updateTaskLabels = function (tasks, width) {
                    var _this = this;
                    var axisLabel;
                    var taskLineCoordinateX = 15;
                    var taskLabelsShow = this.viewModel ? this.viewModel.taskLabelsShow : true;
                    var taskLabelsColor = this.viewModel ? this.viewModel.taskLabelsColor : Gantt.DefaultValues.TaskLabelColor;
                    var taskLabelsFontSize = this.viewModel ? this.viewModel.taskLabelsFontSize : Gantt.DefaultValues.LabelFontSize;
                    if (taskLabelsShow) {
                        axisLabel = this.lineGroup.selectAll(Selectors.Label.selector).data(tasks);
                        axisLabel.enter().append("text").classed(Selectors.Label.class, true);
                        axisLabel.attr({
                            x: taskLineCoordinateX,
                            y: function (task, i) { return _this.getTaskLabelCoordinateY(task.id); },
                            fill: taskLabelsColor,
                            "stroke-width": 1
                        })
                            .style("font-size", PixelConverter.fromPoint(taskLabelsFontSize))
                            .text(function (task) { return task.name; });
                        axisLabel.call(visuals.AxisHelper.LabelLayoutStrategy.clip, width - 20, powerbi.TextMeasurementService.svgEllipsis);
                        axisLabel.append("title").text(function (task) { return task.name; });
                        axisLabel.exit().remove();
                    }
                    else {
                        this.lineGroup.selectAll(Selectors.Label.selector).remove();
                    }
                };
                Gantt.prototype.renderTasks = function (tasks) {
                    var _this = this;
                    var taskSelection = this.taskGroup.selectAll(Selectors.SingleTask.selector).data(tasks);
                    var taskProgressColor = this.viewModel ? this.viewModel.taskProgressColor : Gantt.DefaultValues.ProgressColor;
                    var taskResourceShow = this.viewModel ? this.viewModel.taskResourceShow : true;
                    var padding = 4;
                    var taskResourceColor = this.viewModel ? this.viewModel.taskResourceColor : Gantt.DefaultValues.TaskResourceColor;
                    var taskResourceFontSize = this.viewModel ? this.viewModel.taskResourceFontSize : Gantt.DefaultValues.ResourceFontSize;
                    //render task group container 
                    taskSelection.enter().append("g").classed(Selectors.SingleTask.class, true);
                    //render task main rect
                    var taskRect = taskSelection.selectAll(Selectors.TaskRect.selector).data(function (d) { return [d]; });
                    taskRect.enter().append("rect").classed(Selectors.TaskRect.class, true);
                    taskRect.classed(Selectors.TaskRect.class, true).attr({
                        x: function (task) { return _this.timeScale(task.start); },
                        y: function (task) { return _this.getBarYCoordinate(task.id); },
                        width: function (task) { return _this.taskDurationToWidth(task); },
                        height: function () { return _this.getBarHeight(); }
                    }).style("fill", function (task) { return task.color; });
                    taskRect.exit().remove();
                    //render task progress rect 
                    var taskProgress = taskSelection.selectAll(Selectors.TaskProgress.selector).data(function (d) { return [d]; });
                    taskProgress.enter().append("rect").classed(Selectors.TaskProgress.class, true);
                    taskProgress.attr({
                        x: function (task) { return _this.timeScale(task.start); },
                        y: function (task) { return _this.getBarYCoordinate(task.id) + _this.getBarHeight() / 2 - Gantt.DefaultValues.ProgressBarHeight / 2; },
                        width: function (task) { return _this.setTaskProgress(task); },
                        height: Gantt.DefaultValues.ProgressBarHeight
                    }).style("fill", taskProgressColor);
                    taskProgress.exit().remove();
                    if (taskResourceShow) {
                        //render task resource labels
                        var taskResource = taskSelection.selectAll(Selectors.TaskResource.selector).data(function (d) { return [d]; });
                        taskResource.enter().append("text").classed(Selectors.TaskResource.class, true);
                        taskResource.attr({
                            // Distância da legenda da tarefa até o final da contagem de tempo da mesma
                            x: function (task) { return _this.timeScale(task.end) + padding; },
                            y: function (task) { return (_this.getBarYCoordinate(task.id) + (_this.getBarHeight() / 2) + padding); }
                        })
                            .text(function (task) { return task.resource; })
                            .style({
                            fill: taskResourceColor,
                            "font-size": PixelConverter.fromPoint(taskResourceFontSize)
                        }).call(visuals.AxisHelper.LabelLayoutStrategy.clip, Gantt.DefaultValues.ResourceWidth - 10, powerbi.TextMeasurementService.svgEllipsis);
                        taskResource.exit().remove();
                    }
                    else {
                        taskSelection.selectAll(Selectors.TaskResource.selector).remove();
                    }
                    visuals.TooltipManager.addTooltip(taskSelection, function (tooltipEvent) { return tooltipEvent.data.tooltipInfo; });
                    taskSelection.exit().remove();
                };
                Gantt.prototype.onClearSelection = function () {
                    this.selectionManager.clear();
                };
                /**
                 * Returns the matching Y coordinate for a given task index
                 * @param taskIndex Task Number
                 */
                Gantt.prototype.getTaskLabelCoordinateY = function (taskIndex) {
                    var fontSize = +this.getTaskLabelFontSize();
                    return (ChartLineHeight * taskIndex) + (this.getBarHeight() + 5 - (40 - fontSize) / 4);
                };
                /**
                 * Set the task progress bar in the gantt
                 * @param task All task attributes
                 */
                Gantt.prototype.setTaskProgress = function (task) {
                    var fraction = task.completion / 1.0, y = this.timeScale, progress = (y(task.end) - y(task.start)) * fraction;
                    return progress;
                };
                /**
                 * Set the task progress bar in the gantt
                 * @param lineNumber Line number that represents the task number
                 */
                Gantt.prototype.getBarYCoordinate = function (lineNumber) {
                    return (ChartLineHeight * lineNumber) + (PaddingTasks);
                };
                Gantt.prototype.getBarHeight = function () {
                    return ChartLineHeight / 1.5;
                };
                /**
                * convert task duration to width in the time scale
                * @param task The task to convert
                */
                Gantt.prototype.taskDurationToWidth = function (task) {
                    return this.timeScale(task.end) - this.timeScale(task.start);
                };
                Gantt.prototype.getTooltipForMilstoneLine = function (timestamp, milestoneTitle) {
                    var stringDate = new Date(timestamp).toDateString();
                    var tooltip = [{ displayName: milestoneTitle, value: stringDate }];
                    return tooltip;
                };
                /**
                * Create vertical dotted line that represent milestone in the time axis (by default it shows not time)
                * @param tasks All tasks array
                * @param timestamp the milestone to be shown in the time axis (default Date.now())
                */
                Gantt.prototype.createMilestoneLine = function (tasks, milestoneTitle, timestamp) {
                    if (milestoneTitle === void 0) { milestoneTitle = "Today"; }
                    if (timestamp === void 0) { timestamp = Date.now(); }
                    var line = [{
                            x1: this.timeScale(timestamp),
                            y1: 0,
                            x2: this.timeScale(timestamp),
                            y2: this.getMilestoneLineLength(tasks.length),
                            tooltipInfo: this.getTooltipForMilstoneLine(timestamp, milestoneTitle)
                        }];
                    var chartLineSelection = this.chartGroup.selectAll(Selectors.ChartLine.selector).data(line);
                    chartLineSelection.enter().append("line").classed(Selectors.ChartLine.class, true);
                    chartLineSelection.attr({
                        x1: function (line) { return line.x1; },
                        y1: function (line) { return line.y1; },
                        x2: function (line) { return line.x2; },
                        y2: function (line) { return line.y2; },
                        tooltipInfo: function (line) { return line.tooltipInfo; }
                    });
                    visuals.TooltipManager.addTooltip(chartLineSelection, function (tooltipEvent) { return tooltipEvent.data.tooltipInfo; });
                    chartLineSelection.exit().remove();
                };
                Gantt.prototype.updateElementsPositions = function (viewport, margin) {
                    var viewModel = this.viewModel;
                    this.axisGroup.attr("transform", visuals.SVGUtil.translate(viewModel.taskLabelsWidth + margin.left, 15));
                    this.chartGroup.attr("transform", visuals.SVGUtil.translate(viewModel.taskLabelsWidth + margin.left, margin.top));
                    this.lineGroup.attr("transform", visuals.SVGUtil.translate(0, margin.top));
                };
                /**
                 * Returns the width of the now line based on num of tasks
                 * @param numOfTasks Number of tasks
                 */
                Gantt.prototype.getMilestoneLineLength = function (numOfTasks) {
                    return numOfTasks * ChartLineHeight;
                };
                Gantt.prototype.getTaskLabelFontSize = function () {
                    return powerbi.DataViewObjects.getValue(this.dataView.metadata.objects, Gantt1448688115699.GanttChartProps.taskLabels.fontSize, Gantt.DefaultValues.LabelFontSize);
                };
                /**
                 * handle "Legend" card
                 * @param enumeration The instance to be pushed into "Legend" card
                 * @param objects Dataview objects
                 */
                Gantt.prototype.enumerateLegendOptions = function (enumeration, objects) {
                    enumeration.pushInstance({
                        displayName: Gantt1448688115699.GanttChartProps.legend.show.objectName,
                        selector: null,
                        properties: {
                            show: powerbi.DataViewObjects.getValue(objects, Gantt1448688115699.GanttChartProps.legend.show, true),
                            position: powerbi.DataViewObjects.getValue(objects, Gantt1448688115699.GanttChartProps.legend.position, true),
                            showTitle: powerbi.DataViewObjects.getValue(objects, Gantt1448688115699.GanttChartProps.legend.showTitle, true),
                            titleText: powerbi.DataViewObjects.getValue(objects, Gantt1448688115699.GanttChartProps.legend.titleText, ""),
                            labelColor: powerbi.DataViewObjects.getFillColor(objects, Gantt1448688115699.GanttChartProps.legend.labelColor, Gantt.DefaultValues.LegendLabelColor),
                            fontSize: powerbi.DataViewObjects.getValue(objects, Gantt1448688115699.GanttChartProps.legend.fontSize, Gantt.DefaultValues.LegendFontSize)
                        },
                        objectName: Gantt1448688115699.GanttChartProps.legend.show.objectName
                    });
                };
                /**
                * handle "Data Colors" card
                * @param enumeration The instance to be pushed into "Data Colors" card
                * @param objects Dataview objects
                */
                Gantt.prototype.enumerateDataPoints = function (enumeration, objects) {
                    var taskSeries = this.data.series;
                    taskSeries.forEach(function (item) {
                        enumeration.pushInstance({
                            objectName: 'dataPoint',
                            displayName: item.name,
                            selector: visuals.ColorHelper.normalizeSelector(item.identity.getSelector(), false),
                            properties: {
                                fill: { solid: { color: item.fill } }
                            }
                        });
                    });
                };
                /**
                * handle "Task Completion" card
                * @param enumeration The instance to be pushed into "Task Completion" card
                * @param objects Dataview objects
                */
                Gantt.prototype.enumerateTaskCompletion = function (enumeration, objects) {
                    enumeration.pushInstance({
                        selector: null,
                        properties: {
                            fill: powerbi.DataViewObjects.getFillColor(objects, Gantt1448688115699.GanttChartProps.taskCompletion.fill, Gantt.DefaultValues.ProgressColor)
                        },
                        objectName: Gantt1448688115699.GanttChartProps.taskCompletion.fill.objectName
                    });
                };
                /**
                * handle "Labels" card
                * @param enumeration The instance to be pushed into "Data Labels" card
                * @param objects Dataview objects
                */
                Gantt.prototype.enumerateTaskLabels = function (enumeration, objects) {
                    enumeration.pushInstance({
                        selector: null,
                        properties: {
                            show: powerbi.DataViewObjects.getValue(objects, Gantt1448688115699.GanttChartProps.taskLabels.show, true),
                            fill: powerbi.DataViewObjects.getFillColor(objects, Gantt1448688115699.GanttChartProps.taskLabels.fill, Gantt.DefaultValues.TaskLabelColor),
                            fontSize: powerbi.DataViewObjects.getValue(objects, Gantt1448688115699.GanttChartProps.taskLabels.fontSize, Gantt.DefaultValues.LabelFontSize),
                            width: powerbi.DataViewObjects.getValue(objects, Gantt1448688115699.GanttChartProps.taskLabels.width, Gantt.DefaultValues.TaskLabelWidth),
                        },
                        objectName: Gantt1448688115699.GanttChartProps.taskLabels.show.objectName
                    });
                };
                /**
                * handle "Data Labels" card
                * @param enumeration The instance to be pushed into "Task Resource" card
                * @param objects Dataview objects
                */
                Gantt.prototype.enumerateDataLabels = function (enumeration, objects) {
                    enumeration.pushInstance({
                        selector: null,
                        properties: {
                            show: powerbi.DataViewObjects.getValue(objects, Gantt1448688115699.GanttChartProps.taskResource.show, true),
                            fill: powerbi.DataViewObjects.getFillColor(objects, Gantt1448688115699.GanttChartProps.taskResource.fill, Gantt.DefaultValues.TaskResourceColor),
                            fontSize: powerbi.DataViewObjects.getValue(objects, Gantt1448688115699.GanttChartProps.taskResource.fontSize, Gantt.DefaultValues.ResourceFontSize)
                        },
                        objectName: Gantt1448688115699.GanttChartProps.taskResource.show.objectName
                    });
                };
                Gantt.prototype.enumerateDateType = function (enumeration, objects) {
                    enumeration.pushInstance({
                        selector: null,
                        properties: {
                            type: powerbi.DataViewObjects.getValue(objects, Gantt1448688115699.GanttChartProps.ganttDateType.type, Gantt1448688115699.DefaultDateType),
                        },
                        objectName: Gantt1448688115699.GanttChartProps.ganttDateType.type.objectName
                    });
                };
                /**
                * handle the property pane options
                * @param objects Dataview enumerate objects
                */
                Gantt.prototype.enumerateObjectInstances = function (options) {
                    var dataView = this.dataView;
                    if (!dataView)
                        return;
                    var enumeration = new visuals.ObjectEnumerationBuilder();
                    switch (options.objectName) {
                        case 'legend':
                            this.enumerateLegendOptions(enumeration, dataView.metadata.objects);
                            break;
                        case 'dataPoint':
                            this.enumerateDataPoints(enumeration, dataView.metadata.objects);
                            break;
                        case 'taskLabels':
                            this.enumerateTaskLabels(enumeration, dataView.metadata.objects);
                            break;
                        case 'taskCompletion':
                            this.enumerateTaskCompletion(enumeration, dataView.metadata.objects);
                            break;
                        case 'taskResource':
                            this.enumerateDataLabels(enumeration, dataView.metadata.objects);
                            break;
                        case 'ganttDateType':
                            this.enumerateDateType(enumeration, dataView.metadata.objects);
                            break;
                    }
                    return enumeration.complete();
                };
                Gantt.DefaultValues = {
                    AxisTickSize: 6,
                    LabelFontSize: 9,
                    LegendFontSize: 8,
                    LegendLabelColor: "#000000",
                    MaxTaskOpacity: 1,
                    MinTaskOpacity: 0.4,
                    ProgressBarHeight: 4,
                    ProgressColor: "#000000",
                    ResourceFontSize: 9,
                    ResourceWidth: 100,
                    TaskColor: "#00B099",
                    TaskLabelColor: "#000000",
                    TaskLabelWidth: 110,
                    TaskLineWidth: 15,
                    TaskResourceColor: "#000000",
                    ganttFormatString: "MMM dd"
                };
                Gantt.capabilities = {
                    dataRoles: [
                        {
                            name: "Legend",
                            kind: powerbi.VisualDataRoleKind.Grouping,
                            displayName: "Legend",
                        }, {
                            name: "Task",
                            kind: powerbi.VisualDataRoleKind.Grouping,
                            displayName: "Task"
                        }, {
                            name: "StartDate",
                            kind: powerbi.VisualDataRoleKind.Grouping,
                            displayName: "Start Date",
                        }, {
                            name: "Duration",
                            kind: powerbi.VisualDataRoleKind.Measure,
                            displayName: "Duration",
                            requiredTypes: [{ numeric: true }, { integer: true }]
                        }, {
                            name: "Completion",
                            kind: powerbi.VisualDataRoleKind.Measure,
                            displayName: "% Completion",
                            requiredTypes: [{ numeric: true }, { integer: true }]
                        }, {
                            name: "Resource",
                            kind: powerbi.VisualDataRoleKind.Grouping,
                            displayName: "Resource"
                        }
                    ],
                    dataViewMappings: [{
                            conditions: [
                                {
                                    "Legend": { min: 0, max: 1 },
                                    "Task": { min: 1, max: 1 },
                                    "StartDate": { min: 0, max: 0 },
                                    "Duration": { min: 0, max: 0 },
                                    "Completion": { min: 0, max: 0 },
                                    "Resource": { min: 0, max: 0 }
                                }, {
                                    "Legend": { min: 0, max: 1 },
                                    "Task": { min: 1, max: 1 },
                                    "StartDate": { min: 0, max: 1 },
                                    "Duration": { min: 0, max: 0 },
                                    "Completion": { min: 0, max: 0 },
                                    "Resource": { min: 0, max: 0 }
                                }, {
                                    "Legend": { min: 0, max: 1 },
                                    "Task": { min: 0, max: 1 },
                                    "StartDate": { min: 0, max: 1 },
                                    "Duration": { min: 0, max: 1 },
                                    "Completion": { min: 0, max: 1 },
                                    "Resource": { min: 0, max: 1 },
                                }
                            ],
                            table: {
                                rows: {
                                    select: [
                                        { for: { in: "Legend" } },
                                        { for: { in: "Task" } },
                                        { for: { in: "StartDate" } },
                                        { for: { in: "Duration" } },
                                        { for: { in: "Completion" } },
                                        { for: { in: "Resource" } },
                                    ]
                                },
                            },
                        }],
                    sorting: {
                        default: {},
                    },
                    objects: {
                        legend: {
                            displayName: "Legend",
                            description: "Display legend options",
                            properties: {
                                show: {
                                    displayName: "Show",
                                    type: { bool: true }
                                },
                                position: {
                                    displayName: "Position",
                                    description: "Select the location for the legend",
                                    type: { enumeration: visuals.legendPosition.type }
                                },
                                showTitle: {
                                    displayName: "Title",
                                    description: "Display a title for legend symbols",
                                    type: { bool: true }
                                },
                                titleText: {
                                    displayName: "Legend Name",
                                    description: "Title text",
                                    type: { text: true },
                                    suppressFormatPainterCopy: true
                                },
                                labelColor: {
                                    displayName: "Color",
                                    type: { fill: { solid: { color: true } } }
                                },
                                fontSize: {
                                    displayName: "Text Size",
                                    type: { formatting: { fontSize: true } }
                                }
                            }
                        },
                        //dataPoint: {
                        //    displayName: "Data colors",
                        //    properties: {
                        //        fill: {
                        //            displayName: "Fill",
                        //            type: { fill: { solid: { color: true } } }
                        //        }
                        //    }
                        //},
                        taskLabels: {
                            displayName: 'Category Labels',
                            properties: {
                                show: {
                                    displayName: "Show",
                                    type: { bool: true }
                                },
                                fill: {
                                    displayName: 'Fill',
                                    type: { fill: { solid: { color: true } } }
                                },
                                fontSize: {
                                    displayName: 'Font Size',
                                    type: { formatting: { fontSize: true } }
                                },
                                width: {
                                    displayName: 'Width',
                                    type: { numeric: true }
                                }
                            }
                        },
                        taskCompletion: {
                            displayName: 'Task Completion',
                            properties: {
                                show: {
                                    type: { bool: true }
                                },
                                fill: {
                                    displayName: 'Completion Color',
                                    type: { fill: { solid: { color: true } } }
                                }
                            }
                        },
                        taskResource: {
                            displayName: 'Data Labels',
                            properties: {
                                show: {
                                    displayName: "Show",
                                    type: { bool: true }
                                },
                                fill: {
                                    displayName: 'Color',
                                    type: { fill: { solid: { color: true } } }
                                },
                                fontSize: {
                                    displayName: 'Font Size',
                                    type: { formatting: { fontSize: true } }
                                }
                            }
                        },
                        ganttDateType: {
                            displayName: 'Gantt Date Type',
                            properties: {
                                type: {
                                    displayName: "Type",
                                    type: { enumeration: dateTypeSelector.type }
                                },
                            }
                        },
                    }
                };
                return Gantt;
            }());
            Gantt1448688115699.Gantt = Gantt;
            var GanttChartBehavior = (function () {
                function GanttChartBehavior() {
                }
                GanttChartBehavior.prototype.bindEvents = function (options, selectionHandler) {
                    this.options = options;
                    var clearCatcher = options.clearCatcher;
                    options.taskSelection.on('click', function (d) {
                        selectionHandler.handleSelection(d, d3.event.ctrlKey);
                        d3.event.stopPropagation();
                    });
                    clearCatcher.on('click', function () {
                        selectionHandler.handleClearSelection();
                    });
                };
                GanttChartBehavior.prototype.renderSelection = function (hasSelection) {
                    var options = this.options;
                    var ganttMaxOpacity = Gantt.getMaxTaskOpacity();
                    var ganttMinOpacity = Gantt.getMinTaskOpacity();
                    options.taskSelection.style("opacity", function (d) {
                        return (hasSelection && !d.selected) ? ganttMinOpacity : ganttMaxOpacity;
                    });
                };
                return GanttChartBehavior;
            }());
            Gantt1448688115699.GanttChartBehavior = GanttChartBehavior;
            var GanttChartWarning = (function () {
                function GanttChartWarning() {
                }
                Object.defineProperty(GanttChartWarning.prototype, "code", {
                    get: function () {
                        return "GanttChartWarning";
                    },
                    enumerable: true,
                    configurable: true
                });
                GanttChartWarning.prototype.getMessages = function (resourceProvider) {
                    var message = "This visual requires task value", titleKey = "", detailKey = "", visualMessage;
                    visualMessage = {
                        message: message,
                        title: resourceProvider.get(titleKey),
                        detail: resourceProvider.get(detailKey)
                    };
                    return visualMessage;
                };
                return GanttChartWarning;
            }());
            Gantt1448688115699.GanttChartWarning = GanttChartWarning;
        })(Gantt1448688115699 = visuals.Gantt1448688115699 || (visuals.Gantt1448688115699 = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var plugins;
        (function (plugins) {
            plugins.Gantt1448688115699 = {
                name: 'Gantt1448688115699',
                class: 'Gantt1448688115699',
                capabilities: powerbi.visuals.Gantt1448688115699.Gantt.capabilities,
                custom: true,
                create: function () { return new powerbi.visuals.Gantt1448688115699.Gantt(); }
            };
        })(plugins = visuals.plugins || (visuals.plugins = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
