import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router';
import DocumentsWindow from './components/DocumentsWindow';
const pages = new Map([['test-root',{id:'test-root',parentId:null,title:'테스트 상위',content:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'보존할 상위 본문'}]},{type:'paragraph'}]}}]]);
window.fetch = async (url, options={}) => {
 const p = String(url).replace('/api','');
 let data;
 if(p==='/auth/me') data={username:'fixture',isAdmin:true};
 else if(p==='/lab/tree') data=[...pages.values()].map(({id,parentId,title})=>({id,parentId,title}));
 else if(p==='/lab/save') { const note=JSON.parse(options.body); pages.set(note.id,{...pages.get(note.id),...note}); data={success:true}; }
 else if(p.startsWith('/lab/delete/')) {
   const id=p.split('/').at(-1), removed=new Set([id]);
   let size=0; while(size!==removed.size){size=removed.size;for(const note of pages.values())if(removed.has(note.parentId))removed.add(note.id);}
   for(const id of removed)pages.delete(id);
   const clean=node=>node.type==='childNote' && removed.has(node.attrs.noteId)?null:{...node,...(node.content?{content:node.content.map(clean).filter(Boolean)}:{})};
   for(const note of pages.values())note.content=clean(note.content);
   data={success:true,deletedIds:[...removed]};
 } else if(p.startsWith('/lab/'))data=pages.get(p.split('/').at(-1));
 return new Response(JSON.stringify(data || {message:'Not found'}),{status:data?200:404,headers:{'Content-Type':'application/json'}});
};
createRoot(document.getElementById('root')).render(<BrowserRouter><div>격리된 테스트 — 메모리 데이터만 사용</div><DocumentsWindow onClose={()=>{}}/></BrowserRouter>);
