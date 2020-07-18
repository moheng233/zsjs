import { EventEmitter } from "events";

export interface ITask<T> {
    Priority: number,
    Exec: (ClassI: T, ...arg: any[]) => Promise<boolean>,
    Data?: any[]
}

export class TaskStack<T> {
    _runTaskNumber = 0;
    _ClassList: T[] = [];
    _rej!: (value?: unknown) => void;
    _TStack: ITask<T>[] = [];

    constructor(ClassI: T[],option?: {isWorkThread?: boolean}){
        this._ClassList = ClassI;
    }

    addTask(task: ITask<T>, ...arg: any[]){
        task.Data = arg;

        this._TStack.push(task);
    }

    get runTaskNumber(){
        return this._runTaskNumber;
    }

    set runTaskNumber(n){
        this._runTaskNumber = n;
    }

    runTask(C: T,task: ITask<T>){
        this.runTaskNumber += 1;

        task.Exec(C,task.Data).then((r) => {
            this.runTaskNumber -= 1;

            let Task = this._TStack.pop();
            if(Task != undefined){
                this.runTask(C,Task);
            } else {
                this.complete();
            }
        }).catch((err) => {
            console.log(err);

            this.runTaskNumber -= 1;

            let Task = this._TStack.pop();
            if(Task != undefined){
                this.runTask(C,Task);
            } else {
                this.complete();
            }
        });
    }
    
    async start(){
        return new Promise((rej,reg) => {
            this._rej = rej;

            this._TStack.sort((a,b) => {
                return a.Priority - b.Priority;
            })
    
            for ( let C of this._ClassList){
                let Task = this._TStack.pop();
                if(Task != undefined){
                    this.runTask(C,Task);
                } else {
                    break;
                }
            }
        })
    }

    stop(){

    }

    complete(){
        if(this.runTaskNumber <= 0){
            console.log('执行完毕');
            this._rej();
        }
    }
}

export function randomNum(minNum: number,maxNum: number){ 
    var range = maxNum - minNum; //取值范围的差

    var random = Math.random(); //小于1的随机数
    
    return minNum + Math.round(random * range); //最小数与随机数和取值范围求和，返回想要的随机数字
}