const speedtest = require("@hola.org/speedtest-net");
const cron = require("cron");
const zabbix = require("zabbix-promise");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

const CONFIGURATION_FILE =
  process.env.CONFIGURATION_FILE || "./configuration/config.json";
const CRON_TIME = process.env.CRON_TIME || "*/2 * * * *";

function main() {
  const configuration = fs.createReadStream(CONFIGURATION_FILE, {
    encoding: "utf-8",
  });

  configuration.on("data", (data) => {
    const config = JSON.parse(data);
    cron.CronJob.from({
      cronTime: CRON_TIME,
      runOnInit: true,
      onTick: function () {
        try {
          const st = speedtest({
            acceptGdpr: config.speedTestConfig.acceptGdpr || false,
            acceptLicense: config.speedTestConfig.acceptLicense || false,
            serverId: config.speedTestConfig.serverId || null,
          })
            .then((result) => {
              console.log("Done speedtest...");
              console.log(result);
              zabbix.sender({
                server: config.zabbixTrapperConfig.zabbixServerIp,
                host: config.zabbixTrapperConfig.hosts.hostname,
                key: config.zabbixTrapperConfig.hosts.download,
                value: result.download.bandwidth / 125000,
              });
              zabbix.sender({
                server: config.zabbixTrapperConfig.zabbixServerIp,
                host: config.zabbixTrapperConfig.hosts.hostname,
                key: config.zabbixTrapperConfig.hosts.upload,
                value: result.download.bandwidth / 125000,
              });
              zabbix.sender({
                server: config.zabbixTrapperConfig.zabbixServerIp,
                host: config.zabbixTrapperConfig.hosts.hostname,
                key: config.zabbixTrapperConfig.hosts.jitter,
                value: result.ping.jitter,
              });
              zabbix.sender({
                server: config.zabbixTrapperConfig.zabbixServerIp,
                host: config.zabbixTrapperConfig.hosts.hostname,
                key: config.zabbixTrapperConfig.hosts.latency,
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
  });
  configuration.on("error", (err) => {
    console.log(`Error reading configuration file: ${err.message}`);
    console.log("Exiting with error...");
    process.exit(1);
  });
}

main();
