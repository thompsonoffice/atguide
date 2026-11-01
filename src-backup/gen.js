const fs=require("fs"),path=require("path");
const html=fs.readFileSync("/workspace/atguide/index.html","utf8");
const m=html.match(/<script>window\.ATG=(.*?);<\/script>/s);
const D=JSON.parse(m[1]);const {CO,DEV,OSL}=D;
const OUT="/workspace/atguide/dist",ROOT=OUT+"/ATGuide-TXT",TXT=OUT+"/txt";
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(ROOT,{recursive:true});fs.mkdirSync(TXT,{recursive:true});
const ND="Not documented",SW=["Screen Readers","Accessible Linux"],NL="\r\n";
const CM={},DM={},OM={},osBy={},usedBy={};CO.forEach(c=>CM[c.id]=c);DEV.forEach(d=>{DM[d.id]=d;(d.vo||[]).forEach(v=>(usedBy[v]=usedBy[v]||[]).push(d.id));});OSL.forEach(o=>{OM[o.id]=o;o.d.forEach(id=>(osBy[id]=osBy[id]||[]).push(o.id));});
const coName=id=>CM[id]?CM[id].n:id;
const ascii=s=>String(s).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,"-").replace(/·/g,"-").replace(/[^\x20-\x7e]/g,"");
const safe=s=>ascii(s).replace(/[\/\\]/g,"-").replace(/[:*?"<>|]/g," ").replace(/\s+/g," ").trim().replace(/^[. ]+|[. ]+$/g,"").slice(0,100)||"Untitled";
const slugify=s=>ascii(s).toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,80)||"entry";
// text cleanup: plain, no markdown symbols
const clean=s=>String(s==null?"":s).replace(/[*_`#|]/g,"").replace(/[★☆]/g,"").trim();
const used=new Set(),slugOf=(k,n)=>{let b=slugify(n),s=b,i=2;while(used.has(s))s=b+"-"+i++;used.add(s);return s;};
const SL={};// key -> slug
CO.forEach(c=>SL["co:"+c.id]=slugOf("co","company "+c.n));
DEV.forEach(d=>SL["dev:"+d.id]=slugOf("dev",d.n));
OSL.forEach(o=>SL["os:"+o.id]=slugOf("os","history "+o.n));
const sec=(title,lines)=>[title+":"].concat(lines.length?lines.map(clean):[ND]).join(NL);
const ref=id=>DM[id]?DM[id].n+" ("+coName(DM[id].co)+", "+DM[id].y+")":id;
function devTxt(d){const s=d.s||{},v=x=>x||ND,isV=d.cat==="TTS Voices",isS=SW.indexOf(d.cat)>=0;let rows;
 if(isV)rows=[["Maker",coName(d.co)],["First released",d.y],["Synthesis type",v(s.syn)],["Platforms",v(s.plat)],["Default on or shipped with",v(s.def)],["Price",v(s.price)]];
 else if(isS)rows=[["Developer",coName(d.co)],["Release years",d.y],["Runs on",v(s.os)],["Default speech",v(s.tts)],["Price",v(s.price)]];
 else rows=[["Released",d.y],["Processor",v(s.cpu)],["Memory (RAM)",v(s.ram)],["Storage",v(s.sto)],["Operating system",v(s.os)],["Default speech synthesizer",v(s.tts)],["Battery",v(s.bat)],["Display or braille cells",v(s.disp)],["Speech synthesizers available",v(s.syns)],["Price at launch",v(s.price)],["Used price today (eBay)",v(s.used)]];
 if(!isV&&s.syn)rows.push(["Synthesis type",s.syn]);
 const specs=rows.map(r=>r[0]+": "+clean(r[1]));
 if(d.vo&&d.vo.length)specs.push("Voices: "+d.vo.filter(x=>DM[x]).map(x=>DM[x].n).join("; "));
 if(usedBy[d.id])specs.push("Shipped with or used by: "+usedBy[d.id].map(x=>DM[x].n).join("; "));
 const hist=[d.h||ND];if(d.pre&&d.pre.length)hist.push("Predecessors: "+d.pre.map(ref).join("; "));if(d.suc&&d.suc.length)hist.push("Successors: "+d.suc.map(ref).join("; "));
 const os=[s.os||(isV?(s.plat||ND):ND)];(osBy[d.id]||[]).forEach(o=>os.push("Operating system history: "+OM[o].n));
 const parts=[clean(d.n),"Company: "+coName(d.co),"Category: "+d.cat,"Released: "+clean(d.y)];
 return [parts.join(NL),sec("Overview",[d.o||ND]),sec("Specs",specs),sec("Physical Description",[isV||isS?"Not applicable (software)":(d.ph||ND)]),
  ...(d.desc&&d.desc.length?[sec("Detailed Description",d.desc)]:[]),sec("Features",d.f||[]),sec("History",hist),sec("Ports",[isV||isS?"Not applicable (software)":(d.io||ND)]),sec("Operating System",os),
  sec("System Requirements",d.req||[]),sec("Sources",d.src.map((u,i)=>"Source "+(i+1)+": "+u)),"From ATGuide, https://thompsonoffice.github.io/atguide/"].join(NL+NL)+NL;}
function osTxt(o){const vers=o.v.map((x,i)=>"Version "+(i+1)+": "+clean(x[0])+NL+"Released: "+clean(x[1]||ND)+NL+"Notes: "+clean(x[2]||ND));
 return [[clean(o.n),"Company: "+coName(o.co),"Category: Operating system or software version history","Versions listed: "+o.v.length].join(NL),
  sec("Overview",[o.h||ND]),["Version History:"].concat(vers.length?vers:[ND]).join(NL+NL),sec("Devices and Software That Ran It",o.d.filter(x=>DM[x]).map(ref)),
  sec("System Requirements",o.req||[]),sec("Sources",o.src.map((u,i)=>"Source "+(i+1)+": "+u)),"From ATGuide, https://thompsonoffice.github.io/atguide/"].join(NL+NL)+NL;}
function coTxt(c){const prods=DEV.filter(d=>d.co===c.id).sort((a,b)=>(a.yr||9999)-(b.yr||9999)||a.n.localeCompare(b.n)),oses=OSL.filter(o=>o.co===c.id);
 return [[clean(c.n),"Type: Company profile","Founded: "+clean(c.f||ND),"Products listed: "+prods.length].join(NL),sec("History",[c.h||ND]),
  sec("Products",prods.map(d=>d.n+" ("+d.cat+", "+d.y+")")),sec("Operating System and Software Histories",oses.map(o=>o.n)),
  sec("Sources",(c.src||[]).map((u,i)=>"Source "+(i+1)+": "+u)),"From ATGuide, https://thompsonoffice.github.io/atguide/"].join(NL+NL)+NL;}
// write files
const folderUsed={},readme=[];let count=0;
function put(coId,name,key,body){const folder=safe(coName(coId));const dir=ROOT+"/"+folder;fs.mkdirSync(dir,{recursive:true});
 folderUsed[folder]=folderUsed[folder]||new Set();let base=safe(name),f=base,i=2;while(folderUsed[folder].has(f.toLowerCase()))f=base+" ("+i+++")";folderUsed[folder].add(f.toLowerCase());
 fs.writeFileSync(dir+"/"+f+".txt",body);fs.writeFileSync(TXT+"/"+SL[key]+".txt",body);count++;return folder+"/"+f+".txt";}
const cos=CO.slice().sort((a,b)=>a.n.localeCompare(b.n));
cos.forEach(c=>{const lines=[];lines.push(put(c.id,"About "+c.n,"co:"+c.id,coTxt(c)));
 OSL.filter(o=>o.co===c.id).forEach(o=>lines.push(put(c.id,o.n+" (version history)","os:"+o.id,osTxt(o))));
 DEV.filter(d=>d.co===c.id).sort((a,b)=>a.n.localeCompare(b.n)).forEach(d=>lines.push(put(c.id,d.n,"dev:"+d.id,devTxt(d))));
 readme.push(clean(c.n)+" ("+lines.length+" files):"+NL+lines.map(l=>l).join(NL));});
const total=count+1;
const R=["ATGuide plain text edition","Generated "+new Date().toISOString().slice(0,10)+" from ATGuide, https://thompsonoffice.github.io/atguide/","",
"This folder holds one plain text file for every entry in ATGuide: each device, braille display, notetaker, speech synthesizer, text-to-speech voice, screen reader, operating system or software version history, and company profile.",
"There is one folder per company. Each folder starts with an About file for the company, then its version histories, then its products in alphabetical order.",
"Each entry file has a header, then sections separated by blank lines in this order: Overview, Specs, Physical Description, Features, History, Ports, Operating System, System Requirements, Sources. Facts that could not be found in a source read Not documented.",
"","Totals: "+CO.length+" companies, "+DEV.length+" devices, software and voices, "+OSL.length+" version histories, "+total+" files including this README.","",
"Index by company:","",readme.join(NL+NL)].join(NL)+NL;
fs.writeFileSync(ROOT+"/README.txt",R);fs.writeFileSync(TXT+"/README.txt",R);
fs.writeFileSync(OUT+"/slugs.json",JSON.stringify(SL));
console.log("files",total,"folders",Object.keys(folderUsed).length);
