<!-- // src/views/DashboardView.vue - 仪表板

<template>
  <div class="dashboard-view">
    <div id="ganttContainer" style="width: 1000px; height: 200px;"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, onDeactivated, h, onActivated, nextTick, watch } from 'vue';
        import { gantt } from 'dhtmlx-gantt';
        import "dhtmlx-gantt/codebase/dhtmlxgantt.css";

        const initGannt = () => {
            // ...这里写甘特图配置 
            gantt.init("ganttContainer");
            // 语言设置-中文
            gantt.i18n.setLocale("cn");
              // 设置甘特图表格列的最小列宽
            gantt.config.mcolumn_width = 20;
            gantt.config.columns = [
              { name: "cCode", label: "学号", width: 80, align: "left" },
              { name: "cName", label: "名称", width: 50, align: "center" },
              { name: "cHeight", label: "身高", width: 30, align: "center" },
            ];
            gantt.config.scales = [
                { unit: "day", format: "%Y-%m-%d" },
                { unit: "hour", step: 12, format: "%H" }
            ];
            gantt.templates.task_text = function (start, end, task) {
                return task.cCode + "-" + task.cName + "-" + task.cHeight;
            };

            gantt.templates.task_class = function (start, end, task) {
                if (task.cStatus == '已完成') {
                    return "ywcTask";
                } else if (task.cStatus == '在执行') {
                    return "zzxTask";
                } else {
                    return "style0";
                }
            };

            layout();






 
        }

        const getRequestData = () => {
            // ...获取接口数据

            const ganttData = [
              {
                  start_date: new Date("2024-12-23 00:00:00"),
                  end_date: new Date("2024-12-24 23:59:59"),
                  cCode: "001",
                  cName: "李四",
                  cHeight: "180",
                  progress: 0.6, // 当前任务进度
                  cStatus: "已完成",
                  machine: '机台1',
              },
              {
                  start_date: new Date("2024-12-25"),
                  // end_date: new Date("2024-12-26"),
                  duration: 1,
                  cCode: "002",
                  cName: "张三",
                  cHeight: "170",
                  progress: 0.9,
                  cStatus: "在执行",
                  machine: '机台2',
              },
          ]

          // 更新甘特图数据
          gantt.parse({
              data: ganttData
          })

        }

        const layout = () => {
        // lightbox 弹窗相关设置
        // map_to 用于将表单部分的输入值与任务对象的属性进行绑定。当用户在 Lightbox 中编辑表单部分时，输入的值会自动映射到指定的任务属性上。
        // name 显示为表单部分的标题，字段和 gantt.locale.labels.section_XXX 相对应，设置显示标题
        // height 设置表单部分的高度
        // type 设置表单部分的类型，可以是 template、time、time_range、textarea、select、checkbox、radio、color_picker、duration、time_picker、time_range、recurring、custom_table、customer_time_picker
        gantt.config.lightbox.sections = [
            { name: "orderNumber", height: 15, map_to: "orderNumber", type: "template" },
            { name: "machine", height: 15, map_to: "machine", type: "template" },
            { name: "matnrPlan", height: 30, map_to: "auto", type: "custom_table" },
            { name: "nPlanWgt", height: 15, map_to: "nPlanWgt", type: "template" },
            { name: "nCompWgt", height: 15, map_to: "nCompWgt", type: "template" },
            { name: "plan_date", height: 15, map_to: "auto", type: "customer_time_picker" }
        ];

        // 设置标题文字
        gantt.locale.labels.section_orderNumber = "销售订单号";
        gantt.locale.labels.section_machine = "机台";
        gantt.locale.labels.section_matnrPlan = "物料详情";
        gantt.locale.labels.section_nPlanWgt = "计划量";
        gantt.locale.labels.section_nCompWgt = "完成量";
        gantt.locale.labels.section_plan_date = "计划时间";


        // 底部按钮
        gantt.config.buttons_left = ["gantt_cancel_btn"];
        gantt.config.buttons_right = ["gantt_save_btn"];

        // gantt.form_blocks[XXX] 自定义表单部分组件
        gantt.form_blocks["customer_time_picker"] = {
            render: function (sns) {
                return "<div class='dhx_cal_ltext' style='height:30px; margin-left:10px;'>" +
                            "<input id='start_time' class='time_start' type='datetime-local' disabled></input>" +
                                "-" +
                            "<input id='end_time' class='time_end' type='datetime-local' disabled></input>" +
                        "</div>"
            },
            set_value: function (node, value, task) {
                function convertLocalTime(date: Date) {
                    let yyyy = date.getFullYear();
                    let MM = (date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
                    let dd = date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate();
                    let HH = date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours();
                    let mm = date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes();

                    let curDay = yyyy + '-' + MM + '-' + dd + 'T' + HH + ':' + mm;
                    return curDay;
                }
                node.querySelector(".time_start").value = convertLocalTime(task.start_date);
                node.querySelector(".time_end").value = convertLocalTime(task.end_date);
            },
            get_value: function (node, task) {
                task.start_date = new Date(node.querySelector(".time_start").value);
                task.end_date = new Date(node.querySelector(".time_end").value);
                return task;
            },
            focus: function (node) {

            }
        };
        gantt.form_blocks["custom_template"] = {
            // render 用于渲染自定义表单块的 HTML 内容
            render: function (sns, task, section) {
                return "<div class='dhx_cal_ltext' style='height:24px; margin-left:10px;'>" +
                    "<input type='text' class='cpltAmt' style='width:100%; border:none; background-color:transparent;' readonly />" +
                    "</div>";
            },

            // set_value 用于设置表单块的值
            set_value: function (node, value, task) {
                var input = node.querySelector(".cpltAmt");
                if (input) {
                    // 如果值为 undefined 或 null，则将其设置为0
                    var displayValue = value == undefined || value == null ? "0" : value;
                    input.value = displayValue;
                } else {
                    task.cpltAmt = value;
                }
            },
            // get_value 用于获取表单块的值
            get_value: function (node, task) {
                // 无需实现此方法，因为输入框是只读的
                return task;
            },
            // 用于在 Lightbox 打开时将焦点设置到特定的表单块上
            focus: function (node) {
                // 无需实现此方法，因为输入框是只读的
            }
        };

        gantt.form_blocks["custom_select"] = {
            render: function (sns) {
                return "<div class='dhx_cal_ltext' style='height:20px; margin-left:10px;'>" +
                    "<select class='plnumStatus'></select>" +
                    "</div>";
            },
            set_value: function (node, value, task) {
                var select = node.querySelector(".plnumStatus");
                // 如果下拉框存在，则设置下拉框选项
                if (select) {
                    // 获取当前任务的状态值
                    var status = task.plnumStatus;
                    // 如果状态为"完成"或"执行中"，将下拉框选项设置为对应的选项
                    if (status === "完成" || status === "执行中") {
                        select.innerHTML = "<option value='执行中'>执行中</option><option value='完成'>完成</option>";
                        // 设置下拉框的选中值
                        select.value = status;
                        // 设置下拉框的样式为可见
                        select.style.display = "block";
                        // 移除节点中的状态值
                        var span = node.querySelector("span");
                        if (span) {
                            span.remove();
                        }
                    } else {
                        // 如果状态为其他值，将下拉框选项置为空
                        select.innerHTML = "";
                        // 设置下拉框的选中值为当前任务的状态值
                        select.value = status;
                        // 设置下拉框的样式为不可见
                        select.style.display = "none";
                        // 在节点中添加当前任务的状态值
                        var span = node.querySelector("span");
                        if (span) {
                            span.innerHTML = status;
                        } else {
                            node.innerHTML += "<span>" + status + "</span>";
                        }
                    }
                } else {
                    // 如果下拉框不存在，将任务状态设置为节点的内容
                    task.plnumStatus = node.innerHTML;
                }
            },
            get_value: function (node, task) {
                var select = node.querySelector(".plnumStatus");
                // 如果下拉框存在，获取下拉框的选中值
                if (select) {
                    var value = select.value;
                    // 如果选中值为"完成"或"执行中"，将任务状态设置为对应的值
                    if (value === "完成" || value === "执行中") {
                        task.plnumStatus = value;
                    }
                } else {
                    // 如果下拉框不存在，将任务状态设置为节点的内容
                    var span = node.querySelector("span");
                    if (span) {
                        task.plnumStatus = span.innerHTML;
                    }
                }
                return task;
            },
            focus: function (node) {
                var select = node.querySelector(".plnumStatus");
                if (select) {
                    select.focus();
                }
            }
        };
        gantt.form_blocks["custom_table"] = {
            render: function (sns) {
                // 注：这里不能使用反引号，否则会报错
                return "<div class='dhx_cal_ltext' style='height:100px; margin-left:5px;'>" +
                            "<table class='wuliaoTable' style='border: 1px solid black; border-collapse: collapse; width:100%;'>" +
                                "<thead>" +
                                    "<tr>" +
                                        "<th style='padding-left: 5px; border-right: 1px solid black;'>编号</th>" +
                                        "<th style='padding: 8px; padding-left: 8px; border-right: 1px solid black;'>名称</th>" +
                                        "<th style='padding: 8px; padding-left: 8px; border-right: 1px solid black;'>计划量</th>" +
                                        "<th style='padding: 8px; padding-left: 8px; border-right: 1px solid black;'>库存量</th>" +
                                        "<th style='padding: 8px; padding-left: 8px;'>缺量</th>" +
                                    "</tr>" +
                                "</thead>" +
                                "<tbody>"+
                                "</tbody>" +
                            "</table>" +
                        "</div>";
            },
            set_value: async function (node, value, task) {
                console.log('获取自定义表格node', node)
                var table = node.querySelector(".wuliaoTable");
                if (table) {
                    table.querySelector("tbody").innerHTML = "";
                    const WuliaoList = [1, 2, 3]
                    WuliaoList.forEach(item => {
                        var rowElement = document.createElement('tr');
                        var rowData = "<td style='padding-left: 5px; border-right: 1px solid black;'>" + '' + "</td>" +
                            "<td style='padding-left: 10px; border-right: 1px solid black;'>" + '' + "</td>" +
                            "<td style='padding-left: 10px; border-right: 1px solid black;'>" + '' + "</td>" +
                            "<td style='padding-left: 10px; border-right: 1px solid black;'>" + '' + "</td>" +
                            "<td style='padding-left: 10px; border-right: 1px solid black;'>" + '' + "</td>";
                        rowElement.innerHTML = rowData;
                        table.querySelector("tbody").appendChild(rowElement);
                    });
                }
            },
            get_value: function (node, task) {
                var table = node.querySelector(".wuliaoTable");
                if (table) {
                    var rows = table.querySelectorAll("tbody tr");
                    var data = [];
                    rows.forEach(row => {
                        var rowData = {
                            c_MTRL_NO: row.cells[0].textContent,
                            c_MATNRTEXT: row.cells[1].textContent,
                            c_PLAN_WGT: parseFloat(row.cells[2].textContent),
                            c_ERPLOCK_WGT: row.cells[3].textContent,
                            n_PICKING_WGT: row.cells[4].textContent,
                        };
                        data.push(rowData);
                    });
                    return data;
                }
                return task;
            },
            focus: function (node) {

            }
        };


          
        }

        onMounted(() => {
            initGannt()
            getRequestData()
        })

</script>

<style scoped lang="scss">
.dashboard-view {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}
:deep(.gantt_task_line) {
    &.style0 {
        border: 1px solid #d9d9d9;
        background: #d9d9d9;
    }
    &.ywcTask {
        border: 1px solid #606060;
        background: #606060;
    }
    &.zzxTask {
        border: 1px solid #029f08;
        background: #029f08;
    }
}

</style> -->

<template>
  <div ref="container" class="content-wrapper"> </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, onDeactivated, h, onActivated, nextTick, watch } from 'vue';
        import { gantt } from 'dhtmlx-gantt';
        import "dhtmlx-gantt/codebase/dhtmlxgantt.css";

        const container = ref<HTMLElement | null>(null);

        onMounted(() => {
            initGannt()
            getRequestData()
        })

        const initGannt = () => {
          gantt.init(container.value as HTMLElement);
        }

        const getRequestData = () => {
          const tasks = {
            data: [
              {
                id: "10",
                text: "Project #1",
                start_date: "01-04-2025",
                duration: 3,
                order: 10,
                progress: 0.4,
                open: true,
              },
              {
                id: "1",
                text: "Task #1",
                start_date: "01-04-2025",
                duration: 1,
                order: 10,
                progress: 0.6,
                parent: "10",
              },
              {
                id: "2",
                text: "Task #2",
                start_date: "02-04-2025",
                duration: 2,
                order: 20,
                progress: 0.6,
                parent: "10",
              },
            ],
            links: [{ id: 1, source: 1, target: 2, type: "0" }],
          };
          gantt.parse(tasks);
        }
</script>

<style>
  .content-wrapper{
    height: auto;
    min-height: 500px;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    overflow: auto;
  }

</style>
