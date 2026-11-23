import {createContext,useContext,useEffect,useState} from 'react';
import {MONEDAS,consultarTasas,convertirCLP,formatoDivisa} from '../lib/currency.mjs';

const CurrencyContext=createContext(null);
export const useCurrency=()=>useContext(CurrencyContext);
export function CurrencyProvider({children}){
 const [moneda,setMoneda]=useState(()=>{
   try{const saved=localStorage.getItem('casa-jose-moneda');return MONEDAS.includes(saved)?saved:'CLP'}catch{return 'CLP'}
 });
 const [tasas,setTasas]=useState({}),[cargando,setCargando]=useState(false),[error,setError]=useState('');
 useEffect(()=>{try{localStorage.setItem('casa-jose-moneda',moneda)}catch{}},[moneda]);
 useEffect(()=>{
   if(moneda==='CLP'||tasas[moneda])return;
   let alive=true;setCargando(true);setError('');
   consultarTasas().then(data=>{if(alive)setTasas(data)}).catch(e=>{if(alive)setError(e.message)})
     .finally(()=>{if(alive)setCargando(false)});
   return ()=>{alive=false};
 },[moneda,tasas]);
 const tasa=moneda==='CLP'?{tasa:1,fecha:null}:tasas[moneda]||null;
 function importe(pesos,lang){
   return tasa&&Number.isFinite(pesos)?formatoDivisa(convertirCLP(pesos,tasa.tasa),moneda,lang):null;
 }
 return <CurrencyContext.Provider value={{moneda,setMoneda,importe,fecha:tasa?.fecha||null,cargando,error}}>{children}</CurrencyContext.Provider>;
}
