const fs=require("fs"),cp=require("child_process"),path=require("path");
const lines=fs.readFileSync("data/new2.canvas.tsx","utf8").split("\n");const end=lines.findIndex(l=>/^const ND\s*=/.test(l));
fs.writeFileSync("/tmp/a.mts",lines.slice(0,end).filter(l=>!/^import /.test(l)).join("\n")+"\nconsole.log(JSON.stringify({CO,DEV,OSL,TRIV}));");
const B=JSON.parse(cp.execFileSync(process.execPath,["--no-warnings","--experimental-strip-types","/tmp/a.mts"],{maxBuffer:1<<28}));
for(const f of["research.js","research2.js"])require(path.resolve("data",f))(B);
const SW=new Set(["TTS Voices","Screen Readers","Speech Synthesizers","Accessible Linux"]);
const hw=B.DEV.filter(d=>!SW.has(d.cat)),sw=B.DEV.filter(d=>SW.has(d.cat));
const APP=new Set(["aira","eyenote","cashreaderapp","looktelmr","openbook","knfbm","irisv","hwcomp"]);const nod=hw.filter(d=>!APP.has(d.id)&&!(d.desc&&d.desc.length>=5));
const sh=sw.filter(d=>(d.h||"").length<300);
console.log("hw",hw.length,"nodesc",nod.length,nod.map(d=>d.id).join(" "));
console.log("sw",sw.length,"short",sh.length,sh.map(d=>d.id+"("+(d.h||"").length+")").join(" "));
let g=[];for(const d of B.DEV)for(const k of["yr","y","o","h","src"]){const v=d[k];if(!v||(Array.isArray(v)&&!v.length)||/Not documented/.test(JSON.stringify(v)))g.push(d.id+"."+k)}
for(const d of B.DEV)if(/Not documented/.test(JSON.stringify(d.s||{})+(d.ph||"")+(d.io||"")))g.push(d.id+".s/ph/io");
console.log("gaps",g.length,g.join(" "));
