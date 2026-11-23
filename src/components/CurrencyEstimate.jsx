import {useCurrency} from '../context/CurrencyContext';
import {useLanguage} from '../context/LanguageContext';

/** Subtotal solo orientativo. No modifica Firestore ni la Cloud Function. */
export default function CurrencyEstimate({pesos}){
 const {moneda,importe}=useCurrency();const {lang,t}=useLanguage();
 if(moneda==='CLP')return null;
 const valor=importe(pesos,lang);
 if(!valor)return null;
 return <span className="fx-estimate">≈ {valor} <small>{t('currencyApprox')}</small></span>;
}
