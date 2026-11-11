import React,{useState} from 'react';
import {Icon,Text} from '@reactor/reactor';

// Боковое меню — основа из конструктора витрины, пункты как на тестовой среде qatl.ru.
// [иконка, название, есть ли стрелка раскрытия]
const groups=[
 ['lamp','Помощник',true],['calendar-day','Управление номерами',true],['house','Настройки гостиницы',true],
 ['developer-board','Управление отелем',true],['hive','Менеджер каналов',false],['radar','Метапоисковики',false],
 ['insights','Аналитика',false],['forum','Репутация',true],['mail','Маркетинг',true],['folder','Документооборот',true],
 ['report','Отчеты',true],['user-check','Онлайн-регистрация',true],['arrow-circle-double','Сравнение цен',false],
 ['journal','Миграционный учет',true],
];

export default function Navigation({route,onNavigate}){
 const [accountOpen,setAccountOpen]=useState(true);
 const row=(icon,title,arrow,open=false)=><div className="navigation-row" key={title}><Icon name={icon} color="scaffold-light-foreground"/><Text text={title} color="scaffold-light-foreground"/>{arrow&&<span className="navigation-arrow"><Icon name={open?'arrow-drop-up':'arrow-drop-down'} color="scaffold-light-foreground"/></span>}</div>;
 const child=(title,{active,onClick,arrow,level=1,badge}={})=><button type="button" className={'navigation-child level-'+level+(active?' active':'')} key={title} onClick={onClick}>
  <Text text={title} color={active?'foreground':'foreground-inverse'}/>
  {badge&&<span className="navigation-badge">A</span>}
  {arrow&&<span className="navigation-arrow"><Icon name={arrow} color={active?'foreground':'foreground-inverse'}/></span>}
 </button>;
 return <aside className="navigation">
  <div className="provider"><Icon name="more-vert" color="foreground-inverse"/><span className="provider-logo">Л</span><div><Text text="Отель Лютик" color="foreground-inverse"/><Text text="16229 Йошкар-Ола" typography="caption" color="foreground-inverse"/></div></div>
  {groups.map(([icon,title,arrow])=>row(icon,title,arrow))}
  {row('users','Управление гостями',true,true)}
  {child('Программа лояльности')}
  {child('Личный кабинет гостя',{active:route==='account',arrow:accountOpen?'arrow-drop-up':'arrow-drop-down',onClick:()=>{if(route==='account')setAccountOpen(v=>!v);else{onNavigate('account');setAccountOpen(true)}}})}
  {accountOpen&&child('Настройки (admin)',{level:2,badge:true,active:route==='admin',onClick:()=>onNavigate('admin')})}
  {row('book','Модуль бронирования',true)}
 </aside>;
}
