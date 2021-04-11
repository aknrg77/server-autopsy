const os = require('os');
const checkDiskSpace = require('check-disk-space');
const sgMail = require('@sendgrid/mail');

function cpuAverage() {

    let totalIdle = 0, totalTick = 0;
    let cpus = os.cpus();

    for (let i = 0, len = cpus.length; i < len; i++) {

        let cpu = cpus[i];

        for (type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    }

    return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}

function freeMemoryFunc() {
    return 100 - (((os.totalmem() - os.freemem()) / (os.totalmem())) * 100).toPrecision(2);
}

async function freeSpaceFunc() {
    let totalDisk;
        try {
            totalDisk = await checkDiskSpace('/');
        } catch (err) {
            throw err;
        }
    return (((totalDisk.size - totalDisk.free) / (totalDisk.size)) * 100).toPrecision(2);
}

function mailTemplate(stat, templateType) {
    if (templateType == "cpu") {
        return {
            "subject": "Important Message regarding your server's Usage",
            "text": `Your server usage is running very high that is ${stat}%\nplease upgrade your current plan`
        }
    } else if (templateType == "memory") {
        return {
            "subject": "Important Message regarding your server's Disk space",
            "text": `Your server is running low of Memory space that is only ${stat}%\nplease upgrade your current memory`,
        }
    } else {
        return {
            "subject": "Important Message regarding your server's Disk space",
            "text": `Your server is running low of Disk space that is only ${stat}%\nplease upgrade your current disk space`
        }
    }


}

async function sendMail(config,stat,templateType,mailid) {
    sgMail.setApiKey(config.apiKey);
    const msg = {
        to: config.to,
        from: config.from,
        subject: mailTemplate(stat,templateType).subject,
        text: mailTemplate(stat,templateType).text
    }
    try {
        let now = new Date();
        let mail = await sgMail.send(msg);
        mailid = now.getTime() + 86400 * 1000;
        console.log(mail);
    } catch (err) {
        throw err;
    }

    return mailid;
}

function validateInput(config){
    if(config.apiKey && config.form && config.to){
        return true;
    }else{
        return false;
    }
}


function serverAutopsy(config) {

    if(!validateInput(config)){
        throw new Error("Api key or from mail or to mail not provided");
    }

    let mail1 = 0;
    let mail2 = 0;
    let mail3 = 0;
    setInterval(async function () {

        let freeSpace = freeSpaceFunc();
        let freeMemory = freeMemoryFunc();
        let startMeasure = cpuAverage();
        let percentageCPU;

        setTimeout(async function () {

            let endMeasure = cpuAverage();

            let idleDifference = endMeasure.idle - startMeasure.idle;
            let totalDifference = endMeasure.total - startMeasure.total;

            percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);
            let now = new Date();
            if (percentageCPU >= 90 && now >= mail1) {
              mail1 = sendMail(config,percentageCPU,"cpu",mail1);
            } else if (freeMemory <= 10 && now >= mail2) {
              mail2 = sendMail(config,freeMemory,"memory",mail2);
            } else if (freeSpace <= 10 && now >= mail3) {
              mail3 = sendMail(config,freeSpace,"space",mail3);
            }
        }, 1000);
    }, 5000);

}

module.exports = serverAutopsy;
