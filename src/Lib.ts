import { Istudent, Ikey } from "./dt";
import { Browser, Page } from "puppeteer";
import { randomNum } from "./TaskStack";
import { resolve } from "url";

interface Elements extends Element {
    click():void
}

export enum AnswerStatus {
    Register,
    Ready,     // 准备阶段
    Logined    // 登录完成
}

export class StudentAnswer {
    static LoginUrl = "http://zsjs.njgzx.cn/student/#/login";

    _Browser: Browser;
    _Page!: Page;
    _StudentInfo: Istudent;
    _ProgressBar?: ProgressBar;
    _AnswerStatus: AnswerStatus = AnswerStatus.Register;

    constructor(B: Browser,Sinfo: Istudent, ProgressBar?: ProgressBar){
        this._Browser = B;
        this._StudentInfo = Sinfo;

        if(ProgressBar != undefined){
            this._ProgressBar = ProgressBar;
        }
    }

    async print(str: string){
        str = `『${this._StudentInfo.xm}』: ${str}`;

        if(this._ProgressBar != undefined){
            this._ProgressBar.interrupt(str);
        } else {
            console.log(str);
        }
    }

    async AutoInit(){
        this._Page = await this._Browser.newPage();

        this._AnswerStatus = AnswerStatus.Ready;

        this.print("初始化完毕");
    }

    async AutoLogin(){
        this.print("打开登录页面");
        await this._Page.goto('http://zsjs.njgzx.cn/student/#/login');

        this.print('等待登录页面加载完成');
        await this._Page.waitForSelector('.el-input__inner[name="userName"]');

        this.print(`进行登录`);
        await this._Page.type('[name="userName"]',this._StudentInfo.xj);
        await this._Page.type('[name="password"]','x123456789');
        await this._Page.click('.login-btn');

        await this._Page.waitForSelector('[data-v-b31a865c]',{
            timeout: 3000
        }).catch(async err => {
            this.print(`密码错误`);
            throw {
                code: "0001",
                message: "密码错误"
            };
        });

        this.print("登录完毕");

        return this;
    }

    async AutoChangPassword(){
        this.print(`进行密码修改`);

        await this._Page.waitForSelector('a[data-v-1b959937]');
        await this._Page.tap('a[data-v-1b959937]');

        await this._Page.waitForSelector('label[for="userName"]+div input');

        await this._Page.type('label[for="userName"]+div input',this._StudentInfo.xj);
        await this._Page.type('label[for="realName"]+div input',this._StudentInfo.xm);
        await this._Page.type('label[for="newPassword"]+div input','x123456789');
        await this._Page.type('label[for="confimPassword"]+div input','x123456789');

        await this._Page.tap('.el-button--primary[data-v-1b959937]');

        return this;
    }

    async AutoOpenQuestionnaire(){
        this.print('打开问卷回答页面');

        await this._Page.click('li[data-v-1ca057c4]');

        await this._Page.waitForSelector('button[data-v-beb8dde4]');
        await this._Page.click('button[data-v-beb8dde4]').catch(err => {
            this._Page.close();
            throw {
                code: "0002",
                message: "问卷已经回答了"
            };
        });

        return this;
    }

    async AutoAnswer(keys: Ikey[]){
        await this._Page.waitForSelector('h3[data-v-8d76b0ae]');
        await this._Page.waitFor(randomNum(500,3000));
    
        for (let q of keys) {
            this.print(`开始回答第${q.question}题`);
            for(let xz of q.xuez){
                this.print(`#question-${q.question} input[value="${xz}"]`);
                await this._Page.tap(`#question-${q.question} input[value="${xz}"]`).catch(async err => {
                    await this._Page.evaluate( (question,xz) => {
                        let e = <Elements>document.querySelector('#question-' + question + ' input[value="' + xz + '"]');
                        e.click();
                    },<string><unknown>q.question,<string><unknown>xz)
                });
            }
        }
    
        this.print('回答完毕！');
        await this._Page.waitForSelector('button[data-v-8d76b0ae]');
        await this._Page.waitFor(500);
        await this._Page.tap('button[data-v-8d76b0ae]');
        await this._Page.waitForSelector('.el-dialog');
        await this._Page.tap('.el-dialog__wrapper .el-button--primary[data-v-8d76b0ae]');
    
        await this._Page.waitFor(500);
    
        return this;
    }

    async AutoGetKeys(){
        let Keys: Ikey[] = [];

        

        return Keys;
    }

    async AutoScreenShot(){
        await this._Page.screenshot({
            path: resolve(__dirname,`dt/${this._StudentInfo.xm}.png`)
        })

        return this;
    }

    async AutoClosePage(){
        this._Page.close();

        return this;
    }
}