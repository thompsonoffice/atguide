// Rebuilt build script (original lost in a box restore, Oct 31 2026).
// Usage: node build/build.js data/new2.canvas.tsx
// Evaluates the data section of the canvas (types stripped by Node), applies data/research.js and data/research2.js,
// then replaces the window.ATG JSON (and CATS) inside index.html. Prints "bad refs: [...]".
const fs=require("fs"),path=require("path"),cp=require("child_process");
const ROOT=path.resolve(__dirname,".."),src=path.resolve(process.argv[2]||"data/new2.canvas.tsx");
const lines=fs.readFileSync(src,"utf8").split("\n");const end=lines.findIndex(l=>/^const ND\s*=/.test(l));
let body=lines.slice(0,end).filter(l=>!/^import /.test(l)).join("\n");
const tmp=path.join(require("os").tmpdir(),"atg-data-"+process.pid+".mts");
fs.writeFileSync(tmp,body+"\nconsole.log(JSON.stringify({CATS,CO,DEV,OSL,TRIV}));\n");
const out=cp.execFileSync(process.execPath,["--no-warnings","--experimental-strip-types",tmp],{maxBuffer:1<<28}).toString();fs.unlinkSync(tmp);
const B=JSON.parse(out);const {CATS,CO,DEV,OSL,TRIV}=B;
for(const f of ["research.js","research2.js"]){const p=path.join(ROOT,"data",f);if(fs.existsSync(p)){delete require.cache[p];require(p)({DEV,CO,OSL,TRIV});}}
const ix=path.join(ROOT,"index.html");let h=fs.readFileSync(ix,"utf8");
const m=h.match(/window\.ATG=(\{.*?\});?(?=\s*(?:var |<\/script>|\n))/s);if(!m)throw new Error("ATG block not found");
const old=JSON.parse(m[1]);let TXT=old.TXT||{};const sl=path.join(ROOT,"dist","slugs.json");if(fs.existsSync(sl)){try{TXT=JSON.parse(fs.readFileSync(sl,"utf8"));}catch(e){}}
const A={CO,DEV,OSL,TRIV,TXT,DL:old.DL||{}};
h=h.slice(0,m.index)+"window.ATG="+JSON.stringify(A)+";"+h.slice(m.index+m[0].length);
h=h.replace(/var CATS=\[[^\]]*\]/,"var CATS="+JSON.stringify(CATS));
fs.writeFileSync(ix,h);
const coIds=new Set(CO.map(c=>c.id)),devIds=new Set(DEV.map(d=>d.id));
const bad=DEV.filter(d=>!coIds.has(d.co)).map(d=>d.id+"->"+d.co).concat(OSL.flatMap(o=>(o.d||[]).filter(x=>typeof x==="string"&&/^[a-z0-9_]+$/.test(x)&&!devIds.has(x)&&!coIds.has(x)&&!/\s/.test(x)).map(x=>o.id+"->"+x)));
const noTxt=DEV.filter(d=>!TXT["dev:"+d.id]).map(d=>d.id);
console.log(CO.length+" companies, "+DEV.length+" devices");console.log("bad refs: "+JSON.stringify(bad));if(noTxt.length&&Object.keys(TXT).some(k=>k.startsWith("dev:")))console.log("no txt: "+noTxt.join(","));
