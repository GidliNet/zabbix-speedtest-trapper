const speedtest = require("speedtest-net");
const cron = require("cron");

function main() {
  cron.CronJob.from({
    cronTime: "*/5 * * * *",
    runOnInit: true,
    onTick: function () {
      console.log("Running speedtest...");
      speedtest({
        acceptGdpr: true,
        acceptLicense: true,
      })
        .then((result) => {
          const Upload_Mbps = result.download.bandwidth / 125000;
          const Download_Mbps = result.upload.bandwidth / 125000;

          console.log(Upload_Mbps);
          console.log(Download_Mbps);
          console.log(result);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    start: true,
  });
}

main();
