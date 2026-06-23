(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const d of i)if(d.type==="childList")for(const s of d.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const d={};return i.integrity&&(d.integrity=i.integrity),i.referrerPolicy&&(d.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?d.credentials="include":i.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function n(i){if(i.ep)return;i.ep=!0;const d=t(i);fetch(i.href,d)}})();let P=null;function ge(e){function a(){const t=window.location.hash.replace("#","")||"/dashboard";if(P){try{P()}catch{}P=null}let n=!1;for(const[i,d]of Object.entries(e)){const s=ye(i,t);if(s){document.getElementById("app").scrollTop=0,P=d(s.params),n=!0;break}}n||(window.location.hash="#/dashboard")}window.addEventListener("hashchange",a),a()}function ye(e,a){const t=e.split("/"),n=a.split("/");if(t.length!==n.length)return null;const i={};for(let d=0;d<t.length;d++)if(t[d].startsWith(":"))i[t[d].slice(1)]=n[d];else if(t[d]!==n[d])return null;return{params:i}}function b(e){window.location.hash=e}function M(){window.history.back()}const he="/api";function ee(){return localStorage.getItem("bm_token")}function xe(e){localStorage.setItem("bm_token",e)}function $e(){localStorage.removeItem("bm_token")}async function $(e,a,t=null){const n={"Content-Type":"application/json"},i=ee();i&&(n.Authorization=`Bearer ${i}`);const d={method:e,headers:n};t&&(d.body=JSON.stringify(t));const s=await fetch(`${he}${a}`,d),c=await s.json();if(!s.ok)throw new Error(c.error||"请求失败");return c}async function te(e,a){const t=await $("POST","/auth/login",{phone:e,password:a});return xe(t.token),localStorage.setItem("bm_user",JSON.stringify(t.user)),t.user}function H(){try{return JSON.parse(localStorage.getItem("bm_user"))}catch{return null}}function T(){return!!ee()&&!!H()}function ae(){$e(),localStorage.removeItem("bm_user")}async function U(e="",a=""){const t=new URLSearchParams;e&&t.set("status",e),a&&t.set("keyword",a);const n=t.toString();return(await $("GET",`/activities${n?"?"+n:""}`)).activities}async function E(e){return(await $("GET",`/activities/${e}`)).activity}async function F(e){const a=await $("POST","/activities",e);return{...e,id:a.id}}async function w(e,a){return await $("PUT",`/activities/${e}`,a),{id:e,...a}}async function ie(e){await $("DELETE",`/activities/${e}`)}async function ke(e){await $("POST",`/activities/${e}/restore`)}async function Ee(e){await $("DELETE",`/activities/${e}/permanent`)}async function we(e){return await $("POST","/activities/batch-export",{ids:e})}async function ne(e,a){await w(e,{fields:a})}async function Le(e=""){const a=e?`?category=${encodeURIComponent(e)}`:"";return await $("GET",`/templates${a}`)}async function se(e,a=""){const t=a?`?token=${encodeURIComponent(a)}`:"";return(await $("GET",`/form/${e}${t}`)).activity}async function de(e,a,t=""){const n=t?{...a,token:t}:a;return await $("POST",`/form/${e}/submit`,n)}async function Ie(e){return(await $("POST",`/activities/${e}/regenerate-token`)).inviteToken}async function ce(e){return(await $("GET",`/activities/${e}/submissions`)).submissions}async function le(e){await $("DELETE",`/activities/${e}/submissions`)}const oe=Object.freeze(Object.defineProperty({__proto__:null,addSubmission:de,batchExport:we,clearSubmissions:le,createActivity:F,deleteActivity:ie,getActivities:U,getActivity:E,getLoginUser:H,getPublicActivity:se,getSubmissions:ce,getTemplates:Le,isLoggedIn:T,login:te,logout:ae,permanentDeleteActivity:Ee,regenerateToken:Ie,restoreActivity:ke,updateActivity:w,updateActivityFields:ne},Symbol.toStringTag,{value:"Module"}));let V=null;function u(e,a=2e3){const t=document.getElementById("toast");t&&(t.textContent=e,t.classList.add("show"),clearTimeout(V),V=setTimeout(()=>{t.classList.remove("show")},a))}function re({title:e="",content:a="",footer:t=null}={}){C();const n=document.createElement("div");n.className="modal-overlay",n.id="current-modal";const i=document.createElement("div");i.className="modal-content";let d="";return t&&(d=`<div class="mt-16">${t}</div>`),i.innerHTML=`
    <div class="modal-header">
      <span class="modal-title">${e}</span>
      <button class="modal-close" id="modal-close-btn">✕</button>
    </div>
    <div class="modal-body">${a}</div>
    ${d}
  `,n.appendChild(i),document.body.appendChild(n),n.querySelector("#modal-close-btn").addEventListener("click",C),n.addEventListener("click",s=>{s.target===n&&C()}),i}function C(){const e=document.getElementById("current-modal");e&&e.remove()}function ue(e){return/^1[3-9]\d{9}$/.test(e)}function pe(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}function me(e){return/^[一-龥·]{2,20}$/.test(e)}function ve(e){if(!/^\d{17}[\dXx]$/.test(e))return!1;const a=[7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2],t=["1","0","X","9","8","7","6","5","4","3","2"];let n=0;for(let i=0;i<17;i++)n+=parseInt(e[i])*a[i];return t[n%11]===e[17].toUpperCase()}function be(e){if(!e)return"";const a=new Date(e),t=n=>String(n).padStart(2,"0");return`${a.getFullYear()}-${t(a.getMonth()+1)}-${t(a.getDate())} ${t(a.getHours())}:${t(a.getMinutes())}`}function R(e){if(!e)return"";const a=new Date(e),t=n=>String(n).padStart(2,"0");return`${a.getFullYear()}-${t(a.getMonth()+1)}-${t(a.getDate())}`}function Te(){return Date.now()}function h(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function Se(e){return new URLSearchParams(window.location.search).get(e)}function z(e){const a=window.location.hash.replace("#",""),t=a.indexOf("?");return t===-1?null:new URLSearchParams(a.slice(t+1)).get(e)}function Be(e){return JSON.parse(JSON.stringify(e))}function qe(e,a=300){let t;return function(...n){clearTimeout(t),t=setTimeout(()=>e.apply(this,n),a)}}function fe(e,a,t="data.csv"){const n="\uFEFF",i=e.join(","),d=a.map(y=>e.map(r=>{let o=(y[r]??"").toString();return(o.includes(",")||o.includes('"')||o.includes(`
`))&&(o='"'+o.replace(/"/g,'""')+'"'),o}).join(",")),s=n+[i,...d].join(`
`),c=new Blob([s],{type:"text/csv;charset=utf-8;"}),l=URL.createObjectURL(c),m=document.createElement("a");m.href=l,m.download=t,m.click(),URL.revokeObjectURL(l)}const Ae=Object.freeze(Object.defineProperty({__proto__:null,closeModal:C,debounce:qe,deepClone:Be,exportCSV:fe,formatDate:R,formatDateTime:be,genId:h,getHashParam:z,getUrlParam:Se,isValidChineseName:me,isValidEmail:pe,isValidIdCard:ve,isValidPhone:ue,now:Te,showModal:re,showToast:u},Symbol.toStringTag,{value:"Module"}));function Ce(){if(T())return b("#/dashboard"),()=>{};const e=document.getElementById("app");e.innerHTML=`
    <div class="login-page">
      <div class="login-logo">📋</div>
      <div class="login-title">小棕熊预约报名</div>
      <div class="login-subtitle">活动预约 · 培训报名 · 场馆预约</div>

      <div class="login-card">
        <div class="form-group">
          <label class="form-label">手机号码</label>
          <input type="tel" class="form-input" id="phone-input"
                 placeholder="请输入手机号码" maxlength="11"
                 value="13310843925"
                 autocomplete="tel" />
          <div class="form-error" id="phone-error"></div>
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <input type="password" class="form-input" id="password-input"
                 placeholder="请输入密码"
                 value="Aled2239"
                 autocomplete="current-password" />
          <div class="form-error" id="password-error"></div>
        </div>

        <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">
          <input type="checkbox" id="agree-check" style="width:16px;height:16px;accent-color:#D4720D" />
          <span style="font-size:12px;color:#999">我已阅读并同意</span>
          <a href="#" id="privacy-link" style="font-size:12px;color:#D4720D">《用户服务协议及隐私政策》</a>
        </div>

        <button class="btn btn-primary btn-block btn-lg" id="login-btn">
          登 录
        </button>
      </div>
    </div>
  `;const a=document.getElementById("phone-input"),t=document.getElementById("password-input"),n=document.getElementById("login-btn"),i=document.getElementById("phone-error"),d=document.getElementById("password-error");t.addEventListener("keydown",c=>{c.key==="Enter"&&s()}),n.addEventListener("click",s);async function s(){if(i.textContent="",d.textContent="",!document.getElementById("agree-check").checked){u("请先阅读并同意用户服务协议及隐私政策");return}const c=a.value.trim(),l=t.value;if(!c){i.textContent="请输入手机号码";return}if(!/^1[3-9]\d{9}$/.test(c)){i.textContent="手机号码格式不正确";return}if(!l){d.textContent="请输入密码";return}n.disabled=!0,n.textContent="登录中...";try{await te(c,l),u("登录成功！"),setTimeout(()=>b("#/dashboard"),500)}catch(m){u(m.message||"手机号或密码错误"),n.disabled=!1,n.textContent="登 录"}}return()=>{}}const Me="modulepreload",Pe=function(e){return"/"+e},N={},D=function(a,t,n){let i=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),c=(s==null?void 0:s.nonce)||(s==null?void 0:s.getAttribute("nonce"));i=Promise.allSettled(t.map(l=>{if(l=Pe(l),l in N)return;N[l]=!0;const m=l.endsWith(".css"),y=m?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${y}`))return;const r=document.createElement("link");if(r.rel=m?"stylesheet":Me,m||(r.as="script"),r.crossOrigin="",r.href=l,c&&r.setAttribute("nonce",c),document.head.appendChild(r),m)return new Promise((o,p)=>{r.addEventListener("load",o),r.addEventListener("error",()=>p(new Error(`Unable to preload CSS for ${l}`)))})}))}function d(s){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=s,window.dispatchEvent(c),!c.defaultPrevented)throw s}return i.then(s=>{for(const c of s||[])c.status==="rejected"&&d(c.reason);return a().catch(d)})};let _="all",q="";function He(){if(!T())return b("#/login"),()=>{};H();const e=document.getElementById("app");return e.innerHTML=`
    <!-- 顶部 -->
    <div class="dashboard-header">
      <div class="greeting">👋 欢迎回来</div>
      <div class="title-section">
        <div class="main-title">小棕熊预约报名</div>
        <div class="avatar">🐻</div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div style="background:var(--bg-white);padding:12px 16px">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" id="search-input" placeholder="搜索活动名称..." />
      </div>
    </div>

    <!-- 标签切换 -->
    <div class="dashboard-tabs" id="dashboard-tabs">
      <div class="dashboard-tab active" data-tab="all">全部</div>
      <div class="dashboard-tab" data-tab="published">已发布</div>
      <div class="dashboard-tab" data-tab="draft">草稿</div>
      <div class="dashboard-tab" data-tab="ended">已结束</div>
    </div>

    <!-- 活动列表 -->
    <div class="page" style="padding-top:12px" id="activity-list-container">
      <div class="text-center text-hint" style="padding:24px">加载中...</div>
    </div>

    <!-- 悬浮按钮 -->
    <button class="fab" id="create-fab">+</button>

    <!-- 底部导航 -->
    <div class="tabbar">
      <div class="tabbar-item active" data-nav="dashboard">
        <span class="tab-icon">🏠</span><span class="tab-label">首页</span></div>
      <div class="tabbar-item" data-nav="templates">
        <span class="tab-icon">📋</span><span class="tab-label">模板</span></div>
      <div class="tabbar-item" data-nav="create">
        <span class="tab-icon">➕</span><span class="tab-label">创建</span></div>
      <div class="tabbar-item" data-nav="about">
        <span class="tab-icon">🐻</span><span class="tab-label">关于</span></div>
    </div>
  `,Oe(),I(),()=>{}}function Oe(){document.getElementById("create-fab").addEventListener("click",()=>{b("#/create")}),document.getElementById("dashboard-tabs").addEventListener("click",a=>{const t=a.target.closest(".dashboard-tab");t&&(_=t.dataset.tab,document.querySelectorAll(".dashboard-tab").forEach(n=>n.classList.remove("active")),t.classList.add("active"),I())}),document.getElementById("search-input").addEventListener("input",a=>{q=a.target.value.trim().toLowerCase(),I()}),document.getElementById("activity-list-container").addEventListener("click",async a=>{const t=a.target.closest("[data-action]");if(!t)return;const{action:n,id:i}=t.dataset;switch(n){case"form":b(`#/builder/${i}`);break;case"publish":b(`#/publish/${i}`);break;case"data":b(`#/data/${i}`);break;case"edit":b(`#/edit/${i}`);break;case"duplicate":await De(i);break;case"delete":await ze(i);break;case"end":await _e(i);break}}),document.querySelector(".tabbar").addEventListener("click",a=>{const t=a.target.closest(".tabbar-item");if(t)switch(t.dataset.nav){case"dashboard":b("#/dashboard");break;case"templates":b("#/templates");break;case"create":b("#/create");break;case"about":b("#/about");break}})}async function I(){var a;const e=document.getElementById("activity-list-container");try{const t=await U(),n=t.filter(d=>{const s=_==="all"||d.status===_,c=!q||d.name.toLowerCase().includes(q);return s&&c});(a=document.getElementById("stat-total"))==null||a.remove();const i=`
      <div class="stats-row" id="stat-total">
        <div class="stat-card-v2"><div class="stat-value">${t.length}</div><div class="stat-label">全部活动</div></div>
        <div class="stat-card-v2"><div class="stat-value">${t.filter(d=>d.status==="published").length}</div><div class="stat-label">已发布</div></div>
        <div class="stat-card-v2 accent"><div class="stat-value">${t.reduce((d,s)=>d+(s.submissionCount||0),0)}</div><div class="stat-label">报名总人数</div></div>
      </div>`;n.length===0?e.innerHTML=i+`
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <div class="empty-title">${q?"未找到匹配的活动":"还没有活动"}</div>
          <div class="empty-text">${q?"换个关键词试试":"点击右下角 + 号创建第一个活动吧"}</div>
        </div>`:e.innerHTML=i+n.map(je).join("")}catch(t){e.innerHTML=`<div class="empty-state"><div class="empty-title">加载失败</div><div class="empty-text">${t.message}</div></div>`}}function je(e){const a=(e.fields||[]).length,t=e.submissionCount||0,n=e.maxParticipants||0,i=n>0?Math.round(t/n*100):0,d={published:'<span class="badge badge-success">进行中</span>',draft:'<span class="badge badge-info">草稿</span>',ended:'<span class="badge" style="background:#f5f5f5;color:#999">已截止</span>'};return`
    <div class="activity-card">
      <div class="card-top">
        <div>
          <div class="activity-name">${G(e.name)}</div>
          <div style="margin-top:4px;display:flex;align-items:center;gap:8px">
            ${d[e.status]||d.draft}
            ${n>0?`<span class="text-hint" style="font-size:11px">${t}/${n}人</span>`:`<span class="text-hint" style="font-size:11px">${t}人报名</span>`}
          </div>
        </div>
        ${e.status==="published"?'<span class="status-dot published"></span>':""}
      </div>
      ${n>0&&t>0?`
        <div style="height:3px;background:#f0ede9;border-radius:2px;margin:8px 0">
          <div style="height:3px;background:var(--primary);border-radius:2px;width:${Math.min(i,100)}%;transition:width 0.5s"></div>
        </div>
      `:""}
      <div class="info-row">
        <span class="info-item">📅 ${e.startTime?R(e.startTime):"未设置时间"}</span>
        <span class="info-item">📝 ${a}字段</span>
        ${e.location?`<span class="info-item">📍 ${G(e.location.slice(0,10))}</span>`:""}
      </div>
      <div class="action-bar">
        <button class="btn btn-sm btn-outline" data-action="form" data-id="${e.id}">✏️ 编辑表单</button>
        <button class="btn btn-sm btn-outline" data-action="publish" data-id="${e.id}">🚀 发布</button>
        <button class="btn btn-sm btn-outline" data-action="data" data-id="${e.id}">📊 数据</button>
        <button class="btn btn-sm btn-ghost" data-action="delete" data-id="${e.id}" style="padding:0 6px;color:var(--text-hint)">🗑</button>
      </div>
    </div>`}async function ze(e){if(confirm("确定删除这个活动吗？报名数据也会被清除。"))try{await ie(e),u("已删除"),I()}catch(a){u("删除失败: "+a.message)}}async function De(e){try{const t=(await U()).find(s=>s.id===e);if(!t)return;const{createActivity:n}=await D(async()=>{const{createActivity:s}=await Promise.resolve().then(()=>oe);return{createActivity:s}},void 0),{genId:i}=await D(async()=>{const{genId:s}=await Promise.resolve().then(()=>Ae);return{genId:s}},void 0),d=i();await n({id:d,name:t.name+" (副本)",description:t.description,location:t.location,startTime:t.startTime,endTime:t.endTime,maxParticipants:t.maxParticipants,status:"draft",fields:t.fields||[],createdAt:Date.now()}),u("已复制活动"),I()}catch(a){u("复制失败: "+a.message)}}async function _e(e){if(confirm("确定结束这个活动吗？结束后用户将无法报名。"))try{await w(e,{status:"ended"}),u("活动已结束"),I()}catch(a){u("操作失败: "+a.message)}}function G(e){const a=document.createElement("div");return a.textContent=e||"",a.innerHTML}function J(e={}){const a=!!e.id,t=document.getElementById("app");t.innerHTML=`
    <div class="navbar">
      <button class="navbar-back" id="back-btn">← 返回</button>
      <span class="navbar-title">${a?"编辑活动":"创建活动"}</span>
    </div>
    <div class="page">
      <div class="card">
        <div class="form-group">
          <label class="form-label">活动名称 <span class="required">*</span></label>
          <input type="text" class="form-input" id="activity-name" placeholder="例如：2024年度技术分享会" />
        </div>
        <div class="form-group">
          <label class="form-label">活动描述</label>
          <textarea class="form-textarea" id="activity-desc" placeholder="介绍一下活动内容、参与须知等..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">活动地点</label>
          <input type="text" class="form-input" id="activity-location" placeholder="例如：XX市XX路XX号" />
        </div>
      </div>
      <div class="card">
        <div class="card-title mb-12">时间设置</div>
        <div class="form-group">
          <label class="form-label">报名开始时间</label>
          <input type="datetime-local" class="form-input" id="start-time" />
        </div>
        <div class="form-group">
          <label class="form-label">报名截止时间</label>
          <input type="datetime-local" class="form-input" id="end-time" />
        </div>
      </div>
      <div class="card">
        <div class="card-title mb-12">报名限制</div>
        <div class="form-group">
          <label class="form-label">最大报名人数（0表示不限）</label>
          <input type="number" class="form-input" id="max-participants" value="0" min="0" />
        </div>
      </div>
    </div>
    <div class="fixed-bottom">
      <button class="btn btn-primary btn-block btn-lg" id="save-btn">
        ${a?"保存修改":"下一步：设置报名表单 →"}
      </button>
    </div>
  `,document.getElementById("back-btn").addEventListener("click",M),document.getElementById("save-btn").addEventListener("click",i),a&&n(e.id);async function n(d){try{const s=await E(d);if(!s){u("活动不存在"),b("#/dashboard");return}document.getElementById("activity-name").value=s.name||"",document.getElementById("activity-desc").value=s.description||"",document.getElementById("activity-location").value=s.location||"",s.startTime&&(document.getElementById("start-time").value=X(s.startTime)),s.endTime&&(document.getElementById("end-time").value=X(s.endTime)),document.getElementById("max-participants").value=s.maxParticipants||0}catch{u("加载活动失败")}}async function i(){const d=document.getElementById("activity-name").value.trim();if(!d){u("请输入活动名称");return}const s={name:d,description:document.getElementById("activity-desc").value.trim(),location:document.getElementById("activity-location").value.trim(),startTime:document.getElementById("start-time").value?new Date(document.getElementById("start-time").value).getTime():null,endTime:document.getElementById("end-time").value?new Date(document.getElementById("end-time").value).getTime():null,maxParticipants:parseInt(document.getElementById("max-participants").value)||0};try{if(a)await w(e.id,s),u("活动信息已更新"),M();else{const c=h(),l={id:c,...s,fields:[],status:"draft",createdAt:Date.now()};await F(l),u("活动创建成功，请设置报名表单"),setTimeout(()=>b(`#/builder/${c}`),500)}}catch(c){u("保存失败: "+c.message)}}return()=>{}}function X(e){const a=new Date(e),t=n=>String(n).padStart(2,"0");return`${a.getFullYear()}-${t(a.getMonth()+1)}-${t(a.getDate())}T${t(a.getHours())}:${t(a.getMinutes())}`}const O={name:{icon:"👤",name:"姓名",defaultLabel:"姓名"},text:{icon:"📝",name:"单行文本",defaultLabel:"单行文本"},textarea:{icon:"📄",name:"多行文本",defaultLabel:"多行文本"},number:{icon:"🔢",name:"数字",defaultLabel:"数字"},date:{icon:"📅",name:"日期",defaultLabel:"日期"},time:{icon:"⏰",name:"时间",defaultLabel:"时间"},radio:{icon:"🔘",name:"单选",defaultLabel:"单选",options:["选项一","选项二"]},checkbox:{icon:"☑️",name:"多选",defaultLabel:"多选",options:["选项一","选项二","选项三"]},select:{icon:"📋",name:"下拉选择",defaultLabel:"下拉选择",options:["选项一","选项二"]},phone:{icon:"📱",name:"手机号",defaultLabel:"手机号码"},email:{icon:"📧",name:"邮箱",defaultLabel:"电子邮箱"},idcard:{icon:"🪪",name:"身份证",defaultLabel:"身份证号"},location:{icon:"📍",name:"地理位置",defaultLabel:"地理位置"},image:{icon:"🖼️",name:"图片上传",defaultLabel:"图片上传"},fee:{icon:"💰",name:"报名费用",defaultLabel:"报名费用"}};function Ue(e){const a=O[e];return a?{id:h(),type:e,label:a.defaultLabel||"未命名字段",placeholder:"",required:!1,options:a.options?[...a.options]:[],maxImages:9}:null}function Fe(e){const a=O[e.type],t=["radio","checkbox","select"].includes(e.type);return`
    <div class="form-group">
      <label class="form-label">字段类型</label>
      <div class="tag">${(a==null?void 0:a.icon)||""} ${(a==null?void 0:a.name)||e.type}</div>
    </div>

    <div class="form-group">
      <label class="form-label">字段标题 <span class="required">*</span></label>
      <input type="text" class="form-input" id="field-label"
             value="${j(e.label)}" placeholder="例如：姓名" />
    </div>

    <div class="form-group">
      <label class="form-label">占位提示文字</label>
      <input type="text" class="form-input" id="field-placeholder"
             value="${j(e.placeholder)}" placeholder="输入提示..." />
    </div>

    <div class="form-group flex items-center justify-between">
      <label class="form-label" style="margin-bottom:0">是否必填</label>
      <div class="switch ${e.required?"on":""}" id="field-required"></div>
    </div>

    ${e.type==="image"?`
    <div class="form-group">
      <label class="form-label">最大上传张数</label>
      <input type="number" class="form-input" id="field-max-images"
             value="${e.maxImages||9}" min="1" max="9" />
    </div>
    `:""}

    ${t?`
    <div class="form-group">
      <label class="form-label">选项列表</label>
      <ul class="option-list" id="option-list">
        ${(e.options||[]).map((n,i)=>`
          <li class="option-item" data-index="${i}">
            <span style="color:var(--text-hint);font-size:12px">${i+1}.</span>
            <input type="text" class="form-input option-input" value="${j(n)}" />
            <button class="btn-icon option-delete" title="删除">✕</button>
          </li>
        `).join("")}
      </ul>
      <button class="btn btn-sm btn-outline mt-8" id="add-option-btn">+ 添加选项</button>
    </div>
    `:""}
  `}function Re(e,a){var s,c,l,m,y;const t=((c=(s=e.querySelector("#field-label"))==null?void 0:s.value)==null?void 0:c.trim())||"未命名字段",n=((m=(l=e.querySelector("#field-placeholder"))==null?void 0:l.value)==null?void 0:m.trim())||"",i=((y=e.querySelector("#field-required"))==null?void 0:y.classList.contains("on"))||!1,d={...a,label:t,placeholder:n,required:i};if(["radio","checkbox","select"].includes(a.type)){const r=e.querySelectorAll(".option-input");d.options=Array.from(r).map(o=>o.value.trim()).filter(o=>o)}if(a.type==="image"){const r=e.querySelector("#field-max-images");d.maxImages=parseInt(r==null?void 0:r.value)||9}return d}function j(e){return(e||"").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const Y={base:{name:"基础",types:["name","text","textarea","number"]},choice:{name:"选择",types:["radio","checkbox","select"]},datetime:{name:"日期",types:["date","time"]},contact:{name:"联系方式",types:["phone","email","idcard","location"]},media:{name:"附件",types:["image"]},pay:{name:"收款",types:["fee"]}};function Ve(e={}){const a=document.getElementById("app");let t="base";a.innerHTML=`
    <div class="navbar">
      <button class="navbar-back" id="back-btn">← 返回</button>
      <span class="navbar-title">自定义收集表单</span>
    </div>

    <div class="page" style="padding-bottom:180px">
      <div class="text-hint mb-8" style="font-size:12px" id="activity-name-label">加载中...</div>

      <!-- 字段分组标签 -->
      <div class="field-category-bar" id="category-bar">
        ${Object.entries(Y).map(([r,o])=>`<span class="tag ${r===t?"selected":""}" data-group="${r}">${o.name}</span>`).join("")}
      </div>

      <!-- 字段类型面板 -->
      <div class="card" style="padding:12px">
        <div class="field-type-palette" id="type-palette"></div>
      </div>

      <!-- 已添加字段 -->
      <div style="margin-top:12px">
        <div class="flex items-center justify-between mb-8">
          <span style="font-size:var(--font-base);font-weight:600">表单字段</span>
          <span class="text-hint" style="font-size:12px" id="field-count">0个字段</span>
        </div>
        <div id="fields-container">
          <div class="text-center text-hint" style="padding:24px">加载中...</div>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="fixed-bottom no-tab" style="display:flex;gap:12px">
      <button class="btn btn-outline flex-1" id="preview-btn">👁 预览</button>
      <button class="btn btn-primary flex-1 btn-lg" id="save-fields-btn">💾 保存并发布</button>
    </div>
  `;let n=null;function i(){var p;const r=document.getElementById("type-palette"),o=((p=Y[t])==null?void 0:p.types)||[];r.innerHTML=o.map(f=>{const v=O[f];return`<div class="field-type-btn" data-type="${f}">
        <span class="ft-icon">${v.icon}</span><span>${v.name}</span></div>`}).join("")}i(),document.getElementById("back-btn").addEventListener("click",M),document.getElementById("category-bar").addEventListener("click",r=>{const o=r.target.closest(".tag");o&&(t=o.dataset.group,document.querySelectorAll("#category-bar .tag").forEach(p=>p.classList.remove("selected")),o.classList.add("selected"),i())}),document.getElementById("type-palette").addEventListener("click",r=>{const o=r.target.closest(".field-type-btn");!o||!n||c(o.dataset.type)}),document.getElementById("fields-container").addEventListener("click",r=>{const o=r.target.closest("button[data-action]");if(!o)return;const{action:p,fieldId:f}=o.dataset;p==="edit"?y(f):p==="delete"?l(f):p==="moveUp"?m(f,-1):p==="moveDown"&&m(f,1)}),document.getElementById("save-fields-btn").addEventListener("click",async()=>{if(n)try{await ne(e.id,n.fields),u("保存成功！"),setTimeout(()=>b(`#/publish/${e.id}`),400)}catch(r){u("保存失败: "+r.message)}}),document.getElementById("preview-btn").addEventListener("click",()=>{n&&b(`#/form/${e.id}?preview=1`)}),d();async function d(){try{if(n=await E(e.id),!n){u("活动不存在"),b("#/dashboard");return}document.getElementById("activity-name-label").textContent="📋 "+n.name,s()}catch(r){u("加载失败: "+r.message)}}function s(){const r=(n==null?void 0:n.fields)||[];document.getElementById("field-count").textContent=r.length+"个字段";const o=document.getElementById("fields-container");o.innerHTML=r.length===0?`<div class="empty-state"><div class="empty-icon">🧩</div>
         <div class="empty-title">还没有添加字段</div>
         <div class="empty-text">点击上方字段类型开始构建表单</div></div>`:r.map((p,f)=>Ne(p,f,r.length)).join("")}function c(r){const o=Ue(r);o&&(n.fields=[...n.fields||[],o],s(),u(`已添加「${o.label}」`))}function l(r){var p;const o=(p=n.fields)==null?void 0:p.find(f=>f.id===r);confirm(`确定删除「${(o==null?void 0:o.label)||""}」吗？`)&&(n.fields=n.fields.filter(f=>f.id!==r),s(),u("已删除"))}function m(r,o){const p=[...n.fields],f=p.findIndex(g=>g.id===r);if(f===-1)return;const v=f+o;v<0||v>=p.length||([p[f],p[v]]=[p[v],p[f]],n.fields=p,s())}function y(r){var f,v;const o=n.fields.find(g=>g.id===r);if(!o)return;const p=re({title:"编辑字段",content:Fe(o),footer:'<button class="btn btn-primary btn-block" id="save-field-edit-btn">确认修改</button>'});p&&((f=p.querySelector("#field-required"))==null||f.addEventListener("click",function(){this.classList.toggle("on")}),(v=p.querySelector("#add-option-btn"))==null||v.addEventListener("click",()=>{const g=p.querySelector("#option-list");if(!g)return;const k=document.createElement("li");k.className="option-item",k.innerHTML=`<span style="color:var(--text-hint);font-size:12px">${g.children.length+1}.</span>
        <input type="text" class="form-input option-input" value="" />
        <button class="btn-icon option-delete" title="删除">✕</button>`,k.querySelector(".option-delete").addEventListener("click",()=>k.remove()),g.appendChild(k)}),p.querySelectorAll(".option-delete").forEach(g=>g.addEventListener("click",()=>g.closest(".option-item").remove())),p.querySelector("#save-field-edit-btn").addEventListener("click",()=>{const g=Re(p,o);n.fields=n.fields.map(k=>k.id===r?g:k),C(),s(),u("字段已更新")}))}return()=>{}}function Ne(e,a,t){const n=O[e.type];let i="";switch(e.type){case"name":i='<input class="form-input" placeholder="中文姓名" disabled />';break;case"text":i='<input class="form-input" placeholder="单行文本" disabled />';break;case"textarea":i='<textarea class="form-textarea" rows="2" placeholder="多行文本" disabled></textarea>';break;case"number":i='<input type="number" class="form-input" placeholder="数字" disabled />';break;case"date":i='<input type="date" class="form-input" disabled />';break;case"time":i='<input type="time" class="form-input" disabled />';break;case"phone":i='<input type="tel" class="form-input" placeholder="手机号码" disabled />';break;case"email":i='<input type="email" class="form-input" placeholder="邮箱" disabled />';break;case"idcard":i='<input type="text" class="form-input" placeholder="身份证号" disabled />';break;case"radio":i=(e.options||[]).map(d=>`◉ ${d}`).join(" | ");break;case"checkbox":i=(e.options||[]).map(d=>`☐ ${d}`).join(" | ");break;case"select":i=`<select class="form-select" disabled><option>${(e.options||[])[0]||"选项"}</option></select>`;break;case"image":i='<div class="image-upload-item">+</div>';break;case"location":i='<input class="form-input" placeholder="点击获取位置" disabled />';break;case"fee":i='<input class="form-input" value="¥ 0.00" style="font-weight:600;color:var(--primary)" disabled />';break;default:i='<input class="form-input" disabled />'}return`
    <div class="field-card-v2">
      <div class="fc-header">
        <span class="fc-drag">⠿</span>
        <div class="fc-info">
          <div class="fc-label">${Ge(e.label)} ${e.required?'<span style="color:var(--danger)">*</span>':""}</div>
          <div class="fc-meta">${(n==null?void 0:n.icon)||""} ${(n==null?void 0:n.name)||e.type} · 第${a+1}项</div>
        </div>
        <div class="fc-actions">
          ${a>0?`<button data-action="moveUp" data-field-id="${e.id}">⬆</button>`:""}
          ${a<t-1?`<button data-action="moveDown" data-field-id="${e.id}">⬇</button>`:""}
          <button data-action="edit" data-field-id="${e.id}">✏</button>
          <button data-action="delete" data-field-id="${e.id}">🗑</button>
        </div>
      </div>
      <div class="fc-preview">${i}</div>
    </div>`}function Ge(e){const a=document.createElement("div");return a.textContent=e||"",a.innerHTML}function Je(e={}){const a=document.getElementById("app");a.innerHTML=`
    <div class="navbar">
      <button class="navbar-back" id="back-btn">← 返回</button>
      <span class="navbar-title">发布活动</span>
    </div>
    <div class="page" style="padding-top:12px">
      <div id="publish-content"><div class="text-center text-hint" style="padding:24px">加载中...</div></div>
    </div>
  `,document.getElementById("back-btn").addEventListener("click",M),t();async function t(){try{const s=await E(e.id);if(!s){u("活动不存在"),b("#/dashboard");return}i(s)}catch(s){u("加载失败: "+s.message)}}function n(s){let l=`${window.location.origin+window.location.pathname}#/form/${s.id}`;return s.inviteToken&&(l+=`?token=${s.inviteToken}`),l}function i(s){const c=n(s),l=s.status==="published",m=!!s.inviteToken,y=!!s.wechatOnly;document.getElementById("publish-content").innerHTML=`
      <!-- 状态 -->
      <div class="card" style="text-align:center">
        <div style="font-size:48px;margin-bottom:8px">${l?"✅":"📦"}</div>
        <div class="card-title">${l?"已发布":"待发布"}</div>
        <div class="text-hint mt-4" style="font-size:13px">
          ${l?"用户可通过下方链接报名":"发布后生成报名链接"}
        </div>
        <div class="stats-row mt-12">
          <div class="stat-card-v2"><div class="stat-value">${(s.fields||[]).length}</div><div class="stat-label">收集字段</div></div>
          <div class="stat-card-v2"><div class="stat-value">${s.submissionCount||0}</div><div class="stat-label">已报名</div></div>
          <div class="stat-card-v2"><div class="stat-value">${s.maxParticipants||"∞"}</div><div class="stat-label">人数上限</div></div>
        </div>
      </div>

      <!-- 报名链接 -->
      <div class="card">
        <div class="card-title mb-8">📎 报名链接</div>
        <div style="display:flex;align-items:center;gap:8px;background:var(--bg-page);padding:10px 14px;border-radius:var(--radius-sm)">
          <span style="flex:1;font-size:13px;color:var(--text-secondary);word-break:break-all" id="url-text">${c}</span>
          <button class="btn btn-sm btn-primary" id="copy-btn" style="flex-shrink:0">复制</button>
        </div>
        <div style="display:flex;justify-content:center;margin:16px 0">
          <img id="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(c)}"
               width="160" height="160" alt="二维码" style="border-radius:8px" />
        </div>
        <div class="text-hint text-center" style="font-size:12px">微信扫码即可报名</div>
      </div>

      <!-- 🔑 群组模式设置 -->
      <div class="card" style="border:2px solid ${m?"var(--primary)":"transparent"}">
        <div class="card-title mb-12">🔐 群组访问控制</div>
        <div class="flex items-center justify-between mb-12">
          <div>
            <span style="font-weight:600">开启群组专属报名</span>
            <div class="text-hint mt-2" style="font-size:11px">仅持有邀请链接的用户可报名</div>
          </div>
          <div class="switch ${m?"on":""}" id="group-mode-switch"></div>
        </div>
        ${m?`
          <div style="background:var(--bg-page);padding:12px;border-radius:var(--radius-sm);margin-bottom:12px">
            <div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px">🔑 群组邀请 Token</div>
            <div style="display:flex;align-items:center;gap:8px">
              <code style="flex:1;font-size:12px;background:#fff;padding:6px 10px;border-radius:4px;word-break:break-all;border:1px solid #e8e8e8" id="token-text">${s.inviteToken}</code>
              <button class="btn btn-sm btn-outline" id="copy-token-btn" style="flex-shrink:0">复制</button>
            </div>
            <div class="text-hint mt-8" style="font-size:11px">
              ⚠️ Token 会嵌入报名链接中。重新生成后<strong>旧链接立即失效</strong>，请重新分享。
            </div>
            <button class="btn btn-sm btn-warning-outline mt-8" id="regen-token-btn">🔄 重新生成 Token（旧链接失效）</button>
          </div>
        `:`
          <div class="text-hint" style="font-size:12px;padding:8px 0">
            开启后生成唯一邀请链接，只有通过该链接进入的用户才能报名。<br>
            适合场景：限定某个微信群内的成员报名，防止链接外泄。
          </div>
        `}

        <!-- 微信专属模式 -->
        <div class="flex items-center justify-between mt-12" style="padding-top:12px;border-top:1px solid var(--border)">
          <div>
            <span style="font-weight:600">仅限微信内打开</span>
            <div class="text-hint mt-2" style="font-size:11px">非微信浏览器无法访问报名页</div>
          </div>
          <div class="switch ${y?"on":""}" id="wechat-only-switch"></div>
        </div>
      </div>

      <!-- 分享渠道 -->
      <div class="card">
        <div class="card-title mb-12">📤 分享到微信群</div>
        <div class="publish-share-row">
          <div class="share-channel" id="share-wechat">
            <div class="ch-icon wechat">💬</div><span class="ch-label">微信好友</span></div>
          <div class="share-channel" id="share-moment">
            <div class="ch-icon moment">🔄</div><span class="ch-label">朋友圈</span></div>
          <div class="share-channel" id="share-link">
            <div class="ch-icon link">🔗</div><span class="ch-label">复制链接</span></div>
          <div class="share-channel" id="share-qr">
            <div class="ch-icon qrcode">📱</div><span class="ch-label">保存二维码</span></div>
        </div>
        ${m?`
          <div style="background:#fffbe6;padding:10px 14px;border-radius:8px;margin-top:12px;font-size:12px;color:#ad6800">
            💡 <strong>推荐操作：</strong>点击"微信好友"→ 选择目标群 → 粘贴链接发送<br>
            群成员点击链接即可报名，群外人员无法访问。
          </div>
        `:""}
      </div>

      <!-- 分享设置 -->
      <div class="card">
        <div class="card-title mb-12">分享设置</div>
        <div class="flex items-center justify-between">
          <span>允许他人分享该报名</span>
          <div class="switch ${s.allowShare!==!1?"on":""}" id="allow-share-switch"></div>
        </div>
        <div class="text-hint mt-8" style="font-size:12px">
          ${s.allowShare!==!1?"好友可将报名链接转发到微信群、朋友圈":"仅管理员可分享，他人无法转发"}
        </div>
      </div>

      <!-- 操作 -->
      <div class="card">
        ${l?`
          <button class="btn btn-danger-outline btn-block" id="unpublish-btn">⚠️ 取消发布</button>
          <div class="text-hint mt-8 text-center" style="font-size:12px">取消后链接将无法访问，已提交的数据保留</div>
        `:`
          <button class="btn btn-primary btn-block btn-lg" id="publish-btn">🚀 立即发布</button>
          <div class="text-hint mt-8 text-center" style="font-size:12px">发布后他人可通过链接或扫码报名</div>
        `}
        <button class="btn btn-outline btn-block mt-12" id="preview-btn">👁 预览报名表单</button>
      </div>
    `,d(s,c,l)}function d(s,c,l,m){const y=document.getElementById("group-mode-switch");y&&y.addEventListener("click",async()=>{const v=!y.classList.contains("on");try{if(v){const g=W();await w(s.id,{inviteToken:g}),u("✅ 群组模式已开启");const k=await E(s.id);i(k)}else if(confirm("关闭群组模式后，报名链接将无需 token 即可访问，确定吗？")){await w(s.id,{inviteToken:""}),u("已关闭群组模式");const g=await E(s.id);i(g)}}catch(g){u("设置失败: "+g.message)}});const r=document.getElementById("wechat-only-switch");r&&r.addEventListener("click",async()=>{const v=!r.classList.contains("on");try{await w(s.id,{wechatOnly:v}),r.classList.toggle("on"),u(v?"已开启微信专属模式":"已关闭微信专属模式")}catch(g){u("设置失败: "+g.message)}});const o=document.getElementById("regen-token-btn");o&&o.addEventListener("click",async()=>{if(confirm("重新生成后，旧的报名链接将立即失效，确定吗？"))try{const v=W();await w(s.id,{inviteToken:v}),u("✅ Token 已重新生成");const g=await E(s.id);i(g)}catch(v){u("生成失败: "+v.message)}});const p=document.getElementById("copy-token-btn");p&&p.addEventListener("click",()=>{const v=document.getElementById("token-text");v&&S(v.textContent)});const f=document.getElementById("allow-share-switch");f&&f.addEventListener("click",async()=>{const v=!f.classList.contains("on");try{await w(s.id,{allowShare:v}),f.classList.toggle("on"),u(v?"已开启分享":"已关闭分享");const g=await E(s.id);i(g)}catch{u("设置失败")}}),document.getElementById("copy-btn").addEventListener("click",()=>S(c)),document.getElementById("share-link").addEventListener("click",()=>S(c)),document.getElementById("share-qr").addEventListener("click",()=>{u("请长按上方二维码保存")}),document.getElementById("share-wechat").addEventListener("click",()=>{S(c),u("链接已复制，请打开微信粘贴到目标群")}),document.getElementById("share-moment").addEventListener("click",()=>{S(c),u("链接已复制，请打开微信朋友圈粘贴")}),document.getElementById("preview-btn").addEventListener("click",()=>{const v=`#/form/${s.id}?preview=1`;s.inviteToken?b(`${v}&token=${s.inviteToken}`):b(v)}),l?document.getElementById("unpublish-btn").addEventListener("click",async()=>{if(confirm("取消发布后链接将失效，确定吗？"))try{await w(s.id,{status:"draft"}),u("已取消发布");const v=await E(s.id);i(v)}catch(v){u("操作失败: "+v.message)}}):document.getElementById("publish-btn").addEventListener("click",async()=>{try{await w(s.id,{status:"published"}),u("🎉 发布成功！");const v=await E(s.id);i(v)}catch(v){u("发布失败: "+v.message)}})}return()=>{}}function W(){if(typeof crypto<"u"&&crypto.randomUUID)return crypto.randomUUID().replace(/-/g,"");const e="abcdefghijklmnopqrstuvwxyz0123456789";let a="";for(let t=0;t<32;t++)a+=e[Math.floor(Math.random()*e.length)];return a}function S(e){if(navigator.clipboard)navigator.clipboard.writeText(e).then(()=>u("✅ 已复制"));else{const a=document.createElement("textarea");a.value=e,a.style.position="fixed",document.body.appendChild(a),a.select();try{document.execCommand("copy"),u("✅ 已复制")}catch{u("复制失败")}document.body.removeChild(a)}}function Xe(e={}){const a=document.getElementById("app");a.innerHTML=`
    <div class="navbar">
      <button class="navbar-back" id="back-btn">← 返回</button>
      <span class="navbar-title">报名数据</span>
    </div>
    <div class="page" style="padding-bottom:120px">
      <div id="data-content"><div class="text-center text-hint" style="padding:24px">加载中...</div></div>
    </div>
    <div id="bottom-area"></div>
  `,document.getElementById("back-btn").addEventListener("click",M),t();async function t(){try{const[n,i]=await Promise.all([E(e.id).catch(()=>null),ce(e.id)]);if(!n){u("活动不存在"),b("#/dashboard");return}const d=n.fields||[],s=document.getElementById("data-content");if(i.length===0){s.innerHTML=`
          <div class="stats-row">
            <div class="stat-card-v2"><div class="stat-value">0</div><div class="stat-label">报名人数</div></div>
            <div class="stat-card-v2"><div class="stat-value">${d.length}</div><div class="stat-label">收集字段</div></div>
            <div class="stat-card-v2"><div class="stat-value">0%</div><div class="stat-label">提交率</div></div>
          </div>
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <div class="empty-title">暂无报名数据</div>
            <div class="empty-text">分享活动链接后，报名数据会实时显示在这里</div>
          </div>`,document.getElementById("bottom-area").innerHTML="";return}const c={};i.forEach(o=>{const p=new Date(o.submittedAt).toLocaleDateString("zh-CN",{month:"short",day:"numeric"});c[p]=(c[p]||0)+1});const l=Math.max(...Object.values(c),1),m=Object.entries(c).slice(-7).map(([o,p])=>`
        <div class="bar-col">
          <div>${p}</div>
          <div class="bar-fill" style="height:${Math.max(p/l*80,4)}px"></div>
          <div class="bar-lbl">${o}</div>
        </div>
      `).join(""),y=["序号","提交时间",...d.map(o=>o.label)],r=i.map((o,p)=>{const f={序号:p+1,提交时间:be(o.submittedAt)};return d.forEach(v=>{var k;const g=(k=o.data)==null?void 0:k[v.id];f[v.label]=Array.isArray(g)?g.join("、"):g??""}),f});s.innerHTML=`
        <div class="stats-row">
          <div class="stat-card-v2"><div class="stat-value">${i.length}</div><div class="stat-label">报名人数</div></div>
          <div class="stat-card-v2"><div class="stat-value">${d.length}</div><div class="stat-label">收集字段</div></div>
          <div class="stat-card-v2 accent"><div class="stat-value">${i.length}</div><div class="stat-label">总提交</div></div>
        </div>

        <div class="card">
          <div class="card-title mb-12">📊 提交趋势（近7天）</div>
          <div class="chart-bar">${m}</div>
        </div>

        <div class="card" style="padding:0">
          <div style="padding:14px 16px;border-bottom:1px solid var(--border-light)">
            <span style="font-weight:600">📋 详细数据</span>
          </div>
          <div class="data-table-wrapper" style="padding:0 8px 8px">
            <table class="data-table">
              <thead><tr>${y.map(o=>`<th>${K(o)}</th>`).join("")}</tr></thead>
              <tbody>${r.map(o=>`<tr>${y.map(p=>`<td title="${Ye(String(o[p]??""))}">${K(String(o[p]??"-"))}</td>`).join("")}</tr>`).join("")}</tbody>
            </table>
          </div>
        </div>`,document.getElementById("bottom-area").innerHTML=`
        <div class="fixed-bottom no-tab" style="display:flex;gap:12px">
          <button class="btn btn-outline flex-1" id="export-btn">📥 导出CSV</button>
          <button class="btn btn-danger-outline flex-1" id="clear-btn">🗑 清空</button>
        </div>`,document.getElementById("export-btn").addEventListener("click",()=>{fe(y,r,`${n.name}_报名数据.csv`),u("导出成功！")}),document.getElementById("clear-btn").addEventListener("click",async()=>{if(confirm("确定清空所有报名数据吗？不可恢复！"))try{await le(e.id),u("已清空"),t()}catch(o){u("清空失败: "+o.message)}})}catch(n){document.getElementById("data-content").innerHTML=`<div class="empty-state"><div class="empty-title">加载失败</div><div class="empty-text">${n.message}</div></div>`}}return()=>{}}function K(e){const a=document.createElement("div");return a.textContent=String(e??""),a.innerHTML}function Ye(e){return String(e??"").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function We(e,a={}){return!e||e.length===0?`<div class="empty-state">
      <div class="empty-icon">📝</div>
      <div class="empty-text">暂无需要填写的字段</div>
    </div>`:e.map((t,n)=>{const i=a[t.id]??"",d=t.required?'<span class="required-mark">*</span>':"";let s="";switch(t.type){case"name":s=`<input type="text" class="form-input" data-field-id="${t.id}"
                       placeholder="${x(t.placeholder||"请输入中文姓名")}"
                       value="${x(i)}" maxlength="20" />`;break;case"text":s=`<input type="text" class="form-input" data-field-id="${t.id}"
                       placeholder="${x(t.placeholder||"请输入")}"
                       value="${x(i)}" />`;break;case"textarea":s=`<textarea class="form-textarea" data-field-id="${t.id}"
                        placeholder="${x(t.placeholder||"请输入")}"
                        rows="3">${B(i)}</textarea>`;break;case"number":s=`<input type="number" class="form-input" data-field-id="${t.id}"
                       placeholder="${x(t.placeholder||"请输入数字")}"
                       value="${x(i)}" />`;break;case"date":s=`<input type="date" class="form-input" data-field-id="${t.id}"
                       value="${x(i)}" />`;break;case"time":s=`<input type="time" class="form-input" data-field-id="${t.id}"
                       value="${x(i)}" />`;break;case"phone":s=`<input type="tel" class="form-input" data-field-id="${t.id}"
                       placeholder="请输入手机号码" maxlength="11"
                       value="${x(i)}" />`;break;case"email":s=`<input type="email" class="form-input" data-field-id="${t.id}"
                       placeholder="请输入邮箱地址"
                       value="${x(i)}" />`;break;case"idcard":s=`<input type="text" class="form-input" data-field-id="${t.id}"
                       placeholder="请输入18位身份证号码" maxlength="18"
                       value="${x(i)}" />`;break;case"radio":s=`<div class="radio-group" data-field-id="${t.id}">
          ${(t.options||[]).map((l,m)=>`
            <label class="radio-item ${i===l?"selected":""}">
              <input type="radio" name="radio-${t.id}" value="${x(l)}"
                     ${i===l?"checked":""} />
              <span>${B(l)}</span>
            </label>
          `).join("")}
        </div>`;break;case"checkbox":const c=Array.isArray(i)?i:i?i.split(","):[];s=`<div class="checkbox-group" data-field-id="${t.id}">
          ${(t.options||[]).map((l,m)=>`
            <label class="checkbox-item ${c.includes(l)?"selected":""}">
              <input type="checkbox" name="cb-${t.id}" value="${x(l)}"
                     ${c.includes(l)?"checked":""} />
              <span>${B(l)}</span>
            </label>
          `).join("")}
        </div>`;break;case"select":s=`<select class="form-select" data-field-id="${t.id}">
          <option value="">请选择</option>
          ${(t.options||[]).map(l=>`
            <option value="${x(l)}" ${i===l?"selected":""}>${B(l)}</option>
          `).join("")}
        </select>`;break;case"image":s=`
          <div class="image-upload" data-field-id="${t.id}" data-max="${t.maxImages||9}">
            <div class="image-upload-item" id="img-add-${t.id}" title="点击上传图片">
              <span>+</span>
            </div>
          </div>
          <input type="file" accept="image/*" style="display:none"
                 id="img-input-${t.id}" ${(t.maxImages||9)>1?"multiple":""} />
          <div class="form-hint">最多上传 ${t.maxImages||9} 张图片</div>
        `;break;case"location":s=`<div style="display:flex;gap:8px">
          <input type="text" class="form-input" data-field-id="${t.id}"
                 placeholder="${x(t.placeholder||"点击获取位置或手动输入地址")}"
                 value="${x(i)}" style="flex:1" />
          <button type="button" class="btn btn-sm btn-outline get-location-btn"
                  data-field-id="${t.id}" style="flex-shrink:0">📍 定位</button>
        </div>`;break;case"fee":s=`<div style="position:relative">
          <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-weight:600;color:var(--primary);z-index:1">¥</span>
          <input type="number" class="form-input" data-field-id="${t.id}"
                 placeholder="0.00" value="${x(i)}"
                 style="padding-left:32px;font-weight:600;font-size:18px" min="0" step="0.01" readonly />
          <div class="form-hint">报名费用由用户确认后支付</div>
        </div>`;break;default:s=`<input type="text" class="form-input" data-field-id="${t.id}"
                       placeholder="${x(t.placeholder||"请输入")}"
                       value="${x(i)}" />`}return`
      <div class="register-field" data-field-type="${t.type}">
        <div class="field-title">${d} ${B(t.label)}</div>
        ${s}
        <div class="form-error" id="error-${t.id}"></div>
      </div>
    `}).join("")}function Ke(e,a){const t={},n={};for(const i of e){let d="";const s=a.querySelector(`#error-${i.id}`);switch(i.type){case"name":case"text":case"textarea":case"number":case"date":case"time":case"phone":case"email":case"idcard":case"location":case"fee":case"select":{const c=a.querySelector(`[data-field-id="${i.id}"]`);d=c?c.value.trim():"";break}case"radio":{const c=a.querySelector(`input[name="radio-${i.id}"]:checked`);d=c?c.value:"";break}case"checkbox":{const c=a.querySelectorAll(`input[name="cb-${i.id}"]:checked`);d=Array.from(c).map(l=>l.value);break}case"image":{const c=a.querySelector(`.image-upload[data-field-id="${i.id}"]`);if(c){const l=c.querySelectorAll("img");d=Array.from(l).map(m=>m.src)}break}}t[i.id]=d,i.required&&((Array.isArray(d)?d.length===0:!d)?(n[i.id]=`请${i.type==="image"?"上传":"填写"}${i.label}`,s&&(s.textContent=n[i.id])):s&&(s.textContent="")),d&&!n[i.id]&&(i.type==="name"&&!me(d)&&(n[i.id]="请输入正确的中文姓名（2-20个汉字）",s&&(s.textContent=n[i.id])),i.type==="phone"&&!ue(d)&&(n[i.id]="手机号码格式不正确",s&&(s.textContent=n[i.id])),i.type==="email"&&!pe(d)&&(n[i.id]="邮箱格式不正确",s&&(s.textContent=n[i.id])),i.type==="idcard"&&!ve(d)&&(n[i.id]="身份证号码格式不正确",s&&(s.textContent=n[i.id])))}return{data:t,errors:n}}function Qe(e){e.querySelectorAll(".image-upload").forEach(t=>{const n=t.dataset.fieldId,i=parseInt(t.dataset.max)||9,d=e.querySelector(`#img-input-${n}`),s=e.querySelector(`#img-add-${n}`);!d||!s||(s.addEventListener("click",()=>d.click()),d.addEventListener("change",()=>{const c=t.querySelectorAll("img").length,l=i-c;if(l<=0)return;Array.from(d.files).slice(0,l).forEach(y=>{const r=new FileReader;r.onload=o=>{const p=document.createElement("div");p.className="image-upload-item",p.innerHTML=`
            <img src="${o.target.result}" alt="uploaded" />
            <button class="remove-img">✕</button>
          `,p.querySelector(".remove-img").addEventListener("click",f=>{f.stopPropagation(),p.remove(),t.querySelectorAll("img").length===0&&(s.style.display="")}),t.insertBefore(p,s),t.querySelectorAll("img").length>=i&&(s.style.display="none")},r.readAsDataURL(y)}),d.value=""}))})}function Ze(e){e.querySelectorAll(".get-location-btn").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.fieldId,n=e.querySelector(`input[data-field-id="${t}"]`);n&&navigator.geolocation&&(a.textContent="获取中...",a.disabled=!0,navigator.geolocation.getCurrentPosition(i=>{n.value=`${i.coords.latitude.toFixed(6)}, ${i.coords.longitude.toFixed(6)}`,a.textContent="定位",a.disabled=!1},()=>{n.placeholder="无法获取位置，请手动输入",a.textContent="定位",a.disabled=!1},{timeout:1e4}))})})}function et(e){e.querySelectorAll(".radio-item input").forEach(a=>{a.addEventListener("change",function(){this.closest(".radio-group").querySelectorAll(".radio-item").forEach(n=>n.classList.remove("selected")),this.checked&&this.closest(".radio-item").classList.add("selected")})}),e.querySelectorAll(".checkbox-item input").forEach(a=>{a.addEventListener("change",function(){this.closest(".checkbox-item").classList.toggle("selected",this.checked)})})}function B(e){if(!e)return"";const a=document.createElement("div");return a.textContent=e,a.innerHTML}function x(e){return e?e.replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):""}function tt(e={}){const a=document.getElementById("app"),t=z("token")||"",n=z("preview")==="1";a.innerHTML=`
    <div class="register-page">
      <div class="register-cover"><div class="cover-text">
        <div class="cover-title">加载中...</div>
      </div></div>
      <div class="register-body"><div id="register-form-container"><div class="text-center text-hint" style="padding:24px">加载中...</div></div></div>
    </div>
  `,i();async function i(){try{let d;if(n){const{getActivity:y}=await D(async()=>{const{getActivity:r}=await Promise.resolve().then(()=>oe);return{getActivity:r}},void 0);d=await y(e.id)}else d=await se(e.id,t);if(!d){a.innerHTML='<div class="register-page"><div class="empty-state" style="padding-top:100px"><div class="empty-icon">🔍</div><div class="empty-text">活动不存在或已下架</div></div></div>';return}const s=d.fields||[],c=!n&&d.status!=="published",l=d.maxParticipants>0&&d.submissionCount>=d.maxParticipants;if(!n&&d.requireToken&&!t){a.innerHTML=`
          <div class="register-page">
            <div class="empty-state" style="padding-top:100px">
              <div class="empty-icon">🔒</div>
              <div class="empty-text">此活动仅限指定群成员报名</div>
              <div class="text-hint mt-8" style="font-size:13px;max-width:280px;margin:0 auto">请联系群管理员获取正确的报名链接</div>
            </div>
          </div>`;return}a.innerHTML=`
        <div class="register-page">
          <div class="register-cover">
            <div class="cover-text">
              <div class="cover-title">${A(d.name)}</div>
              ${d.description?`<div class="cover-subtitle">${A(d.description)}</div>`:""}
              ${d.startTime?`<div class="cover-time">📅 ${R(d.startTime)}</div>`:""}
              ${d.location?`<div class="cover-time">📍 ${A(d.location)}</div>`:""}
              ${d.requireToken?'<div style="margin-top:8px;font-size:11px;background:rgba(255,255,255,0.2);display:inline-block;padding:2px 10px;border-radius:10px">🔐 群内报名</div>':""}
            </div>
          </div>
          ${n?'<div style="background:#fffbe6;padding:8px 16px;text-align:center;font-size:12px;color:#d48806">⚠️ 预览模式 - 提交不会保存</div>':""}
          ${c?'<div style="background:#fff2f0;padding:8px 16px;text-align:center;font-size:14px;color:#ff4d4f">🚫 活动暂未开放报名</div>':""}
          ${l?'<div style="background:#fff2f0;padding:8px 16px;text-align:center;font-size:14px;color:#ff4d4f">🚫 报名人数已达上限</div>':""}
          <div class="register-body">
            <div id="register-form-container">${We(s)}</div>
            ${s.length>0&&!c&&!l?'<button class="btn btn-primary btn-block btn-lg mt-16" id="submit-btn">📝 提交报名</button>':""}
            ${s.length===0?'<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-text">暂无需要填写的表单</div></div>':""}
          </div>
        </div>`,Qe(document.getElementById("register-form-container")),Ze(document.getElementById("register-form-container")),et(document.getElementById("register-form-container"));const m=document.getElementById("submit-btn");m&&m.addEventListener("click",()=>at(d,s,n,t))}catch(d){d.message.includes("token")||d.message.includes("链接")||d.message.includes("微信")?a.innerHTML=`
          <div class="register-page">
            <div class="empty-state" style="padding-top:100px">
              <div class="empty-icon">🔒</div>
              <div class="empty-text">${A(d.message)}</div>
              <div class="text-hint mt-8" style="font-size:13px;max-width:280px;margin:0 auto">请联系群管理员获取正确的报名链接</div>
            </div>
          </div>`:a.innerHTML=`<div class="register-page"><div class="empty-state" style="padding-top:100px"><div class="empty-text">加载失败: ${d.message}</div></div></div>`}}return()=>{}}async function at(e,a,t,n){const i=document.getElementById("register-form-container"),{data:d,errors:s}=Ke(a,i),c=Object.keys(s).length;if(c>0){u(`请检查 ${c} 项错误`);return}if(t){u("✅ 预览验证通过！"),console.log("预览数据:",d);return}const l=document.getElementById("submit-btn");l.disabled=!0,l.textContent="提交中...";try{await de(e.id,{id:h(),data:d,submittedAt:Date.now()},n);const m=document.getElementById("app");m.innerHTML=`
      <div class="register-page">
        <div class="register-cover"><div class="cover-text"><div class="cover-title">${A(e.name)}</div></div></div>
        <div class="register-success">
          <div class="success-icon">✅</div>
          <div class="success-text">报名成功！</div>
          <div class="text-hint">感谢您的参与，请留意后续通知</div>
        </div>
      </div>`}catch(m){m.message.includes("token")||m.message.includes("链接")||m.message.includes("微信")?(u("报名失败: "+m.message),setTimeout(()=>window.location.reload(),2e3)):u("提交失败: "+m.message),l.disabled=!1,l.textContent="📝 提交报名"}}function A(e){const a=document.createElement("div");return a.textContent=e||"",a.innerHTML}const Q=[{id:"training",icon:"📚",name:"培训报名",desc:"课程培训、讲座活动",fields:[{id:h(),type:"name",label:"姓名",placeholder:"请输入中文姓名",required:!0,options:[]},{id:h(),type:"phone",label:"手机号码",placeholder:"请输入手机号码",required:!0,options:[]},{id:h(),type:"text",label:"单位/公司",placeholder:"请输入单位名称",required:!1,options:[]},{id:h(),type:"select",label:"报名场次",options:["上午场 09:00-12:00","下午场 14:00-17:00","全天"],required:!0}]},{id:"party",icon:"🎉",name:"聚会活动",desc:"同学聚会、团建活动",fields:[{id:h(),type:"name",label:"姓名",placeholder:"请输入中文姓名",required:!0,options:[]},{id:h(),type:"phone",label:"手机号码",placeholder:"请输入手机号码",required:!0,options:[]},{id:h(),type:"radio",label:"是否携带家属",options:["是","否"],required:!0},{id:h(),type:"textarea",label:"特殊需求",placeholder:"饮食禁忌等",required:!1,options:[]}]},{id:"signup",icon:"📝",name:"通用登记",desc:"信息收集、意向登记",fields:[{id:h(),type:"name",label:"姓名",placeholder:"请输入中文姓名",required:!0,options:[]},{id:h(),type:"phone",label:"手机号码",required:!0,options:[]},{id:h(),type:"email",label:"电子邮箱",required:!1,options:[]},{id:h(),type:"textarea",label:"备注",placeholder:"请输入备注信息",required:!1,options:[]}]},{id:"competition",icon:"🏆",name:"比赛报名",desc:"赛事、竞赛活动",fields:[{id:h(),type:"name",label:"姓名",placeholder:"请输入中文姓名",required:!0,options:[]},{id:h(),type:"phone",label:"手机号码",required:!0,options:[]},{id:h(),type:"idcard",label:"身份证号",required:!0,options:[]},{id:h(),type:"select",label:"参赛组别",options:["青少年组","成人组","专业组"],required:!0},{id:h(),type:"image",label:"作品上传",maxImages:3,required:!1,options:[]}]},{id:"blank",icon:"📄",name:"空白表单",desc:"从零开始自定义",fields:[]}];function it(){const e=document.getElementById("app");e.innerHTML=`
    <div class="navbar">
      <button class="navbar-back" id="back-btn">← 返回</button>
      <span class="navbar-title">选择模板</span>
    </div>

    <div class="page" style="padding-top:12px">
      <div class="text-hint mb-12" style="font-size:13px">选择一个模板快速开始，后续可以自由修改</div>
      <div class="template-grid" id="template-grid">
        ${Q.map(t=>`
          <div class="template-card" data-tpl="${t.id}">
            <div class="tpl-icon">${t.icon}</div>
            <div class="tpl-name">${t.name}</div>
            <div class="tpl-desc">${t.desc}</div>
            <div class="tpl-fields">${t.fields.length>0?t.fields.length+"个预设字段":"自定义添加"}</div>
          </div>
        `).join("")}
      </div>

      <!-- 快速创建：直接输入名称 -->
      <div class="card mt-16" id="quick-create" style="display:none">
        <div class="card-title mb-12">活动名称</div>
        <div class="form-group">
          <input type="text" class="form-input" id="quick-name" placeholder="输入活动名称" />
        </div>
        <button class="btn btn-primary btn-block" id="quick-create-btn">立即创建</button>
      </div>
    </div>

    <div class="tabbar">
      <div class="tabbar-item" data-nav="dashboard"><span class="tab-icon">🏠</span><span class="tab-label">首页</span></div>
      <div class="tabbar-item active" data-nav="templates"><span class="tab-icon">📋</span><span class="tab-label">模板</span></div>
      <div class="tabbar-item" data-nav="create"><span class="tab-icon">➕</span><span class="tab-label">创建</span></div>
      <div class="tabbar-item" data-nav="about"><span class="tab-icon">🐻</span><span class="tab-label">关于</span></div>
    </div>
  `;let a=null;return document.getElementById("back-btn").addEventListener("click",()=>b("#/dashboard")),document.getElementById("template-grid").addEventListener("click",t=>{const n=t.target.closest(".template-card");n&&(a=n.dataset.tpl,document.querySelectorAll(".template-card").forEach(i=>i.classList.remove("selected")),n.classList.add("selected"),document.getElementById("quick-create").style.display="block",document.getElementById("quick-name").focus())}),document.getElementById("quick-create-btn").addEventListener("click",async()=>{if(!a){u("请先选择一个模板");return}const t=document.getElementById("quick-name").value.trim();if(!t){u("请输入活动名称");return}const n=Q.find(d=>d.id===a),i=h();try{await F({id:i,name:t,description:"",location:"",startTime:null,endTime:null,maxParticipants:0,status:"draft",fields:n?JSON.parse(JSON.stringify(n.fields)):[],createdAt:Date.now()}),u("创建成功！"),setTimeout(()=>b(`#/builder/${i}`),400)}catch(d){u("创建失败: "+d.message)}}),document.querySelector(".tabbar").addEventListener("click",t=>{const n=t.target.closest(".tabbar-item");if(n)switch(n.dataset.nav){case"dashboard":b("#/dashboard");break;case"templates":break;case"create":b("#/create");break;case"about":b("#/about");break}}),()=>{}}function nt(){if(!T())return b("#/login"),()=>{};const e=H(),a=document.getElementById("app");return a.innerHTML=`
    <div class="navbar"><span class="navbar-title">关于</span></div>
    <div class="page" style="padding-top:12px">
      <div class="about-section">
        <div class="app-icon">🐻</div>
        <div style="font-size:var(--font-xl);font-weight:700;margin-bottom:4px">小棕熊预约报名</div>
        <div class="text-hint" style="font-size:var(--font-sm)">Version 2.0</div>
      </div>

      <div class="card">
        <div class="card-title mb-12">当前账号</div>
        <div class="flex items-center justify-between">
          <span>📱 ${(e==null?void 0:e.phone)||"-"}</span>
          <span class="badge badge-primary">管理员</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title mb-12">功能说明</div>
        <div class="text-hint" style="font-size:13px;line-height:1.8">
          🧩 <b>自定义表单</b>：拖拽式添加12种字段类型<br>
          📋 <b>模板系统</b>：5套预设模板快速开始<br>
          🚀 <b>一键发布</b>：生成链接+二维码分享<br>
          📊 <b>数据管理</b>：实时查看报名数据·导出CSV<br>
          🔒 <b>安全存储</b>：PostgreSQL数据库·JWT认证
        </div>
      </div>

      <button class="btn btn-danger-outline btn-block mt-16" id="logout-btn">退出登录</button>
    </div>

    <div class="tabbar">
      <div class="tabbar-item" data-nav="dashboard"><span class="tab-icon">🏠</span><span class="tab-label">首页</span></div>
      <div class="tabbar-item" data-nav="templates"><span class="tab-icon">📋</span><span class="tab-label">模板</span></div>
      <div class="tabbar-item" data-nav="create"><span class="tab-icon">➕</span><span class="tab-label">创建</span></div>
      <div class="tabbar-item active" data-nav="about"><span class="tab-icon">🐻</span><span class="tab-label">关于</span></div>
    </div>
  `,document.getElementById("logout-btn").addEventListener("click",()=>{ae(),b("#/login")}),document.querySelector(".tabbar").addEventListener("click",t=>{const n=t.target.closest(".tabbar-item");if(n)switch(n.dataset.nav){case"dashboard":b("#/dashboard");break;case"templates":b("#/templates");break;case"create":b("#/create");break}}),()=>{}}function L(e){return a=>T()?e(a):(b("#/login"),()=>{})}const st={"/login":e=>Ce(),"/dashboard":e=>L(He)(e),"/templates":e=>L(it)(e),"/about":e=>L(nt)(e),"/create":e=>L(J)(e),"/edit/:id":e=>L(J)(e),"/builder/:id":e=>L(Ve)(e),"/publish/:id":e=>L(Je)(e),"/data/:id":e=>L(Xe)(e),"/form/:id":e=>tt(e)};function Z(){console.log("🐻 小棕熊预约报名 V2 启动中..."),console.log("📋 预设账号: 13310843925 / Aled2239"),ge(st),window.location.hash.replace("#","")||b(T()?"#/dashboard":"#/login")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Z):Z();
