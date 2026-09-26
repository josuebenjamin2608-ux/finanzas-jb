/* Finanzas JB · almacenamiento en el celular (localStorage).

   Distingue dos estados:
   - Instalación nueva: no existe nada guardado (exists() === false). La app abre
     el primer uso "¿Cuánto tienes hoy?".
   - Usuario con datos: existe el registro guardado, aunque esté vacío porque
     saltó la configuración. La app entra directo a Inicio.

   Nunca se borra ni se reinicia al abrir o actualizar la app. Si en el futuro
   cambia la forma de los datos, se migra en migrate(); jamás se descarta.

   Forma de los registros:

   Cuenta {
     id, name,
     cls: 'disp' | 'deuda' | 'ahorro' | 'persona',   // Disponible, Tarjeta/préstamo, Ahorro e inversión, Persona
     sub?: 'tarjeta' | 'credito',                     // solo en Tarjeta/préstamo
     archived?: boolean
   }
   // "Saldo por confirmar" no se guarda: es una cuenta (que no es Persona) sin ajuste de apertura.

   Movimiento {
     id, d: 'AAAA-MM-DD', t: 'HH:MM',
     type: 'GASTO' | 'INGRESO' | 'TRANSFERENCIA' | 'REEMBOLSO' | 'AJUSTE',
     amt,                        // monto, siempre positivo
     acc?,                       // cuenta (gasto, ingreso, reembolso, ajuste)
     from?, to?,                 // cuentas (transferencia)
     cat?, sub?,                 // categoría y subcategoría
     desc?, phrase?,             // descripción y frase registrada
     link?,                      // reembolso -> gasto original (única relación entre movimientos)
     motivo?: 'apertura' | 'conciliacion',   // solo ajustes
     saldo?                      // solo ajustes: saldo escrito, con signo (negativo = debes)
   }

   El saldo de una cuenta nunca se guarda: se calcula desde sus movimientos y ajustes.
*/
(function(){
"use strict";
const KEY = 'finanzas-jb';
const VERSION = 1;

function migrate(db){
  // Versión 1 es la primera con datos reales. Las siguientes versiones agregan sus pasos aquí.
  db.cuentas = db.cuentas || [];
  db.movimientos = db.movimientos || [];
  db.preferencias = db.preferencias || {};
  db.version = VERSION;
  return db;
}

window.FJB_STORE = {
  VERSION,
  exists(){
    try{ return localStorage.getItem(KEY) !== null; }catch(e){ return false; }
  },
  // Estado vacío de una instalación nueva: sin cuentas, sin movimientos, sin saldos.
  empty(){
    const now = new Date();
    return {version:VERSION, creado:now.toISOString(), cuentas:[], movimientos:[], preferencias:{}};
  },
  load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(raw === null) return null;
      return migrate(JSON.parse(raw));
    }catch(e){
      // Datos ilegibles: se guarda una copia antes de cualquier otra cosa para no perderlos.
      try{ const raw = localStorage.getItem(KEY); if(raw) localStorage.setItem(KEY+'-respaldo-'+Date.now(), raw); }catch(_){}
      return null;
    }
  },
  save(db){
    try{ localStorage.setItem(KEY, JSON.stringify(db)); return true; }catch(e){ return false; }
  },
  // Pide al navegador que no borre estos datos cuando necesite espacio.
  persist(){
    try{ if(navigator.storage && navigator.storage.persist) navigator.storage.persist(); }catch(e){}
  },
  newId(p){ return p + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
};
})();
