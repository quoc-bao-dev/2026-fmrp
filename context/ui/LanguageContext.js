import { createContext, useContext } from 'react';
import { useLanguage } from '@/hooks/useAuth';
import { useSelector } from 'react-redux';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const langDefault = useSelector((state) => state.lang);
    const { data } = useLanguage(langDefault);
    
    return (
        <LanguageContext.Provider value={data}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguageContext() {
    return useContext(LanguageContext);
}