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
            var PixelConverter = jsCommon.PixelConverter;
            var CreateClassAndSelector = jsCommon.CssConstants.createClassAndSelector;
            var SelectionManager = powerbi.visuals.utility.SelectionManager;
            var createEnumType = powerbi.createEnumType;
            var LegendData = powerbi.visuals.LegendData;
            var legendPosition = powerbi.visuals.legendPosition;
            var VisualDataRoleKind = powerbi.VisualDataRoleKind;
            var createInteractivityService = powerbi.visuals.createInteractivityService;
            var appendClearCatcher = powerbi.visuals.appendClearCatcher;
            var createLegend = powerbi.visuals.createLegend;
            var LegendPosition = powerbi.visuals.LegendPosition;
            var valueFormatter = powerbi.visuals.valueFormatter;
            var ColorHelper = powerbi.visuals.ColorHelper;
            var SelectionId = powerbi.visuals.SelectionId;
            var DataViewObjects = powerbi.DataViewObjects;
            var LegendIcon = powerbi.visuals.LegendIcon;
            var Legend = powerbi.visuals.Legend;
            var ValueType = powerbi.ValueType;
            var AxisHelper = powerbi.visuals.AxisHelper;
            var TextMeasurementService = powerbi.TextMeasurementService;
            var TooltipManager = powerbi.visuals.TooltipManager;
            var SVGUtil = powerbi.visuals.SVGUtil;
            var ObjectEnumerationBuilder = powerbi.visuals.ObjectEnumerationBuilder;
            var axisScale = powerbi.visuals.axisScale;
            var PercentFormat = "0.00 %;-0.00 %;0.00 %";
            var MillisecondsInADay = 86400000;
            var MillisecondsInWeek = 604800000;
            var MillisecondsInAMonth = 2629746000;
            var MillisecondsInAYear = 31556952000;
            var ChartLineHeight = 40;
            var PaddingTasks = 5;
            (function (GanttDateType) {
                GanttDateType[GanttDateType["Day"] = "Day"] = "Day";
                GanttDateType[GanttDateType["Week"] = "Week"] = "Week";
                GanttDateType[GanttDateType["Month"] = "Month"] = "Month";
                GanttDateType[GanttDateType["Year"] = "Year"] = "Year";
            })(Gantt1448688115699.GanttDateType || (Gantt1448688115699.GanttDateType = {}));
            var GanttDateType = Gantt1448688115699.GanttDateType;
            ;
            var Selectors;
            (function (Selectors) {
                Selectors.ClassName = CreateClassAndSelector("gantt");
                Selectors.Chart = CreateClassAndSelector("chart");
                Selectors.ChartLine = CreateClassAndSelector("chart-line");
                Selectors.Body = CreateClassAndSelector("gantt-body");
                Selectors.AxisGroup = CreateClassAndSelector("axis");
                Selectors.Domain = CreateClassAndSelector("domain");
                Selectors.AxisTick = CreateClassAndSelector("tick");
                Selectors.Tasks = CreateClassAndSelector("tasks");
                Selectors.TaskGroup = CreateClassAndSelector("task-group");
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
            var GanttSettings = (function () {
                function GanttSettings() {
                    //Default Settings
                    this.general = {
                        groupTasks: false
                    };
                    this.legend = {
                        show: true,
                        position: legendPosition.right,
                        showTitle: true,
                        titleText: "",
                        labelColor: "#000000",
                        fontSize: 8,
                    };
                    this.taskLabels = {
                        show: true,
                        fill: "#000000",
                        fontSize: 9,
                        width: 110,
                    };
                    this.taskCompletion = {
                        show: true,
                        fill: "#000000",
                    };
                    this.taskResource = {
                        show: true,
                        fill: "#000000",
                        fontSize: 9,
                    };
                    this.dateType = {
                        type: GanttDateType.Week
                    };
                }
                Object.defineProperty(GanttSettings, "Default", {
                    get: function () {
                        return new this();
                    },
                    enumerable: true,
                    configurable: true
                });
                GanttSettings.parse = function (dataView, capabilities) {
                    var settings = new this();
                    if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
                        return settings;
                    }
                    var properties = this.getProperties(capabilities);
                    for (var objectKey in capabilities.objects) {
                        for (var propKey in capabilities.objects[objectKey].properties) {
                            if (!settings[objectKey] || !_.has(settings[objectKey], propKey)) {
                                continue;
                            }
                            var type = capabilities.objects[objectKey].properties[propKey].type;
                            var getValueFn = this.getValueFnByType(type);
                            settings[objectKey][propKey] = getValueFn(dataView.metadata.objects, properties[objectKey][propKey], settings[objectKey][propKey]);
                        }
                    }
                    return settings;
                };
                GanttSettings.getProperties = function (capabilities) {
                    var objects = _.merge({
                        general: { properties: { formatString: {} } }
                    }, capabilities.objects);
                    var properties = {};
                    for (var objectKey in objects) {
                        properties[objectKey] = {};
                        for (var propKey in objects[objectKey].properties) {
                            properties[objectKey][propKey] = {
                                objectName: objectKey,
                                propertyName: propKey
                            };
                        }
                    }
                    return properties;
                };
                GanttSettings.createEnumTypeFromEnum = function (type) {
                    var even = false;
                    return createEnumType(Object.keys(type)
                        .filter(function (key, i) { return ((!!(i % 2)) === even && type[key] === key
                        && !void (even = !even)) || (!!(i % 2)) !== even; })
                        .map(function (x) { return { value: x, displayName: x }; }));
                };
                GanttSettings.getValueFnByType = function (type) {
                    switch (_.keys(type)[0]) {
                        case "fill":
                            return DataViewObjects.getFillColor;
                        default:
                            return DataViewObjects.getValue;
                    }
                };
                GanttSettings.enumerateObjectInstances = function (settings, options, capabilities) {
                    if (settings === void 0) { settings = new this(); }
                    var enumeration = new ObjectEnumerationBuilder();
                    var object = settings && settings[options.objectName];
                    if (!object) {
                        return enumeration;
                    }
                    var instance = {
                        objectName: options.objectName,
                        selector: null,
                        properties: {}
                    };
                    for (var key in object) {
                        if (_.has(object, key)) {
                            instance.properties[key] = object[key];
                        }
                    }
                    enumeration.pushInstance(instance);
                    return enumeration;
                };
                GanttSettings.prototype.createOriginalSettings = function () {
                    this.originalSettings = _.cloneDeep(this);
                };
                return GanttSettings;
            }());
            Gantt1448688115699.GanttSettings = GanttSettings;
            var GanttColumns = (function () {
                function GanttColumns() {
                    //Data Roles
                    this.Legend = null;
                    this.Task = null;
                    this.StartDate = null;
                    this.Duration = null;
                    this.Completion = null;
                    this.Resource = null;
                }
                GanttColumns.getColumnSources = function (dataView) {
                    return this.getColumnSourcesT(dataView);
                };
                GanttColumns.getTableValues = function (dataView) {
                    var table = dataView && dataView.table;
                    var columns = this.getColumnSourcesT(dataView);
                    return columns && table && _.mapValues(columns, function (n, i) { return n && table.rows.map(function (row) { return row[n.index]; }); });
                };
                GanttColumns.getTableRows = function (dataView) {
                    var table = dataView && dataView.table;
                    var columns = this.getColumnSourcesT(dataView);
                    return columns && table && table.rows.map(function (row) {
                        return _.mapValues(columns, function (n, i) { return n && row[n.index]; });
                    });
                };
                GanttColumns.getCategoricalValues = function (dataView) {
                    var categorical = dataView && dataView.categorical;
                    var categories = categorical && categorical.categories || [];
                    var values = categorical && categorical.values || [];
                    var series = categorical && values.source && this.getSeriesValues(dataView);
                    return categorical && _.mapValues(new this(), function (n, i) {
                        return _.toArray(categories).concat(_.toArray(values))
                            .filter(function (x) { return x.source.roles && x.source.roles[i]; }).map(function (x) { return x.values; })[0]
                            || values.source && values.source.roles && values.source.roles[i] && series;
                    });
                };
                GanttColumns.getSeriesValues = function (dataView) {
                    return dataView && dataView.categorical && dataView.categorical.values
                        && dataView.categorical.values.map(function (x) { return visuals.converterHelper.getSeriesName(x.source); });
                };
                GanttColumns.getCategoricalColumns = function (dataView) {
                    var categorical = dataView && dataView.categorical;
                    var categories = categorical && categorical.categories || [];
                    var values = categorical && categorical.values || [];
                    return categorical && _.mapValues(new this(), function (n, i) { return categories.filter(function (x) { return x.source.roles && x.source.roles[i]; })[0]
                        || values.source && values.source.roles && values.source.roles[i] && values
                        || values.filter(function (x) { return x.source.roles && x.source.roles[i]; }); });
                };
                GanttColumns.getColumnSourcesT = function (dataView) {
                    var columns = dataView && dataView.metadata && dataView.metadata.columns;
                    return columns && _.mapValues(new this(), function (n, i) { return columns.filter(function (x) { return x.roles && x.roles[i]; })[0]; });
                };
                GanttColumns.Roles = Object.freeze(_.mapValues(new GanttColumns(), function (x, i) { return i; }));
                return GanttColumns;
            }());
            Gantt1448688115699.GanttColumns = GanttColumns;
            var Gantt = (function () {
                function Gantt() {
                    this.textProperties = {
                        fontFamily: 'wf_segoe-ui_normal',
                        fontSize: PixelConverter.toString(9),
                    };
                    this.margin = Gantt.DefaultMargin;
                }
                Object.defineProperty(Gantt, "DefaultMargin", {
                    get: function () {
                        return {
                            top: 50,
                            right: 40,
                            bottom: 40,
                            left: 10
                        };
                    },
                    enumerable: true,
                    configurable: true
                });
                Gantt.prototype.init = function (options) {
                    this.viewport = _.clone(options.viewport);
                    this.style = options.style;
                    this.body = d3.select(options.element.get(0));
                    this.hostServices = options.host;
                    this.selectionManager = new SelectionManager({ hostServices: options.host });
                    this.isInteractiveChart = options.interactivity && options.interactivity.isInteractiveLegend;
                    this.interactivityService = createInteractivityService(this.hostServices);
                    this.createViewport(options.element);
                    this.updateChartSize();
                    this.behavior = new GanttChartBehavior();
                    this.colors = options.style.colorPalette.dataColors;
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
                    this.clearCatcher = appendClearCatcher(this.ganttSvg);
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
                    this.legend = createLegend(element, this.isInteractiveChart, this.interactivityService, true, LegendPosition.Top);
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
                    this.chartGroup.selectAll(Selectors.TaskGroup.selector).remove();
                    this.chartGroup.selectAll(Selectors.SingleTask.selector).remove();
                };
                /**
                 * Update div container size to the whole viewport area
                 * @param viewport The vieport to change it size
                 */
                Gantt.prototype.updateChartSize = function () {
                    this.ganttDiv.style({
                        height: PixelConverter.toString(this.viewport.height),
                        width: PixelConverter.toString(this.viewport.width)
                    });
                };
                /**
                 * Get task property from the data view
                 * @param columnSource
                 * @param child
                 * @param propertyName The property to get
                 */
                Gantt.getTaskProperty = function (columnSource, child, propertyName) {
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
                Gantt.hasRole = function (column, name) {
                    var roles = column.roles;
                    return roles && roles[name];
                };
                /**
                * Get the tooltip info (data display names & formated values)
                * @param task All task attributes.
                * @param formatters Formatting options for gantt attributes.
                */
                Gantt.getTooltipInfo = function (task, formatters, timeInterval) {
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
                * Check if task has data for task
                * @param dataView
                */
                Gantt.isChartHasTask = function (dataView) {
                    if (dataView.table &&
                        dataView.table.columns) {
                        for (var _i = 0, _a = dataView.table.columns; _i < _a.length; _i++) {
                            var column = _a[_i];
                            if (Gantt.hasRole(column, "Task")) {
                                return true;
                            }
                        }
                    }
                    return false;
                };
                /**
                 * Returns the chart formatters
                 * @param dataView The data Model
                 */
                Gantt.getFormatters = function (dataView) {
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
                                if (Gantt.hasRole(dvCategory.source, "StartDate"))
                                    dateFormat = dvColumn.format;
                            }
                        }
                    }
                    return {
                        startDateFormatter: valueFormatter.create({ format: dateFormat }),
                        durationFormatter: valueFormatter.create({ format: numberFormat }),
                        completionFormatter: valueFormatter.create({ format: PercentFormat, value: 1, allowFormatBeautification: true })
                    };
                };
                /**
                * Create task objects dataView
                * @param dataView The data Model.
                * @param formatters task attributes represented format.
                * @param series An array that holds the color data of different task groups.
                */
                Gantt.createTasks = function (dataView, formatters, colors) {
                    var metadataColumns = GanttColumns.getColumnSources(dataView);
                    var columnSource = dataView.table.columns;
                    var colorHelper = new ColorHelper(colors, undefined);
                    return dataView.table.rows.map(function (child, index) {
                        var dateString = Gantt.getTaskProperty(columnSource, child, "StartDate");
                        dateString = Gantt.isValidDate(dateString) ? dateString : new Date(Date.now());
                        var duration = Gantt.getTaskProperty(columnSource, child, "Duration");
                        var completionValue = Gantt.getTaskProperty(columnSource, child, "Completion");
                        var completion = Gantt.convertToDecimal(completionValue);
                        completion = completion <= 1 ? completion : 1;
                        var taskType = Gantt.getTaskProperty(columnSource, child, "Legend");
                        var tasksTypeColor = colorHelper.getColorForMeasure(dataView.metadata.objects, taskType);
                        var identity = SelectionId.createWithIdAndMeasureAndCategory(dataView.categorical.categories[0].identity[index], taskType, metadataColumns.Task.queryName);
                        var task = {
                            id: index,
                            name: Gantt.getTaskProperty(columnSource, child, "Task"),
                            start: dateString ? dateString : new Date(Date.now()),
                            duration: duration > 0 ? duration : 1,
                            end: null,
                            completion: completion > 0 ? completion : 0,
                            resource: Gantt.getTaskProperty(columnSource, child, "Resource"),
                            taskType: taskType,
                            color: tasksTypeColor ? tasksTypeColor : Gantt.DefaultValues.TaskColor,
                            tooltipInfo: null,
                            description: "",
                            identity: identity,
                            selected: false
                        };
                        task.end = d3.time.day.offset(task.start, task.duration);
                        task.tooltipInfo = Gantt.getTooltipInfo(task, formatters);
                        return task;
                    });
                };
                /**
               * Create the gantt tasks series based on all task types
               * @param taskTypes All unique types from the tasks array.
               */
                Gantt.createSeries = function (objects, tasks, dataView, colors) {
                    var colorHelper = new ColorHelper(colors, undefined /*Gantt.Properties.dataPoint.fill*/);
                    var taskGroup = _.groupBy(tasks, function (t) { return t.taskType; });
                    var taskTypes = Gantt.getAllTasksTypes(dataView);
                    var series = _.map(taskTypes.types, function (type) {
                        return {
                            tasks: taskGroup[type],
                            fill: colorHelper.getColorForMeasure(objects, type),
                            name: type,
                            identity: SelectionId.createWithMeasure(type),
                            selected: false
                        };
                    });
                    return series;
                };
                /**
                * Convert the dataView to view model
                * @param dataView The data Model
                */
                Gantt.converter = function (dataView, colors) {
                    if (!dataView
                        || !dataView.categorical
                        || !Gantt.isChartHasTask(dataView)
                        || dataView.table.rows.length === 0) {
                        return null;
                    }
                    var settings = Gantt.parseSettings(dataView, colors);
                    var taskTypes = Gantt.getAllTasksTypes(dataView);
                    var legendData = {
                        fontSize: settings.legend.fontSize,
                        dataPoints: [],
                        title: taskTypes.typeName
                    };
                    var colorHelper = new ColorHelper(colors, undefined /*Gantt.Properties.dataPoint.fill*/);
                    legendData.dataPoints = _.map(taskTypes.types, function (type) {
                        return {
                            label: type,
                            color: colorHelper.getColorForMeasure(dataView.metadata.objects, type),
                            icon: LegendIcon.Circle,
                            selected: false,
                            identity: SelectionId.createWithMeasure(type)
                        };
                    });
                    var formatters = this.getFormatters(dataView);
                    var tasks = Gantt.createTasks(dataView, formatters, colors);
                    var series = Gantt.createSeries(dataView.metadata.objects, tasks, dataView, colors);
                    var viewModel = {
                        dataView: dataView,
                        settings: settings,
                        tasks: tasks,
                        series: series,
                        legendData: legendData,
                        taskTypes: taskTypes,
                    };
                    return viewModel;
                };
                Gantt.parseSettings = function (dataView, colors) {
                    var settings = GanttSettings.parse(dataView, Gantt.capabilities);
                    delete settings.taskCompletion.show;
                    settings.createOriginalSettings();
                    return settings;
                };
                Gantt.isValidDate = function (date) {
                    if (Object.prototype.toString.call(date) !== "[object Date]")
                        return false;
                    return !isNaN(date.getTime());
                };
                Gantt.convertToDecimal = function (number) {
                    if (!(number >= 0 && number <= 1))
                        return (number / 100);
                    return number;
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
                 * Get legend data, calculate position and draw it
                 */
                Gantt.prototype.renderLegend = function () {
                    if (!this.viewModel.legendData) {
                        return;
                    }
                    LegendData.update(this.viewModel.legendData, DataViewObjects.getObject(this.viewModel.dataView.metadata.objects, "legend", {}));
                    var position = this.viewModel.settings.legend.show
                        ? LegendPosition[this.viewModel.settings.legend.position]
                        : LegendPosition.None;
                    this.legend.changeOrientation(position);
                    this.legend.drawLegend(this.viewModel.legendData, _.clone(this.viewport));
                    Legend.positionChartArea(this.ganttDiv, this.legend);
                    switch (this.legend.getOrientation()) {
                        case LegendPosition.Left:
                        case LegendPosition.LeftCenter:
                        case LegendPosition.Right:
                        case LegendPosition.RightCenter:
                            this.viewport.width -= this.legend.getMargins().width;
                            break;
                        case LegendPosition.Top:
                        case LegendPosition.TopCenter:
                        case LegendPosition.Bottom:
                        case LegendPosition.BottomCenter:
                            this.viewport.height -= this.legend.getMargins().height;
                            break;
                    }
                };
                /**
                * Called on data change or resizing
                * @param options The visual option that contains the dataview and the viewport
                */
                Gantt.prototype.update = function (options) {
                    if (!options.dataViews || !options.dataViews[0]) {
                        return;
                    }
                    this.viewModel = Gantt.converter(options.dataViews[0], this.colors);
                    if (!this.viewModel) {
                        this.clearViewport();
                        return;
                    }
                    this.viewport = _.clone(options.viewport);
                    this.margin = Gantt.DefaultMargin;
                    this.renderLegend();
                    this.updateChartSize();
                    var tasks = this.viewModel.tasks;
                    if (this.interactivityService) {
                        this.interactivityService.applySelectionStateToData(tasks);
                        this.interactivityService.applySelectionStateToData(this.viewModel.series);
                    }
                    if (tasks.length > 0) {
                        var tasksSortedByStartDate = _.sortBy(tasks, function (t) { return t.start; });
                        var tasksSortedByEndDate = _.sortBy(tasks, function (t) { return t.end; });
                        var dateTypeMilliseconds = this.getDateType();
                        var startDate = tasksSortedByStartDate[0].start, endDate = tasksSortedByEndDate[tasks.length - 1].end, ticks = Math.ceil(Math.round(endDate.valueOf() - startDate.valueOf()) / dateTypeMilliseconds);
                        var groupedTasks = this.groupTasks(tasks);
                        ticks = ticks === 0 || ticks === 1 ? 2 : ticks;
                        var axisLength = ticks * 50;
                        this.ganttSvg
                            .attr({
                            height: PixelConverter.toString(groupedTasks.length * ChartLineHeight + this.margin.top),
                            width: PixelConverter.toString(this.margin.left + this.viewModel.settings.taskLabels.width + axisLength + Gantt.DefaultValues.ResourceWidth)
                        });
                        var viewportIn = {
                            height: this.viewport.height,
                            width: axisLength
                        };
                        var xAxisProperties = this.calculateAxes(viewportIn, this.textProperties, startDate, endDate, axisLength, ticks, false);
                        this.timeScale = xAxisProperties.scale;
                        this.renderAxis(xAxisProperties, 200);
                        this.renderTasks(groupedTasks);
                        this.createMilestoneLine(groupedTasks);
                        this.updateTaskLabels(groupedTasks, this.viewModel.settings.taskLabels.width);
                        this.updateElementsPositions(this.viewport, this.margin);
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
                    switch (this.viewModel.settings.dateType.type) {
                        case GanttDateType.Day:
                            milliSeconds = MillisecondsInADay;
                            break;
                        case GanttDateType.Week:
                            milliSeconds = MillisecondsInWeek;
                            break;
                        case GanttDateType.Month:
                            milliSeconds = MillisecondsInAMonth;
                            break;
                        case GanttDateType.Year:
                            milliSeconds = MillisecondsInAYear;
                            break;
                    }
                    return milliSeconds;
                };
                Gantt.prototype.calculateAxes = function (viewportIn, textProperties, startDate, endDate, axisLength, ticksCount, scrollbarVisible) {
                    var dataTypeDatetime = ValueType.fromPrimitiveTypeAndCategory(6 /* Date */);
                    var category = { displayName: "StartDate", queryName: "StartDate", type: dataTypeDatetime, index: 0 };
                    var visualOptions = {
                        viewport: viewportIn,
                        margin: this.margin,
                        forcedXDomain: [startDate, endDate],
                        forceMerge: false,
                        showCategoryAxisLabel: false,
                        showValueAxisLabel: false,
                        categoryAxisScaleType: axisScale.linear,
                        valueAxisScaleType: null,
                        valueAxisDisplayUnits: 0,
                        categoryAxisDisplayUnits: 0,
                        trimOrdinalDataOnOverflow: false,
                        forcedTickCount: ticksCount
                    };
                    var width = viewportIn.width;
                    var axes = this.calculateAxesProperties(viewportIn, visualOptions, axisLength, category);
                    axes.willLabelsFit = AxisHelper.LabelLayoutStrategy.willLabelsFit(axes, width, TextMeasurementService.measureSvgTextWidth, textProperties);
                    // If labels do not fit and we are not scrolling, try word breaking
                    axes.willLabelsWordBreak = (!axes.willLabelsFit && !scrollbarVisible) && AxisHelper.LabelLayoutStrategy.willLabelsWordBreak(axes, this.margin, width, TextMeasurementService.measureSvgTextWidth, TextMeasurementService.estimateSvgTextHeight, TextMeasurementService.getTailoredTextOrDefault, textProperties);
                    return axes;
                };
                Gantt.prototype.calculateAxesProperties = function (viewportIn, options, axisLength, metaDataColumn) {
                    var _this = this;
                    var xAxisProperties = AxisHelper.createAxis({
                        pixelSpan: viewportIn.width,
                        dataDomain: options.forcedXDomain,
                        metaDataColumn: metaDataColumn,
                        formatString: Gantt.DefaultValues.DateFormatStrings[this.viewModel.settings.dateType.type],
                        outerPadding: 0,
                        isScalar: true,
                        isVertical: false,
                        forcedTickCount: options.forcedTickCount,
                        useTickIntervalForDisplayUnits: true,
                        isCategoryAxis: true,
                        getValueFn: function (index, type) {
                            return valueFormatter.format(new Date(index), Gantt.DefaultValues.DateFormatStrings[_this.viewModel.settings.dateType.type]);
                        },
                        scaleType: options.categoryAxisScaleType,
                        axisDisplayUnits: options.categoryAxisDisplayUnits,
                    });
                    xAxisProperties.axisLabel = metaDataColumn.displayName;
                    return xAxisProperties;
                };
                Gantt.prototype.groupTasks = function (tasks) {
                    if (this.viewModel.settings.general.groupTasks) {
                        var groupedTasks = _.groupBy(tasks, function (x) { return x.name; });
                        var result = _.map(groupedTasks, function (x, i) { return {
                            name: i,
                            tasks: groupedTasks[i]
                        }; });
                        result.forEach(function (x, i) {
                            x.tasks.forEach(function (t) { return t.id = i; });
                            x.id = i;
                        });
                        return result;
                    }
                    return tasks.map(function (x) { return {
                        name: x.name,
                        id: x.id,
                        tasks: [x]
                    }; });
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
                    var taskLabelsShow = this.viewModel ? this.viewModel.settings.taskLabels.show : true;
                    var taskLabelsColor = this.viewModel ? this.viewModel.settings.taskLabels.fill : GanttSettings.Default.taskLabels.fill;
                    var taskLabelsFontSize = this.viewModel ? this.viewModel.settings.taskLabels.fontSize : GanttSettings.Default.taskLabels.fontSize;
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
                        axisLabel.call(AxisHelper.LabelLayoutStrategy.clip, width - 20, TextMeasurementService.svgEllipsis);
                        axisLabel.append("title").text(function (task) { return task.name; });
                        axisLabel.exit().remove();
                    }
                    else {
                        this.lineGroup.selectAll(Selectors.Label.selector).remove();
                    }
                };
                Gantt.prototype.renderTasks = function (groupedTasks) {
                    var _this = this;
                    var taskGroupSelection = this.taskGroup.selectAll(Selectors.TaskGroup.selector).data(groupedTasks);
                    var taskProgressColor = this.viewModel ? this.viewModel.settings.taskCompletion.fill : GanttSettings.Default.taskCompletion.fill;
                    var taskResourceShow = this.viewModel ? this.viewModel.settings.taskResource.show : true;
                    var padding = 4;
                    var taskResourceColor = this.viewModel ? this.viewModel.settings.taskResource.fill : GanttSettings.Default.taskResource.fill;
                    var taskResourceFontSize = this.viewModel ? this.viewModel.settings.taskResource.fontSize : GanttSettings.Default.taskResource.fontSize;
                    //render task group container 
                    taskGroupSelection.enter().append("g").classed(Selectors.TaskGroup.class, true);
                    var taskSelection = taskGroupSelection.selectAll(Selectors.SingleTask.selector).data(function (d) { return d.tasks; });
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
                            x: function (task) { return _this.timeScale(task.end) + padding; },
                            y: function (task) { return (_this.getBarYCoordinate(task.id) + (_this.getBarHeight() / 2) + padding); }
                        })
                            .text(function (task) { return task.resource; })
                            .style({
                            fill: taskResourceColor,
                            "font-size": PixelConverter.fromPoint(taskResourceFontSize)
                        }).call(AxisHelper.LabelLayoutStrategy.clip, Gantt.DefaultValues.ResourceWidth - 10, TextMeasurementService.svgEllipsis);
                        taskResource.exit().remove();
                    }
                    else {
                        taskSelection.selectAll(Selectors.TaskResource.selector).remove();
                    }
                    TooltipManager.addTooltip(taskSelection, function (tooltipEvent) { return tooltipEvent.data.tooltipInfo; });
                    taskSelection.exit().remove();
                    taskGroupSelection.exit().remove();
                };
                Gantt.prototype.onClearSelection = function () {
                    this.selectionManager.clear();
                };
                /**
                 * Returns the matching Y coordinate for a given task index
                 * @param taskIndex Task Number
                 */
                Gantt.prototype.getTaskLabelCoordinateY = function (taskIndex) {
                    var fontSize = +this.viewModel.settings.taskLabels.fontSize;
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
                    TooltipManager.addTooltip(chartLineSelection, function (tooltipEvent) { return tooltipEvent.data.tooltipInfo; });
                    chartLineSelection.exit().remove();
                };
                Gantt.prototype.updateElementsPositions = function (viewport, margin) {
                    this.axisGroup.attr("transform", SVGUtil.translate(this.viewModel.settings.taskLabels.width + margin.left, 15));
                    this.chartGroup.attr("transform", SVGUtil.translate(this.viewModel.settings.taskLabels.width + margin.left, margin.top));
                    this.lineGroup.attr("transform", SVGUtil.translate(0, margin.top));
                };
                Gantt.prototype.getMilestoneLineLength = function (numOfTasks) {
                    return numOfTasks * ChartLineHeight;
                };
                Gantt.prototype.enumerateObjectInstances = function (options) {
                    var settings = this.viewModel && this.viewModel.settings;
                    if (_.isEmpty(settings)) {
                        return [];
                    }
                    var result = GanttSettings.enumerateObjectInstances(settings.originalSettings, options, Gantt.capabilities);
                    switch (options.objectName) {
                        case 'general':
                            return [];
                    }
                    return result.complete();
                };
                Gantt.DefaultValues = {
                    AxisTickSize: 6,
                    MaxTaskOpacity: 1,
                    MinTaskOpacity: 0.4,
                    ProgressBarHeight: 4,
                    ResourceWidth: 100,
                    TaskColor: "#00B099",
                    TaskLineWidth: 15,
                    DefaultDateType: GanttDateType.Week,
                    DateFormatStrings: {
                        Day: "MMM dd",
                        Week: "MMM dd",
                        Month: "MMM yyyy",
                        Year: "yyyy"
                    }
                };
                Gantt.capabilities = {
                    dataRoles: [
                        {
                            name: "Legend",
                            kind: VisualDataRoleKind.Grouping,
                            displayName: "Legend",
                        }, {
                            name: "Task",
                            kind: VisualDataRoleKind.Grouping,
                            displayName: "Task"
                        }, {
                            name: "StartDate",
                            kind: VisualDataRoleKind.Grouping,
                            displayName: "Start Date",
                        }, {
                            name: "Duration",
                            kind: VisualDataRoleKind.Measure,
                            displayName: "Duration",
                            requiredTypes: [{ numeric: true }, { integer: true }]
                        }, {
                            name: "Completion",
                            kind: VisualDataRoleKind.Measure,
                            displayName: "% Completion",
                            requiredTypes: [{ numeric: true }, { integer: true }]
                        }, {
                            name: "Resource",
                            kind: VisualDataRoleKind.Grouping,
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
                    objects: {
                        general: {
                            displayName: "General",
                            properties: {
                                groupTasks: {
                                    displayName: "Group Tasks",
                                    type: { bool: true }
                                }
                            },
                        },
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
                                    type: { enumeration: legendPosition.type }
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
                        dateType: {
                            displayName: 'Gantt Date Type',
                            properties: {
                                type: {
                                    displayName: "Type",
                                    type: { enumeration: GanttSettings.createEnumTypeFromEnum(GanttDateType) }
                                },
                            }
                        },
                    },
                    sorting: {
                        default: {},
                    },
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
                    this.options.taskSelection.style("opacity", function (d) {
                        return (hasSelection && !d.selected) ? Gantt.DefaultValues.MinTaskOpacity : Gantt.DefaultValues.MaxTaskOpacity;
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
