let notes = JSON.parse(localStorage.getItem('my_todo_data')) || [];
//加上[]保证第一次输入不会爆炸

function savetolocal(){
    localStorage.setItem('my_todo_data',JSON.stringify(notes));
}

//设置一个锁定目前界面是否是正常界面还是回收站
let currentview = 'all';

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
        isdeleted: false
    };

    notes.unshift(newnote);//插入到最前面

    savetolocal();
    titleinput.value = '';
}

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


function render(){
    const list = document.getElementById('note-list');
    list.innerHTML = '';//清空

    //区别回收站和正常
    const filtered = notes.filter(n=>currentview === 'all'? !n.isdeleted : n.isdeleted);

    if(filtered.length === 0){
        if(currentview === 'all'){
            list.innerHTML = `
                        <div class="guide-container">
                            
                            <p class="guide-title">添加你的第一个待办事项！📝</p>
                            <div class="guide-content">
                                <p class="guide-subtitle">食用方法 💡：</p>
                                <ul class="guide-list">
                                    <li><span class="guide-icon">✔</span> 所有提交操作支持Enter回车键提交</li>
                                    <li><span class="guide-icon">✔</span> 拖拽Todo上下移动可排序(仅支持PC)</li>
                                    <li><span class="guide-icon">✔</span> 双击上面的标语和 Todo 可进行编辑</li>
                                    <li><span class="guide-icon">✔</span> 右侧的小窗口是快捷操作哦</li>
                                    <li><span class="guide-icon">🔒</span> 所有的Todo数据存储在浏览器本地</li>
                                    <li><span class="guide-icon">📝</span> 支持下载和导入，导入追加到当前序列</li>
                                </ul>
                            </div>
                        </div>
            `;
        }
        else{
            list.innerHTML = `<div class="empty-tip">回收站没东西</div>`
        }
        return;
    }

    filtered.forEach(note => {
        const card = document.createElement('div');//创造一个div
        //区别已完成和未完成
        card.className = `note-card ${note.isdone ? 'done-style' : ''}`;
        //添加css属性
        card.innerHTML = `
            <div class = "card-body" onclick="editnote(${note.id})">
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
                if(btn.id === 'trash-bag' || this,this.innerHTML.includes('回收站')){
                    currentview = 'trash';
                }
                else{
                    currentview = 'all';
                }
                render();
            };
        }
    })

    render();
})