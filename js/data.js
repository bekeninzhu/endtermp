/* Project-owned sample data for frontend demo; each entry includes more than four properties. */
(function () {
  'use strict';
  const offers = [
    {id:1,name:'Aigerim',teaches:'Photoshop',wants:'English',category:'Design',level:'Intermediate',color:'#c7b5ff',symbol:'✎'},
    {id:2,name:'Daniyar',teaches:'Python basics',wants:'Guitar',category:'Coding',level:'Beginner',color:'#bcff9a',symbol:'⌘'},
    {id:3,name:'Madina',teaches:'English speaking',wants:'Excel',category:'Languages',level:'Advanced',color:'#fac6d9',symbol:'◉'},
    {id:4,name:'Alikhan',teaches:'Video editing',wants:'Public speaking',category:'Creative',level:'Intermediate',color:'#accaff',symbol:'♫'},
    {id:5,name:'Aruzhan',teaches:'Math tutoring',wants:'Illustration',category:'Academic',level:'Advanced',color:'#ffdb97',symbol:'∑'},
    {id:6,name:'Nurlan',teaches:'Guitar',wants:'HTML & CSS',category:'Creative',level:'Intermediate',color:'#deb7ff',symbol:'♫'},
    {id:7,name:'Amina',teaches:'UX design',wants:'Python basics',category:'Design',level:'Advanced',color:'#e4d0ff',symbol:'✎'},
    {id:8,name:'Timur',teaches:'Excel',wants:'Photoshop',category:'Academic',level:'Intermediate',color:'#a6e0ff',symbol:'∑'},
    {id:9,name:'Zere',teaches:'English',wants:'Math tutoring',category:'Languages',level:'Intermediate',color:'#ffc0cf',symbol:'◉'},
    {id:10,name:'Dias',teaches:'HTML & CSS',wants:'Video editing',category:'Coding',level:'Advanced',color:'#c8ffaf',symbol:'⌘'},
    {id:11,name:'Raihan',teaches:'Public speaking',wants:'UX design',category:'Languages',level:'Intermediate',color:'#b7baff',symbol:'◉'},
    {id:12,name:'Meruert',teaches:'Illustration',wants:'English',category:'Creative',level:'Beginner',color:'#ffd5a6',symbol:'♫'}
  ];
  const meetings = [
    {day:'MON',name:'Design & creativity',venue:'Campus library',time:'17:00',fullDay:'Monday'},
    {day:'WED',name:'Language exchange',venue:'Coworking space',time:'18:00',fullDay:'Wednesday'},
    {day:'FRI',name:'Code & technology',venue:'Campus library',time:'16:00',fullDay:'Friday'},
    {day:'SAT',name:'Music & ideas',venue:'Campus meeting area',time:'12:00',fullDay:'Saturday'}
  ];
  const USER_KEY='skillswap_student_offers_v1';
  const SAVED_KEY='skillswap_saved_ids_v1';
  function read(key,fallback){try{const value=JSON.parse(localStorage.getItem(key));return Array.isArray(value)?value:fallback;}catch(_){return fallback;}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(_){return false;}}
  function cleanSkill(value){return String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'').replace(/speaking|basics|tutoring/g,'').trim();}
  function getOffers(){const added=read(USER_KEY,[]).filter(item=>item&&typeof item.name==='string'&&typeof item.teaches==='string'&&typeof item.wants==='string'&&typeof item.id==='string');return [...added,...offers];}
  window.SkillSwap={offers,meetings,read,write,cleanSkill,getOffers,USER_KEY,SAVED_KEY};
})();
