import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ApplicationSearchContext = createContext(null);

export const ApplicationSearchProvider = ({ children }) => {
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search value với delay 500ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchValue);
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [searchValue]);

    const handleSearchChange = useCallback((value) => {
        setSearchValue(value);
    }, []);

    return (
        <ApplicationSearchContext.Provider
            value={{
                searchValue,
                debouncedSearch,
                handleSearchChange,
            }}
        >
            {children}
        </ApplicationSearchContext.Provider>
    );
};

export const useApplicationSearch = () => {
    const context = useContext(ApplicationSearchContext);
    if (!context) {
        throw new Error('useApplicationSearch must be used within ApplicationSearchProvider');
    }
    return context;
};
