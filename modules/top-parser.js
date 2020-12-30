/**
 * @file modules/top-parser.js
 * @project big_brother
 * @author Aleksandr Krasnov
 * @todo брал от сюда https://github.com/devalexqt/topparser
 */


function parseStatLine(line,options,error){
    line=line.replace(/ +(?= )/g,'')// replace multiple spaces

    if(!options.root.regex.exec(line)){
        return {}
    }//root stat line

    var result={}
    var tmp=null
    try{
        options.params.forEach(item=>{
            item.keys=item.keys||1
            tmp=item.regex.exec(line)
            if(tmp){
                if(!item.keys||item.keys==1){result[item.name]=tmp[1]}      
                else{
                    var subarray=[]
                    for(var i=1;i<item.keys+1;i++){
                        subarray.push(tmp[i])
                    }//for
                    result[item.name]=subarray
                }//else
            }//if
        })
    }catch(err){error(err)}

    return result
}//parseCpu


function parseProcessLine(str,error){
    var result={}
    try{
        var data = str.split(' ');
        var items = [];
        for(var i in data) {
            if(data[i]) {
                items.push(data[i]);
            }
        }

        result= {
            "pid":items[0],
            "user":items[1],
            "pr":items[2],
            "ni":items[3],
            "virt":items[4],
            "res":items[5],
            "shr":items[6],
            "s":items[7],
            "cpu":items[8],
            "mem":items[9],
            "time":items[10],
            "command":items[11],
        }
    }catch(err){
        error(err)
    }
    return result
}//parseRootTopLine


/**
 * Парсинг top - результата
 * @param {string} data входная строка
 * @param {any} options опции. По умолчанию {}
 * @param {void} error обрабочик ошибок 
 * @example
 * var top = require('./modules/top-parser')(input, {}, error=>{ });
 */
module.exports = function(data,options={pid_sort(a,b){return a.cpu-b.cpu}},error=(error)=>{/*parser error messages*/ console.log(error)}){
    var data=data.split("\n").filter(v=>v!="")
    var result={

        top:parseStatLine(data[0],
            {
                root:{regex:/top \-/g,name:"top"},//root line params
                params:[// parse variable values
                    {regex: /(\d+\:\d+\:\d+) up/g, name:"time"},
                    // {regex: /up  ([0-9,\:]+)\,/g, name:"up"},
                    {regex: / ([0-9,\:]+)\, \d+ user/g, name:"up_hours"},
                    {regex: / (\d+) days/g, name:"up_days"},
    
                    {regex: /(\d+) user/g, name:"user"},
                    {regex: /load average: (\d+[\.,]\d+)\, (\d+[\.,]\d+)\, (\d+[\.,]\d+)/g, name:"load_average",keys:3},//need subarray with values
                    // {regex: /(\d+) zombie/g, name:"zombie"},
                ]
    
            },error
        ),//stat 

        tasks:parseStatLine(data[1],
            {
                root:{regex:/Tasks/g,name:"tasks"},//root line params
                params:[// parse variable values
                    {regex: /(\d+) total/g, name:"total"},
                    {regex: /(\d+) running/g, name:"running"},
                    {regex: /(\d+) sleeping/g, name:"sleeping"},
                    {regex: /(\d+) stopped/g, name:"stopped"},
                    {regex: /(\d+) zombie/g, name:"zombie"},
                ]
    
            },error
        ),//stat    

        cpu:parseStatLine(data[2],
            {
                root:{regex:/%Cpu/g,name:"cpu"},//root line params
                params:[// parse variable values
                    {regex: /(\d+[\.,]\d) us/g, name:"us"},
                    {regex: /(\d+[\.,]\d) sy/g, name:"sy"},
                    {regex: /(\d+[\.,]\d) ni/g, name:"ni"},
                    {regex: /(\d+[\.,]\d) id/g, name:"id"},
                    {regex: /(\d+[\.,]\d) wa/g, name:"wa"},
                    {regex: /(\d+[\.,]\d) hi/g, name:"hi"},
                    {regex: /(\d+[\.,]\d) si/g, name:"si"},
                    {regex: /(\d+[\.,]\d) st/g, name:"st"},
                ]
            },error
        ),//stat

        mem:parseStatLine(data[3],
            {
                root:{regex:/KiB Mem/g,name:"mem"},//root line params
                params:[// parse variable values
                    {regex: /(\d+) total/g, name:"total"},
                    {regex: /(\d+) used/g, name:"used"},
                    {regex: /(\d+) free/g, name:"free"},
                    {regex: /(\d+) buffers/g, name:"buffers"},
                    {regex: /(\d+) buff\/cache/g, name:"buff_cache"},
                ]
                
            }
            ),//stat   

        swap:parseStatLine(data[4],
            {
                root:{regex:/KiB Swap/g,name:"swap"},//root line params
                params:[// parse variable values
                    {regex: /(\d+) total/g, name:"total"},
                    {regex: /(\d+) used/g, name:"used"},
                    {regex: /(\d+) free/g, name:"free"},
                    {regex: /(\d+) cached Mem/g, name:"cached_mem"},
                    {regex: /(\d+) avail Mem/g, name:"avail_mem"},
                ]
            },error
        ),//stat
            
        processes:[...( [            
                (()=>{
                    var result=[]
                    for (var i=5;i<data.length-1;i++){
                        var proc=null
                        try{
                            var proc=parseProcessLine(data[i],error)
                            if(typeof options.pid_filter=="function"){
                                proc=options.pid_filter(proc)
                            }//if
                        }catch(err){error(err)}
                        proc?result.push(proc):null                        
                    }//for
                    return result.slice(0,options.pid_limit||result.length).sort(options.pid_sort)
                 })()//for        
        ]
        )]    
            
    }//result
    
    return result

}//export