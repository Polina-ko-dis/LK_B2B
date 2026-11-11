import React,{useEffect,useState} from 'react';
import {ReactorTheme,Text,Label,Select,Button,IconButton,Icon,Field,ReadOnlyField,Checkbox,Tile,PageTop,InfoAlert,SidebarWindow,SnackbarWindow} from '@reactor/reactor';
import Navigation from './Navigation';
import DevPanel from './DevPanel';
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
function accountLinks(admin,chain){
 const external=admin.type==='external';
 const links=[{key:'main',label:chain?'Основной личный кабинет':'Ссылка на личный кабинет гостя',url:external?admin.externalUrl.trim():accountUrl,hint:external?'Тип: внешний личный кабинет':'Тип: личный кабинет TL'}];
 if(chain&&!external&&admin.extra&&admin.extraUrl.trim())links.push({key:'extra',label:'Дополнительный личный кабинет',url:admin.extraUrl.trim(),hint:'Тип: внешний личный кабинет'});
 return links;
}

function AccountPage({settings,setSettings,onDescription,onNotify,admin,chain}){
 const links=accountLinks(admin,chain);
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
       <Text text={l.hint} typography="caption" color="neutral"/>
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
    {admin.type==='external'&&<div className="setting-row">
     <Text text="Вход в модуле бронирования TravelLine"/>
     <div className="setting-control">
      <Checkbox value={admin.fbAuth} disabled disabledHint="Настраивается администратором" label={{text:'Показывать вход в личный кабинет TL',color:'foreground'}}/>
     </div>
    </div>}
   </div>
  </Tile></div>
 </main>;
}

const lkTypes=[{value:'tl',text:'Личный кабинет TL'},{value:'external',text:'Внешний личный кабинет'}];
const initialAdmin={type:'tl',externalUrl:'',fbAuth:false,extra:false,extraUrl:''};

function AdminPage({admin,setAdmin,error,setError,extraError,setExtraError,chain}){
 const external=admin.type==='external';
 const set=patch=>setAdmin(a=>({...a,...patch}));
 return <main className="page">
  <PageTop title="Настройки"/>
  <div className="tile-wrap"><Tile header="Отображение личного кабинета">
   <div className="tile-body">
    <InfoAlert text="Если изменилась ссылка на личный кабинет гостя, уведомите средство размещения о необходимости обновить QR-код."/>
    {chain&&<Text text="Основной личный кабинет" typography="subtitle"/>}
    <div className="setting-row">
     <Text text="Тип личного кабинета"/>
     <div className="admin-field"><Select value={admin.type} onChange={type=>{set({type});setError('')}} options={lkTypes} size="stretch"/></div>
    </div>
    <div className="dependent-block">
     <div className="setting-row align-top">
      <Text text="Ссылка"/>
      <div className="dependent-field admin-field">
       {external
        ?<Field value={admin.externalUrl} onChange={externalUrl=>{set({externalUrl});setError('')}} placeholder="https://" size="stretch" state={error?'danger':undefined}/>
        :<Field value={accountUrl} onChange={()=>{}} size="stretch"/>}
       {external&&(error?<div role="alert"><Text text={error} typography="caption" color="danger"/></div>:<Text text="Вставьте ссылку на внешний кабинет" typography="caption" color="neutral"/>)}
       {!external&&<Text text="Формируется автоматически" typography="caption" color="neutral"/>}
      </div>
     </div>
     {external&&<div className="setting-row align-top checkbox-row">
      <Text text="Вход в модуле бронирования TravelLine"/>
      <div className="dependent-field">
       <Checkbox value={admin.fbAuth} onChange={fbAuth=>set({fbAuth})} label="Показывать вход в личный кабинет TL"/>
      </div>
     </div>}
    </div>
    {chain&&!external&&(admin.extra
     ?<div className="extra-account">
       <div className="extra-account-head"><Text text="Дополнительный личный кабинет" typography="subtitle"/><IconButton icon="delete" hint="Удалить дополнительный личный кабинет" onClick={()=>{set({extra:false,extraUrl:''});setExtraError('')}}/></div>
       <div className="setting-row align-top">
        <Text text="Ссылка"/>
        <div className="dependent-field admin-field">
         <Field value={admin.extraUrl} onChange={extraUrl=>{set({extraUrl});setExtraError('')}} placeholder="https://" size="stretch" state={extraError?'danger':undefined}/>
         {extraError?<div role="alert"><Text text={extraError} typography="caption" color="danger"/></div>:<Text text="Вставьте ссылку на личный кабинет" typography="caption" color="neutral"/>}
        </div>
       </div>
      </div>
     :<div><Button type="link" icon="add" text="Личный кабинет" onClick={()=>set({extra:true})}/></div>)}
   </div>
  </Tile></div>
 </main>;
}

function Prototype(){
 const [route,setRoute]=useState(routeFromHash);
 const [hotelType,setHotelType]=useState(()=>{try{return localStorage.getItem('lk-hotel-type')||'single'}catch{return 'single'}});
 useEffect(()=>{try{localStorage.setItem('lk-hotel-type',hotelType)}catch{}},[hotelType]);
 const [settings,setSettings]=useState(initialSettings);
 const [savedSettings,setSavedSettings]=useState(initialSettings);
 const [admin,setAdmin]=useState(initialAdmin);
 const [savedAdmin,setSavedAdmin]=useState(initialAdmin);
 const [adminError,setAdminError]=useState('');
 const [extraError,setExtraError]=useState('');
 const [description,setDescription]=useState(null);
 const [toast,setToast]=useState(''),[toastStatus,setToastStatus]=useState('success');
 useEffect(()=>{const f=()=>setRoute(routeFromHash());window.addEventListener('hashchange',f);return()=>window.removeEventListener('hashchange',f)},[]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),5000);return()=>clearTimeout(t)},[toast]);
 const navigate=r=>{window.location.hash=r==='admin'?'#/AdminSettings':'#/Settings';setRoute(r)};
 const notify=(text,status='success')=>{setToastStatus(status);setToast(text)};
 const save=()=>{
  if(route==='admin'){
   const mainError=admin.type==='external'&&!admin.externalUrl.trim()?'Укажите ссылку':'';
   const extraMissing=hotelType==='chain'&&admin.type!=='external'&&admin.extra&&!admin.extraUrl.trim()?'Укажите ссылку':'';
   setAdminError(mainError);setExtraError(extraMissing);
   if(mainError||extraMissing){notify('Не удалось сохранить. Исправьте ошибки на странице','danger');return}
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
    {route==='admin'?<AdminPage chain={hotelType==='chain'} admin={admin} setAdmin={setAdmin} error={adminError} setError={setAdminError} extraError={extraError} setExtraError={setExtraError}/>:<AccountPage settings={settings} setSettings={setSettings} onDescription={setDescription} onNotify={notify} admin={savedAdmin} chain={hotelType==='chain'}/>}
    <footer className="footer"><Text typography="caption" color="neutral" text="© ООО «ТРЭВЕЛ ЛАЙН СИСТЕМС», 2021 – 2026"/><Text typography="caption" color="neutral" text="TravelLine: Platform — автоматизация процессов для гостиничного бизнеса"/></footer>
   </div>
  </div>
  <SidebarWindow header="Описание настройки" width={640} state={[Boolean(description),v=>{if(!v)setDescription(null)}]} footer={({close})=><Button text="Закрыть" onClick={close}/>}>
   <DescriptionBody id={description}/>
  </SidebarWindow>
  <DevPanel hotelType={hotelType} setHotelType={setHotelType}/>
  <SnackbarWindow status={toastStatus} text={toast} state={[Boolean(toast),v=>{if(!v)setToast('')}]} close={()=>setToast('')}/>
 </>;
}

export default function App(){return <ReactorTheme><div id="reactor-app-portal"/><Prototype/></ReactorTheme>}
