const ConductorClient = require("conductor-client").default;

const conductorClient = new ConductorClient({
  baseURL: "https://api.fountain.drivs.io/conductor/api"
});

const workflowDefs = [
  {
    name: "fail_rollback",
    description: "Fail rollback",
    version: 1,
    tasks: [
      {
        name: "check_fail1",
        taskReferenceName: "check_fail1",
        type: "SIMPLE",
        startDelay: 0,
        optional: false
      },
      {
        name: "check_fail1",
        taskReferenceName: "check_fail2",
        inputParameters: {
          chickens: "${workflow.input.chickens}"
        },
        type: "SIMPLE",
        startDelay: 0,
        optional: false
      }
    ],
    inputParameters: ["orderType", "chickens", "orderType"],
    schemaVersion: 2
  },
  {
    name: "withdraw_chickens",
    description: "Withdraw chickens",
    version: 1,
    tasks: [
      {
        name: "is_take_home",
        taskReferenceName: "is_take_home",
        type: "DECISION",
        inputParameters: {
          orderType: "${workflow.input.orderType}"
        },
        caseValueParam: "orderType",
        decisionCases: {
          takehome: [
            {
              name: "put_chickens_on_box",
              taskReferenceName: "put_chickens_on_box",
              inputParameters: {
                chickens: "${workflow.input.chickens}"
              },
              type: "SIMPLE",
              startDelay: 0,
              optional: false
            }
          ]
        },
        defaultCase: [
          {
            name: "withdraw_disk",
            taskReferenceName: "withdraw_disk",
            type: "SIMPLE",
            startDelay: 0,
            optional: false
          },
          {
            name: "put_chickens_on_disk",
            taskReferenceName: "put_chickens_on_disk",
            inputParameters: {
              chickens: "${workflow.input.chickens}"
            },
            type: "SIMPLE",
            startDelay: 0,
            optional: false
          }
        ],
        startDelay: 0,
        optional: false
      }
    ],
    inputParameters: ["orderType", "chickens", "orderType"],
    schemaVersion: 2
  },
  {
    name: "order_chickens",
    description: "Order chickens",
    version: 1,
    tasks: [
      {
        name: "get_money",
        taskReferenceName: "get_money",
        inputParameters: {
          money: "${workflow.input.money}"
        },
        type: "SIMPLE",
        startDelay: 0,
        optional: false
      },
      {
        name: "print_slip",
        taskReferenceName: "print_slip",
        inputParameters: {
          money: "${workflow.input.money}",
          chickens: "${workflow.input.chickens}",
          queueId: "${get_money.output.queueId}"
        },
        type: "SIMPLE",
        startDelay: 0,
        optional: false
      },
      {
        name: "check_chickens",
        taskReferenceName: "check_chickens",
        inputParameters: {
          chickens: "${workflow.input.chickens}"
        },
        type: "SIMPLE",
        startDelay: 0,
        optional: false
      },
      {
        name: "is_got_chickens",
        taskReferenceName: "is_got_chickens",
        type: "DECISION",
        inputParameters: {
          isGotChickens: "${check_chickens.output.isGotChickens}"
        },
        caseValueParam: "isGotChickens",
        decisionCases: {
          yes: [
            {
              name: "withdraw_chickens",
              taskReferenceName: "withdraw_chickens_yes",
              type: "SUB_WORKFLOW",
              inputParameters: {
                orderType: "${workflow.input.orderType}",
                chickens: "${workflow.input.chickens}"
              },
              startDelay: 0,
              subWorkflowParam: {
                name: "withdraw_chickens",
                version: 1
              },
              optional: false
            }
          ]
        },
        defaultCase: [
          {
            name: "fire_chickens",
            taskReferenceName: "fire_chickens",
            inputParameters: {
              chickens: "${workflow.input.chickens}"
            },
            type: "SIMPLE",
            startDelay: 0,
            optional: false
          },
          {
            name: "withdraw_chickens",
            taskReferenceName: "withdraw_chickens_default",
            type: "SUB_WORKFLOW",
            inputParameters: {
              orderType: "${workflow.input.orderType}",
              chickens: "${workflow.input.chickens}"
            },
            startDelay: 0,
            subWorkflowParam: {
              name: "withdraw_chickens",
              version: 1
            },
            optional: false
          }
        ],
        startDelay: 0,
        optional: false
      },
      {
        name: "put_chickens_on_counter",
        taskReferenceName: "put_chickens_on_counter",
        type: "SIMPLE",
        startDelay: 0,
        optional: false
      },
      {
        name: "call_customer",
        taskReferenceName: "call_customer",
        inputParameters: {
          queueId: "${get_money.output.queueId}"
        },
        type: "SIMPLE",
        startDelay: 0,
        optional: false
      },
      {
        name: "others_job",
        taskReferenceName: "others_job",
        inputParameters: {
          dynamicTasks: "${call_customer.output.dynamicTasks}",
          dynamicTasksInput: "${call_customer.output.dynamicTasksInput}"
        },
        type: "FORK_JOIN_DYNAMIC",
        dynamicForkTasksParam: "dynamicTasks",
        dynamicForkTasksInputParamName: "dynamicTasksInput"
      },
      {
        joinOn: ["others_job"],
        taskReferenceName: "system_join",
        type: "JOIN"
      },
      {
        name: "just_done",
        taskReferenceName: "just_done",
        type: "SIMPLE",
        startDelay: 0,
        optional: false
      }
    ],
    inputParameters: ["orderType", "chickens", "money"],
    failureWorkflow: "fail_rollback",
    schemaVersion: 2
  }
];

const taskDefs = [
  {
    name: "check_fail1",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ["money"],
    outputKeys: ["queueId"],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "check_fail2",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ["money"],
    outputKeys: ["queueId"],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "get_money",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ["money"],
    outputKeys: ["queueId"],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "print_slip",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ["money", "queueId", "chickens"],
    outputKeys: [],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "check_chickens",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ["chickens"],
    outputKeys: ["isGotChickens"],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "is_got_chickens",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ["chickens"],
    outputKeys: [],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "fire_chickens",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ["chickens"],
    outputKeys: [],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "put_chickens_on_counter",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "call_customer",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ["queueId"],
    outputKeys: [],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "is_take_home",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ["order_type"],
    outputKeys: [],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "withdraw_disk",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "put_chickens_on_disk",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "put_chickens_on_box",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "just_wait",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "dy_fork_1",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "dy_fork_2",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "dy_fork_3",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "dy_fork_4",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: "just_done",
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: "TIME_OUT_WF",
    retryLogic: "FIXED",
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  }
];

conductorClient.updateWorkflowDefs(workflowDefs).then(() =>
  conductorClient.registerTaskDefs(taskDefs).then(() => {
    conductorClient.registerWatcher(
      "get_money",
      (data, updater) => {
        console.log(data);
        updater.complete({  outputData: { queueId: "12354423" }, callbackAfterSeconds: 123 });
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    );
    conductorClient.registerWatcher(
      "print_slip",
      async (data, updater) => {
        console.log(data.taskType, data.inputData);
        setTimeout(() => updater.complete({  }), 6000);
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    );
    conductorClient.registerWatcher(
      "check_chickens",
      (data, updater) => {
        console.log(data.taskType, data.inputData);
        updater.complete({  outputData: { isGotChickens: "yes" } });
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    );
    conductorClient.registerWatcher(
      "fire_chickens",
      (data, updater) => {
        console.log(data.taskType, data.inputData);
        updater.complete({  });
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    );
    conductorClient.registerWatcher(
      "put_chickens_on_counter",
      (data, updater) => {
        console.log(data.taskType, data.inputData);
        updater.complete({  });
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    );
    conductorClient.registerWatcher(
      "call_customer",
      (data, updater) => {
        const forkTasks = [
          { name: "dy_fork_1", taskReferenceName: "dy_fork_1", type: "SIMPLE" },
          { name: "dy_fork_2", taskReferenceName: "dy_fork_2", type: "SIMPLE" },
          { name: "dy_fork_3", taskReferenceName: "dy_fork_3", type: "SIMPLE" },
          { name: "dy_fork_4", taskReferenceName: "dy_fork_4", type: "SIMPLE" }
        ];
        const inputTasks = {
          dy_fork_1: { input1: "Hello1" },
          dy_fork_2: { input2: "Hello2" },
          dy_fork_3: { input1: "33223" },
          dy_fork_4: { input1: "Hello4" }
        };
        console.log(data.taskType, data.inputData);
        updater.complete({
          
          outputData: { dynamicTasks: forkTasks, dynamicTasksInput: inputTasks }
        });
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    );
    conductorClient.registerWatcher(
      "withdraw_disk",
      (data, updater) => {
        console.log(data.taskType, data.inputData);
        updater.complete({  });
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    );
    conductorClient.registerWatcher(
      "put_chickens_on_disk",
      (data, updater) => {
        console.log(data.taskType, data.inputData);
        updater.complete({  });
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    );
    conductorClient.registerWatcher(
      "put_chickens_on_box",
      (data, updater) => {
        console.log(data.taskType, data.inputData);
        updater.complete({  });
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    );
    conductorClient.registerWatcher(
      "just_wait",
      (data, updater) => {
        console.log(data.taskType, data.inputData);
        updater.complete({  });
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    );
    conductorClient.registerWatcher(
      "dy_fork_1",
      (data, updater) => {
        console.log(data.taskType, data.inputData);
        updater.complete({  });
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    );
    conductorClient.registerWatcher(
      "dy_fork_2",
      (data, updater) => {
        console.log(data.taskType, data.inputData);
        updater.complete({  });
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    );
    conductorClient.registerWatcher(
      "dy_fork_3",
      (data, updater) => {
        console.log(data.taskType, data.inputData);
        updater.complete({  });
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    );
    conductorClient.registerWatcher(
      "dy_fork_4",
      (data, updater) => {
        console.log(data, data.inputData);
        updater.complete({  });
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    );

    conductorClient.registerWatcher(
      "just_done",
      (data, updater) => {
        console.log(data.taskType, data.inputData);
        updater.complete({  });
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    );

    conductorClient.startWorkflow("order_chickens", {
      money: 500,
      orderType: "takehome",
      chickens: 20,
    });
  })
);
