import { email } from "zod/v4";

// interface a{
//     email:string;
//     name:string;
//     age:number
// }
//1. 给变量 约束
// const user1:a ={
//     email:'aaaaaaa',
//     name:'bob',
//     age:12,
//     // sex: 只能有a里的变量不可多不可少
// }

//2. 给函数的参数贴标签
// const funca =(user1:a) :void =>{
//     console.log(`${user1.email}`+` ${user1.name}`+`${user1.age}`)
// }

// funca({
//     email:'111',
//     name:'bob',
//     age:10
// })

//2 联合类型
type UserRole = 'doctor'|'patient'|'third-party'
const myrole:UserRole = 'doctor'
// 错误：const myRole2:UserRole = 'teacher'

//3 泛型
//泛型就是类型参数，把它当作一个可传入变量，能够适配不同的数据类型，避免写大量重复接口代码
/*
    后端返回json数据
    {
    "code": 200,
    "msg": "请求成功",
    "data": 这里的类型不固定，可能是患者信息、医生信息、列表数据
    }
*/
//不用泛型：要写很多接口
interface Doctor{
    age:number;
    name:string;
}
interface Patient{
    age:number;
    name:string;
}//自定义类型
interface PatientResponse{
    code:number;
    msg:string;
    data:Patient;
}
interface DoctorResponse{
    code:number;
    msg:string;
    data:Doctor;
}

//用泛型：

interface ApiResponse<T>{
    code:number;
    msg:string;
    data:T;
}
// ApiResponse<patient>
// ApiResponse<doctor>
// ApiResponse<doctor[]>//医生数组类型

// <T = any>泛型默认值，不指定类型时，T 自动 = 任意类型

//4 useState<类型>()