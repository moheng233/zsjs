import pupp from 'puppeteer';
import { di2 } from './json/dis2';
import { resolve } from 'path';

export interface Itim {
    question: Number,
    xuez: String[]
}

export interface Istudent {
    xm: string,
    xj: string
}

interface Elements extends Element {
    click():void
}

export async function execdt(brower: pupp.Browser,s: Istudent,daan:Itim[]){
    console.log('打开页面');
    const page1 = await brower.newPage();

    console.log('打开登录页面');
    await page1.goto('http://zsjs.njgzx.cn/student/#/login');

    console.log('等待登录页面加载完成');
    await page1.waitForSelector('.el-input__inner[name="userName"]');

    console.log('进行登录')
    await page1.type('[name="userName"]',s.xj);
    await page1.type('[name="password"]','x123456789');
    await page1.click('.login-btn');

    await page1.waitForSelector('[data-v-b31a865c]');
    
    await page1.click('li[data-v-1ca057c4]');

    await page1.waitForSelector('button[data-v-beb8dde4]');
    await page1.click('button[data-v-beb8dde4]').catch(err => {
        page1.close();
        throw err;
    });

    console.log('等待开始答题');
    await page1.waitForSelector('h3[data-v-8d76b0ae]');
    await page1.waitFor(1000);

    for (let q of daan) {
        console.log(`开始回答第${q.question}题`);
        for(let xz of q.xuez){
            console.log(`#question-${q.question} input[value="${xz}"]`);
            await page1.tap(`#question-${q.question} input[value="${xz}"]`).catch(async err => {
                await page1.evaluate( (question,xz) => {
                    let e = <Elements>document.querySelector('#question-' + question + ' input[value="' + xz + '"]');
                    e.click();
                },<string><unknown>q.question,<string><unknown>xz)
            });
        }
    }

    console.log('回答完毕！')
    await page1.waitForSelector('button[data-v-8d76b0ae]');
    await page1.waitFor(500);
    await page1.tap('button[data-v-8d76b0ae]');
    await page1.waitForSelector('.el-dialog');
    await page1.tap('.el-dialog__wrapper .el-button--primary[data-v-8d76b0ae]');

    await page1.waitFor(500);

    await page1.screenshot({
        path: resolve(__dirname,`../dt/${s.xm}.png`)
    })

    await page1.close();
}

export async function execmm(brower: pupp.Browser,s: Istudent){
    let page = await brower.newPage();

    await page.goto('http://zsjs.njgzx.cn/student/#/');
    await page.waitForSelector('a[data-v-1b959937]');
    await page.tap('a[data-v-1b959937]');

    await page.waitForSelector('label[for="userName"]+div input');

    await page.type('label[for="userName"]+div input',s.xj);
    await page.type('label[for="realName"]+div input',s.xm);
    await page.type('label[for="newPassword"]+div input','x123456789');
    await page.type('label[for="confimPassword"]+div input','x123456789');

    await page.tap('.el-button--primary[data-v-1b959937]');

    await page.screenshot({
        path: resolve(__dirname,`../mm/${s.xm}.png`)
    })

    await page.close();
}
