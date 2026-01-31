const speedtest = require("@hola.org/speedtest-net");
const cron = require("cron");
const zabbix = require("zabbix-promise");
const dotenv = require("dotenv");
dotenv.config();

const ZABBIX_SERVER_IP = process.env.ZABBIX_SERVER_IP || "172.20.1.1";

function main() {
  cron.CronJob.from({
    cronTime: "*/2 * * * *",
    runOnInit: true,
    onTick: function () {
      console.log("Running speedtest...");
      try {
        console.log(ZABBIX_SERVER_IP);
        const st = speedtest({
          acceptGdpr: true,
          acceptLicense: true,
        })
          .then((result) => {
            console.log("Done speedtest...");
            console.log(result);
            zabbix.sender({
              server: ZABBIX_SERVER_IP,
              host: "isp-core",
              key: "Trapper.Speedtest.Download",
              value: result.download.bandwidth / 125000,
            });
            zabbix.sender({
              server: ZABBIX_SERVER_IP,
              host: "isp-core",
              key: "Trapper.Speedtest.Upload",
              value: result.download.bandwidth / 125000,
            });
            zabbix.sender({
              server: ZABBIX_SERVER_IP,
              host: "isp-core",
              key: "Trapper.Speedtest.Jitter",
              value: result.ping.jitter,
            });
            zabbix.sender({
              server: ZABBIX_SERVER_IP,
              host: "isp-core",
              key: "Trapper.Speedtest.Latency",
              value: result.ping.latency,
            });
          })
          .catch((e) => {
            console.log(e);
            return 0;
          });
      } catch (e) {
        console.log(e);
        return 0;
      }

      // .then((result) => {
      //   const Upload_Mbps = result.download.bandwidth / 125000;
      //   const Download_Mbps = result.upload.bandwidth / 125000;

      //   console.log(Upload_Mbps);
      //   console.log(Download_Mbps);
      //   console.log(result);
      // })
    },
    start: true,
  });
}

main();
