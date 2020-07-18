import pupp from 'puppeteer';
import { resolve } from 'path';
import { randomNum } from './TaskStack';

export interface Ikey {
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

/**
 * 开始自动答题
 * @param brower 浏览器实例
 * @param s 学生信息实例
 * @param daan 答案信息实例
 */
export async function startAutoAnswer(brower: pupp.Browser,s: Istudent,keys:Ikey[]){

    const page1 = await brower.newPage();

    console.log('打开登录页面');
    await page1.goto('http://zsjs.njgzx.cn/student/#/login');

    console.log('等待登录页面加载完成');
    await page1.waitForSelector('.el-input__inner[name="userName"]');

    console.log(`${s.xm}进行登录`)
    await page1.type('[name="userName"]',s.xj);
    await page1.type('[name="password"]','x123456789');
    await page1.click('.login-btn');

    await page1.waitForSelector('[data-v-b31a865c]',{
        timeout: 3000
    }).catch(async err => {
        console.log(`${s.xm}的密码错误，准备重新初始化密码`);

        await startChangePassword(brower,s);

        page1.close();

        await startAutoAnswer(brower,s,keys);

        throw err;
    });
    
    await page1.click('li[data-v-1ca057c4]');

    await page1.waitForSelector('button[data-v-beb8dde4]');
    await page1.click('button[data-v-beb8dde4]').catch(err => {
        page1.close();
        throw err;
    });

    console.log('等待开始答题');
    await page1.waitForSelector('h3[data-v-8d76b0ae]');
    await page1.waitFor(randomNum(500,3000));

    for (let q of keys) {
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

/**
 * 自动进行密码修改
 * @param brower 浏览器实例
 * @param s 学生信息实例
 */
export async function startChangePassword(brower: pupp.Browser,s: Istudent){
    console.log(`对${s.xm}的密码进行初始化`);

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
