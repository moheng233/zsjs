import pupp from 'puppeteer';
import figlet from 'figlet';
import { execdt, execmm, Istudent, Itim } from './dt';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';

async function main(){
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
        }
    ]);

    if(aw1.ifs != true){
        let aw2 = await inquirer.prompt([
            {
                type: "rawlist",
                name: "students",
                message: "选择要操作的学生名单:",
                choices: async () => {
                    let studentsList: string[] = [];

                    const filelist = await fs.promises.readdir(path.resolve(__dirname,"../data/student"));
                    for (const file of filelist){
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

        let sf = await fs.promises.readFile(path.resolve(__dirname,`../data/student/${aw2.students}`),'utf-8');

        let studentList: Istudent[] = JSON.parse(sf);
        console.log(`一共需要操作的学生数量是${studentList.length}个`);

        if(aw2.mode === "批量答题"){

            let aw3 = await inquirer.prompt([
                {
                    type: "rawlist",
                    name: "daan",
                    message: "选择要使用的答案:",
                    choices: async () => {
                        let daanList: string[] = [];

                        const filelist = await fs.promises.readdir(path.resolve(__dirname,"../data/daan"));
                        for (const file of filelist){
                            daanList.push(file);
                        }

                        return daanList;
                    }
                }
            ]);

            let df = await fs.promises.readFile(path.resolve(__dirname,`../data/daan/${aw3.daan}`),'utf-8');

            let dList: Itim[] = JSON.parse(df);

            const b = await launchP(aw1.headless);

            console.log('打开页面');
            const page1 = await b.newPage();

            console.log('打开登录页面');
            await page1.goto('http://zsjs.njgzx.cn/student/#/login');

            for(let s of studentList){
                await execdt(b,s,dList).catch(err => {
                    console.log(err);
                });
            }
        } else if (aw2.mode === "批量初始化学生密码"){
            
        }
    }
}

async function launchP(headless = false){
    console.log('启动浏览器');
    return pupp.launch({
        headless: headless,
        timeout: 3000,
        slowMo: 20
    })
}

main();