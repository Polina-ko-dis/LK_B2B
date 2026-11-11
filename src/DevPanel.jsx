import React from 'react';

// Панель для разработчика (как в проекте Экспресс): не часть интерфейса, только переключает состояния прототипа.
export const hotelTypes=[{value:'single',text:'Одиночный отель'},{value:'chain',text:'Сетевой отель'}];

export default function DevPanel({hotelType,setHotelType}){
 return <aside className="devp" aria-label="Состояния прототипа для разработки (не часть интерфейса)" title="Не часть интерфейса — переключатель для просмотра">
  <label className="devp-pill">
   <span className="devp-k">Тип отеля</span>
   <select value={hotelType} onChange={e=>setHotelType(e.target.value)}>
    {hotelTypes.map(o=><option key={o.value} value={o.value}>{o.text}</option>)}
   </select>
   <svg className="devp-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  </label>
 </aside>;
}
