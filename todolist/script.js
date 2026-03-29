let notes = JSON.parse(localStorage.getItem('my_todo_data')) || [];
//加上[]保证第一次输入不会爆炸

function savetolocal(){
    localStorage.setItem('my_todo_data',JSON.stringify(notes));
}

//设置一个锁定目前界面是否是正常界面还是回收站
let currentview = 'all';
//设置分类所在的界面
let currentcategory = 'all';

function addnote(){
    //先获取输入框的内容
    const titleinput = document.getElementById('note-title');
    //去杂
    const title = titleinput.value.trim();

    if(!title){
        alert("啥也没写");
        return;
    }

    const newnote = {
        id: Date.now(),//生成唯一编号
        content:"",
        title:title,
        date: new Date().toLocaleDateString(),//记录日期
        isdone: false,
        isdeleted: false,
        priority:document.getElementById('priority-select').value,
        category: document.getElementById('category-select').value,
    };

    notes.unshift(newnote);//插入到最前面

    savetolocal();
    titleinput.value = '';
    render();
}

//------优先排列-------
const priorityweight = {
    high: 3,
    medium: 2,
    low: 1,
};
//--------------------

//标记这个事件已经完成
function toggledone(id){
    const note = notes.find(n => n.id === id);
    if(note){
        note.isdone = !note.isdone;
        savetolocal();
        render();//再次渲染
    }
}

//从回收站拿出笔记
function restorenote(id){
    const note = notes.find(n=>n.id === id);
    if(note){
        note.isdeleted = false;
        savetolocal();
        render();
    }
}

//删除笔记
function deletenote(id){
    const noteindex = notes.findIndex(n=>n.id === id);
    if(noteindex == -1) return;
    
    if(!notes[noteindex].isdeleted){
        //没被删除
        notes[noteindex].isdeleted = true;
    }else{
        //如果已经被删除了
        if(confirm("确定要删除这条笔记吗?")){
            notes.splice(noteindex,1);
        }
    }
    savetolocal();
    render();
}

//清空笔记
function clearall(){
    if(notes.length === 0) return;
    if(currentview === 'all'){
        if(confirm("确定把所有笔记放回收站吗?")){
            notes.forEach(n=>n.isdeleted = true)
        }
    }else{
        if(confirm("确定永久删除这些笔记吗?")){
            notes = [];
        }
    }
    savetolocal();
    render();
}

//修改笔记
function editnote(id){
    const note = notes.find(n =>n.id === id);

    if(!note || note.isdeleted) return;

    const newtitle = prompt("修改笔记标题:",note.title);

    if(newtitle !== null && newtitle.trim() !== ""){
        note.title = newtitle;
        savetolocal();
        render();
    }

}

//------切换中英文-------
const i18n = {
    zh: {
        inputplaceholder:"新增待办事项...",
        submitbtn:"提交",
        title: "我的待办事项",
        searchPlaceholder: "搜索笔记...", 
        status: "开✨",
        all: "全部",
        clear: "清除全部",
        trash: "回收站",
        import: "导入(txt/json)",
        langName: "English / 中文",
        emptyTrash: "回收站没东西" ,
        guideTitle: "今日事今日毕，勿将今事待明日！☕",
        guideSub: "添加你的第一个待办事项！📝",
        guideMethod: "食用方法 💡：",
        guideList: [
            "所有提交操作支持Enter回车键提交",
            "拖拽Todo上下移动可排序(仅支持PC)",
            "双击上面的标语和 Todo 可进行编辑",
            "右侧的小窗口是快捷操作哦",
            "所有的Todo数据存储在浏览器本地",
            "支持下载和导入，导入追加到当前序列"
        ],
        high:"高",
        medium:"中",
        low:"低",
        study: "学习",
        work: "工作",
        all: "全部"
    },
    en: {
        inputplaceholder:"Add new todo...",
        submitbtn:"Add",
        title: "My Todo List",
        searchPlaceholder: "Search content...",
        status: "ON✨",
        all: "All",
        clear: "Clear All",
        trash: "Trash",
        import: "Import",
        langName: "中文 / English",
        emptyTrash: "Trash is empty",
        guideTitle: "Don't put off until tomorrow what you can do today! ☕",
        guideSub: "Add your first todo item! 📝",
        guideMethod: "How to use 💡:",
        guideList: [
            "Press Enter to submit your notes",
            "Drag and drop to reorder (PC only)",
            "Double-click titles or todos to edit",
            "Quick actions are in the right panel",
            "All data is stored locally in your browser",
            "Supports download and import (appends to list)"
        ],
        high:"High",
        medium:"Medium",
        low:"Low",
        study: "Study",
        work: "Work",
        all: "All"
    }
};
//默认
let currentLang = localStorage.getItem('my-todo-lang') || 'zh';


//----------------------

//---------搜索----------
const searchinput = document.querySelector('#search-input');

function handlesearch(){
    const keyword = searchinput.value.toLowerCase().trim();
    render(keyword);
}


if(searchinput){
    searchinput.addEventListener('input',handlesearch);
}
//-----------------------

function render(kw = ''){
    const list = document.getElementById('note-list');
    const lang = i18n[currentLang];
    list.innerHTML = '';//清空

    //区别回收站和正常
    let filtered = notes.filter(n=>{
        const viewmatch = (currentview==='all'?!n.isdeleted:n.isdeleted);

        //区别开来大写和小写的搜索
        const searchmatch = n.title.toLowerCase().includes(kw.toLowerCase()) ||
                            n.content.toLowerCase().includes(kw.toLowerCase()); 

        const categorymatch = (currentcategory === 'all' || n.category === currentcategory );          
        //只有保持在回收站界面和全部界面才可以进行搜索 同时保证主界面为work study或者全部
        return viewmatch && searchmatch && categorymatch;
    });

    //--------优先排列-------
    filtered.sort((a,b)=>{
        //完成的先放在前面
        if(a.isdone !== b.isdone){
            return a.isdone ? 1 : -1;
        }
        return priorityweight[b.priority] - priorityweight[a.priority];
    });
    //----------------------


    if(filtered.length === 0){
        if(currentview === 'all'){
            const listItems = lang.guideList.map(n=> `<li><span class="guide-icon">✔</span> ${n}</li>`).join('');
            list.innerHTML = `
            <div class="guide-container">
                <p class="guide-top-title">${lang.guideTitle}</p>
                <p class="guide-title">${lang.guideSub}</p>
                <div class="guide-content">
                    <p class="guide-subtitle">${lang.guideMethod}</p>
                    <ul class="guide-list">
                        ${listItems}
                     </ul>
                </div>
            </div>

            `;
        }
        else{
            list.innerHTML = `<div class="empty-tip">${lang.emptyTrash}</div>`
        }
        return;
    }

    filtered.forEach(note => {
        const card = document.createElement('div');//创造一个div
        //区别已完成和未完成
        card.className = `note-card ${note.isdone ? 'done-style' : ''} priority-${note.priority}`;
        // 获取当前的分泪
        const cattext = note.category === 'work' ? `💼 ${lang.work}` : `📚 ${lang.study}`;


        //添加css属性
        card.innerHTML = `
            <div class = "card-body" onclick="editnote(${note.id})">
                <span class = "category-tag">${cattext}</span>
                <h3 class = "card-title" style="${note.isdone?'text-decoration:line-through;opacity:0.6;':''}" >
                    ${note.title}
                </h3>
                <p class="card-text">${note.content}</p>
            </div>
            <div class="note-footer">
                <span class="note-footer">${note.date}</span>
                <div class="note-actions">
                ${!note.isdeleted ? `
                    <button class="action-btn done" onclick="event.stopPropagation();toggledone(${note.id})">
                        ${note.isdone ? '↩' : '✔'}
                    </button>
                `:`
                    <button class="action-btn done" onclick="event.stopPropagation();restorenote(${note.id})">
                        ♻
                    </button>
                `}
                <button class="action-btn delete"  onclick="event.stopPropagation();deletenote(${note.id})">
                    ${note.isdeleted?'❌' : '🗑'}
                </button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
    
}


//事件绑定部分
document.addEventListener('DOMContentLoaded',()=>{
    //绑定语言切换按钮
    const langbtn = document.getElementById('lang-btn');
    if(langbtn){
        langbtn.onclick = function(){
            currentLang = currentLang === 'zh' ? 'en' : 'zh';
            localStorage.setItem('my-todo-lang',currentLang);
            updateStaticText();
            render();
        }
    }



    // 提交事件绑定增加函数
    const addBtn = document.getElementById('add-btn');
    if(addBtn) addBtn.onclick = addnote;

    // 清除事件绑定清除函数
    const clearBtn = document.getElementById('clear-all');
    if(clearBtn) clearBtn.onclick = clearall;
    
    //处理回收站
    const trashBtn = document.getElementById('trash-bag');
    //回收站单独的界面
    if(trashBtn){
        trashBtn.onclick = function(){
            currentview = 'trash';

            document.querySelectorAll('.nav-btn').forEach(n=>n.classList.remove('active'));
            trashBtn.classList.add('active');
            render();
        };
    }


    //重置为全部的事件
    document.querySelectorAll('.nav-btn').forEach(btn=>{
        if(btn.innerText.includes('全部')){
            btn.onclick = function(){
                if(btn.id === 'clear-all'){
                    clearall();
                    return;
                }
                currentview = 'all';
                document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
                btn.classList.add('active');
                if(btn.id === 'trash-bag' || this.innerHTML.includes('回收站')){
                    currentview = 'trash';
                }
                else{
                    currentview = 'all';
                }
                render();
            };
        }
    })
    updateStaticText();
    render();
})

//--------按钮的文字切换-------
const langbtn = document.getElementById('lang-btn');
if(langbtn){
    langbtn.onclick = function(){
        currentLang = currentLang === 'zh' ? 'en' : 'zh';

        localStorage.setItem('my-todo-lang',currentLang);
        updatenavtext();
        render();
    }
}

function updateStaticText() {
    const lang = i18n[currentLang];
    if(!lang) return;

    if(document.getElementById('note-title')) document.getElementById('note-title').placeholder = lang.inputplaceholder;
    if(document.getElementById('add-btn')) document.getElementById('add-btn').innerText = lang.submitbtn;
    if(document.getElementById('status-bar')) document.getElementById('status-bar').innerText = lang.status;
    if(document.getElementById('all-btn')) document.getElementById('all-btn').innerText = lang.all;
    if(document.getElementById('clear-all')) document.getElementById('clear-all').innerText = lang.clear;
    if(document.getElementById('trash-bag')) document.getElementById('trash-bag').innerText = lang.trash;
    if(document.getElementById('import-btn')) document.getElementById('import-btn').innerText = lang.import;
    if(document.getElementById('lang-btn')) document.getElementById('lang-btn').innerText = lang.langName;

    if(document.getElementById('search-input')) document.getElementById('search-input').placeholder = lang.searchPlaceholder;
    if(document.querySelector('.logo-container span')) document.querySelector('.logo-container span').innerText = lang.title;

    const noteheaderspan = document.querySelector('.note-header span');
    if(noteheaderspan){
        noteheaderspan.innerText = lang.guideTitle;
    }

    const priorityselect = document.getElementById('priority-select');
    if(priorityselect){
        priorityselect.options[0].text = `🔴${lang.high}`;
        priorityselect.options[1].text = `🟡${lang.medium}`;
        priorityselect.options[2].text = `🟢${lang.low}`;
    }

    const categoryselect = document.getElementById('category-select');
    if(categoryselect){
        categoryselect.options[0].text = lang.study;
        categoryselect.options[1].text = lang.work;
        categoryselect.options[2].text = lang.all;
    }
}

//----------------------------