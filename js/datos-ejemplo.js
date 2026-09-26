/* Finanzas JB · datos de ejemplo (ficticios).
   Solo sirven para ver la interfaz funcionando. Se reemplazarán por los datos
   guardados del usuario cuando se conecte la persistencia (ver js/store.js). */
(function(){
"use strict";
/* ---------- Datos ficticios ---------- */
const TODAY = '2026-09-26';
const INSTALL = '2026-09-01';
const CATS = [
  {n:'Comida', subs:['Mercado','Restaurantes']},
  {n:'Transporte', subs:['Taxi y apps','Gasolina']},
  {n:'Vivienda', subs:['Arriendo','Servicios']},
  {n:'Salud'},{n:'Personal'},{n:'Ocio'},{n:'Educación'},{n:'Regalos'},{n:'Financieros'},{n:'Otros'}
];
const INCATS = [{n:'Trabajo', subs:['Salario']},{n:'Rendimientos'},{n:'Otros'}];
const CLS = {disp:'Disponible', deuda:'Tarjeta/préstamo', ahorro:'Ahorro e inversión', persona:'Persona'};

const A = [
  {id:'efectivo', name:'Efectivo', cls:'disp', ap:150000},
  {id:'bancolombia', name:'Bancolombia', cls:'disp', ap:1328000},
  {id:'nequi', name:'Nequi', cls:'disp', ap:null, pending:true},
  {id:'visa', name:'Visa Bancolombia', cls:'deuda', sub:'tarjeta', ap:-864000},
  {id:'moto', name:'Crédito moto', cls:'deuda', sub:'credito', ap:-2500000},
  {id:'ahorro', name:'Ahorro programado', cls:'ahorro', ap:2000000},
  {id:'cdt', name:'CDT Bancolombia', cls:'ahorro', ap:1200000},
  {id:'daniel', name:'Daniel', cls:'persona', ap:0},
  {id:'laura', name:'Laura', cls:'persona', ap:0},
  {id:'daviplata', name:'Daviplata', cls:'disp', ap:0, archived:true}
];
const M = [
  {id:'m1', d:'2026-09-26', t:'13:05', type:'GASTO', desc:'Almuerzo', cat:'Comida', sub:'Restaurantes', amt:18000, acc:'nequi', phrase:'almuerzo 18 mil con nequi'},
  {id:'m2', d:'2026-09-26', t:'08:10', type:'GASTO', desc:'Taxi al trabajo', cat:'Transporte', sub:'Taxi y apps', amt:12000, acc:'efectivo', phrase:'taxi 12 mil'},
  {id:'m3', d:'2026-09-25', t:'19:40', type:'GASTO', desc:'Mercado Éxito', cat:'Comida', sub:'Mercado', amt:146000, acc:'visa', phrase:'mercado en el éxito 146 mil con la visa'},
  {id:'m4', d:'2026-09-25', t:'09:00', type:'TRANSFERENCIA', desc:'', amt:200000, from:'bancolombia', to:'nequi', phrase:'pasé 200 mil de bancolombia a nequi'},
  {id:'m5', d:'2026-09-24', t:'17:22', type:'GASTO', desc:'Pago PSE', cat:null, amt:38000, acc:'bancolombia', phrase:'pago pse 38 mil'},
  {id:'m6', d:'2026-09-24', t:'11:15', type:'REEMBOLSO', desc:'Devolución cena de cumpleaños', cat:'Comida', sub:'Restaurantes', amt:60000, acc:'bancolombia', link:'m11', phrase:'me devolvieron 60 mil de la cena'},
  {id:'m7', d:'2026-09-23', t:'20:30', type:'TRANSFERENCIA', desc:'Préstamo a Daniel', amt:100000, from:'nequi', to:'daniel', phrase:'le presté 100 mil a daniel por nequi'},
  {id:'m8', d:'2026-09-20', t:'10:02', type:'TRANSFERENCIA', desc:'Pago tarjeta Visa', amt:450000, from:'bancolombia', to:'visa', phrase:'pagué la tarjeta 450 mil desde bancolombia'},
  {id:'m9', d:'2026-09-20', t:'10:05', type:'TRANSFERENCIA', desc:'Aparté para ahorro', amt:300000, from:'bancolombia', to:'ahorro', phrase:'aparté 300 mil para el ahorro'},
  {id:'m10', d:'2026-09-18', t:'21:00', type:'GASTO', desc:'Cine', cat:'Ocio', amt:45000, acc:'bancolombia', phrase:'cine 45 mil'},
  {id:'m11', d:'2026-09-15', t:'09:00', type:'INGRESO', desc:'Salario', cat:'Trabajo', sub:'Salario', amt:3800000, acc:'bancolombia', phrase:'me llegó el sueldo 3 millones 800'},
  {id:'m12', d:'2026-09-14', t:'16:40', type:'TRANSFERENCIA', desc:'Laura me prestó', amt:40000, from:'laura', to:'efectivo', phrase:'laura me prestó 40 mil'},
  {id:'m13', d:'2026-09-12', t:'22:10', type:'GASTO', desc:'Cena de cumpleaños', cat:'Comida', sub:'Restaurantes', amt:120000, acc:'visa', refundedBy:'m6', phrase:'cena de cumpleaños 120 mil con la visa'},
  {id:'m14', d:'2026-09-10', t:'07:00', type:'GASTO', desc:'Cuota de manejo', cat:'Financieros', amt:45000, acc:'visa', phrase:'cuota de manejo visa 45 mil'},
  {id:'m15', d:'2026-09-08', t:'15:30', type:'GASTO', desc:'Consulta médica', cat:'Salud', amt:85000, acc:'efectivo', phrase:'consulta médica 85 mil en efectivo'},
  {id:'m16', d:'2026-09-05', t:'08:30', type:'GASTO', desc:'Arriendo', cat:'Vivienda', sub:'Arriendo', amt:1100000, acc:'bancolombia', phrase:'arriendo un millón cien'},
  {id:'m17', d:'2026-09-01', t:'08:12', type:'AJUSTE', motivo:'apertura', desc:'Saldo inicial', amt:1328000, acc:'bancolombia'}
];
// arreglar ids: el reembolso m6 apunta a la cena m13
M.find(m=>m.id==='m6').link='m13';

window.FJB_DATOS = {TODAY, INSTALL, CATS, INCATS, CLS, A, M};
})();
