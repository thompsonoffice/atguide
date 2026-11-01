import zipfile,shutil,io,os
G='/workspace/atguide/gumroad'
shutil.copy('/workspace/atguide/index.html',G+'/ATGuide/index.html')
with zipfile.ZipFile(G+'/ATGuide-App.zip','w',zipfile.ZIP_DEFLATED) as z:
  for f in sorted(os.listdir(G+'/ATGuide')): z.write(G+'/ATGuide/'+f,'ATGuide/'+f)
shutil.copy('/workspace/atguide/dist/ATGuide-TXT.zip',G+'/ATGuide-TXT.zip')
with zipfile.ZipFile(G+'/ATGuide-Complete.zip','w',zipfile.ZIP_DEFLATED) as z:
  for f in ['ATGuide-App.zip','ATGuide-TXT.zip','Read Me First.txt']: z.write(G+'/'+f,f)
R={'atguide-data.json':open('/workspace/atguide-native/ATGuide/Resources/atguide-data.json','rb').read(),'export_data.py':open('/workspace/atguide-native/tools/export_data.py','rb').read()}
def patch(data):
  zi=zipfile.ZipFile(io.BytesIO(data));out=io.BytesIO();zo=zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED)
  for i in zi.infolist():
    b=zi.read(i);n=os.path.basename(i.filename)
    if n in R: b=R[n]
    elif n.endswith('.zip') and zipfile.is_zipfile(io.BytesIO(b)): b=patch(b)
    zo.writestr(i.filename,b)
  zo.close();return out.getvalue()
inner='/workspace/atguide-native/ATGuide-Xcode.zip'
d=patch(open(inner,'rb').read());open(inner,'wb').write(d)
o='/workspace/ATGuide-Xcode.zip';d=patch(open(o,'rb').read());open(o,'wb').write(d)
print('ok')
