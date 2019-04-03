const ConductorClient = require("conductor-client").default;

const conductorClient = new ConductorClient({
  baseURL: "https://api.staging.drivs.io/conductor/api",
  maxRunner: 5
});


const sleep = mil =>
  new Promise(resolve => {
    setTimeout(async () => {
      resolve();
    }, mil);
  });

conductorClient
  .registerTaskDefs([
    {
      name: "hello_world",
      retryCount: 1,
      inputKeys: [],
      outputKeys: [],
      timeoutPolicy: "TIME_OUT_WF",
      retryLogic: "FIXED",
      retryDelaySeconds: 0,
      timeoutSeconds: 0,
      // responseTimeoutSeconds: 9
    }
  ])
  .then(() => {
    return conductorClient.updateWorkflowDefs([
      {
        name: "simple",
        description: "adkdajkldasklj",
        version: 1,
        tasks: [
          {
            name: "hello_world",
            taskReferenceName: "hello_world",
            inputParameters: {},
            type: "SIMPLE",
            startDelay: 0,
            optional: false,
            retryCount: 0
          }
        ],
        inputParameters: [],
        schemaVersion: 2
      }
    ]);
  })
  .then(async () => {
    (await conductorClient.getRunningWorkflows("simple")).data.map(
      async workflow => conductorClient.terminateWorkflow(workflow)
    );

    let arr = []
    for (let i = 0; i < 50; i++) {
      arr.push(i)
      // console.log('started', i)
    }

    await Promise.all(arr.map(() => conductorClient.startWorkflow("simple", {})))

    conductorClient.registerWatcher(
      "hello_world",
      async (data, updater) => {
        console.log("Im running", data.taskId);
        await sleep(5000);
        // throw new Error("ccc");
        console.log("Im Complete", data.taskId);
        await updater.complete({})
      },
      { pollingIntervals: 100, autoAck: true, maxRunner: 20 },
      true
    );
  })
  .catch(error => console.log(error.response.data));

// conductorClient.registerWatcher(
//   "bye_bye",
//   (data, updater) => {
//     console.log(data.taskType, data.inputData);
//     updater.complete({});
//   },
//   { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
//   true
// );

// conductorClient.startWorkflow("QRUN_TEST_001", {});
