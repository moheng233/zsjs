import pupp from 'puppeteer';
import { di2 } from './json/di2';
import { resolve } from 'path';
import { execdt, execmm } from './dt';
import { Studentlist } from './json/student';

console.log('启动浏览器');
pupp.launch({
    headless: false,
    timeout: 30000,
    slowMo: 20
}).then(async (b) => {
    let page = await b.newPage();

    await page.goto('http://zsjs.njgzx.cn/student/#/');

    // execdt(b,'G320826200303262074','Xy200322400',di2).catch(err => {
    //     console.error(err);
    // });

    for (let s of Studentlist){
        await execdt(b,s,di2).catch(err => {
            console.log(err);
        });
    }

    // for (let s of Studentlist) {
    //     await execmm(b,s);
    // }
})