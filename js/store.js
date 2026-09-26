/* Finanzas JB · almacenamiento local (preparado, todavía NO conectado a la interfaz).

   Estructura pensada para la siguiente etapa: guardar en el propio celular
   (localStorage) las cuentas y los movimientos del modelo financiero ya cerrado.
   La interfaz sigue usando js/datos-ejemplo.js hasta que se conecte.

   Forma de los registros (mismos campos que ya usa la interfaz):

   Cuenta {
     id, name,
     cls: 'disp' | 'deuda' | 'ahorro' | 'persona',   // Disponible, Tarjeta/préstamo, Ahorro e inversión, Persona
     sub?: 'tarjeta' | 'credito',                     // solo en Tarjeta/préstamo
     pending?: boolean,                               // saldo por confirmar
     archived?: boolean
   }

   Movimiento {
     id, d: 'AAAA-MM-DD', t: 'HH:MM',
     type: 'GASTO' | 'INGRESO' | 'TRANSFERENCIA' | 'REEMBOLSO' | 'AJUSTE',
     amt,                        // monto, siempre positivo
     acc?,                       // cuenta (gasto, ingreso, reembolso, ajuste)
     from?, to?,                 // cuentas (transferencia)
     cat?, sub?,                 // categoría y subcategoría
     desc?, phrase?,             // descripción y frase registrada
     link?,                      // reembolso -> gasto original (única relación entre movimientos)
     motivo?: 'apertura' | 'conciliacion'   // solo ajustes
   }

   El saldo de una cuenta nunca se guarda: se calcula desde sus movimientos.
*/
(function(){
"use strict";
const KEY = 'finanzas-jb';
const VERSION = 1;
const empty = () => ({version:VERSION, cuentas:[], movimientos:[], preferencias:{}});

function read(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return empty();
    const db = JSON.parse(raw);
    return db && db.version===VERSION ? db : empty();
  }catch(e){ return empty(); }
}
function write(db){
  try{ localStorage.setItem(KEY, JSON.stringify(db)); return true; }catch(e){ return false; }
}
const newId = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2,6);

window.FJB_STORE = {
  VERSION,
  load: read,
  save: write,
  hasData(){ const db=read(); return db.cuentas.length>0 || db.movimientos.length>0; },
  addCuenta(c){ const db=read(); const x=Object.assign({id:newId('c')}, c); db.cuentas.push(x); write(db); return x; },
  updateCuenta(id, patch){ const db=read(); const c=db.cuentas.find(x=>x.id===id); if(c){ Object.assign(c, patch); write(db); } return c; },
  addMovimiento(m){ const db=read(); const x=Object.assign({id:newId('m')}, m); db.movimientos.push(x); write(db); return x; },
  updateMovimiento(id, patch){ const db=read(); const m=db.movimientos.find(x=>x.id===id); if(m){ Object.assign(m, patch); write(db); } return m; },
  removeMovimiento(id){ const db=read(); db.movimientos=db.movimientos.filter(x=>x.id!==id); write(db); },
  reset(){ try{ localStorage.removeItem(KEY); }catch(e){} }
};
})();
