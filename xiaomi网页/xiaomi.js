//创建一个对象 用来存放不同侧边栏目对应的选项 后续可以进行添加
    const menuData = {
        'phone': [
            {name: 'Xiaomi 15', img: './images/m15.png' },
            {name: 'REDMI K80', img: './images/k80.png' }
        ],
        'tv': [
            {name: '小米电视S Pro', img: './images/tv1.png' },
            {name: 'REDMI A 2025', img: './images/tv2.png' }
        ],
        'home': [
            {name: '米家冰箱', img: './images/bx.png' }
        ],
        'pad': [
            {name: 'xiaomi book pro 14',img:'./images/book14.png'},
            {name: 'red mi pad 2 pro',img:'./images/red2.png'},
            {name: 'xiaomi pad 8',img:'./images/pad8.png'},
        ],
        'out' :[
            {name: 'xiaomi watch s5',img:'./images/s5.png'}, 
        ],
        'zhin' :[
            {name: 'k歌麦克风',img:'./images/maike.png'}, 
        ],
        'life' :[
            {name: '小背包',img:'./images/smallbag.png'},
        ],
        'secure' :[
            {name: '米家吸顶灯',img:'./images/deng.png'},
        ]
    };

    const detailPanel = document.getElementById('categoryDetail');
    const menuItems = document.querySelectorAll('#leftmenu li');

    // 拿到li后循环拿全部li 设置鼠标选在li标签上面启动反应 利用attr来拿data-type 没有则为0
    menuItems.forEach(item => {
        item.onmouseenter = function() {
            const type = item.getAttribute('data-type'); 
            const data = menuData[type]; 
            if (data) {
                //创建一个let容器包含着div 用来存储最终显示在屏幕上面的内容
                let htmlStr = '<div class="detail-list">';               
                data.forEach(prod => {
                    htmlStr += 
                        `<div class="detail-item">
                            <img src="${prod.img}">
                            <span>${prod.name}</span>
                        </div>`;
                });
                htmlStr += '</div>';

                //塞进面板中
                detailPanel.innerHTML = htmlStr;
                // 塞进了之后 用id属性把一开始设置的display:none属性变为显示
                detailPanel.style.display = 'block'; 
            }
        };
    });

    //测试时发现 如果不设置离开会一直卡在选项界面 于是设置移到hero-container外自动隐藏界面
    document.querySelector('.hero-container').onmouseleave = function() {
        detailPanel.style.display = 'none';
    };



    //轮播图片
    const bannerlist = [
        "./images/1.png",
        "./images/2.png",
        "./images/3.png",
        "./images/4.png",
        "./images/5.png",
        "./images/6.png"
    ];

    const bannerimg = document.getElementById("banner-img")
    const preimg = document.querySelector(".xiaoyu")
    const nextimg = document.querySelector(".dayu")

    let cur = 0;

    function changebanner(){
        bannerimg.src = bannerlist[cur];
    }

    nextimg.onclick = function(){
        cur++;
        if(cur >= bannerlist.length) cur = 0;

        changebanner();
    };

    preimg.onclick = function(){
        cur--;
        if(cur < 0) cur = bannerlist.length-1;

        changebanner();
    };