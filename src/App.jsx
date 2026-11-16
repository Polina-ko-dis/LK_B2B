import React,{useEffect,useState} from 'react';
import {ReactorTheme,Text,Label,Select,Button,IconButton,Icon,Field,ReadOnlyField,Checkbox,Tile,PageTop,InfoAlert,WarningAlert,SidebarWindow,SnackbarWindow} from '@reactor/reactor';
import Navigation from './Navigation';
import {DescriptionBody} from './descriptions';

const accountUrl='https://guest.qatl.ru/guest-account/16229/auth';
const routeFromHash=()=>window.location.hash.startsWith('#/Admin')?'admin':'account';

const settingsRows=[
 {key:'hotbot',label:'Услуги HotBot',text:'Показывать блок с услугами в личном кабинете гостя.',description:'hotbot'},
 {key:'deleteProfile',label:'Удаление профиля гостя',text:'Позволять гостям самостоятельно удалять свои профили в личном кабинете гостя.'},
 {key:'merge',label:'Объединение дубликатов профилей гостя',text:'Позволять гостям самостоятельно объединять дубликаты своих профилей.',description:'merge'},
 {key:'payment',label:'Оплата бронирования в личном кабинете гостя',text:'Позволять гостям оплачивать бронирования или вносить предоплату по бронированию прямо из своего личного кабинета.'},
];
const initialSettings={hotbot:true,deleteProfile:false,merge:true,payment:true};

function DescriptionLink({onOpen}){return <Button type="link" icon="help" text="Описание настройки" onClick={onOpen}/>}

// Ссылки на ЛК берутся из сохранённых настроек на странице «Настройки (admin)».
// Максимум один кабинет каждого типа: дополнительный ЛК всегда другого типа, чем основной.
const otherType=type=>type==='external'?'tl':'external';
const typeHint=type=>type==='external'?'Тип: внешний личный кабинет':'Тип: личный кабинет TL';
const typeLabel=type=>type==='external'?'Внешний личный кабинет':'Личный кабинет TL';
// Вход в модуле бронирования настраивается только в админке, в блоке ЛК TL; для внешнего ЛК он всегда скрыт. Отелю на странице гостя не показываем.
const fbAuthLabel='Показывать вход в личный кабинет TL';

function FbAuthRow({admin,onChange}){
 return <div className="setting-row align-top checkbox-row">
  <Text text="Вход в модуле бронирования TravelLine"/>
  <div className="dependent-field"><Checkbox value={admin.fbAuth} onChange={onChange} label={fbAuthLabel}/></div>
 </div>;
}
const fbAuthHiddenAlert='Для внешнего личного кабинета вход в модуле бронирования TravelLine всегда скрыт.';

function accountLinks(admin){
 const main={type:admin.type,url:admin.type==='external'?admin.externalUrl.trim():accountUrl};
 const extraType=otherType(admin.type);
 const extra=admin.extra?{type:extraType,url:extraType==='external'?admin.extraUrl.trim():accountUrl}:null;
 const hasExtra=Boolean(extra&&extra.url);
 const links=[{key:'main',label:hasExtra?typeLabel(main.type):'Ссылка на личный кабинет гостя',url:main.url,hint:hasExtra?'':typeHint(main.type)}];
 if(hasExtra)links.push({key:'extra',label:typeLabel(extra.type),url:extra.url,hint:''});
 return links;
}

function AccountPage({settings,setSettings,onDescription,onNotify,admin}){
 const links=accountLinks(admin);
 const copy=async url=>{try{await navigator.clipboard.writeText(url);onNotify('Ссылка скопирована')}catch{onNotify('Не удалось скопировать ссылку','danger')}};
 const many=links.length>1;
 return <main className="page">
  <PageTop title="Личный кабинет гостя"/>
  <div className="tile-wrap"><Tile>
   <div className="intro">
    <Text text="Личный кабинет гостя" typography="subtitle"/>
    <Text text="Личный кабинет — часть модуля бронирования TL: Booking Engine. Он доступен всем гостям, которые зарегистрировались в модуле при бронировании."/>
    <Text text="В личном кабинете гость может:"/>
    <ul className="description-list">{['отслеживать свой уровень и накопления в программе лояльности','смотреть информацию о своих бронированиях','бронировать услуги и многое другое'].map(t=><li key={t}><Text text={t}/></li>)}</ul>
    <Text text="Вы можете установить личный кабинет гостя отдельной страницей на вашем официальном сайте, чтобы в нем регистрировались больше клиентов."/>
    <div className="intro-action"><DescriptionLink onOpen={()=>onDescription('integration')}/></div>
   </div>
  </Tile></div>
  <div className="tile-wrap"><Tile header="Ссылка на личный кабинет гостя">
   <div className="tile-body">
    <InfoAlert text="Увеличивайте количество зарегистрированных гостей: скопируйте ссылку на личный кабинет гостя и опубликуйте ее в соцсетях или отправьте сообщением."/>
    {links.map(l=><div className="setting-row align-top" key={l.key}>
     <Text text={l.label}/>
     <div className={'account-link'+(many?' with-copy':'')}>
      <div className="dependent-field link-field">
       <ReadOnlyField text={l.url||'Ссылка не указана'}/>
       {l.hint&&<Text text={l.hint} typography="caption" color="neutral"/>}
      </div>
      {many&&<Button icon="copy" text="Скопировать" disabled={!l.url} onClick={()=>copy(l.url)}/>}
     </div>
    </div>)}
    {!many&&<div><Button icon="copy" text="Скопировать ссылку" disabled={!links[0].url} onClick={()=>copy(links[0].url)}/></div>}
   </div>
  </Tile></div>
  <div className="tile-wrap"><Tile header="Настройки">
   <div className="tile-body settings-list">
    {settingsRows.map(r=><div className="setting-row" key={r.key}>
     <Text text={r.label}/>
     <div className="setting-control">
      <Checkbox value={settings[r.key]} onChange={v=>setSettings(s=>({...s,[r.key]:v}))} label={r.text}/>
      {r.description&&<DescriptionLink onOpen={()=>onDescription(r.description)}/>}
     </div>
    </div>)}
   </div>
  </Tile></div>
 </main>;
}

// Сайты, на которых работает ЛК: по адресу сайта GuestProfile выбирает, какой ЛК и какую настройку входа применить к ФБ.
// Необязательны только для единственного ЛК TL; один сайт нельзя назначить двум кабинетам.
const normSite=v=>v.trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/+$/,'');
const sitesRequired=(admin,kind)=>admin.extra||(kind==='main'&&admin.type==='external');
function validateSites(admin){
 const lists=admin.extra?{main:admin.sites,extra:admin.extraSites}:{main:admin.sites};
 const errors={main:[],extra:[]};
 for(const kind of Object.keys(lists)){
  const list=lists[kind],other=kind==='main'?lists.extra:lists.main,otherSet=new Set((other||[]).map(normSite).filter(Boolean));
  list.forEach((v,i)=>{
   const n=normSite(v);
   if(!n){if(i>0)errors[kind][i]='Укажите сайт или удалите поле';else if(sitesRequired(admin,kind))errors[kind][i]='Укажите сайт';return}
   if(list.slice(0,i).some(x=>normSite(x)===n))errors[kind][i]='Этот сайт уже указан';
   else if(otherSet.has(n))errors[kind][i]='Сайт уже указан у другого личного кабинета';
  });
 }
 return errors;
}

function SitesField({sites,onChange,errors=[],required}){
 return <div className="dependent-field sites-field">
  {sites.map((site,i)=><div className="site-item" key={i}>
   <div className="site-row">
    <Field value={site} onChange={v=>onChange(sites.map((x,j)=>j===i?v:x))} placeholder="https://" size="stretch" state={errors[i]?'danger':undefined}/>
    {i>0&&<Button icon="delete" hint="Удалить сайт" onClick={()=>onChange(sites.filter((_,j)=>j!==i))}/>}
   </div>
   {errors[i]&&<div role="alert"><Text text={errors[i]} typography="caption" color="danger"/></div>}
  </div>)}
  {!required&&<Text text="Необязательно" typography="caption" color="neutral"/>}
  <div><Button type="link" icon="add" text="Добавить сайт" onClick={()=>onChange([...sites,''])}/></div>
 </div>;
}

const lkTypes=[{value:'tl',text:'Личный кабинет TL'},{value:'external',text:'Внешний личный кабинет'}];
const initialAdmin={type:'tl',externalUrl:'',fbAuth:true,extra:false,extraUrl:'',sites:[''],extraSites:['']};

function AdminPage({admin,setAdmin,error,setError,extraError,setExtraError,siteErrors,setSiteErrors}){
 const external=admin.type==='external';
 const extraExternal=!external;
 const set=patch=>setAdmin(a=>({...a,...patch}));
 const clearSiteErrors=()=>setSiteErrors({main:[],extra:[]});
 const sitesRow=(kind,key)=><div className="setting-row align-top">
  <Text text="Используется на сайтах"/>
  <SitesField sites={admin[key]} required={sitesRequired(admin,kind)} errors={siteErrors[kind]} onChange={v=>{set({[key]:v});clearSiteErrors()}}/>
 </div>;
 return <main className="page">
  <PageTop title="Настройки"/>
  <div className="tile-wrap"><Tile header="Отображение личного кабинета">
   <div className="tile-body">
    <InfoAlert text="Если изменилась ссылка на личный кабинет гостя, уведомите средство размещения о необходимости обновить QR-код."/>
    {admin.extra&&<Text text="Основной личный кабинет" typography="subtitle"/>}
    <div className="setting-row">
     <Text text="Тип личного кабинета"/>
     <div className="admin-field"><Select value={admin.type} onChange={type=>{set({type});setError('');setExtraError('')}} options={lkTypes} size="stretch"/></div>
    </div>
    <div className="dependent-block">
     {external&&<WarningAlert text={fbAuthHiddenAlert}/>}
     <div className="setting-row align-top">
      <Text text="Ссылка на личный кабинет"/>
      <div className="dependent-field admin-field">
       {external
        ?<Field value={admin.externalUrl} onChange={externalUrl=>{set({externalUrl});setError('')}} placeholder="https://" size="stretch" state={error?'danger':undefined}/>
        :<Field value={accountUrl} onChange={()=>{}} size="stretch"/>}
       {external&&(error?<div role="alert"><Text text={error} typography="caption" color="danger"/></div>:<Text text="Вставьте ссылку на внешний кабинет" typography="caption" color="neutral"/>)}
       {!external&&<Text text="Формируется автоматически" typography="caption" color="neutral"/>}
      </div>
     </div>
     {sitesRow('main','sites')}
     {!external&&<FbAuthRow admin={admin} onChange={fbAuth=>set({fbAuth})}/>}
    </div>
    {admin.extra
     ?<div className="extra-account">
       <div className="extra-account-head"><Text text="Дополнительный личный кабинет" typography="subtitle"/><Button icon="delete" hint="Удалить дополнительный личный кабинет" onClick={()=>{set({extra:false,extraUrl:'',extraSites:['']});setExtraError('');clearSiteErrors()}}/></div>
       <div className="setting-row">
        <Text text="Тип личного кабинета"/>
        <div className="admin-field link-field"><ReadOnlyField text={extraExternal?'Внешний личный кабинет':'Личный кабинет TL'}/></div>
       </div>
       <div className="dependent-block">
        {extraExternal&&<WarningAlert text={fbAuthHiddenAlert}/>}
        <div className="setting-row align-top">
         <Text text="Ссылка на личный кабинет"/>
         <div className="dependent-field admin-field">
          {extraExternal
           ?<Field value={admin.extraUrl} onChange={extraUrl=>{set({extraUrl});setExtraError('')}} placeholder="https://" size="stretch" state={extraError?'danger':undefined}/>
           :<Field value={accountUrl} onChange={()=>{}} size="stretch"/>}
          {extraExternal
           ?(extraError?<div role="alert"><Text text={extraError} typography="caption" color="danger"/></div>:<Text text="Вставьте ссылку на внешний кабинет" typography="caption" color="neutral"/>)
           :<Text text="Формируется автоматически" typography="caption" color="neutral"/>}
         </div>
        </div>
        {sitesRow('extra','extraSites')}
        {!extraExternal&&<FbAuthRow admin={admin} onChange={fbAuth=>set({fbAuth})}/>}
       </div>
      </div>
     :<div><Button type="link" icon="add" text="Личный кабинет" onClick={()=>{set({extra:true});clearSiteErrors()}}/></div>}
   </div>
  </Tile></div>
 </main>;
}

function Prototype(){
 const [route,setRoute]=useState(routeFromHash);
 const [settings,setSettings]=useState(initialSettings);
 const [savedSettings,setSavedSettings]=useState(initialSettings);
 const [admin,setAdmin]=useState(initialAdmin);
 const [savedAdmin,setSavedAdmin]=useState(initialAdmin);
 const [adminError,setAdminError]=useState('');
 const [extraError,setExtraError]=useState('');
 const [siteErrors,setSiteErrors]=useState({main:[],extra:[]});
 const [description,setDescription]=useState(null);
 const [toast,setToast]=useState(''),[toastStatus,setToastStatus]=useState('success');
 useEffect(()=>{const f=()=>setRoute(routeFromHash());window.addEventListener('hashchange',f);return()=>window.removeEventListener('hashchange',f)},[]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),5000);return()=>clearTimeout(t)},[toast]);
 const navigate=r=>{window.location.hash=r==='admin'?'#/AdminSettings':'#/Settings';setRoute(r)};
 const notify=(text,status='success')=>{setToastStatus(status);setToast(text)};
 const save=()=>{
  if(route==='admin'){
   const mainError=admin.type==='external'&&!admin.externalUrl.trim()?'Укажите ссылку':'';
   const extraMissing=otherType(admin.type)==='external'&&admin.extra&&!admin.extraUrl.trim()?'Укажите ссылку':'';
   const sErrors=validateSites(admin);
   setAdminError(mainError);setExtraError(extraMissing);setSiteErrors(sErrors);
   if(mainError||extraMissing||[...sErrors.main,...sErrors.extra].some(Boolean)){notify('Не удалось сохранить. Исправьте ошибки на странице','danger');return}
  }
  if(route==='admin')setSavedAdmin(admin);else setSavedSettings(settings);
  notify('Изменения сохранены')};
 return <>
  <div className="shell">
   <Navigation route={route} onNavigate={navigate}/>
   <div className="workspace">
    <div className="topbar">
     <Button type="primary" text="Сохранить" onClick={save}/>
     <div className="inline"><Icon name="wallet" color="accent"/><Icon name="settings" color="accent"/><Icon name="notification" color="accent"/><Icon name="help" color="accent"/><span className="inline user"><Icon name="account" color="accent"/><Text text="polina.kozlova" color="accent"/></span></div>
    </div>
    {route==='admin'?<AdminPage admin={admin} setAdmin={setAdmin} error={adminError} setError={setAdminError} extraError={extraError} setExtraError={setExtraError} siteErrors={siteErrors} setSiteErrors={setSiteErrors}/>:<AccountPage settings={settings} setSettings={setSettings} onDescription={setDescription} onNotify={notify} admin={savedAdmin}/>}
    <footer className="footer"><Text typography="caption" color="neutral" text="© ООО «ТРЭВЕЛ ЛАЙН СИСТЕМС», 2021 – 2026"/><Text typography="caption" color="neutral" text="TravelLine: Platform — автоматизация процессов для гостиничного бизнеса"/></footer>
   </div>
  </div>
  <SidebarWindow header="Описание настройки" width={640} state={[Boolean(description),v=>{if(!v)setDescription(null)}]} footer={({close})=><Button text="Закрыть" onClick={close}/>}>
   <DescriptionBody id={description}/>
  </SidebarWindow>
  <SnackbarWindow status={toastStatus} text={toast} state={[Boolean(toast),v=>{if(!v)setToast('')}]} close={()=>setToast('')}/>
 </>;
}

export default function App(){return <ReactorTheme><div id="reactor-app-portal"/><Prototype/></ReactorTheme>}
