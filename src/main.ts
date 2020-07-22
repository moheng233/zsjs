import pupp from 'puppeteer';
import figlet from 'figlet';
import { Istudent, Ikey } from './dt';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { TaskStack, ITask } from './TaskStack';
import { time } from 'console';
import { StudentAnswer } from './Lib';
import ProgressBar from 'progress';

async function main() {
    console.log(figlet.textSync('ZSJS'));
    let aw1 = await inquirer.prompt([
        {
            type: "confirm",
            name: "ifs",
            message: "是否在此之前编辑一下学生名单？",
            default: false
        },
        {
            type: "confirm",
            name: "headless",
            message: "是否启动无头浏览器模式？",
            default: true
        },
        {
            type: "input",
            name: "pActionValue",
            message: "使用的浏览器数量",
            default: 2
        }
    ]);

    if (aw1.ifs != true) {
        let aw2 = await inquirer.prompt([
            {
                type: "rawlist",
                name: "students",
                message: "选择要操作的学生名单:",
                choices: async () => {
                    let studentsList: string[] = [];

                    const filelist = await fs.promises.readdir(path.resolve(__dirname, "../data/student"));
                    for (const file of filelist) {
                        studentsList.push(file);
                    }

                    return studentsList;
                }
            },
            {
                type: "rawlist",
                name: "mode",
                message: "选择你要进行的模式",
                choices: [
                    "批量初始化学生密码",
                    "获取今天的答案",
                    "批量答题"
                ],
                default: 2
            }
        ]);

        let sf = await fs.promises.readFile(path.resolve(__dirname, `../data/student/${aw2.students}`), 'utf-8');

        let studentList: Istudent[] = JSON.parse(sf);
        console.log(`一共需要操作的学生数量是${studentList.length}个`);

        if (aw2.mode === "批量答题") {

            let aw3 = await inquirer.prompt([
                {
                    type: "rawlist",
                    name: "daan",
                    message: "选择要使用的答案:",
                    choices: async () => {
                        let daanList: string[] = [];

                        const filelist = await fs.promises.readdir(path.resolve(__dirname, "../data/daan"));
                        for (const file of filelist) {
                            daanList.push(file);
                        }

                        return daanList;
                    }
                }
            ]);

            let df = await fs.promises.readFile(path.resolve(__dirname, `../data/daan/${aw3.daan}`), 'utf-8');

            let dList: Ikey[] = JSON.parse(df);

            // const b = await lausnchP(aw1.headless);

            // console.log('打开页面');
            // const page1 = await b.newPage();

            // console.log('打开登录页面');
            // await page1.goto('http://zsjs.njgzx.cn/student/#/login');

            // for( let s of studentList){
            //     await execDt(b,s,dList).catch(err => {
            //         console.log(err);
            //     });
            // }

            let PList: pupp.Browser[] = [];

            for (let index = 0; index < aw1.pActionValue; index++) {
                PList.push(await launchP(aw1.headless));
            }

            let TaskStackI = new TaskStack(PList);

            let Bar = new ProgressBar(`回答进度 [:bar] :current/:total`, {
                complete: '=',
                incomplete: '-',
                width: 25,
                total: studentList.length
            });


            for (let s of studentList) {
                TaskStackI.addTask({
                    Priority: 1,
                    Exec: async (B) => {

                        let S = new StudentAnswer(B, s, Bar);
                        await S.AutoInit();
                        await S.AutoLogin().catch(async (err) => {
                            await S.AutoChangPassword();
                            await S.AutoLogin();
                        });

                        await S.AutoOpenQuestionnaire().catch((err) => {
                            throw err;
                        });

                        await S.AutoAnswer(dList);

                        await S.AutoScreenShot();

                        Bar.tick();

                        return true;
                    }
                })
            }

            await TaskStackI.start();

            Bar.interrupt('全部处理完毕');
            
        } else if (aw2.mode === "批量初始化学生密码") {

        }
    }
}

async function launchP(headless = false) {
    console.log('启动浏览器');
    return pupp.launch({
        headless: headless,
        timeout: 30000,
        slowMo: 20
    })
}

main();